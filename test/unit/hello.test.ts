import { describe, expect, it } from 'vitest';

function helloWorld(): string {
  return 'Hello, world Vitest!';
}

describe('helloWorld', () => {
  it('returns the greeting', () => {
    expect(helloWorld()).toBe('Hello, world Vitest!');
  });
});
