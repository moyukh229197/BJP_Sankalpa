const ECI_SOURCE_URL = 'https://results.eci.gov.in/ResultAcGenMay2026/partywiseresult-S25.htm';
const OATH_DATE = new Date('2026-05-09T00:00:00+05:30');
const SITE_SYNC_DATE = new Date('2026-05-25T00:00:00+05:30');

const PARTY_RESULTS = [
  { code: 'BJP', name: 'Bharatiya Janata Party', won: 207, leading: 0, color: '#ff944d', link: 'partywisewinresult-369S25.htm' },
  { code: 'AITC', name: 'All India Trinamool Congress', won: 80, leading: 0, color: '#aebedf', link: 'partywisewinresult-140S25.htm' },
  { code: 'INC', name: 'Indian National Congress', won: 2, leading: 0, color: '#19AAED', link: 'partywisewinresult-742S25.htm' },
  { code: 'AJUP', name: 'Aam Janata Unnayan party', won: 2, leading: 0, color: '#244ffa', link: 'partywisewinresult-3735S25.htm' },
  { code: 'CPI(M)', name: 'Communist Party of India (Marxist)', won: 1, leading: 0, color: '#FF1D15', link: 'partywisewinresult-547S25.htm' },
  { code: 'AISF', name: 'All India Secular Front', won: 1, leading: 0, color: '#7bfb79', link: 'partywisewinresult-3075S25.htm' }
];

const PARTY_LOOKUP = Object.fromEntries(PARTY_RESULTS.map(party => [party.code, party]));
const TOTAL_DECLARED = PARTY_RESULTS.reduce((sum, party) => sum + party.won, 0);
const MAJORITY_MARK = 148;
const resultRows = window.ECI_S25_DATA?.chartData || [];
const constituencyDetails = window.ECI_S25_CONSTITUENCY_DETAILS || {};
const candidatePortraits = window.ECI_S25_CANDIDATE_PORTRAITS || {};

const resultByAc = new Map(resultRows.map(row => [Number(row[2]), {
  party: row[0],
  state: row[1],
  acNo: Number(row[2]),
  candidate: row[3],
  color: row[4] || PARTY_LOOKUP[row[0]]?.color || '#555E6E'
}]));

const LENS_MODES = [
  { id: 'winner', label: 'Winner fill', helper: 'Color every seat by the winning party.' },
  { id: 'cluster', label: 'Cluster lens', helper: 'Highlight strongholds, balanced areas, and swing clusters.' }
];

const CLUSTER_COLORS = {
  stronghold: '#8e7bff',
  balanced: '#00b8d9',
  swing: '#f2c14e',
  unknown: '#555E6E'
};

function $(id) {
  return document.getElementById(id);
}

function sourceHref(path) {
  return `${ECI_SOURCE_URL.replace('partywiseresult-S25.htm', '')}${path}`;
}

function normalize(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function initialsFromName(name) {
  return String(name || 'NA')
    .split(/[\s().-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

function avatarDataUrl(name, color) {
  const initials = initialsFromName(name);
  const bg = color || '#555E6E';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#1a1d24"/></linearGradient></defs><rect width="160" height="160" rx="24" fill="url(#g)"/><circle cx="80" cy="66" r="30" fill="rgba(255,255,255,.12)"/><path d="M34 134c11-27 28-40 46-40s35 13 46 40" fill="rgba(255,255,255,.12)"/><text x="80" y="87" font-family="Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function acName(feature) {
  return feature?.properties?.AC_NAME1 || feature?.properties?.AC_NAME || 'Unknown';
}

function acNumber(feature) {
  return Number(feature?.properties?.AC_NO);
}

function collectPoints(coords, out = []) {
  if (!Array.isArray(coords)) return out;
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    out.push(coords);
    return out;
  }
  coords.forEach(item => collectPoints(item, out));
  return out;
}

function computeCentroid(feature) {
  const points = collectPoints(feature?.geometry?.coordinates || []);
  if (!points.length) return [0, 0];
  const sum = points.reduce((acc, point) => {
    acc[0] += point[0];
    acc[1] += point[1];
    return acc;
  }, [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

function buildFeatureMeta(features) {
  const all = features.map(feature => {
    const acNo = acNumber(feature);
    const result = resultByAc.get(acNo);
    return {
      feature,
      acNo,
      name: acName(feature),
      result,
      party: result?.party || 'NA',
      partyName: PARTY_LOOKUP[result?.party]?.name || result?.party || 'Not available',
      centroid: computeCentroid(feature)
    };
  });

  const ranked = all.map(item => {
    const neighbors = all
      .filter(other => other.acNo !== item.acNo)
      .map(other => {
        const dx = item.centroid[0] - other.centroid[0];
        const dy = item.centroid[1] - other.centroid[1];
        return { other, distance: Math.hypot(dx, dy) };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    const sameParty = neighbors.filter(n => n.other.party === item.party).length;
    let cluster = 'swing';
    if (!item.party || item.party === 'NA') cluster = 'unknown';
    else if (sameParty >= 4) cluster = 'stronghold';
    else if (sameParty >= 2) cluster = 'balanced';
    return { ...item, neighbors, sameParty, cluster };
  });

  return ranked;
}

function constituencyPopupHtml(meta) {
  const party = PARTY_LOOKUP[meta?.party];
  const detail = constituencyDetails[meta?.acNo];
  const portraitEntry = candidatePortraits[String(meta?.acNo)] || candidatePortraits[meta?.acNo] || {};
  const winner = detail?.winner || null;
  const runnerUp = detail?.runnerUp || null;
  const totalVotes = detail?.totalVotes || (winner?.totalVotes || 0) + (runnerUp?.totalVotes || 0);
  const winnerVotes = winner?.totalVotes || 0;
  const runnerVotes = runnerUp?.totalVotes || 0;
  const winnerPct = winner?.percent || 0;
  const runnerPct = runnerUp?.percent || 0;
  const winnerColor = PARTY_LOOKUP[winner?.party]?.color || party?.color || meta?.result?.color || '#555E6E';
  const runnerColor = PARTY_LOOKUP[runnerUp?.party]?.color || '#7a8392';
  const gapVotes = Math.max(0, winnerVotes - runnerVotes);
  const gapPct = Math.max(0, winnerPct - runnerPct).toFixed(2);
  const cluster = meta?.cluster || 'unknown';
  return `
    <div class="map-popup map-popup-result">
      <span class="map-popup-kicker">Constituency</span>
      <strong>${meta?.name || 'Unknown'} - ${meta?.acNo || 'NA'}</strong>
      <div class="matchup-card">
        <div class="matchup-row">
          <img class="person-avatar" alt="${winner?.candidate || 'Winner'}" src="${portraitEntry.winner || avatarDataUrl(winner?.candidate || meta?.result?.candidate || 'Winner', winnerColor)}">
          <div class="person-copy">
            <span class="person-kicker">Winner</span>
            <strong>${winner?.candidate || meta?.result?.candidate || 'Winner not available'}</strong>
            <span class="party-line"><span class="party-dot" style="background:${winnerColor}"></span>${winner?.party || party?.name || meta?.party || 'Party not available'}</span>
          </div>
        </div>
        <div class="matchup-row">
          <img class="person-avatar" alt="${runnerUp?.candidate || 'Runner-up'}" src="${portraitEntry.runnerUp || avatarDataUrl(runnerUp?.candidate || 'Runner-up', runnerColor)}">
          <div class="person-copy">
            <span class="person-kicker">Runner-up</span>
            <strong>${runnerUp?.candidate || 'Runner-up not available'}</strong>
            <span class="party-line"><span class="party-dot" style="background:${runnerColor}"></span>${runnerUp?.party || 'Party not available'}</span>
          </div>
        </div>
      </div>
      <div class="popup-race">
        <div class="race-item">
          <div class="race-top">
            <strong>Winner</strong>
            <span>${winnerVotes.toLocaleString()} votes · ${winnerPct.toFixed(2)}%</span>
          </div>
          <div class="race-bar"><span style="width:${winnerPct}%;background:${winnerColor}"></span></div>
        </div>
        <div class="race-item">
          <div class="race-top">
            <strong>Runner-up</strong>
            <span>${runnerVotes.toLocaleString()} votes · ${runnerPct.toFixed(2)}%</span>
          </div>
          <div class="race-bar"><span style="width:${runnerPct}%;background:${runnerColor}"></span></div>
        </div>
      </div>
      <div class="popup-meta">
        <span><b>${gapVotes.toLocaleString()}</b> vote margin</span>
        <span><b>${gapPct}%</b> percentage gap</span>
        <span><b>${totalVotes.toLocaleString()}</b> total votes</span>
      </div>
      <span class="map-popup-cluster">Cluster: ${cluster}</span>
    </div>
  `;
}

function renderStats() {
  const top = PARTY_RESULTS[0];
  $('electionStats').innerHTML = [
    { label: 'Total AC', value: 294, color: 'var(--text)' },
    { label: 'Declared', value: TOTAL_DECLARED, color: 'var(--green-light)' },
    { label: 'BJP Won', value: top.won, color: top.color },
    { label: 'Majority Mark', value: MAJORITY_MARK, color: 'var(--saffron)' }
  ].map(stat => `
    <div class="election-stat">
      <span>${stat.label}</span>
      <strong style="color:${stat.color}">${stat.value}</strong>
    </div>
  `).join('');

  const syncBadge = $('syncBadge');
  if (syncBadge) {
    syncBadge.textContent = `Synced ${SITE_SYNC_DATE.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }
}

function renderPartyCards() {
  $('partyCardList').innerHTML = PARTY_RESULTS.map((party, index) => {
    const share = Math.round((party.won / TOTAL_DECLARED) * 1000) / 10;
    const majorityText = index === 0 ? `${party.won - MAJORITY_MARK} above majority` : `${share}% seat share`;
    return `
      <a class="party-result-card" href="${sourceHref(party.link)}" target="_blank" rel="noopener noreferrer">
        <div>
          <span class="party-dot" style="background:${party.color}"></span>
          <strong>${party.code}</strong>
          <small>${party.name}</small>
        </div>
        <div class="party-result-count">
          <strong style="color:${party.color}">${party.won}</strong>
          <span>${majorityText}</span>
        </div>
        <div class="party-seat-bar"><span style="width:${share}%;background:${party.color}"></span></div>
      </a>
    `;
  }).join('');
}

function renderLegend() {
  $('partyLegend').innerHTML = PARTY_RESULTS.map(party => `
    <a class="legend-item" href="${sourceHref(party.link)}" target="_blank" rel="noopener noreferrer">
      <span class="party-dot" style="background:${party.color}"></span>
      <span>${party.code}</span>
      <strong>${party.won}</strong>
    </a>
  `).join('');
}

function buildSummaryHtml(metaList, activeLens, activeTheme, searchValue) {
  const counts = PARTY_RESULTS.map(party => ({
    ...party,
    count: metaList.filter(item => item.party === party.code).length
  })).filter(item => item.count > 0).sort((a, b) => b.count - a.count);
  const visible = metaList.length;
  const top = counts[0] || { code: 'NA', count: visible, color: CLUSTER_COLORS.unknown };
  const next = counts[1] || { code: '—', count: 0, color: 'rgba(255,255,255,.22)' };
  const clusterCounts = metaList.reduce((acc, item) => {
    acc[item.cluster] = (acc[item.cluster] || 0) + 1;
    return acc;
  }, {});

  return `
    <div class="map-summary-card">
      <span class="map-summary-label">Visible seats</span>
      <strong>${visible}</strong>
      <div class="map-summary-mini">
        <span>Top</span><b>${top.code} ${top.count}</b>
        <span>Next</span><b>${next.code} ${next.count}</b>
      </div>
    </div>
    <div class="map-summary-card">
      <span class="map-summary-label">Lens</span>
      <strong>${activeLens === 'cluster' ? 'Cluster' : 'Winner'}</strong>
      <div class="map-summary-mini">
        <span>Stronghold</span><b>${clusterCounts.stronghold || 0}</b>
        <span>Balanced</span><b>${clusterCounts.balanced || 0}</b>
        <span>Swing</span><b>${clusterCounts.swing || 0}</b>
      </div>
    </div>
    <div class="map-summary-card map-summary-search ${searchValue ? 'active' : ''}">
      <span class="map-summary-label">Search</span>
      <strong>${searchValue ? searchValue : 'Search a seat'}</strong>
    </div>
    <div class="map-summary-bar" aria-hidden="true">
      ${counts.slice(0, 6).map(item => `
        <span style="width:${Math.max(2, (item.count / visible) * 100)}%;background:${item.color}" title="${item.code} ${item.count}"></span>
      `).join('')}
    </div>
  `;
}

function renderMapFilters(onFilter) {
  $('mapFilters').innerHTML = [
    `<button class="map-filter active" data-party="all">All</button>`,
    ...PARTY_RESULTS.map(party => `
      <button class="map-filter" data-party="${party.code}">
        <span class="party-dot" style="background:${party.color}"></span>${party.code}
      </button>
    `)
  ].join('');

  document.querySelectorAll('.map-filter').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.map-filter').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      onFilter(button.dataset.party);
    });
  });
}

function renderMapLens(onLens) {
  $('mapLens').innerHTML = `
    <div class="map-lens-label">Map lens</div>
    <div class="map-lens-group">
      ${LENS_MODES.map((mode, index) => `
        <button class="map-lens ${index === 0 ? 'active' : ''}" data-lens="${mode.id}" title="${mode.helper}">
          <span>${mode.label}</span>
        </button>
      `).join('')}
    </div>
  `;

  document.querySelectorAll('.map-lens[data-lens]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.map-lens[data-lens]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      onLens(button.dataset.lens);
    });
  });
}

function syncThemeButton(theme) {
  const button = $('mapThemeToggle');
  if (!button) return;
  button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  const span = button.querySelector('span:last-child');
  if (span) span.textContent = theme === 'dark' ? 'Dark map' : 'Light map';
}

function renderMap() {
  const features = window.json_All_AC?.features || [];
  const metaList = buildFeatureMeta(features);
  const metaByAc = new Map(metaList.map(item => [item.acNo, item]));
  const select = $('constituencySelect');
  const search = $('seatSearch');
  const mapNode = $('electionMap');
  const themeButton = $('mapThemeToggle');

  let activeLayer = null;
  let activeParty = 'all';
  let activeLens = 'winner';
  let activeTheme = 'light';
  let activeSearch = '';
  const layerByAc = new Map();

  const orderedFeatures = features.slice().sort((a, b) => acNumber(a) - acNumber(b));
  select.innerHTML += orderedFeatures
    .map(feature => `<option value="${acNumber(feature)}">${acName(feature).toUpperCase()} - ${acNumber(feature)}</option>`)
    .join('');

  const map = L.map('electionMap', {
    center: [24.2109, 87.9777],
    zoom: 7,
    minZoom: 6,
    maxZoom: 10,
    scrollWheelZoom: false,
    attributionControl: false
  });

  function applyMapTheme(theme) {
    activeTheme = theme;
    mapNode.classList.toggle('theme-dark', theme === 'dark');
    mapNode.classList.toggle('theme-light', theme !== 'dark');
    syncThemeButton(theme);
    map.invalidateSize();
    refreshStyles();
  }

  function fillFor(meta) {
    if (activeLens === 'cluster') {
      return CLUSTER_COLORS[meta?.cluster] || CLUSTER_COLORS.unknown;
    }
    return meta?.result?.party === 'NA' ? '#555E6E' : meta?.result?.color || '#555E6E';
  }

  function isFiltered(meta) {
    return activeParty !== 'all' && meta?.party !== activeParty;
  }

  function styleFor(feature) {
    const meta = metaByAc.get(acNumber(feature));
    const muted = isFiltered(meta);
    return {
      color: muted ? 'rgba(255,255,255,.28)' : '#ffffff',
      weight: muted ? 0.6 : 1,
      opacity: 1,
      fill: true,
      fillOpacity: muted ? 0.24 : 0.94,
      fillColor: muted ? '#555E6E' : fillFor(meta),
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 0.75,
      className: `ac-path ${activeLens === 'cluster' ? 'lens-cluster' : 'lens-winner'} ${activeTheme === 'dark' ? 'map-dark' : 'map-light'}`
    };
  }

  function refreshStyles() {
    if (!window.__eciGeoLayer) return;
    window.__eciGeoLayer.eachLayer(layer => {
      layer.setStyle(styleFor(layer.feature));
      const meta = metaByAc.get(acNumber(layer.feature));
      const tooltipHtml = `
        <div class="map-tip">
          <strong>${meta?.name || 'Unknown'} - ${meta?.acNo || 'NA'}</strong>
          <span>${meta?.partyName || 'Not available'} · ${meta?.result?.candidate || 'Not available'}</span>
          <em>${activeLens === 'cluster' ? `Cluster: ${meta?.cluster || 'unknown'}` : 'Winner fill active'}</em>
        </div>
      `;
      layer.setTooltipContent(tooltipHtml);
    });
    if (activeLayer) activeLayer.bringToFront();
    renderSummary();
  }

  function renderSummary() {
    const visible = metaList.filter(meta => !isFiltered(meta));
    $('mapSummary').innerHTML = buildSummaryHtml(visible, activeLens, activeTheme, activeSearch);
  }

  function focusOnMeta(meta) {
    if (!meta) return;
    const layer = layerByAc.get(meta.acNo);
    if (!layer) return;
    if (activeLayer && activeLayer !== layer) {
      activeLayer.setStyle(styleFor(activeLayer.feature));
      if (activeLayer._path) activeLayer._path.classList.remove('ac-pulse');
    }
    activeLayer = layer;
    layer.setStyle({ weight: 2.4, color: '#f0f2f5', fillOpacity: 1 });
    if (layer._path) layer._path.classList.add('ac-pulse');
    layer.closeTooltip();
    layer.bindPopup(constituencyPopupHtml(meta), { closeButton: false, autoPan: false }).openPopup();
    select.value = String(meta.acNo);
    map.flyToBounds(layer.getBounds(), { padding: [36, 36], maxZoom: 8, duration: 0.8 });
    renderSummary();
  }

  function searchMeta(query) {
    const q = normalize(query);
    if (!q) return null;
    const exactNumber = Number(q);
    const byNumber = Number.isFinite(exactNumber)
      ? metaList.find(meta => meta.acNo === exactNumber)
      : null;
    if (byNumber) return byNumber;
    return metaList.find(meta =>
      normalize(meta.name).includes(q) ||
      normalize(meta.party).includes(q) ||
      normalize(meta.partyName).includes(q)
    ) || null;
  }

  function applySearch(query, { focus = true } = {}) {
    activeSearch = query || '';
    const meta = searchMeta(query);
    if (meta && focus) focusOnMeta(meta);
    renderSummary();
  }

  renderMapFilters(party => {
    activeParty = party;
    mapNode.classList.toggle('map-party-glow', party !== 'all');
    refreshStyles();
  });

  renderMapLens(lens => {
    activeLens = lens;
    refreshStyles();
  });

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      applyMapTheme(activeTheme === 'dark' ? 'light' : 'dark');
    });
  }

  const geoLayer = L.geoJson(window.json_All_AC, {
    style: styleFor,
    onEachFeature(feature, layer) {
      const acNo = acNumber(feature);
      const meta = metaByAc.get(acNo);
      layerByAc.set(acNo, layer);
      layer.feature = feature;

      layer.bindTooltip('', { sticky: true, direction: 'top' });
      layer.setTooltipContent(`
        <div class="map-tip">
          <strong>${meta?.name || 'Unknown'} - ${meta?.acNo || 'NA'}</strong>
          <span>${meta?.partyName || 'Not available'} · ${meta?.result?.candidate || 'Not available'}</span>
          <em>${activeLens === 'cluster' ? `Cluster: ${meta?.cluster || 'unknown'}` : 'Winner fill active'}</em>
        </div>
      `);

      layer.on({
        mouseover: () => layer.setStyle({ weight: 2.2, color: '#f0f2f5', fillOpacity: 1 }),
        mouseout: () => {
          if (layer !== activeLayer) layer.setStyle(styleFor(feature));
        },
        click: () => focusOnMeta(meta)
      });
    }
  }).addTo(map);

  window.__eciGeoLayer = geoLayer;

  const glow = L.DomUtil.create('div', 'map-glow', map.getPanes().overlayPane);
  glow.style.pointerEvents = 'none';

  map.flyToBounds(geoLayer.getBounds(), { padding: [18, 18], duration: 1 });
  applyMapTheme('light');
  renderSummary();

  select.addEventListener('change', event => {
    const acNo = Number(event.target.value);
    const meta = metaByAc.get(acNo);
    if (!meta) return;
    activeSearch = meta.name;
    focusOnMeta(meta);
    search.value = meta.name;
  });

  search.addEventListener('input', event => {
    const value = event.target.value.trim();
    if (!value) {
      activeSearch = '';
      renderSummary();
      return;
    }
    const meta = searchMeta(value);
    if (meta) {
      activeSearch = value;
      focusOnMeta(meta);
    } else {
      activeSearch = value;
      renderSummary();
    }
  });

  search.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      search.value = '';
      activeSearch = '';
      renderSummary();
      search.blur();
    }
    if (event.key === 'Enter') {
      const meta = searchMeta(search.value);
      if (meta) focusOnMeta(meta);
    }
  });

  renderSummary();
}

// ═══════════════════════════════════════════════════════════════
//  ENHANCED VISUALIZATIONS
// ═══════════════════════════════════════════════════════════════

function renderHemicycle() {
  const el = $('hemicycleSvg');
  if (!el) return;
  const seats = [];
  PARTY_RESULTS.forEach(p => { for (let i = 0; i < p.won; i++) seats.push(p); });
  const total = seats.length;
  const rows = 7, rMin = 75, gap = 18, dotR = 5;
  const radii = Array.from({length: rows}, (_, i) => rMin + i * gap);
  const sumR = radii.reduce((a, b) => a + b, 0);
  const perRow = radii.map(r => Math.round(total * r / sumR));
  perRow[rows - 1] += total - perRow.reduce((a, b) => a + b, 0);
  const w = 500, h = 270, cx = w / 2, cy = h - 15;
  let svg = '';
  let idx = 0;
  for (let row = 0; row < rows; row++) {
    const r = radii[row], n = perRow[row];
    for (let i = 0; i < n && idx < total; i++) {
      const a = Math.PI * (i + 0.5) / n;
      const x = cx - r * Math.cos(a), y = cy - r * Math.sin(a);
      svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dotR}" fill="${seats[idx].color}" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${(idx * 0.004).toFixed(3)}s" fill="freeze"/></circle>`;
      idx++;
    }
  }
  svg += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - radii[rows-1] - 12}" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="3,3"/>`;
  svg += `<text x="${cx + 4}" y="${cy - radii[rows-1] - 16}" fill="var(--text3)" font-size="9" font-family="Outfit">${MAJORITY_MARK}</text>`;
  el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" class="hemicycle-svg">${svg}</svg>`;
}

function renderVoteShareDonut() {
  const el = $('donutSvg');
  if (!el) return;
  const r = 75, sw = 24, w = 220, h = 220, cx = w/2, cy = h/2;
  const C = 2 * Math.PI * r;
  let offset = 0, arcs = '';
  const total = PARTY_RESULTS.reduce((a, p) => a + p.won, 0);
  PARTY_RESULTS.forEach((p, i) => {
    const len = (p.won / total) * C, g = 2;
    arcs += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.color}" stroke-width="${sw}" stroke-dasharray="${Math.max(0,len-g)} ${C-len+g}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" class="donut-arc" style="animation-delay:${i*0.12}s"/>`;
    offset += len;
  });
  const top = PARTY_RESULTS[0];
  arcs += `<text x="${cx}" y="${cy-6}" text-anchor="middle" fill="var(--text)" font-family="Outfit" font-size="26" font-weight="700">${top.won}</text>`;
  arcs += `<text x="${cx}" y="${cy+12}" text-anchor="middle" fill="${top.color}" font-family="Outfit" font-size="12" font-weight="600">${top.code}</text>`;
  arcs += `<text x="${cx}" y="${cy+26}" text-anchor="middle" fill="var(--text3)" font-family="Inter" font-size="9">of ${total} seats</text>`;
  el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" class="donut-svg">${arcs}</svg>`;
}

function animateCounters() {
  document.querySelectorAll('.election-stat strong').forEach(el => {
    const target = parseInt(el.textContent);
    if (isNaN(target)) return;
    const start = performance.now(), dur = 1500;
    el.textContent = '0';
    (function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(e * target);
      if (t < 1) requestAnimationFrame(tick);
    })(performance.now());
  });
}

function renderCandidateSpotlight() {
  const el = $('spotlightGrid');
  if (!el) return;
  const features = window.json_All_AC?.features || [];
  const list = [];
  features.forEach(f => {
    const no = Number(f?.properties?.AC_NO);
    const name = f?.properties?.AC_NAME1 || f?.properties?.AC_NAME || 'Unknown';
    const d = constituencyDetails[no];
    if (!d?.winner) return;
    const result = resultByAc.get(no);
    const port = candidatePortraits[String(no)] || candidatePortraits[no] || {};
    const color = PARTY_LOOKUP[d.winner.party]?.color || result?.color || '#555E6E';
    const margin = (d.winner.totalVotes || 0) - (d.runnerUp?.totalVotes || 0);
    list.push({ no, name, candidate: d.winner.candidate, party: d.winner.party, votes: d.winner.totalVotes || 0, margin, color, img: port.winner || avatarDataUrl(d.winner.candidate, color) });
  });
  list.sort((a, b) => b.votes - a.votes);
  el.innerHTML = list.slice(0, 5).map((c, i) => `
    <div class="spotlight-card" style="--accent:${c.color};animation-delay:${i*0.08}s">
      <img src="${c.img}" alt="${c.candidate}" class="spotlight-avatar">
      <div class="spotlight-body">
        <strong>${c.candidate}</strong>
        <span class="spotlight-party"><span class="party-dot" style="background:${c.color}"></span>${c.party}</span>
        <span class="spotlight-seat">${c.name}</span>
      </div>
      <div class="spotlight-nums">
        <div><b style="color:${c.color}">${c.votes.toLocaleString()}</b><small>votes</small></div>
        <div><b>${c.margin.toLocaleString()}</b><small>margin</small></div>
      </div>
    </div>
  `).join('');
}

function renderTopMargins() {
  const el = $('marginsGrid');
  if (!el) return;
  const features = window.json_All_AC?.features || [];
  const entries = [];
  features.forEach(f => {
    const no = Number(f?.properties?.AC_NO);
    const name = f?.properties?.AC_NAME1 || f?.properties?.AC_NAME || 'Unknown';
    const d = constituencyDetails[no];
    if (!d?.winner || !d?.runnerUp) return;
    const margin = (d.winner.totalVotes || 0) - (d.runnerUp.totalVotes || 0);
    const color = PARTY_LOOKUP[d.winner.party]?.color || resultByAc.get(no)?.color || '#555E6E';
    entries.push({ name, winner: d.winner.candidate, party: d.winner.party, margin, color });
  });
  entries.sort((a, b) => b.margin - a.margin);
  const biggest = entries.slice(0, 5);
  const closest = entries.filter(e => e.margin > 0).sort((a, b) => a.margin - b.margin).slice(0, 5);
  function col(title, icon, items) {
    return `<div class="margins-col"><h3>${icon} ${title}</h3>${items.map((e, i) => `
      <div class="margin-row">
        <span class="margin-rank">#${i+1}</span>
        <div class="margin-info"><strong>${e.name}</strong><span><span class="party-dot" style="background:${e.color}"></span>${e.winner}</span></div>
        <b class="margin-val" style="color:${e.color}">${e.margin.toLocaleString()}</b>
      </div>
    `).join('')}</div>`;
  }
  el.innerHTML = col('Biggest Landslides', '🏔️', biggest) + col('Closest Fights', '⚔️', closest);
}

function renderRegionBreakdown() {
  const el = $('regionGrid');
  if (!el) return;
  const REGIONS = [
    { name: 'North Bengal', range: [1, 42], icon: '🏔️' },
    { name: 'Rarh Bengal', range: [43, 100], icon: '🌾' },
    { name: 'Kolkata Metro', range: [101, 147], icon: '🏙️' },
    { name: 'South Bengal', range: [148, 210], icon: '🌊' },
    { name: 'Midnapore Belt', range: [211, 294], icon: '⚡' }
  ];
  const features = window.json_All_AC?.features || [];
  el.innerHTML = REGIONS.map(reg => {
    const acs = features.filter(f => { const n = Number(f?.properties?.AC_NO); return n >= reg.range[0] && n <= reg.range[1]; });
    const total = acs.length;
    if (!total) return '';
    const counts = {};
    acs.forEach(f => { const p = resultByAc.get(Number(f?.properties?.AC_NO))?.party || 'OTH'; counts[p] = (counts[p]||0)+1; });
    const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
    return `<div class="region-card">
      <div class="region-head"><span class="region-icon">${reg.icon}</span><div><strong>${reg.name}</strong><small>${total} seats</small></div></div>
      <div class="region-bar">${sorted.map(([c,n]) => `<span style="width:${(n/total*100).toFixed(1)}%;background:${PARTY_LOOKUP[c]?.color||'#555E6E'}" title="${c}: ${n}"></span>`).join('')}</div>
      <div class="region-labels">${sorted.map(([c,n]) => `<span><span class="party-dot" style="background:${PARTY_LOOKUP[c]?.color||'#555E6E'}"></span>${c} ${n}</span>`).join('')}</div>
    </div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const badge = $('dayBadge');
  if (badge) {
    const day = Math.max(0, Math.floor((Date.now() - OATH_DATE) / 864e5));
    badge.textContent = `Day ${day} of 365`;
  }
  renderStats();
  renderPartyCards();
  renderLegend();
  renderMap();
  renderHemicycle();
  renderVoteShareDonut();
  renderCandidateSpotlight();
  renderTopMargins();
  renderRegionBreakdown();
  setTimeout(animateCounters, 300);
});
