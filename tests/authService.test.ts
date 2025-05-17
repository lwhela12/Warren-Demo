import { describe, it, expect } from 'vitest';
import { storeMagicToken, verifyMagicLink } from '../server/services/authService';

describe('verifyMagicLink', () => {
  it('returns a JWT for a valid token', () => {
    storeMagicToken('test@example.com', 'tok');
    const jwt = verifyMagicLink('tok');
    expect(typeof jwt).toBe('string');
    expect(jwt.split('.').length).toBe(3);
  });

  it('throws for invalid token', () => {
    expect(() => verifyMagicLink('bad')).toThrow();
  });
});
