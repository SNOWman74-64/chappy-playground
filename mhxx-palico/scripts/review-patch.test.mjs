import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReviewPatch } from '../review.js';

test('verdict-only review preserves unseen moves, skills and memo', () => {
  assert.deepEqual(buildReviewPatch({ verdict: 'hold', memo: '', supportMoves: [], skills: [] }, new Set(['verdict'])), { verdict: 'hold' });
});

test('explicit clearing maps optional fields to API null without changing verdict', () => {
  const fields = ['name', 'level', 'supportType', 'supportPattern', 'skillPattern', 'memo'];
  assert.deepEqual(buildReviewPatch(Object.fromEntries(fields.map(key => [key, ' '])), new Set(fields)), Object.fromEntries(fields.map(key => [key, null])));
});

test('review records unknown classifications and numeric level without guessing', () => {
  const values = { name: ' オリヒメ ', level: '35', supportMoves: [{ name: '確認した行動', group: 'unknown' }], skills: [], verdict: 'keep' };
  assert.deepEqual(buildReviewPatch(values, new Set(Object.keys(values))), { ...values, name: 'オリヒメ', level: 35, skills: null });
  assert.deepEqual(buildReviewPatch(values), {});
});
