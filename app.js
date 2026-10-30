import { initialTasks } from './tasks.js';
const KEY = 'roadside-tallinn-photo-v2';
const LEGACY_KEY = 'roadside-tallinn-lv-v1';
const categories = [...new Set(initialTasks.map(t => t.category))];
let tasks = initialTasks.map(t => ({ ...t, done: false }));
let storageAvailable = true;
const validTask = t => t && typeof t.id === 'string' && typeof t.title === 'string' && typeof t.category === 'string' && typeof t.description === 'string' && typeof t.done === 'boolean';
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const saved = JSON.parse(raw);
    if (saved && saved.completed && Array.isArray(saved.customTasks)) {
      tasks.forEach(t => t.done = saved.completed[t.id] === true);
      tasks.push(...saved.customTasks.filter(validTask).filter(t => !initialTasks.some(base => base.id === t.id)));
    }
  } else {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (Array.isArray(legacy)) tasks.push(...legacy.filter(validTask).filter(t => t.id !== 'finala-uzvaras-poza' && !t.id.startsWith('sample-')));
  }
} catch { storageAvailable = false; }
let filter = 'all';
let category = 'all';
const $ = s => document.querySelector(s);
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500); }
function save() {
  try {
    const completed = Object.fromEntries(tasks.filter(t => t.done).map(t => [t.id, true]));
    const customTasks = tasks.filter(t => !initialTasks.some(base => base.id === t.id));
    localStorage.setItem(KEY, JSON.stringify({ completed, customTasks }));
  } catch { storageAvailable = false; toast('Saglabāšana nav pieejama. Progress paliks tikai šajā apmeklējumā.'); }
}
function el(tag, className, text) { const e = document.createElement(tag); if (className) e.className = className; if (text !== undefined) e.textContent = text; return e; }
function cardFor(task) {
  const card = el('article', `card${task.done ? ' done' : ''}`); card.dataset.id = task.id;
  const content = el('div', 'card-content');
  const meta = el('div', 'card-meta'); meta.append(el('span', '', task.category), el('span', 'card-number', String(tasks.indexOf(task) + 1).padStart(2, '0')));
  content.append(meta, el('h4', 'card-title', task.title));
  if (task.photographer || task.participants || task.flash) {
    const details = el('dl', 'photo-details');
    for (const [label, value] of [['Fotogrāfs', task.photographer], ['Pozē', task.participants], ['Zibspuldze', task.flash]]) {
      if (!value) continue;
      const row = el('div', 'photo-detail'); row.append(el('dt', '', label), el('dd', '', value)); details.append(row);
    }
    content.append(details);
  }
  content.append(el('p', 'card-description', task.description));
  const toggle = el('button', 'done-toggle'); toggle.type = 'button'; toggle.setAttribute('aria-pressed', task.done);
  toggle.setAttribute('aria-label', `${task.done ? 'Atzīmēt kā neizpildītu' : 'Atzīmēt kā izpildītu'}: ${task.title}`);
  const icon = el('span', 'done-icon', task.done ? '✓' : ''); icon.setAttribute('aria-hidden', 'true');
  toggle.append(icon, el('span', '', task.done ? 'Izpildīts · Atcelt' : 'Atzīmēt kā izpildītu'));
  toggle.addEventListener('click', () => {
    task.done = !task.done; save(); render();
    const replacement = Array.from(document.querySelectorAll('.card')).find(c => c.dataset.id === task.id);
    if (replacement) replacement.querySelector('.done-toggle').focus(); else document.querySelector('.filter.active').focus();
  });
  card.append(content, toggle); return card;
}
function render() {
  const done = tasks.filter(t => t.done).length;
  $('#all-count').textContent = tasks.length; $('#todo-count').textContent = tasks.length - done; $('#done-count').textContent = done;
  $('#progress-text').textContent = `${done} / ${tasks.length} izpildīts`;
  $('#progress-fill').style.width = `${tasks.length ? done / tasks.length * 100 : 0}%`;
  $('.progress-track').setAttribute('aria-valuemax', tasks.length); $('.progress-track').setAttribute('aria-valuenow', done);
  $('#progress-message').textContent = done === tasks.length && tasks.length ? 'Viss izpildīts! Atmiņas, kas paliks ar mums.' : done ? 'Vēl viena kopīga atmiņa. Turpinām!' : 'Kopīgās atmiņas sākas ar pirmo kartīti.';
  document.querySelectorAll('.filter').forEach(b => { const active = b.dataset.filter === filter; b.classList.toggle('active', active); b.setAttribute('aria-pressed', active); });
  const visible = tasks.filter(t => (category === 'all' || t.category === category) && (filter === 'all' || (filter === 'done' ? t.done : !t.done)));
  $('#empty').hidden = visible.length > 0;
  const groups = [...new Set(tasks.map(t => t.category))].map(name => {
    const groupTasks = visible.filter(t => t.category === name); if (!groupTasks.length) return null;
    const section = el('section', 'task-group'); const heading = el('h3', 'category-heading', name);
    heading.append(el('span', '', `${groupTasks.length} ${groupTasks.length === 1 ? 'uzdevums' : 'uzdevumi'}`));
    const cards = el('div', 'cards'); cards.append(...groupTasks.map(cardFor)); section.append(heading, cards); return section;
  }).filter(Boolean);
  $('#cards').replaceChildren(...groups);
}
for (const name of [...new Set([...categories, ...tasks.map(t => t.category)])]) {
  for (const select of [$('#category-filter')]) { const option = el('option', '', name); option.value = name; select.append(option); }
}
document.querySelectorAll('.filter').forEach(b => b.addEventListener('click', () => { filter = b.dataset.filter; render(); }));
$('#category-filter').addEventListener('change', e => { category = e.target.value; render(); });

render();
if (!storageAvailable) toast('Saglabāšana nav pieejama. Progress paliks tikai šajā apmeklējumā.');
