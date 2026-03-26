export function formatEntsoe(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  return `${y}${m}${d}${h}00`;
}

export function getDateRange(window) {
  const end = new Date();
  // truncate to current hour
  end.setUTCMinutes(0, 0, 0);
  const start = new Date(end);

  switch (window) {
    case 'daily':   start.setUTCHours(start.getUTCHours() - 24);  break;
    case 'bidaily': start.setUTCHours(start.getUTCHours() - 48);  break;
    case 'weekly':  start.setUTCDate(start.getUTCDate() - 7);     break;
    case 'monthly': start.setUTCDate(start.getUTCDate() - 30);    break;
    case 'yearly':  start.setUTCDate(start.getUTCDate() - 365);   break;
    default:        start.setUTCHours(start.getUTCHours() - 24);
  }

  return { periodStart: formatEntsoe(start), periodEnd: formatEntsoe(end) };
}

export function parseResolutionMinutes(res) {
  if (!res) return 60;
  if (res === 'PT15M') return 15;
  if (res === 'PT30M') return 30;
  if (res === 'PT60M') return 60;
  if (res === 'P1D')   return 1440;
  if (res === 'P1Y')   return 525600;
  const m = res.match(/PT(\d+)M/);
  if (m) return parseInt(m[1]);
  return 60;
}
