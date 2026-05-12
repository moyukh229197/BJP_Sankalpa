const ECI_SOURCE_URL = 'https://results.eci.gov.in/ResultAcGenMay2026/partywiseresult-S25.htm';
const OATH_DATE = new Date('2026-05-09T00:00:00+05:30');

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
    }
    activeLayer = layer;
    layer.setStyle({ weight: 2.4, color: '#f0f2f5', fillOpacity: 1 });
    layer.closeTooltip();
    layer.bindPopup(constituencyPopupHtml(meta), { closeButton: false, autoPan: false }).openPopup();
    select.value = String(meta.acNo);
    map.fitBounds(layer.getBounds(), { padding: [36, 36], maxZoom: 8 });
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

  map.fitBounds(geoLayer.getBounds(), { padding: [18, 18] });
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
});
