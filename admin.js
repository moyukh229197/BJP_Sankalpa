const $ = s => document.getElementById(s);

const SECTION_META = {
  manifesto: { label: 'Promises', title: 'Promises / manifesto items', add: () => ({ id: Date.now(), title: 'New promise', desc: '', cat: 'General', dl: '2026-12-31', status: 'Pending', prog: 0, pri: 'medium' }) },
  dailyLog: { label: 'Daily Action Log', title: 'Daily action log days', add: () => ({ date: '2026-05-13', dayNumber: 4, label: 'New Day', events: [] }) },
  moments: { label: 'Key Moments', title: 'Featured videos / moments', add: () => ({ title: 'New moment', desc: '', date: 'May 13, 2026', badge: 'NEW', thumb: '', yt: '' }) },
  backlog: { label: 'Backlog', title: 'Backlog items', add: () => ({ id: Date.now(), p: 'New backlog item', v: null, s: 2026, y: 0, d: 'General', st: 'Pending', r: 0 }) },
};

let content = { manifesto: [], dailyLog: [], moments: [], backlog: [] };

function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function updateSummary() {
  const bar = $('summaryBar');
  if (!bar) return;
  bar.innerHTML = Object.entries(content).map(([key, value]) => `
    <div class="admin-summary-card">
      <span>${SECTION_META[key].label}</span>
      <strong>${Array.isArray(value) ? value.length : 0}</strong>
    </div>
  `).join('');
}

function renderEditor() {
  const grid = $('sectionGrid');
  if (!grid) return;
  grid.innerHTML = Object.entries(SECTION_META).map(([key, meta]) => `
    <article class="admin-section-card" data-section="${key}">
      <div class="admin-section-head">
        <div>
          <h3>${esc(meta.title)}</h3>
          <p>${esc(meta.label)}</p>
        </div>
        <div class="admin-section-actions">
          <button class="admin-btn" data-add="${key}" type="button">Add item</button>
        </div>
      </div>
      <textarea class="admin-textarea" data-editor="${key}" spellcheck="false"></textarea>
    </article>
  `).join('');

  grid.querySelectorAll('[data-editor]').forEach(box => {
    const key = box.dataset.editor;
    box.value = pretty(content[key] || []);
  });

  grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.add;
      content[key] = Array.isArray(content[key]) ? [...content[key], SECTION_META[key].add()] : [SECTION_META[key].add()];
      renderEditor();
      updateSummary();
      setStatus(`Added a new ${SECTION_META[key].label.toLowerCase()} item.`);
    };
  });
}

function collectContent() {
  const bundle = {};
  for (const key of Object.keys(SECTION_META)) {
    const box = document.querySelector(`[data-editor="${key}"]`);
    if (!box) continue;
    bundle[key] = JSON.parse(box.value);
    if (!Array.isArray(bundle[key])) throw new Error(`${key} must be an array`);
  }
  return bundle;
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
  try { json = text ? JSON.parse(text) : {}; } catch (err) { json = { raw: text }; }
  if (!res.ok) throw new Error(json.error || res.statusText || 'Request failed');
  return json;
}

async function loadContent() {
  const data = await api('/api/content');
  content = {
    manifesto: Array.isArray(data.manifesto) ? data.manifesto : [],
    dailyLog: Array.isArray(data.dailyLog) ? data.dailyLog : [],
    moments: Array.isArray(data.moments) ? data.moments : [],
    backlog: Array.isArray(data.backlog) ? data.backlog : [],
  };
  updateSummary();
  renderEditor();
}

async function authStatus() {
  try {
    const status = await api('/api/auth');
    return !!status.authenticated;
  } catch (err) {
    return false;
  }
}

function showEditor(show) {
  $('loginPanel').classList.toggle('hidden', show);
  $('editorPanel').classList.toggle('hidden', !show);
}

async function login(password) {
  await api('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

async function logout() {
  await api('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ action: 'logout' }),
  });
}

function downloadContent() {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
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
    updateSummary();
    renderEditor();
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
