// node --test src/components/legal/legal-urls.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DATA_DELETION_URL, legalUrls } from './legal-urls.ts';

test('every link is built from the legal base', () => {
  const u = legalUrls('https://accounts.example.com/');
  assert.equal(u.privacy, 'https://accounts.example.com/privacy');
  assert.equal(u.terms, 'https://accounts.example.com/terms-of-service');
  assert.equal(u.dataRequests, 'https://accounts.example.com/data-requests');
  assert.equal(u.autopilotTerms, 'https://accounts.example.com/legal/marketflow-autopublish-terms');
});

test('the data deletion page defaults to MarketFlow and can be replaced', () => {
  const saved = process.env.NEXT_PUBLIC_DATA_DELETION_URL;
  delete process.env.NEXT_PUBLIC_DATA_DELETION_URL;
  try {
    assert.equal(legalUrls().dataDeletion, DEFAULT_DATA_DELETION_URL);
    assert.equal(DEFAULT_DATA_DELETION_URL, 'https://marketflow.codevertexafrica.com/data-deletion');
    assert.equal(
      legalUrls(undefined, { dataDeletionUrl: 'https://app.example.com/delete' }).dataDeletion,
      'https://app.example.com/delete',
    );
    process.env.NEXT_PUBLIC_DATA_DELETION_URL = 'https://env.example.com/delete';
    assert.equal(legalUrls().dataDeletion, 'https://env.example.com/delete');
  } finally {
    if (saved === undefined) delete process.env.NEXT_PUBLIC_DATA_DELETION_URL;
    else process.env.NEXT_PUBLIC_DATA_DELETION_URL = saved;
  }
});
