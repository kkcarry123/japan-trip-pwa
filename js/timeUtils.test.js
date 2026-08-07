// pwa/js/timeUtils.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTimeToMinutes, getScheduleStatus } from './timeUtils.js';

test('parseTimeToMinutes converts HH:MM to minutes since midnight', () => {
  assert.equal(parseTimeToMinutes('09:05'), 545);
  assert.equal(parseTimeToMinutes('00:00'), 0);
});

const items = [
  { time: '07:00', endTime: '08:30' },
  { time: '09:30', endTime: '12:00' },
  { time: '13:20', endTime: null },
  { time: '19:00', endTime: '21:00' },
];

test('getScheduleStatus finds current item inside its time window', () => {
  const { currentIndex, nextIndex, pastIndices } = getScheduleStatus(items, parseTimeToMinutes('10:00'));
  assert.equal(currentIndex, 1);
  assert.equal(nextIndex, 2);
  assert.deepEqual([...pastIndices], [0]);
});

test('getScheduleStatus finds next item when between two items', () => {
  const { currentIndex, nextIndex, pastIndices } = getScheduleStatus(items, parseTimeToMinutes('08:45'));
  assert.equal(currentIndex, null);
  assert.equal(nextIndex, 1);
  assert.deepEqual([...pastIndices], [0]);
});

test('getScheduleStatus before first item: nothing past, first item is next', () => {
  const { currentIndex, nextIndex, pastIndices } = getScheduleStatus(items, parseTimeToMinutes('06:00'));
  assert.equal(currentIndex, null);
  assert.equal(nextIndex, 0);
  assert.deepEqual([...pastIndices], []);
});

test('getScheduleStatus after last item: everything past, no next', () => {
  const { currentIndex, nextIndex, pastIndices } = getScheduleStatus(items, parseTimeToMinutes('22:00'));
  assert.equal(currentIndex, null);
  assert.equal(nextIndex, null);
  assert.deepEqual([...pastIndices], [0, 1, 2, 3]);
});

test('point-in-time item with no endTime becomes past once its minute arrives', () => {
  const { currentIndex, pastIndices } = getScheduleStatus(items, parseTimeToMinutes('13:20'));
  assert.equal(currentIndex, null);
  assert.ok(pastIndices.has(2));
});
