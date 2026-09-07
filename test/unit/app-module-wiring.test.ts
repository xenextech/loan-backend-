import { describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { getOptionsToken, type ThrottlerOptions } from '@nestjs/throttler';
import { AppModule } from '../../src/app.module';

// Guards the wiring that unit-testing AppThrottlerGuard in isolation cannot:
// that the whole DI graph still builds with a global APP_GUARD in it, and that
// the async factory really reads the named policies out of ConfigService.
// compile() instantiates providers without running lifecycle hooks, so no
// database connection is opened.
describe('AppModule throttler wiring', () => {
  it('registers global, auth and sensitive policies from configuration', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const options = moduleRef.get<ThrottlerOptions[]>(getOptionsToken());
    expect(options.map((o) => o.name)).toEqual(['global', 'auth', 'sensitive']);

    // find() rather than Object.fromEntries, which erases the element type.
    const policy = (name: string): ThrottlerOptions => {
      const found = options.find((o) => o.name === name);
      expect(found).toBeDefined();
      return found as ThrottlerOptions;
    };

    for (const name of ['global', 'auth', 'sensitive']) {
      expect(typeof policy(name).limit).toBe('number');
      expect(typeof policy(name).ttl).toBe('number');
    }

    // The whole point of a separate auth policy: strictly tighter than the
    // general budget, whatever the deployment sets them to.
    expect(policy('auth').limit as number).toBeLessThan(
      policy('global').limit as number,
    );

    // configuration.ts defaults — only assertable when a local .env has not
    // overridden them, which is why each is gated on its own variable.
    if (!process.env.THROTTLE_GLOBAL_LIMIT) {
      expect(policy('global').limit).toBe(100);
    }
    if (!process.env.THROTTLE_AUTH_LIMIT) {
      expect(policy('auth').limit).toBe(5);
    }
    if (!process.env.THROTTLE_SENSITIVE_LIMIT) {
      expect(policy('sensitive').limit).toBe(3);
    }

    await moduleRef.close();
  }, 60_000);
});
