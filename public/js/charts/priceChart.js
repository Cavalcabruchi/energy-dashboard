export class PriceChart {
  constructor(canvasId, statsId) {
    this.statsEl = document.getElementById(statsId);
    const ctx = document.getElementById(canvasId).getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            type: 'time',
            ticks: { color: '#8B949E', maxTicksLimit: 10 },
            grid:  { color: '#21262D' },
          },
          y: {
            ticks: { color: '#8B949E', callback: v => `€${v}` },
            grid:  { color: '#21262D' },
            title: { display: true, text: '€/MWh', color: '#484F58', font: { size: 11 } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                if (ctx.dataset.label === 'Average') return null;
                return ` €${ctx.parsed.y != null ? ctx.parsed.y.toFixed(2) : 'N/A'}/MWh`;
              },
            },
          },
        },
        elements: { point: { radius: 0, hoverRadius: 4 } },
      },
    });
  }

  update(data) {
    if (!data?.series?.length) return;
    const nPoints = data.series.length;
    const timeUnit = nPoints < 72 ? 'hour' : nPoints < 200 ? 'day' : 'week';
    this.chart.options.scales.x.time = { unit: timeUnit };

    this.chart.data.datasets = [
      {
        label: 'Price',
        data: data.series.map(p => ({ x: p.timestamp, y: p.value })),
        borderColor: '#F1C40F',
        backgroundColor: 'rgba(241,196,15,0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
      },
    ];

    if (data.avg != null) {
      this.chart.data.datasets.push({
        label: 'Average',
        data: data.series.map(p => ({ x: p.timestamp, y: data.avg })),
        borderColor: 'rgba(241,196,15,0.35)',
        borderDash: [4, 4],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    }

    this.chart.update('none');

    if (this.statsEl) {
      this.statsEl.innerHTML = `
        <div class="stat-chip"><span class="val">€${data.avg ?? '—'}</span><span class="lbl">Avg</span></div>
        <div class="stat-chip"><span class="val" style="color:#2ECC71">€${data.min ?? '—'}</span><span class="lbl">Min</span></div>
        <div class="stat-chip"><span class="val" style="color:#E74C3C">€${data.max ?? '—'}</span><span class="lbl">Max</span></div>
      `;
    }
  }

  destroy() { this.chart.destroy(); }
}
