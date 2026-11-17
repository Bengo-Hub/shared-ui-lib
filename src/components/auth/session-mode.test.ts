// node --test src/components/auth/session-mode.test.ts
// Every token string below is a fake fixture value. secret-scan:allow
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cookieSessionAllowed, scrubStoredSession } from './session-mode.ts';

test('the cookie session runs only with the flag on, over https, on a codevertexafrica.com subdomain', () => {
  assert.equal(cookieSessionAllowed('true', 'books.codevertexafrica.com', 'https:'), true);
  assert.equal(cookieSessionAllowed('1', 'POS.CodevertexAfrica.com.', 'https:'), true);
  // Flag off or unset.
  assert.equal(cookieSessionAllowed('false', 'books.codevertexafrica.com', 'https:'), false);
  assert.equal(cookieSessionAllowed(undefined, 'books.codevertexafrica.com', 'https:'), false);
  // Tenant custom domains and look-alikes keep stored tokens.
  assert.equal(cookieSessionAllowed('true', 'alphachinamarket.co.ke', 'https:'), false);
  assert.equal(cookieSessionAllowed('true', 'erp.masterspace.co.ke', 'https:'), false);
  assert.equal(cookieSessionAllowed('true', 'codevertexafrica.com.evil.example', 'https:'), false);
  assert.equal(cookieSessionAllowed('true', 'evilcodevertexafrica.com', 'https:'), false);
  // The bare domain is not an app host, and plain http never carries a Secure cookie.
  assert.equal(cookieSessionAllowed('true', 'codevertexafrica.com', 'https:'), false);
  assert.equal(cookieSessionAllowed('true', 'books.codevertexafrica.com', 'http:'), false);
  // No page (server render): false.
  assert.equal(cookieSessionAllowed('true', '', 'https:'), false);
});

test('scrubStoredSession drops the tokens and keeps the profile', () => {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
  try {
    store.set('app-auth', JSON.stringify({ state: { session: { accessToken: 'a', refreshToken: 'r' }, user: { id: 'u1' } }, version: 0 })); // secret-scan:allow
    scrubStoredSession('app-auth');
    const after = JSON.parse(store.get('app-auth')!);
    assert.equal('session' in after.state, false);
    assert.deepEqual(after.state.user, { id: 'u1' });
    assert.equal(after.version, 0);

    // Nothing stored, or nothing to drop: unchanged and no throw.
    scrubStoredSession('missing');
    store.set('plain', JSON.stringify({ state: { user: null } }));
    scrubStoredSession('plain');
    assert.equal(store.get('plain'), JSON.stringify({ state: { user: null } }));
    store.set('broken', '{not json');
    scrubStoredSession('broken');
    assert.equal(store.get('broken'), '{not json');
  } finally {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  }
});
