import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTripDay, daysUntilTrip, isTripOver } from './dateUtils.js';

test('getTripDay returns null before trip starts', () => {
  assert.equal(getTripDay(new Date('2026-09-01T10:00:00')), null);
});

test('getTripDay returns 1 on trip start date', () => {
  assert.equal(getTripDay(new Date('2026-09-12T10:00:00')), 1);
});

test('getTripDay returns 9 on trip end date', () => {
  assert.equal(getTripDay(new Date('2026-09-20T10:00:00')), 9);
});

test('getTripDay returns null after trip ends', () => {
  assert.equal(getTripDay(new Date('2026-09-21T10:00:00')), null);
});

test('daysUntilTrip counts down correctly before trip', () => {
  assert.equal(daysUntilTrip(new Date('2026-09-09T10:00:00')), 3);
});

test('daysUntilTrip is 0 once trip has started', () => {
  assert.equal(daysUntilTrip(new Date('2026-09-15T10:00:00')), 0);
});

test('isTripOver is false during trip and true after', () => {
  assert.equal(isTripOver(new Date('2026-09-18T10:00:00')), false);
  assert.equal(isTripOver(new Date('2026-09-21T00:00:01')), true);
});
