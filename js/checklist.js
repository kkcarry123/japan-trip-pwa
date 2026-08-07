// pwa/js/checklist.js
const STORAGE_KEY = 'checklist-done';

function loadDoneState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveDoneState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function initChecklist() {
  const res = await fetch('data/checklist.json');
  const items = await res.json();
  const doneState = loadDoneState();

  const container = document.getElementById('checklist-view');
  container.innerHTML = '';
  const list = document.createElement('ul');
  list.className = 'checklist';

  items.forEach((item) => {
    const li = document.createElement('li');
    if (doneState[item.id]) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!doneState[item.id];
    checkbox.addEventListener('change', () => {
      doneState[item.id] = checkbox.checked;
      saveDoneState(doneState);
      li.classList.toggle('done', checkbox.checked);
    });

    const label = document.createElement('span');
    label.textContent = item.text;

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);
  });

  container.appendChild(list);
}

export { initChecklist };
