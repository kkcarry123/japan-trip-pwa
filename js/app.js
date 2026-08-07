// pwa/js/app.js
import { getTripDay, daysUntilTrip, isTripOver } from './dateUtils.js';
import { nowToMinutes, getScheduleStatus } from './timeUtils.js';
import { initMap, showDayOnMap, focusPoint } from './map.js';
import { initChecklist } from './checklist.js';

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
  const { currentIndex, pastIndices } = getScheduleStatus(data.items, now);

  const list = document.createElement('ul');
  list.className = 'item-list';

  let pointNumber = 0;
  data.items.forEach((item, i) => {
    const isTransit = item.kind === 'transit';
    const hasPoint = item.lat != null && item.lng != null;
    if (hasPoint) pointNumber++;

    const li = document.createElement('li');
    li.className = isTransit ? 'item transit' : 'item stop';
    if (pastIndices.has(i)) li.classList.add('past');
    if (i === currentIndex) li.classList.add('current');
    if (item.status === 'confirmed') li.classList.add('confirmed');
    if (item.status === 'pending') li.classList.add('pending');

    if (isTransit) {
      const row = document.createElement('div');
      row.className = 'transit-row';
      const icon = document.createElement('span');
      icon.className = 'transit-icon';
      icon.textContent = item.icon || '🚶';
      const text = document.createElement('span');
      text.className = 'transit-text';
      text.textContent = item.title + (item.detail ? ` · ${item.detail}` : '');
      row.appendChild(icon);
      row.appendChild(text);
      li.appendChild(row);
    } else {
      if (hasPoint) {
        li.classList.add('clickable');
        const num = document.createElement('span');
        num.className = 'item-number';
        num.textContent = pointNumber;
        li.appendChild(num);
        li.addEventListener('click', () => focusPoint(item.lat, item.lng));
      }

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

function initBottomNav() {
  document.querySelectorAll('#bottom-nav button').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#bottom-nav button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const isItinerary = btn.dataset.view === 'itinerary';
      document.getElementById('day-tabs').style.display = isItinerary ? '' : 'none';
      document.getElementById('day-content').style.display = isItinerary ? '' : 'none';
      document.getElementById('cache-maps-btn').style.display = isItinerary ? '' : 'none';
      document.getElementById('map').style.display = isItinerary ? '' : 'none';
      document.getElementById('checklist-view').style.display = isItinerary ? 'none' : '';
    });
  });
}

async function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }

  initMap();
  initChecklist();
  initBottomNav();

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
