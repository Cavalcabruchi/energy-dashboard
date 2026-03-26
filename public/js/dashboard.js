import { api } from './api.js';
import { GenerationChart } from './charts/generationChart.js';
import { RenewableDonut }  from './charts/renewableDonut.js';
import { PriceChart }      from './charts/priceChart.js';

const ZONE_LABELS = { europe: 'Europe', germany: 'Germany', transnetbw: 'Baden-Württemberg' };

// Read state from URL or defaults
const params = new URLSearchParams(location.search);
const state = {
  zone:   params.get('zone')   || 'europe',
  window: params.get('window') || 'weekly',
};

let genChart, donutChart, priceChart;
let debounceTimer = null;

function overlay(id, show) {
  document.getElementById(id)?.classList.toggle('hidden', !show);
}

function showError(overlayId, message, retryFn) {
  const el = document.getElementById(overlayId);
  if (!el) return;
  el.classList.remove('hidden');
  el.innerHTML = `<div class="error-state">
    <span class="error-msg">⚠ ${message}</span>
    <button class="retry-btn" id="retry-${overlayId}">Retry</button>
  </div>`;
  document.getElementById(`retry-${overlayId}`)?.addEventListener('click', retryFn);
}

function isNoDataError(err) {
  return err.status === 404 || (err.message && err.message.toLowerCase().includes('no data'));
}

async function loadGeneration() {
  overlay('generation-overlay', true);
  overlay('donut-overlay', true);
  try {
    const data = await api.generation(state.zone, state.window);
    genChart.update(data);
    donutChart.update(data);
    document.getElementById('generation-subtitle').textContent =
      `${ZONE_LABELS[state.zone]} · ${data.periodStart?.slice(0,8)} – ${data.periodEnd?.slice(0,8)}`;
    if (data.series?._partialWarning) {
      document.getElementById('footer-note').textContent = data.series._partialWarning;
    }
    overlay('generation-overlay', false);
    overlay('donut-overlay', false);
  } catch (err) {
    const msg = isNoDataError(err) ? 'No data available for this zone / period' : err.message;
    showError('generation-overlay', msg, loadGeneration);
    showError('donut-overlay', msg, loadGeneration);
  }
}

async function loadPrices() {
  overlay('price-overlay', true);
  try {
    const data = await api.prices(state.zone, state.window);
    priceChart.update(data);
    if (data.priceZoneNote) {
      document.getElementById('footer-note').textContent = data.priceZoneNote;
    }
    overlay('price-overlay', false);
  } catch (err) {
    const msg = isNoDataError(err) ? 'No price data available for this zone / period' : err.message;
    showError('price-overlay', msg, loadPrices);
  }
}

async function loadAll() {
  document.getElementById('footer-note').textContent = '';
  await Promise.all([loadGeneration(), loadPrices()]);
}

function syncButtons() {
  document.querySelectorAll('[data-zone]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.zone === state.zone);
  });
  document.querySelectorAll('[data-window]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.window === state.window);
  });
}

function pushState() {
  const url = new URL(location);
  url.searchParams.set('zone', state.zone);
  url.searchParams.set('window', state.window);
  history.replaceState(null, '', url);
}

document.addEventListener('DOMContentLoaded', () => {
  genChart   = new GenerationChart('generation-chart');
  donutChart = new RenewableDonut('donut-chart', 'donut-stats');
  priceChart = new PriceChart('price-chart', 'price-stats');

  document.getElementById('zone-selector').addEventListener('click', e => {
    const btn = e.target.closest('[data-zone]');
    if (!btn) return;
    state.zone = btn.dataset.zone;
    syncButtons();
    pushState();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadAll, 250);
  });

  document.getElementById('window-selector').addEventListener('click', e => {
    const btn = e.target.closest('[data-window]');
    if (!btn) return;
    state.window = btn.dataset.window;
    syncButtons();
    pushState();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadAll, 250);
  });

  syncButtons();
  loadAll();
});
