import assert from 'node:assert/strict';
import { test } from 'node:test';
import { serviceAppName } from './service-name.ts';

test('a tenant named after its app reads once', () => {
  assert.equal(serviceAppName('Hadia', 'Hadia'), 'Hadia');
  assert.equal(serviceAppName('hadia', 'Hadia'), 'Hadia');
});

test('other tenants keep their word before the app', () => {
  assert.equal(serviceAppName('Urban Loft Cafe', 'POS'), 'Urban POS');
  assert.equal(serviceAppName('', 'POS'), 'POS');
});
