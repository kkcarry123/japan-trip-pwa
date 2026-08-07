// pwa/js/app.js
import { getTripDay, daysUntilTrip, isTripOver } from './dateUtils.js';

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
  // 行程项渲染留给 Task 9 补充
}

async function switchDay(day) {
  currentDay = day;
  renderTabs(day);
  const data = await loadDay(day);
  renderDay(data);
}

async function init() {
  const tripDay = getTripDay(new Date());
  if (tripDay === null) {
    renderTabs(1);
    renderBoundaryScreen();
  } else {
    await switchDay(tripDay);
  }
}

init();

export { switchDay, loadDay, renderDay, currentDay };
