const $ = s => document.getElementById(s);

const SECTION_META = {
  manifesto: {
    label: 'Promises',
    title: 'Promises / manifesto items',
    empty: () => ({ id: Date.now(), title: 'New promise', desc: '', cat: 'General', dl: '2026-12-31', status: 'Pending', prog: 0, pri: 'medium', source: '', thumb: '', yt: '', link: '' }),
  },
  dailyLog: {
    label: 'Daily Action Log',
    title: 'Daily action log days',
    empty: () => ({ date: '2026-05-13', dayNumber: 4, label: 'New Day', events: [] }),
  },
  moments: {
    label: 'Key Moments',
    title: 'Featured videos / moments',
    empty: () => ({ title: 'New moment', desc: '', date: 'May 13, 2026', badge: 'NEW', thumb: '', yt: '', source: '', link: '' }),
  },
  backlog: {
    label: 'Backlog',
    title: 'Backlog items',
    empty: () => ({ id: Date.now(), p: 'New backlog item', v: null, s: 2026, y: 0, d: 'General', st: 'Pending', r: 0, source: '', thumb: '', link: '' }),
  },
};

let content = { manifesto: [], dailyLog: [], moments: [], backlog: [] };

const selectOptions = {
  status: ['Pending', 'In Progress', 'Completed'],
  priority: ['low', 'medium', 'high'],
  categories: ['General', 'Governance', 'Finance', 'Law & Order', 'Healthcare', 'Security', 'Employment', 'Infrastructure', 'Industry', 'Youth', 'Women'],
};

function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function setStatus(message, kind = 'neutral') {
  const el = $('saveStatus');
  if (!el) return;
  el.textContent = message;
  el.dataset.kind = kind;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (err) {
    json = { raw: text };
  }
  if (!res.ok) throw new Error(json.error || res.statusText || 'Request failed');
  return json;
}

function authStatus() {
  return api('/api/auth').then(x => !!x.authenticated).catch(() => false);
}

function showEditor(show) {
  $('loginPanel').classList.toggle('hidden', show);
  $('editorPanel').classList.toggle('hidden', !show);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function normalizeContent(raw) {
  const base = { manifesto: [], dailyLog: [], moments: [], backlog: [] };
  if (!raw || typeof raw !== 'object') return base;
  for (const key of Object.keys(base)) {
    if (Array.isArray(raw[key])) base[key] = raw[key];
  }
  return base;
}

function loadContentIntoState(raw) {
  content = normalizeContent(raw);
  renderSummary();
  renderNav();
  renderSections();
}

function renderSummary() {
  const bar = $('summaryBar');
  if (!bar) return;
  bar.innerHTML = Object.entries(content).map(([key, value]) => `
    <div class="admin-summary-card">
      <span>${SECTION_META[key].label}</span>
      <strong>${Array.isArray(value) ? value.length : 0}</strong>
    </div>
  `).join('');
}

function renderNav() {
  const nav = $('sectionNav');
  if (!nav) return;
  nav.innerHTML = Object.entries(SECTION_META).map(([key, meta]) => `
    <button class="admin-nav-pill" data-scroll="${key}" type="button">${meta.label}</button>
  `).join('');
  nav.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.onclick = () => {
      document.querySelector(`[data-section-panel="${btn.dataset.scroll}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  });
}

function fieldSelect(label, value, options, key, section, itemIndex, itemType = 'item') {
  return `
    <label class="admin-field">
      <span>${esc(label)}</span>
      <select data-key="${key}" data-section="${section}" data-index="${itemIndex}" data-type="${itemType}">
        ${options.map(opt => `<option value="${esc(opt)}"${String(value ?? '') === opt ? ' selected' : ''}>${esc(opt)}</option>`).join('')}
      </select>
    </label>
  `;
}

function fieldInput(label, value, key, section, itemIndex, type = 'text', itemType = 'item', placeholder = '') {
  const isTextarea = type === 'textarea';
  return `
    <label class="admin-field ${isTextarea ? 'wide' : ''}">
      <span>${esc(label)}</span>
      ${isTextarea
        ? `<textarea data-key="${key}" data-section="${section}" data-index="${itemIndex}" data-type="${itemType}" placeholder="${esc(placeholder)}">${esc(value ?? '')}</textarea>`
        : `<input type="${type}" data-key="${key}" data-section="${section}" data-index="${itemIndex}" data-type="${itemType}" value="${esc(value ?? '')}" placeholder="${esc(placeholder)}">`}
    </label>
  `;
}

function cardActions(section, itemIndex, itemType = 'item') {
  return `
    <div class="admin-item-actions">
      <button type="button" class="admin-mini-btn" data-action="duplicate" data-section="${section}" data-index="${itemIndex}" data-type="${itemType}">Duplicate</button>
      <button type="button" class="admin-mini-btn danger" data-action="delete" data-section="${section}" data-index="${itemIndex}" data-type="${itemType}">Delete</button>
    </div>
  `;
}

function renderManifestoCard(item, index) {
  return `
    <article class="admin-item-card">
      <div class="admin-item-head">
        <strong>Promise #${index + 1}</strong>
        ${cardActions('manifesto', index)}
      </div>
      <div class="admin-field-grid">
        ${fieldInput('Title', item.title, 'title', 'manifesto', index)}
        ${fieldInput('Category', item.cat, 'cat', 'manifesto', index)}
        ${fieldInput('Deadline', item.dl, 'dl', 'manifesto', index, 'date')}
        ${fieldSelect('Status', item.status, selectOptions.status, 'status', 'manifesto', index)}
        ${fieldInput('Progress %', item.prog, 'prog', 'manifesto', index, 'number')}
        ${fieldSelect('Priority', item.pri, selectOptions.priority, 'pri', 'manifesto', index)}
        ${fieldInput('Source link', item.source || '', 'source', 'manifesto', index)}
        ${fieldInput('Thumbnail / image', item.thumb || '', 'thumb', 'manifesto', index)}
        ${fieldInput('YouTube link', item.yt || '', 'yt', 'manifesto', index)}
        ${fieldInput('Extra link', item.link || '', 'link', 'manifesto', index)}
        ${fieldInput('Description', item.desc, 'desc', 'manifesto', index, 'textarea', 'item', 'Short supporting copy')}
      </div>
    </article>
  `;
}

function renderMomentCard(item, index) {
  return `
    <article class="admin-item-card">
      <div class="admin-item-head">
        <strong>Moment #${index + 1}</strong>
        ${cardActions('moments', index)}
      </div>
      <div class="admin-field-grid">
        ${fieldInput('Title', item.title, 'title', 'moments', index)}
        ${fieldInput('Badge', item.badge, 'badge', 'moments', index)}
        ${fieldInput('Date label', item.date, 'date', 'moments', index)}
        ${fieldInput('YouTube link', item.yt, 'yt', 'moments', index)}
        ${fieldInput('Thumbnail', item.thumb, 'thumb', 'moments', index)}
        ${fieldInput('Source link', item.source || '', 'source', 'moments', index)}
        ${fieldInput('Extra link', item.link || '', 'link', 'moments', index)}
        ${fieldInput('Description', item.desc, 'desc', 'moments', index, 'textarea')}
      </div>
    </article>
  `;
}

function renderBacklogCard(item, index) {
  return `
    <article class="admin-item-card">
      <div class="admin-item-head">
        <strong>Backlog #${index + 1}</strong>
        ${cardActions('backlog', index)}
      </div>
      <div class="admin-field-grid">
        ${fieldInput('Project', item.p, 'p', 'backlog', index)}
        ${fieldInput('Value', item.v ?? '', 'v', 'backlog', index, 'number')}
        ${fieldInput('Start year', item.s ?? '', 's', 'backlog', index, 'number')}
        ${fieldInput('Age / years', item.y ?? '', 'y', 'backlog', index, 'number')}
        ${fieldInput('Department', item.d, 'd', 'backlog', index)}
        ${fieldInput('Status text', item.st, 'st', 'backlog', index)}
        ${fieldInput('Resolution %', item.r ?? 0, 'r', 'backlog', index, 'number')}
        ${fieldInput('Source link', item.source || '', 'source', 'backlog', index)}
        ${fieldInput('Image / thumbnail', item.thumb || '', 'thumb', 'backlog', index)}
        ${fieldInput('Extra link', item.link || '', 'link', 'backlog', index)}
      </div>
    </article>
  `;
}

function renderDailyLogDay(day, index) {
  const events = Array.isArray(day.events) ? day.events : [];
  return `
    <article class="admin-item-card admin-day-card">
      <div class="admin-item-head">
        <strong>Day ${index + 1}</strong>
        ${cardActions('dailyLog', index)}
      </div>
      <div class="admin-field-grid">
        ${fieldInput('Date', day.date, 'date', 'dailyLog', index, 'date')}
        ${fieldInput('Day number', day.dayNumber ?? '', 'dayNumber', 'dailyLog', index, 'number')}
        ${fieldInput('Label', day.label, 'label', 'dailyLog', index)}
      </div>
      <div class="admin-subhead">
        <span>Events</span>
        <button class="admin-mini-btn" type="button" data-add-event="${index}">Add event</button>
      </div>
      <div class="admin-event-list">
        ${events.map((event, eventIndex) => renderEventCard(event, index, eventIndex)).join('')}
      </div>
    </article>
  `;
}

function renderEventCard(event, dayIndex, eventIndex) {
  return `
    <section class="admin-event-card">
      <div class="admin-item-head">
        <strong>Event ${eventIndex + 1}</strong>
        ${cardActions('dailyLog', `${dayIndex}:${eventIndex}`, 'event')}
      </div>
      <div class="admin-field-grid">
        ${fieldInput('Time', event.time, 'time', 'dailyLog', `${dayIndex}:${eventIndex}`, 'text', 'event')}
        ${fieldInput('Title', event.title, 'title', 'dailyLog', `${dayIndex}:${eventIndex}`, 'text', 'event')}
        ${fieldInput('Description', event.desc ?? event.description ?? '', 'desc', 'dailyLog', `${dayIndex}:${eventIndex}`, 'textarea', 'event')}
        ${fieldInput('Category', event.category || '', 'category', 'dailyLog', `${dayIndex}:${eventIndex}`, 'text', 'event')}
        ${fieldInput('Icon', event.icon || '', 'icon', 'dailyLog', `${dayIndex}:${eventIndex}`, 'text', 'event')}
        ${fieldInput('Source link', event.source || '', 'source', 'dailyLog', `${dayIndex}:${eventIndex}`, 'text', 'event')}
        ${fieldInput('Thumbnail', event.thumb || '', 'thumb', 'dailyLog', `${dayIndex}:${eventIndex}`, 'text', 'event')}
        ${fieldInput('YouTube link', event.yt || '', 'yt', 'dailyLog', `${dayIndex}:${eventIndex}`, 'text', 'event')}
        ${fieldInput('Extra link', event.link || '', 'link', 'dailyLog', `${dayIndex}:${eventIndex}`, 'text', 'event')}
      </div>
    </section>
  `;
}

function renderSections() {
  const root = $('sectionGrid');
  if (!root) return;
  root.innerHTML = `
    <section class="admin-section-panel" data-section-panel="manifesto">
      <div class="admin-section-titlebar">
        <div>
          <h3>Promises / manifesto items</h3>
          <p>Adjust promise titles, progress, deadline, media, and links.</p>
        </div>
        <button class="admin-btn" type="button" data-add-section="manifesto">Add promise</button>
      </div>
      <div class="admin-item-stack">
        ${content.manifesto.map(renderManifestoCard).join('')}
      </div>
    </section>

    <section class="admin-section-panel" data-section-panel="dailyLog">
      <div class="admin-section-titlebar">
        <div>
          <h3>Daily Action Log</h3>
          <p>Edit days, events, source links, images, and video thumbnails.</p>
        </div>
        <button class="admin-btn" type="button" data-add-section="dailyLog">Add day</button>
      </div>
      <div class="admin-item-stack">
        ${content.dailyLog.map(renderDailyLogDay).join('')}
      </div>
    </section>

    <section class="admin-section-panel" data-section-panel="moments">
      <div class="admin-section-titlebar">
        <div>
          <h3>Key Moments</h3>
          <p>Manage featured cards and their YouTube thumbnails.</p>
        </div>
        <button class="admin-btn" type="button" data-add-section="moments">Add moment</button>
      </div>
      <div class="admin-item-stack">
        ${content.moments.map(renderMomentCard).join('')}
      </div>
    </section>

    <section class="admin-section-panel" data-section-panel="backlog">
      <div class="admin-section-titlebar">
        <div>
          <h3>Backlog</h3>
          <p>Update project rows, progress, and supporting source media.</p>
        </div>
        <button class="admin-btn" type="button" data-add-section="backlog">Add backlog item</button>
      </div>
      <div class="admin-item-stack">
        ${content.backlog.map(renderBacklogCard).join('')}
      </div>
    </section>
  `;

  root.querySelectorAll('[data-add-section]').forEach(btn => {
    btn.onclick = () => addSectionItem(btn.dataset.addSection);
  });
  root.querySelectorAll('[data-action]').forEach(btn => {
    btn.onclick = () => mutateItem(btn.dataset.action, btn.dataset.section, btn.dataset.index, btn.dataset.type);
  });
  root.querySelectorAll('[data-add-event]').forEach(btn => {
    btn.onclick = () => addDailyEvent(Number(btn.dataset.addEvent));
  });
}

function addSectionItem(section) {
  content[section] = [...content[section], SECTION_META[section].empty()];
  renderSummary();
  renderNav();
  renderSections();
  setStatus(`Added a new ${SECTION_META[section].label.toLowerCase()} item.`);
}

function addDailyEvent(dayIndex) {
  const day = content.dailyLog[dayIndex];
  if (!day) return;
  const next = day.events || [];
  next.push({ time: '12:00 PM', title: 'New event', desc: '', category: 'General', icon: 'dot', source: '', thumb: '', yt: '', link: '' });
  day.events = next;
  renderSections();
  setStatus('Added a new daily log event.');
}

function mutateItem(action, section, index, type = 'item') {
  if (section === 'dailyLog' && type === 'event') {
    const [dayIndex, eventIndex] = String(index).split(':').map(Number);
    const day = content.dailyLog[dayIndex];
    if (!day || !Array.isArray(day.events)) return;
    const item = day.events[eventIndex];
    if (!item) return;
    if (action === 'duplicate') {
      day.events.splice(eventIndex + 1, 0, clone(item));
    } else if (action === 'delete') {
      day.events.splice(eventIndex, 1);
    }
  } else {
    const list = content[section];
    const item = list[Number(index)];
    if (!item) return;
    if (action === 'duplicate') {
      list.splice(Number(index) + 1, 0, clone(item));
    } else if (action === 'delete') {
      list.splice(Number(index), 1);
    }
  }
  renderSummary();
  renderSections();
  setStatus(`Updated ${SECTION_META[section]?.label || 'item'}.`);
}

function readInputsForSection(section) {
  return [...document.querySelectorAll(`[data-section="${section}"]`)];
}

function applyInputValue(target, key, value) {
  if (value === '' && target.type === 'number') return null;
  if (target.type === 'number') return Number.isNaN(Number(value)) ? 0 : Number(value);
  return value;
}

function collectContent() {
  const result = { manifesto: [], dailyLog: [], moments: [], backlog: [] };

  result.manifesto = readInputsForSection('manifesto').reduce((acc, el) => {
    const index = Number(el.dataset.index);
    if (!acc[index]) acc[index] = {};
    acc[index][el.dataset.key] = applyInputValue(el, el.dataset.key, el.value);
    return acc;
  }, []);

  result.moments = readInputsForSection('moments').reduce((acc, el) => {
    const index = Number(el.dataset.index);
    if (!acc[index]) acc[index] = {};
    acc[index][el.dataset.key] = applyInputValue(el, el.dataset.key, el.value);
    return acc;
  }, []);

  result.backlog = readInputsForSection('backlog').reduce((acc, el) => {
    const index = Number(el.dataset.index);
    if (!acc[index]) acc[index] = {};
    acc[index][el.dataset.key] = applyInputValue(el, el.dataset.key, el.value);
    return acc;
  }, []);

  const dayFields = [...document.querySelectorAll(`[data-section="dailyLog"][data-type="item"]`)];
  const dayMap = {};
  dayFields.forEach(el => {
    const index = Number(el.dataset.index);
    if (!dayMap[index]) dayMap[index] = {};
    dayMap[index][el.dataset.key] = applyInputValue(el, el.dataset.key, el.value);
  });

  const eventFields = [...document.querySelectorAll(`[data-section="dailyLog"][data-type="event"]`)];
  const eventMap = {};
  eventFields.forEach(el => {
    const [dayIndex, eventIndex] = String(el.dataset.index).split(':').map(Number);
    if (!eventMap[dayIndex]) eventMap[dayIndex] = {};
    if (!eventMap[dayIndex][eventIndex]) eventMap[dayIndex][eventIndex] = {};
    eventMap[dayIndex][eventIndex][el.dataset.key] = applyInputValue(el, el.dataset.key, el.value);
  });

  result.dailyLog = Object.keys(dayMap).map(Number).sort((a, b) => a - b).map(dayIndex => {
    const day = { ...dayMap[dayIndex] };
    const events = eventMap[dayIndex] || {};
    day.events = Object.keys(events).map(Number).sort((a, b) => a - b).map(eventIndex => events[eventIndex]);
    return day;
  });

  return result;
}

async function loadContent() {
  const data = await api('/api/content');
  loadContentIntoState(data);
}

async function login(password) {
  await api('/api/auth', { method: 'POST', body: JSON.stringify({ password }) });
}

async function logout() {
  await api('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) });
}

function downloadContent() {
  const blob = new Blob([JSON.stringify(collectContent(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'site-content.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function saveAll() {
  setStatus('Saving...');
  try {
    const bundle = collectContent();
    await api('/api/content', {
      method: 'PUT',
      body: JSON.stringify({ content: bundle }),
    });
    content = bundle;
    renderSummary();
    renderNav();
    renderSections();
    setStatus('Saved and pushed to backend.', 'ok');
  } catch (err) {
    setStatus(err.message || 'Save failed.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  $('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await login($('adminPassword').value);
      $('adminPassword').value = '';
      showEditor(true);
      await loadContent();
      setStatus('Signed in and ready.', 'ok');
    } catch (err) {
      setStatus(err.message || 'Login failed.', 'error');
    }
  });

  $('saveAll').onclick = saveAll;
  $('adminExport').onclick = downloadContent;
  $('adminReload').onclick = loadContent;
  $('adminLogout').onclick = async () => {
    await logout();
    showEditor(false);
    setStatus('Signed out.');
  };

  if (await authStatus()) {
    showEditor(true);
    await loadContent();
    setStatus('Signed in and ready.', 'ok');
  } else {
    showEditor(false);
  }
});
