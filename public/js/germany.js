import { api } from './api.js';
import { GenerationMixBar } from './charts/generationMixBar.js';

let mixChart;
let allData   = null;
let selYear   = new Date().getFullYear() - 1;

function overlay(id, show) {
  document.getElementById(id)?.classList.toggle('hidden', !show);
}

// ── Year navigator ─────────────────────────────────────────────────────────
function buildNavigator(years, lastHistYear) {
  const strip = document.getElementById('year-strip');
  strip.innerHTML = '';

  years.forEach(yr => {
    const btn = document.createElement('button');
    btn.className = 'year-pill' + (yr === selYear ? ' active' : '') +
                    (yr > lastHistYear ? ' projected' : '');
    btn.textContent = yr;
    btn.dataset.year = yr;
    btn.addEventListener('click', () => selectYear(Number(btn.dataset.year)));
    strip.appendChild(btn);
  });

  // Scroll selected pill into view
  const active = strip.querySelector('.year-pill.active');
  active?.scrollIntoView({ block: 'nearest', inline: 'center' });
}

function selectYear(yr) {
  selYear = yr;
  document.querySelectorAll('.year-pill').forEach(b =>
    b.classList.toggle('active', Number(b.dataset.year) === yr)
  );
  document.querySelector('.year-pill.active')
    ?.scrollIntoView({ block: 'nearest', inline: 'center' });
  mixChart?.setHighlight(yr);
  fillYearPanel(yr);
}

// ── Year detail panel ("curtain") ─────────────────────────────────────────
function fillYearPanel(yr) {
  const { years, sources, data, lastHistoricalYear } = allData;
  const row = data[yr];
  if (!row) return;

  const total   = Object.values(row).reduce((s, v) => s + v, 0);
  const renewableKeys = new Set(['windOn', 'windOff', 'solar', 'biomass', 'hydro']);
  const renewable = sources
    .filter(s => renewableKeys.has(s.key))
    .reduce((s, src) => s + (row[src.key] || 0), 0);
  const renPct = total > 0 ? ((renewable / total) * 100).toFixed(1) : 0;
  const isProj = yr > lastHistoricalYear;

  document.getElementById('panel-year').textContent  = yr;
  document.getElementById('panel-badge').textContent  = isProj ? 'Projected' : 'Historical';
  document.getElementById('panel-badge').className    = 'badge ' + (isProj ? 'projected' : 'historical');
  document.getElementById('panel-total').textContent  = `${Math.round(total).toLocaleString()} TWh`;
  document.getElementById('panel-re').textContent     = `${renPct}%`;

  const tbody = document.getElementById('panel-sources');
  tbody.innerHTML = '';
  sources.slice().reverse().forEach(src => {
    const val  = row[src.key] || 0;
    if (!val) return;
    const pct  = ((val / total) * 100).toFixed(1);
    const tr   = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="dot" style="background:${src.color}"></span>${src.label}</td>
      <td>${val.toLocaleString()}</td>
      <td>${pct}%</td>`;
    tbody.appendChild(tr);
  });

  document.getElementById('year-panel').classList.remove('hidden');
}

// ── Load ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  mixChart = new GenerationMixBar('mix-chart', /* lastHistYear — set after load */ 2024);
  overlay('mix-overlay', true);

  try {
    allData = await api.germanyMix();
    const { years, sources, data, lastHistoricalYear } = allData;

    // Clamp selectedYear to data range
    if (selYear > lastHistoricalYear) selYear = lastHistoricalYear;
    if (!years.includes(selYear)) selYear = years[years.length - 1];

    // Re-create chart with correct lastHistoricalYear
    mixChart.destroy();
    mixChart = new GenerationMixBar('mix-chart', lastHistoricalYear);
    mixChart.update({ years, sources, data, highlightYear: selYear });

    buildNavigator(years, lastHistoricalYear);
    fillYearPanel(selYear);
    overlay('mix-overlay', false);
  } catch (err) {
    console.error('Failed to load Germany generation mix:', err);
    overlay('mix-overlay', false);
    document.getElementById('mix-overlay').innerHTML =
      `<div class="error-state"><span class="error-msg">⚠ ${err.message}</span></div>`;
    document.getElementById('mix-overlay').classList.remove('hidden');
  }

});
