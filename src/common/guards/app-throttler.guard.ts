import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard, type ThrottlerRequest } from '@nestjs/throttler';
import {
  THROTTLE_POLICY_KEY,
  type ThrottlePolicy,
} from '../decorators/throttle-policy.decorator';

/**
 * Registered as a global APP_GUARD, so it runs before JwtAuthGuard and rejects
 * floods before any bcrypt/database work happens.
 *
 * Two behaviours differ from the stock guard, both deliberate:
 *
 * 1. Policy routing (`handleRequest`). ThrottlerGuard evaluates *every* named
 *    throttler on *every* request, which would mean the 5/min auth limit also
 *    applied to ordinary API calls. Here each request is matched to exactly
 *    one policy and the others are skipped.
 *
 * 2. Key shape (`generateKey`). The stock key includes the class and handler
 *    name, so a "100 per minute" limit is really 100 per minute *per
 *    endpoint* — across ~200 endpoints that is no cap at all. `global` and
 *    `auth` are keyed on the caller alone to give a genuine per-client
 *    budget; `sensitive` keeps the per-route key on purpose.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  private policyFor(request: ThrottlerRequest): ThrottlePolicy {
    return (
      this.reflector.getAllAndOverride<ThrottlePolicy>(THROTTLE_POLICY_KEY, [
        request.context.getHandler(),
        request.context.getClass(),
      ]) ?? 'global'
    );
  }

  protected async handleRequest(request: ThrottlerRequest): Promise<boolean> {
    // Returning true means "this throttler has no objection", which is how the
    // base guard's own skip path works — it does not short-circuit the others.
    if (request.throttler.name !== this.policyFor(request)) {
      return true;
    }
    return super.handleRequest(request);
  }

  protected generateKey(
    context: Parameters<ThrottlerGuard['generateKey']>[0],
    suffix: string,
    name: string,
  ): string {
    if (name === 'sensitive') {
      return `${name}:${context.getClass().name}.${context.getHandler().name}:${suffix}`;
    }
    return `${name}:${suffix}`;
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    // req.ip already honours Express' `trust proxy` setting, which main.ts
    // drives from TRUST_PROXY — so behind Nginx this is the real client IP,
    // and with no proxy configured it is the socket address. Never read
    // X-Forwarded-For directly: unvalidated, it lets a caller mint a new
    // bucket per request and bypass the limit entirely.
    return Promise.resolve((req.ip as string) ?? 'unknown');
  }

  protected throwThrottlingException(): Promise<void> {
    // An object body, not ThrottlerException's plain string: GlobalExceptionFilter
    // only reads `error` off an object response, so a string would surface this
    // 429 to clients as "error": "InternalServerError".
    //
    // Says nothing about which policy tripped or how much budget is left — a
    // 429 must not become an oracle for enumerating valid accounts.
    return Promise.reject(
      new HttpException(
        {
          error: 'TooManyRequests',
          message: 'Too many requests. Please try again later.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      ),
    );
  }
}
