export class ConsumptionBar {
  constructor(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Consumption (TWh)', data: [], backgroundColor: [], borderWidth: 0, borderRadius: 4 }] },
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
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} TWh` } },
        },
      },
    });
  }

  update(historical, highlightYear) {
    if (!historical?.length) return;
    this.chart.data.labels = historical.map(d => String(d.year));
    this.chart.data.datasets[0].data = historical.map(d => d.consumption_twh);
    this.chart.data.datasets[0].backgroundColor = historical.map(d =>
      d.year === highlightYear ? '#2ECC71' : '#21262D'
    );
    this.chart.update('none');
  }

  destroy() { this.chart.destroy(); }
}
