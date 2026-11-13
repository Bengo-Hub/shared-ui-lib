// node --test src/components/format/timezone.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_TIME_ZONE,
  applyUserTimeZone,
  formatDate,
  formatDateTime,
  formatTime,
  getActiveTimeZone,
  isValidTimeZone,
  resolveTimeZone,
  setActiveTimeZone,
  subscribeTimeZone,
  toUserZone,
} from './timezone.ts';

// 22:30 UTC on 13 Nov is already 14 Nov in Nairobi (UTC+3).
const LATE_UTC = '2026-11-13T22:30:00Z';

test('the user zone wins over the tenant zone', () => {
  assert.equal(resolveTimeZone({ profile: { timezone: 'Africa/Lagos' } }, { timezone: 'Europe/London' }), 'Africa/Lagos');
});

test('the tenant zone is used when the user has none', () => {
  assert.equal(resolveTimeZone({ profile: {} }, { timezone: 'Europe/London' }), 'Europe/London');
  assert.equal(resolveTimeZone(null, { timezone: 'Europe/London' }), 'Europe/London');
});

test('Africa/Nairobi is the last resort', () => {
  assert.equal(resolveTimeZone(), DEFAULT_TIME_ZONE);
  assert.equal(resolveTimeZone({ profile: null }, null), DEFAULT_TIME_ZONE);
});

test('unknown and blank zones are skipped', () => {
  assert.equal(resolveTimeZone({ profile: { timezone: 'Mars/Olympus' } }, { timezone: 'Asia/Dubai' }), 'Asia/Dubai');
  assert.equal(resolveTimeZone({ profile: { timezone: '  ' } }, { timezone: '' }), DEFAULT_TIME_ZONE);
  assert.equal(isValidTimeZone('Mars/Olympus'), false);
  assert.equal(isValidTimeZone('Africa/Kampala'), true);
});

test('formatters use the zone they are given', () => {
  assert.equal(formatDate(LATE_UTC, 'Africa/Nairobi'), '14 Nov 2026');
  assert.equal(formatDate(LATE_UTC, 'America/New_York'), '13 Nov 2026');
  assert.equal(formatTime(LATE_UTC, 'Africa/Nairobi'), '01:30');
  assert.equal(formatTime(LATE_UTC, 'Europe/London'), '22:30');
  assert.equal(formatDateTime(LATE_UTC, 'Africa/Nairobi'), formatDate(LATE_UTC, 'Africa/Nairobi') + ', 01:30');
});

test('formatters fall back to the active zone', () => {
  applyUserTimeZone({ profile: { timezone: 'America/New_York' } }, { timezone: 'Africa/Nairobi' });
  assert.equal(getActiveTimeZone(), 'America/New_York');
  assert.equal(formatDate(LATE_UTC), '13 Nov 2026');
  assert.equal(formatTime(LATE_UTC, 'Not/AZone'), '17:30');
  setActiveTimeZone(DEFAULT_TIME_ZONE);
  assert.equal(formatDate(LATE_UTC), '14 Nov 2026');
});

test('a bare calendar day keeps its day in every zone', () => {
  assert.equal(formatDate('2026-11-20', 'America/New_York'), '20 Nov 2026');
  assert.equal(formatDate('2026-11-20', 'Pacific/Kiritimati'), '20 Nov 2026');
});

test('empty and unparseable input', () => {
  assert.equal(formatDate(null), '');
  assert.equal(formatDate('', undefined, { fallback: '-' }), '-');
  assert.equal(formatDate('not a date'), 'not a date');
});

test('caller options override the defaults', () => {
  assert.equal(formatDate(LATE_UTC, 'Africa/Nairobi', { dateStyle: 'medium', locale: 'en-GB' }), '14 Nov 2026');
  assert.equal(formatDate(LATE_UTC, 'Africa/Nairobi', { day: 'numeric', month: 'long', year: 'numeric' }), '14 November 2026');
  assert.equal(formatDate(LATE_UTC, 'Africa/Nairobi', { month: 'long' }), 'November');
  assert.equal(formatTime(LATE_UTC, 'Africa/Nairobi', { hour12: true, locale: 'en-US' }), '01:30 AM');
});

test('subscribers hear zone changes once', () => {
  let calls = 0;
  const off = subscribeTimeZone(() => calls++);
  setActiveTimeZone('Asia/Kolkata');
  setActiveTimeZone('Asia/Kolkata');
  setActiveTimeZone('bogus');
  off();
  setActiveTimeZone('Asia/Dubai');
  setActiveTimeZone(DEFAULT_TIME_ZONE);
  assert.equal(calls, 2);
  assert.equal(getActiveTimeZone(), DEFAULT_TIME_ZONE);
});

test('toUserZone shows the wall clock of the given zone for date-fns', () => {
  // 22:30 UTC on the 13th is 01:30 on the 14th in Nairobi and 17:30 on the 13th in New York.
  const nairobi = toUserZone(new Date(LATE_UTC), 'Africa/Nairobi');
  assert.deepEqual([nairobi.getDate(), nairobi.getHours(), nairobi.getMinutes()], [14, 1, 30]);
  const ny = toUserZone(new Date(LATE_UTC), 'America/New_York');
  assert.deepEqual([ny.getDate(), ny.getHours(), ny.getMinutes()], [13, 17, 30]);
  const bad = new Date('not a date');
  assert.equal(toUserZone(bad), bad);
});
