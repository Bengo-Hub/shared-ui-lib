import assert from 'node:assert/strict';
import { test } from 'node:test';

import { filterMentions, MENTION_LIMIT, type MentionOption } from './mentions.ts';

const people: MentionOption[] = [
  { id: '1', label: 'Amina Otieno', description: 'amina@acme.test' },
  { id: '2', label: 'Brian Kamau', description: 'brian@acme.test' },
  { id: '3', label: 'Otieno Wafula', description: 'ow@acme.test' },
  { id: '4', label: 'Grace Achieng', description: 'grace.amin@acme.test' },
];

test('an empty query lists the first options', () => {
  assert.deepEqual(filterMentions(people, '').map((p) => p.id), ['1', '2', '3', '4']);
  assert.equal(filterMentions(people, '', 2).length, 2);
});

test('a word that starts with the query ranks before a match inside a label or description', () => {
  // "otieno" starts a word in both names; "amin" starts Amina and sits inside Grace's email.
  assert.deepEqual(filterMentions(people, 'otieno').map((p) => p.id), ['1', '3']);
  assert.deepEqual(filterMentions(people, 'AMIN').map((p) => p.id), ['1', '4']);
});

test('no match gives an empty list, and the limit holds', () => {
  assert.deepEqual(filterMentions(people, 'zzz'), []);
  const many = Array.from({ length: 30 }, (_, i) => ({ id: String(i), label: `Person ${i}` }));
  assert.equal(filterMentions(many, 'person').length, MENTION_LIMIT);
});
