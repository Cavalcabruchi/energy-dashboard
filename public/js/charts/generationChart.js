// Shared tooltip DOM element — lives on document.body, not inside any card
function getOrCreateTooltipEl() {
  let el = document.getElementById('gen-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gen-tooltip';
    el.style.cssText = `
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      background: #1c2128;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 10px 14px;
      font-family: Inter, sans-serif;
      font-size: 12px;
      color: #e6edf3;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      min-width: 200px;
      max-width: 320px;
      transition: opacity 0.1s;
      line-height: 1.6;
    `;
    document.body.appendChild(el);
  }
  return el;
}

function externalTooltipHandler(context) {
  const { chart, tooltip } = context;
  const el = getOrCreateTooltipEl();

  if (tooltip.opacity === 0) {
    el.style.opacity = '0';
    return;
  }

  // Build content
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines  = tooltip.body.map(b => b.lines).flat();
    const footerLines = tooltip.footer || [];

    let html = '';

    // Title (timestamp)
    if (titleLines.length) {
      html += `<div style="font-weight:600;color:#8b949e;margin-bottom:6px;font-size:11px">${titleLines.join('<br>')}</div>`;
    }

    // Each data series
    bodyLines.forEach((line, i) => {
      const ds = tooltip.dataPoints?.[i]?.dataset;
      const color = ds?.backgroundColor || '#888';
      html += `<div style="display:flex;align-items:center;gap:6px;padding:1px 0">
        <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color};flex-shrink:0"></span>
        <span>${line.trim()}</span>
      </div>`;
    });

    // Footer (total)
    if (footerLines.length) {
      html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #30363d;font-weight:700;color:#e6edf3">${footerLines.join('<br>')}</div>`;
    }

    el.innerHTML = html;
  }

  // Position synchronously — no rAF, no flicker
  const canvasRect = chart.canvas.getBoundingClientRect();
  const tooltipX = canvasRect.left + tooltip.caretX;
  const tooltipY = canvasRect.top  + tooltip.caretY;
  const offset = 14;

  // offsetWidth/offsetHeight are valid since the element is already in the DOM;
  // fall back to sensible maximums on very first render before layout is known
  const tw = el.offsetWidth  || 320;
  const th = el.offsetHeight || 200;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = tooltipX + offset;
  let top  = tooltipY - th / 2;

  if (left + tw > vw - 8)  left = tooltipX - tw - offset;
  if (top < 8)             top  = 8;
  if (top + th > vh - 8)   top  = vh - th - 8;

  el.style.left    = `${left}px`;
  el.style.top     = `${top}px`;
  el.style.opacity = '1';
}

export class GenerationChart {
  constructor(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            type: 'time',
            stacked: true,
            ticks: { color: '#8B949E', maxTicksLimit: 10 },
            grid:  { color: '#21262D' },
          },
          y: {
            stacked: true,
            ticks: { color: '#8B949E', callback: v => `${(v/1000).toFixed(0)} GW` },
            grid:  { color: '#21262D' },
            title: { display: true, text: 'MW', color: '#484F58', font: { size: 11 } },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#8B949E', boxWidth: 12, font: { size: 11 }, padding: 12 },
          },
          tooltip: {
            enabled: false,          // disable the built-in clipped tooltip
            external: externalTooltipHandler,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y != null ? ctx.parsed.y.toLocaleString() + ' MW' : 'N/A'}`,
              footer: items => {
                const total = items.reduce((s, i) => s + (i.parsed.y || 0), 0);
                return `Total: ${total.toLocaleString()} MW`;
              },
            },
          },
        },
      },
    });

    // Hide tooltip when mouse leaves the chart
    ctx.canvas.addEventListener('mouseleave', () => {
      const el = document.getElementById('gen-tooltip');
      if (el) el.style.opacity = '0';
    });
  }

  update(data) {
    if (!data?.series?.length) return;
    const nPoints = data.series[0]?.data?.length || 0;
    const timeUnit = nPoints < 72 ? 'hour' : nPoints < 200 ? 'day' : 'week';
    this.chart.options.scales.x.time = { unit: timeUnit };

    this.chart.data.datasets = data.series.map(s => ({
      label: s.label,
      data: s.data.map(p => ({ x: p.timestamp, y: p.value })),
      backgroundColor: s.color,
      borderColor: s.color,
      borderWidth: 0,
      barPercentage: 1.0,
      categoryPercentage: 1.0,
    }));
    this.chart.update('none');
  }

  destroy() {
    document.getElementById('gen-tooltip')?.remove();
    this.chart.destroy();
  }
}
