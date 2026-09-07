import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import {
  ThrottlerStorageService,
  type ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import { AppThrottlerGuard } from '../../src/common/guards/app-throttler.guard';
import {
  AuthThrottle,
  SensitiveThrottle,
} from '../../src/common/decorators/throttle-policy.decorator';

// Limits kept small so the tests stay fast; the real values come from env via
// configuration.ts. What matters here is the ratio and the bucket boundaries.
const GLOBAL_LIMIT = 5;
const AUTH_LIMIT = 2;
const SENSITIVE_LIMIT = 1;
const TTL = 10_000;

const options: ThrottlerModuleOptions = [
  { name: 'global', ttl: TTL, limit: GLOBAL_LIMIT },
  { name: 'auth', ttl: TTL, limit: AUTH_LIMIT },
  { name: 'sensitive', ttl: TTL, limit: SENSITIVE_LIMIT },
];

// Real controllers carrying the real decorators, so the test exercises the
// actual metadata wiring rather than a hand-fed reflector stub.
class AuthController {
  @AuthThrottle()
  login() {}

  @AuthThrottle()
  register() {}

  me() {} // no decorator -> global
}

class ApplicationsController {
  @SensitiveThrottle()
  resendParentVerification() {}

  @SensitiveThrottle()
  resendCollegeVerification() {}

  list() {} // no decorator -> global
}

describe('AppThrottlerGuard', () => {
  let guard: AppThrottlerGuard;
  let storage: ThrottlerStorageService;

  const contextFor = (
    controller: new () => object,
    method: string,
    ip: string,
  ): ExecutionContext =>
    ({
      getClass: () => controller,
      getHandler: () =>
        (controller.prototype as Record<string, unknown>)[method],
      switchToHttp: () => ({
        getRequest: () => ({ ip }),
        // The guard sets X-RateLimit-* headers on every pass.
        getResponse: () => ({ header: () => undefined }),
      }),
    }) as unknown as ExecutionContext;

  /** Returns how many consecutive calls were allowed before a 429. */
  const consumeUntilBlocked = async (
    ctx: ExecutionContext,
    attempts: number,
  ) => {
    let allowed = 0;
    for (let i = 0; i < attempts; i++) {
      try {
        await guard.canActivate(ctx);
        allowed++;
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        break;
      }
    }
    return allowed;
  };

  beforeEach(async () => {
    storage = new ThrottlerStorageService();
    guard = new AppThrottlerGuard(options, storage, new Reflector());
    // ThrottlerGuard reads its throttler list here, not in the constructor.
    await guard.onModuleInit();
  });

  afterEach(() => {
    // Clears the storage service's pending expiry timers so vitest can exit.
    storage.onApplicationShutdown();
  });

  describe('global policy', () => {
    it('allows requests up to the limit and rejects the one after it', async () => {
      const ctx = contextFor(ApplicationsController, 'list', '10.0.0.1');
      expect(await consumeUntilBlocked(ctx, GLOBAL_LIMIT + 1)).toBe(
        GLOBAL_LIMIT,
      );
    });

    it('is one budget per client across different endpoints, not per route', async () => {
      const ip = '10.0.0.2';
      // Spend the whole budget on one undecorated route...
      await consumeUntilBlocked(
        contextFor(ApplicationsController, 'list', ip),
        GLOBAL_LIMIT,
      );
      // ...then a different undecorated route on another controller is already
      // out. The stock ThrottlerGuard key includes class + handler, which would
      // have handed this route a fresh allowance.
      await expect(
        guard.canActivate(contextFor(AuthController, 'me', ip)),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('tracks each client IP separately', async () => {
      await consumeUntilBlocked(
        contextFor(ApplicationsController, 'list', '10.0.0.3'),
        GLOBAL_LIMIT,
      );
      await expect(
        guard.canActivate(
          contextFor(ApplicationsController, 'list', '10.0.0.4'),
        ),
      ).resolves.toBe(true);
    });
  });

  describe('auth policy', () => {
    it('allows requests up to the stricter limit and rejects the one after it', async () => {
      const ctx = contextFor(AuthController, 'login', '10.0.1.1');
      expect(await consumeUntilBlocked(ctx, AUTH_LIMIT + 1)).toBe(AUTH_LIMIT);
    });

    it('shares one bucket across credential endpoints so rotating them buys nothing', async () => {
      const ip = '10.0.1.2';
      await consumeUntilBlocked(
        contextFor(AuthController, 'login', ip),
        AUTH_LIMIT,
      );
      await expect(
        guard.canActivate(contextFor(AuthController, 'register', ip)),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('policy isolation', () => {
    it('auth requests do not draw down the global budget', async () => {
      const ip = '10.0.2.1';
      // Exhaust auth entirely.
      await consumeUntilBlocked(
        contextFor(AuthController, 'login', ip),
        AUTH_LIMIT + 1,
      );
      // A normal endpoint still has its full global allowance.
      expect(
        await consumeUntilBlocked(
          contextFor(ApplicationsController, 'list', ip),
          GLOBAL_LIMIT + 1,
        ),
      ).toBe(GLOBAL_LIMIT);
    });

    it('global traffic does not consume the auth budget', async () => {
      const ip = '10.0.2.2';
      await consumeUntilBlocked(
        contextFor(ApplicationsController, 'list', ip),
        GLOBAL_LIMIT + 1,
      );
      expect(
        await consumeUntilBlocked(
          contextFor(AuthController, 'login', ip),
          AUTH_LIMIT + 1,
        ),
      ).toBe(AUTH_LIMIT);
    });
  });

  describe('sensitive policy', () => {
    it('gives each route its own bucket', async () => {
      const ip = '10.0.3.1';
      expect(
        await consumeUntilBlocked(
          contextFor(ApplicationsController, 'resendParentVerification', ip),
          SENSITIVE_LIMIT + 1,
        ),
      ).toBe(SENSITIVE_LIMIT);
      // The college resend is a separate endpoint, so it is untouched — this is
      // the per-route behaviour the previous inline @Throttle had.
      await expect(
        guard.canActivate(
          contextFor(ApplicationsController, 'resendCollegeVerification', ip),
        ),
      ).resolves.toBe(true);
    });
  });

  describe('ttl expiry', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('frees the budget again once the window has passed', async () => {
      vi.useFakeTimers();
      const ctx = contextFor(AuthController, 'login', '10.0.5.1');

      expect(await consumeUntilBlocked(ctx, AUTH_LIMIT + 1)).toBe(AUTH_LIMIT);

      // The in-memory store decrements each hit on its own timer, so the whole
      // window has to elapse before the bucket is clear again.
      await vi.advanceTimersByTimeAsync(TTL + 1);

      expect(await consumeUntilBlocked(ctx, AUTH_LIMIT + 1)).toBe(AUTH_LIMIT);
    });
  });

  describe('error shape', () => {
    it('renders a 429 through GlobalExceptionFilter in the project envelope', async () => {
      const ctx = contextFor(AuthController, 'login', '10.0.4.1');
      await consumeUntilBlocked(ctx, AUTH_LIMIT);
      const error = await guard.canActivate(ctx).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(HttpException);

      // Push it through the real filter — asserting on the exception alone
      // would have missed that a string body renders as "InternalServerError".
      let body: Record<string, unknown> | undefined;
      let status: number | undefined;
      const host = {
        switchToHttp: () => ({
          getResponse: () => ({
            status: (code: number) => {
              status = code;
              return {
                json: (payload: Record<string, unknown>) => (body = payload),
              };
            },
          }),
          getRequest: () => ({ url: '/api/v1/auth/login' }),
        }),
      };
      new GlobalExceptionFilter().catch(error, host as never);

      expect(status).toBe(429);
      expect(body).toMatchObject({
        success: false,
        statusCode: 429,
        error: 'TooManyRequests',
        message: 'Too many requests. Please try again later.',
        path: '/api/v1/auth/login',
      });
      expect(body).toHaveProperty('timestamp');

      // Must not leak which limiter tripped or how much budget is left. Scoped
      // to the fields the guard controls — `path` is the caller's own URL,
      // echoed by the existing filter for every error.
      const disclosed = `${String(body?.error)} ${String(body?.message)}`;
      expect(disclosed).not.toContain('auth');
      expect(disclosed).not.toContain('sensitive');
      expect(disclosed).not.toContain('global');
      expect(disclosed).not.toContain('ThrottlerException');
      expect(disclosed).not.toContain('InternalServerError');
      expect(disclosed).not.toMatch(/\d/); // no counters or remaining budget
    });
  });
});
