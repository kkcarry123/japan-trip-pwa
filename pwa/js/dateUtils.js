const TRIP_START = '2026-09-12';
const TRIP_END = '2026-09-20';

function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTripDay(now = new Date()) {
  const start = toDateOnly(new Date(TRIP_START));
  const end = toDateOnly(new Date(TRIP_END));
  const today = toDateOnly(now);
  if (today < start || today > end) return null;
  const diffDays = Math.round((today - start) / 86400000);
  return diffDays + 1;
}

function daysUntilTrip(now = new Date()) {
  const start = toDateOnly(new Date(TRIP_START));
  const today = toDateOnly(now);
  const diff = Math.round((start - today) / 86400000);
  return diff > 0 ? diff : 0;
}

function isTripOver(now = new Date()) {
  const end = toDateOnly(new Date(TRIP_END));
  const today = toDateOnly(now);
  return today > end;
}

export { getTripDay, daysUntilTrip, isTripOver, TRIP_START, TRIP_END };
