const KEY = 'roadside-tallinn-lv-v1';
const initialTasks = [{
  id: 'finala-uzvaras-poza',
  title: 'Fināla uzvaras poza',
  category: 'Kopīgs mirklis',
  description: 'Fotogrāfs: Garāmgājējs vai selfijs spogulī\n\nPozē: Elīza, Raimonds, Laura un Reinis\n\nUzdevums: Fināla uzvaras poza visiem četriem kopā svētdienā pirms došanās mājup!',
  done: false
}];
let tasks = initialTasks.map(t => ({ ...t }));
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (Array.isArray(saved) && saved.every(t => t && typeof t.id === 'string' && typeof t.title === 'string' && typeof t.category === 'string' && typeof t.description === 'string' && typeof t.done === 'boolean')) tasks = saved;
} catch { storageAvailable = false; }
let filter = 'all';
const flipped = new Set();
const icons = { 'Laba kompānija': '☺', 'Mazs līkums': '↗', 'Kopīgs mirklis': '✧', 'Ceļā': '♧' };
const $ = s => document.querySelector(s);
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch { storageAvailable = false; toast('Saglabāšana nav pieejama. Progress paliks tikai šajā apmeklējumā.'); } }
function el(tag, className, text) { const e = document.createElement(tag); if (className) e.className = className; if (text !== undefined) e.textContent = text; return e; }
function render() {
  const done = tasks.filter(t => t.done).length;
  $('#all-count').textContent = tasks.length; $('#todo-count').textContent = tasks.length - done; $('#done-count').textContent = done;
  $('#progress-text').textContent = `${done} / ${tasks.length} izpildīts`;
  $('#progress-fill').style.width = `${tasks.length ? done / tasks.length * 100 : 0}%`;
  $('.progress-track').setAttribute('aria-valuemax', tasks.length); $('.progress-track').setAttribute('aria-valuenow', done);
  $('#progress-message').textContent = done === tasks.length && tasks.length ? 'Viss izpildīts! Atmiņas, kas paliks ar mums.' : done ? 'Vēl viena kopīga atmiņa. Turpinām!' : 'Kopīgās atmiņas sākas ar pirmo kartīti.';
  $('#sample-notice').hidden = !tasks.some(t => t.id.startsWith('sample-'));
  document.querySelectorAll('.filter').forEach(b => { const active = b.dataset.filter === filter; b.classList.toggle('active', active); b.setAttribute('aria-pressed', active); });
  const visible = tasks.filter(t => filter === 'all' || (filter === 'done' ? t.done : !t.done));
  $('#empty').hidden = visible.length > 0;
  $('#cards').replaceChildren(...visible.map(task => {
    const card = el('article', `card${task.done ? ' done' : ''}${flipped.has(task.id) ? ' flipped' : ''}`);
    card.dataset.id = task.id;
    const button = el('button', 'card-flip'); button.type = 'button'; button.setAttribute('aria-label', `${task.title}: ${flipped.has(task.id) ? 'paslēpt' : 'atklāt'} uzdevumu`); button.setAttribute('aria-expanded', flipped.has(task.id));
    const inner = el('span', 'card-inner');
    const front = el('span', 'card-face card-front'); const back = el('span', 'card-face card-back');
    const isFlipped = flipped.has(task.id); front.setAttribute('aria-hidden', isFlipped); back.setAttribute('aria-hidden', !isFlipped);
    const meta = el('span', 'card-meta'); meta.append(el('span', '', task.category), el('span', 'card-number', String(tasks.indexOf(task) + 1).padStart(2, '0')));
    const bottom = el('span', 'card-bottom'); bottom.append(el('span', '', 'Piedzīvojums gaida'), el('span', 'arrow', '↻'));
    front.append(meta, el('span', 'card-icon', icons[task.category] || '✧'), el('span', 'card-title', task.title), bottom);
    back.append(el('span', 'card-meta', 'TAVS UZDEVUMS'), el('span', 'card-title', task.title), el('span', 'card-description', task.description), el('span', 'card-bottom', '↻ Pieskaries, lai apgrieztu'));
    inner.append(front, back); button.append(inner);
    button.addEventListener('click', () => {
      const active = !flipped.has(task.id); if (active) flipped.add(task.id); else flipped.delete(task.id);
      card.classList.toggle('flipped', active); button.setAttribute('aria-expanded', active); button.setAttribute('aria-label', `${task.title}: ${active ? 'paslēpt' : 'atklāt'} uzdevumu`); front.setAttribute('aria-hidden', active); back.setAttribute('aria-hidden', !active);
    });
    const toggle = el('button', 'done-toggle', task.done ? 'Gatavs! Atmiņa saglabāta.' : 'Atzīmēt kā izpildītu'); toggle.type = 'button'; toggle.setAttribute('aria-pressed', task.done); toggle.setAttribute('aria-label', `${task.done ? 'Atzīmēt kā neizpildītu' : 'Atzīmēt kā izpildītu'}: ${task.title}`);
    toggle.addEventListener('click', () => { task.done = !task.done; save(); render(); const replacement = Array.from(document.querySelectorAll('.card')).find(c => c.dataset.id === task.id); if (replacement) replacement.querySelector('.done-toggle').focus(); else document.querySelector('.filter.active').focus(); });
    card.append(button, toggle); return card;
  }));
}
document.querySelectorAll('.filter').forEach(b => b.addEventListener('click', () => { filter = b.dataset.filter; render(); }));
$('#add-task').addEventListener('click', () => $('#task-dialog').showModal());
$('#close-dialog').addEventListener('click', () => $('#task-dialog').close());
$('#task-form').addEventListener('submit', e => {
  e.preventDefault(); const title = $('#task-title').value.trim(), description = $('#task-description').value.trim();
  if (!title || !description) { toast('Ieraksti nosaukumu un uzdevumu.'); return; }
  tasks.push({ id: crypto.randomUUID(), title, description, category: $('#task-category').value, done: false });
  save(); filter = 'all'; render(); $('#task-form').reset(); $('#task-dialog').close(); toast('Vēl viens piedzīvojums pievienots!');
});
render();
if (!storageAvailable) toast('Saglabāšana nav pieejama. Progress paliks tikai šajā apmeklējumā.');
