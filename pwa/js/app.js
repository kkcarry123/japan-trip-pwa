// pwa/js/app.js
import { getTripDay, daysUntilTrip, isTripOver } from './dateUtils.js';
import { nowToMinutes, getScheduleStatus, parseTimeToMinutes } from './timeUtils.js';
import { initMap, showDayOnMap } from './map.js';

const dayTabsEl = document.getElementById('day-tabs');
const contentEl = document.getElementById('day-content');

let currentDay = null;
const dayCache = {};

async function loadDay(day) {
  if (!dayCache[day]) {
    const res = await fetch(`data/d${day}.json`);
    dayCache[day] = await res.json();
  }
  return dayCache[day];
}

function renderTabs(activeDay) {
  dayTabsEl.innerHTML = '';
  for (let d = 1; d <= 9; d++) {
    const btn = document.createElement('button');
    btn.textContent = `D${d}`;
    btn.className = d === activeDay ? 'tab active' : 'tab';
    btn.addEventListener('click', () => switchDay(d));
    dayTabsEl.appendChild(btn);
  }
}

function renderBoundaryScreen() {
  contentEl.innerHTML = '';
  const now = new Date();
  const box = document.createElement('div');
  box.className = 'boundary-screen';
  box.textContent = isTripOver(now)
    ? '行程已结束,期待下一次旅行'
    : `还有 ${daysUntilTrip(now)} 天出发`;
  contentEl.appendChild(box);
}

function renderDay(data) {
  contentEl.innerHTML = '';

  const title = document.createElement('h2');
  title.textContent = `D${data.day} · ${data.date} ${data.title}`;
  contentEl.appendChild(title);

  const now = nowToMinutes(new Date());
  const { currentIndex, nextIndex, pastIndices } = getScheduleStatus(data.items, now);

  const banner = document.createElement('div');
  banner.className = 'countdown-banner';
  if (nextIndex !== null) {
    const nextItem = data.items[nextIndex];
    const mins = parseTimeToMinutes(nextItem.time) - now;
    banner.textContent = `下一项:${nextItem.title},还有 ${mins} 分钟`;
  } else if (currentIndex !== null) {
    banner.textContent = `进行中:${data.items[currentIndex].title}`;
  } else {
    banner.textContent = '今天的行程已经结束';
  }
  contentEl.appendChild(banner);

  const list = document.createElement('ul');
  list.className = 'item-list';
  data.items.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'item';
    if (pastIndices.has(i)) li.classList.add('past');
    if (i === currentIndex) li.classList.add('current');
    if (item.status === 'confirmed') li.classList.add('confirmed');
    if (item.status === 'pending') li.classList.add('pending');

    const time = document.createElement('span');
    time.className = 'item-time';
    time.textContent = item.endTime ? `${item.time}–${item.endTime}` : item.time;

    const label = document.createElement('span');
    label.className = 'item-title';
    label.textContent = item.title + (item.status === 'confirmed' ? ' ✅' : item.status === 'pending' ? ' ⚠' : '');

    li.appendChild(time);
    li.appendChild(label);

    if (item.detail) {
      const detail = document.createElement('p');
      detail.className = 'item-detail';
      detail.textContent = item.detail;
      li.appendChild(detail);
    }

    list.appendChild(li);
  });
  contentEl.appendChild(list);
}

async function switchDay(day) {
  currentDay = day;
  renderTabs(day);
  const data = await loadDay(day);
  renderDay(data);
  showDayOnMap(data.items);
}

async function init() {
  initMap();

  const tripDay = getTripDay(new Date());
  if (tripDay === null) {
    renderTabs(1);
    renderBoundaryScreen();
  } else {
    await switchDay(tripDay);
  }

  setInterval(() => {
    if (currentDay !== null) renderDay(dayCache[currentDay]);
  }, 60000);
}

init();

export { switchDay, loadDay, renderDay, currentDay };
