import { SetMetadata } from '@nestjs/common';

/**
 * Which named throttler in `ThrottlerModule` a route is billed against.
 *
 * Every request is evaluated by exactly one policy (see AppThrottlerGuard), so
 * an auth attempt never eats into the caller's normal API budget and vice
 * versa. Routes with no decorator fall back to `global`.
 *
 * - `global`    — per-client budget shared across every ordinary endpoint.
 * - `auth`      — per-client budget shared across every credential endpoint.
 *                 Deliberately one bucket for all of them: an attacker who
 *                 rotates login -> register -> forgot-password must not get a
 *                 fresh allowance at each stop.
 * - `sensitive` — per-route bucket for endpoints with an expensive or
 *                 abusable side effect (sending mail). Keyed per handler so
 *                 one noisy endpoint doesn't lock the others.
 */
export const THROTTLE_POLICY_KEY = 'throttlePolicy';

export type ThrottlePolicy = 'global' | 'auth' | 'sensitive';

/** Bill this route against the strict `auth` policy. */
export const AuthThrottle = () => SetMetadata(THROTTLE_POLICY_KEY, 'auth');

/** Bill this route against its own `sensitive` per-route bucket. */
export const SensitiveThrottle = () =>
  SetMetadata(THROTTLE_POLICY_KEY, 'sensitive');
