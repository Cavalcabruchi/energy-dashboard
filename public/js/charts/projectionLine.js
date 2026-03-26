export class ProjectionLine {
  constructor(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: '#8B949E' }, grid: { color: '#21262D' } },
          y: {
            ticks: { color: '#8B949E', callback: v => `${v} TWh` },
            grid:  { color: '#21262D' },
            title: { display: true, text: 'TWh', color: '#484F58', font: { size: 11 } },
          },
        },
        plugins: { legend: { display: false } },
        elements: { point: { radius: 3 } },
      },
    });
  }

  update({ historical, projections }) {
    if (!historical?.length) return;

    // Historical line
    const histData = historical.map(d => ({ x: d.year, y: d.consumption_twh }));

    // Anchor: last historical year connects to projections
    const lastHist = historical[historical.length - 1];

    const scenarios = {
      national_trends:    { label: 'National Trends',    color: '#F4D03F', dash: [6, 3] },
      distributed_energy: { label: 'Distributed Energy', color: '#5DADE2', dash: [6, 3] },
      global_ambition:    { label: 'Global Ambition',    color: '#F39C12', dash: [6, 3] },
    };

    const projDatasets = Object.entries(scenarios).map(([key, meta]) => {
      const pts = projections
        .filter(p => p.scenario === key)
        .sort((a, b) => a.year - b.year)
        .map(p => ({ x: p.year, y: p.consumption_twh }));

      return {
        label: meta.label,
        data: [{ x: lastHist.year, y: lastHist.consumption_twh }, ...pts],
        borderColor: meta.color,
        backgroundColor: 'transparent',
        borderDash: meta.dash,
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.2,
      };
    });

    this.chart.data.datasets = [
      {
        label: 'Historical',
        data: histData,
        borderColor: '#2ECC71',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointRadius: 4,
        tension: 0.2,
      },
      ...projDatasets,
    ];
    this.chart.update('none');
  }

  destroy() { this.chart.destroy(); }
}
