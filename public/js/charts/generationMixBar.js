function getOrCreateMixTooltip() {
  let el = document.getElementById('mix-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'mix-tooltip';
    el.style.cssText = `
      position: fixed; z-index: 9999; pointer-events: none;
      background: #1c2128; border: 1px solid #30363d; border-radius: 8px;
      padding: 10px 14px; font-family: Inter, sans-serif; font-size: 12px;
      color: #e6edf3; box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      min-width: 200px; max-width: 300px; transition: opacity 0.1s; line-height: 1.6;
    `;
    document.body.appendChild(el);
  }
  return el;
}

function mixTooltipHandler(context) {
  const { chart, tooltip } = context;
  const el = getOrCreateMixTooltip();
  if (tooltip.opacity === 0) { el.style.opacity = '0'; return; }

  if (tooltip.dataPoints?.length) {
    const year = tooltip.dataPoints[0].label;
    const pts  = tooltip.dataPoints.slice().reverse();
    const total = pts.reduce((s, p) => s + (p.parsed.y || 0), 0);
    const renewableKeys = new Set(['windOn', 'windOff', 'solar', 'biomass', 'hydro']);
    let renewable = 0;

    let html = `<div style="font-weight:600;color:#8b949e;margin-bottom:6px;font-size:11px">${year}</div>`;
    for (const p of pts) {
      const val = p.parsed.y;
      if (!val) continue;
      const color = p.dataset._baseColor;
      if (renewableKeys.has(p.dataset._sourceKey)) renewable += val;
      html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:1px 0">
        <span style="display:flex;align-items:center;gap:5px">
          <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};flex-shrink:0"></span>
          <span style="color:#c9d1d9">${p.dataset.label}</span>
        </span>
        <span style="font-variant-numeric:tabular-nums">${val.toLocaleString()} TWh</span>
      </div>`;
    }
    const renPct = total > 0 ? ((renewable / total) * 100).toFixed(0) : 0;
    html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #30363d;display:flex;justify-content:space-between">
      <span style="font-weight:700">Total</span><span style="font-weight:700">${Math.round(total).toLocaleString()} TWh</span>
    </div>
    <div style="display:flex;justify-content:space-between;color:#2ECC71">
      <span>Renewables</span><span>${renPct}%</span>
    </div>`;
    el.innerHTML = html;
  }

  const rect   = chart.canvas.getBoundingClientRect();
  const tx = rect.left + tooltip.caretX;
  const ty = rect.top  + tooltip.caretY;
  const offset = 14;
  const tw = el.offsetWidth  || 300;
  const th = el.offsetHeight || 220;
  let left = tx + offset;
  let top  = ty - th / 2;
  if (left + tw > window.innerWidth  - 8) left = tx - tw - offset;
  if (top < 8)                            top  = 8;
  if (top + th > window.innerHeight - 8)  top  = window.innerHeight - th - 8;
  el.style.left    = `${left}px`;
  el.style.top     = `${top}px`;
  el.style.opacity = '1';
}

const separatorPlugin = {
  id: 'historicalSeparator',
  afterDraw(chart, _args, opts) {
    const { ctx, scales: { x }, chartArea: { top, bottom } } = chart;
    const idx = chart.data.labels.indexOf(opts.afterLabel);
    if (idx < 0 || idx >= chart.data.labels.length) return;
    const x0  = x.getPixelForValue(idx - 1);
    const x1  = x.getPixelForValue(idx);
    const xPos = (x0 + x1) / 2;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#484F58';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xPos, top - 4);
    ctx.lineTo(xPos, bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#484F58';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('← Hist.   Projected →', xPos - 52, top - 8);
    ctx.restore();
  },
};

function barColors(years, lastHistYear, highlightYear, baseColor) {
  return years.map(yr => {
    if (yr === highlightYear)    return baseColor + 'FF'; // full brightness
    if (yr > lastHistYear)       return baseColor + '88'; // projected: dimmer
    return baseColor;
  });
}

export class GenerationMixBar {
  constructor(canvasId, lastHistoricalYear) {
    this._lastHistYear  = lastHistoricalYear;
    this._sources       = [];
    this._years         = [];
    this._data          = {};
    this._highlightYear = null;

    const ctx = document.getElementById(canvasId).getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: '#8B949E',
              maxRotation: 45,
              callback(val, idx) {
                const yr = Number(this.getLabelForValue(idx));
                return yr % 5 === 0 ? yr : '';
              },
            },
            grid: { color: '#21262D' },
          },
          y: {
            stacked: true,
            ticks: { color: '#8B949E', callback: v => `${v} TWh` },
            grid:  { color: '#21262D' },
            title: { display: true, text: 'TWh', color: '#484F58', font: { size: 11 } },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            reverse: true,
            labels: { color: '#8B949E', boxWidth: 12, font: { size: 11 }, padding: 10 },
          },
          tooltip: { enabled: false, external: mixTooltipHandler },
          historicalSeparator: { afterLabel: String(lastHistoricalYear + 1) },
        },
        barPercentage: 0.95,
        categoryPercentage: 0.95,
      },
      plugins: [separatorPlugin],
    });

    ctx.canvas.addEventListener('mouseleave', () => {
      const el = document.getElementById('mix-tooltip');
      if (el) el.style.opacity = '0';
    });
  }

  _buildDatasets(highlightYear) {
    return this._sources.map(src => ({
      label:         src.label,
      _sourceKey:    src.key,
      _baseColor:    src.color,
      data:          this._years.map(yr => this._data[yr]?.[src.key] ?? 0),
      backgroundColor: barColors(this._years, this._lastHistYear, highlightYear, src.color),
      borderWidth:   0,
      borderRadius:  0,
      borderSkipped: false,
    }));
  }

  update({ years, sources, data, highlightYear }) {
    this._years   = years;
    this._sources = sources;
    this._data    = data;
    this._highlightYear = highlightYear ?? null;

    this.chart.data.labels   = years.map(String);
    this.chart.data.datasets = this._buildDatasets(highlightYear);
    this.chart.update('none');
  }

  setHighlight(yr) {
    this._highlightYear = yr;
    this.chart.data.datasets = this._buildDatasets(yr);
    this.chart.update('none');
  }

  destroy() {
    document.getElementById('mix-tooltip')?.remove();
    this.chart.destroy();
  }
}
