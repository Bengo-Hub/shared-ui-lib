// node --test src/components/app-switcher/visible-services.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeVisibleServices } from './visible-services.ts';
import type { ServiceDefinition } from './service-registry';

// Mirrors the real SERVICE_REGISTRY entries the rules depend on (icons are irrelevant here).
const Icon = (() => null) as unknown as ServiceDefinition['Icon'];
const registry: ServiceDefinition[] = [
  { key: 'pos', label: 'POS', Icon, category: 'Commerce', color: 'violet', manageOnly: false, serviceTag: 'pos', status: 'live' },
  { key: 'notifications', label: 'Notifications', Icon, category: 'Platform', color: 'amber', manageOnly: true, status: 'live', path: '/dashboard' },
  { key: 'hadia', label: 'Hadia', Icon, category: 'Specialized', color: 'emerald', manageOnly: true, status: 'live', onlyForTenant: 'hadia', path: '/admin' },
];
const defaults = { notifications: 'https://notifications.codevertexafrica.com', hadia: 'https://hadiafrica.com' };

const base = { orgSlug: 'acme', urls: {}, canManageLinks: true };
const run = (o: Partial<Parameters<typeof computeVisibleServices>[0]>) =>
  computeVisibleServices({ ...base, ...o }, registry, defaults);
const keys = (list: { key: string }[]) => list.map((s) => s.key);

test('a custom service is hidden from every other tenant, whatever its subscription state', () => {
  for (const activeServiceTags of [['pos'], [], null, undefined]) {
    assert.ok(!keys(run({ activeServiceTags })).includes('hadia'), String(activeServiceTags));
  }
});

test('the custom service shows for its own tenant, with the default host and fixed path', () => {
  for (const activeServiceTags of [['treasury'], null]) {
    const hadia = run({ orgSlug: 'hadia', activeServiceTags }).find((s) => s.key === 'hadia');
    assert.equal(hadia?.href, 'https://hadiafrica.com/admin');
    assert.ok(!hadia?.locked);
  }
});

test('the custom tenant still sees shared services, locked when outside its plan', () => {
  const pos = run({ orgSlug: 'hadia', urls: { pos: 'https://pos.example' }, activeServiceTags: ['treasury'] }).find((s) => s.key === 'pos');
  assert.ok(pos?.locked);
});

test('notifications appears without the host configuring a URL, on its fixed path', () => {
  const n = run({ activeServiceTags: [] }).find((s) => s.key === 'notifications');
  assert.equal(n?.href, 'https://notifications.codevertexafrica.com/dashboard');
});

test("a host's own URL wins over the default", () => {
  const n = run({ urls: { notifications: 'https://notifications.staging.example' }, activeServiceTags: [] }).find((s) => s.key === 'notifications');
  assert.equal(n?.href, 'https://notifications.staging.example/dashboard');
});

test('slug-routed services keep the /orgSlug link', () => {
  const pos = run({ urls: { pos: 'https://pos.example' }, activeServiceTags: ['pos'] }).find((s) => s.key === 'pos');
  assert.equal(pos?.href, 'https://pos.example/acme');
});

test('manage-only services stay hidden from non-managers', () => {
  const list = run({ orgSlug: 'hadia', canManageLinks: false, activeServiceTags: ['treasury'] });
  assert.ok(!keys(list).includes('notifications'));
  assert.ok(!keys(list).includes('hadia'));
});
