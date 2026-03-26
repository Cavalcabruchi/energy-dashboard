const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, chartArea: { width, height, left, top } } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;
    const pct = chart.data.datasets[0]._renewablePct;
    if (pct == null) return;
    const cx = left + width / 2;
    const cy = top + height / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#E6EDF3';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText(`${pct}%`, cx, cy - 10);
    ctx.fillStyle = '#8B949E';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Renewable', cx, cy + 14);
    ctx.restore();
  },
};

export class RenewableDonut {
  constructor(canvasId, statsId) {
    this.statsEl = document.getElementById(statsId);
    const ctx = document.getElementById(canvasId).getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      plugins: [centerTextPlugin],
      data: {
        labels: ['Renewable', 'Non-Renewable'],
        datasets: [{ data: [0, 0], backgroundColor: ['#2ECC71', '#E74C3C'], borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total ? Math.round(ctx.parsed / total * 100) : 0;
                return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} MW (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  update(data) {
    if (!data?.series?.length) return;
    let renew = 0, nonRenew = 0;
    for (const s of data.series) {
      const total = s.data.reduce((sum, p) => sum + (p.value || 0), 0);
      if (s.category === 'renewable') renew += total;
      else nonRenew += total;
    }
    const total = renew + nonRenew;
    const pct = total ? Math.round(renew / total * 100) : 0;
    this.chart.data.datasets[0].data = [renew, nonRenew];
    this.chart.data.datasets[0]._renewablePct = pct;
    this.chart.update('none');

    if (this.statsEl) {
      this.statsEl.innerHTML = `
        <div class="stat-chip"><span class="val" style="color:#2ECC71">${(renew/1e6).toFixed(1)} TWh</span><span class="lbl">Renewable</span></div>
        <div class="stat-chip"><span class="val" style="color:#E74C3C">${(nonRenew/1e6).toFixed(1)} TWh</span><span class="lbl">Non-Renewable</span></div>
      `;
    }
  }

  destroy() { this.chart.destroy(); }
}
