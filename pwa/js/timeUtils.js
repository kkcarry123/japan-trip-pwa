// pwa/js/timeUtils.js
function parseTimeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function nowToMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

function getScheduleStatus(items, nowMinutes) {
  let currentIndex = null;
  let nextIndex = null;
  const pastIndices = new Set();

  for (let i = 0; i < items.length; i++) {
    const start = parseTimeToMinutes(items[i].time);
    const end = items[i].endTime ? parseTimeToMinutes(items[i].endTime) : start;

    if (nowMinutes >= start && nowMinutes < end) {
      currentIndex = i;
    } else if (end <= nowMinutes) {
      pastIndices.add(i);
    } else if (nextIndex === null && start > nowMinutes) {
      nextIndex = i;
    }
  }

  return { currentIndex, nextIndex, pastIndices };
}

export { parseTimeToMinutes, nowToMinutes, getScheduleStatus };
