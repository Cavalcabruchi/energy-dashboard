import { Router } from 'express';
import { fetchEntsoe } from '../lib/entsoe.js';
import { parseGenerationXML } from '../lib/xmlParser.js';
import { getDateRange } from '../lib/dateUtils.js';
import { EIC, EUROPE_EICS, getGenerationEIC } from '../lib/eicCodes.js';
import { cache } from '../lib/cache.js';

const router = Router();
const VALID_ZONES = new Set(['europe', 'germany', 'transnetbw']);
const VALID_WINDOWS = new Set(['daily', 'bidaily', 'weekly', 'monthly', 'yearly']);

router.get('/', async (req, res, next) => {
  try {
    const zone = req.query.zone || 'europe';
    const window = req.query.window || 'weekly';

    if (!VALID_ZONES.has(zone)) return res.status(400).json({ error: `Invalid zone: ${zone}` });
    if (!VALID_WINDOWS.has(window)) return res.status(400).json({ error: `Invalid window: ${window}` });

    const cacheKey = `gen:${zone}:${window}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const { periodStart, periodEnd } = getDateRange(window);

    let series;
    if (zone === 'europe') {
      const results = await Promise.allSettled(
        EUROPE_EICS.map(eic => fetchAndParse(eic, periodStart, periodEnd))
      );
      const fulfilled = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failed = results.filter(r => r.status === 'rejected').length;
      series = mergeEuropeSeries(fulfilled);
      if (failed > 0) series._partialWarning = `Data unavailable for ${failed} of ${EUROPE_EICS.length} countries`;
    } else {
      const eic = getGenerationEIC(zone);
      if (!eic) return res.status(400).json({ error: 'Unknown zone' });
      series = await fetchAndParse(eic, periodStart, periodEnd);
    }

    if (window === 'yearly') series = downsampleYearly(series);

    const response = { zone, window, periodStart, periodEnd, series };
    cache.set(cacheKey, response);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

async function fetchAndParse(eic, periodStart, periodEnd) {
  const xml = await fetchEntsoe({
    documentType: 'A75',
    processType: 'A16',
    in_Domain: eic,
    periodStart,
    periodEnd,
  });
  return parseGenerationXML(xml);
}

function mergeEuropeSeries(allSeries) {
  const byPsr = {};
  for (const zoneSeries of allSeries) {
    for (const s of zoneSeries) {
      if (!byPsr[s.psr]) {
        byPsr[s.psr] = { ...s, data: {} };
      }
      for (const { timestamp, value } of s.data) {
        byPsr[s.psr].data[timestamp] = (byPsr[s.psr].data[timestamp] || 0) + (value || 0);
      }
    }
  }
  return Object.values(byPsr).map(s => ({
    ...s,
    data: Object.entries(s.data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([timestamp, value]) => ({ timestamp, value })),
  }));
}

function downsampleYearly(series) {
  if (!Array.isArray(series)) return series;
  return series.map(s => {
    const byDay = {};
    for (const { timestamp, value } of s.data) {
      const day = timestamp.slice(0, 10);
      if (!byDay[day]) byDay[day] = { sum: 0, count: 0 };
      byDay[day].sum += value || 0;
      byDay[day].count++;
    }
    return {
      ...s,
      data: Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, { sum, count }]) => ({ timestamp: `${day}T00:00:00.000Z`, value: Math.round(sum / count) })),
    };
  });
}

export default router;
