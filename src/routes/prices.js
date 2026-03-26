import { Router } from 'express';
import { fetchEntsoe } from '../lib/entsoe.js';
import { parsePriceXML } from '../lib/xmlParser.js';
import { getDateRange } from '../lib/dateUtils.js';
import { EIC, EUROPE_EICS, getPriceEIC } from '../lib/eicCodes.js';
import { cache } from '../lib/cache.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const zone = req.query.zone || 'germany';
    const window = req.query.window || 'weekly';

    const cacheKey = `prices:${zone}:${window}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const { periodStart, periodEnd } = getDateRange(window);

    let series;
    let priceZoneNote = null;

    if (zone === 'europe') {
      const results = await Promise.allSettled(
        EUROPE_EICS.map(eic => fetchAndParse(eic, periodStart, periodEnd))
      );
      const fulfilled = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      series = averageEuropePrices(fulfilled);
    } else {
      const eic = getPriceEIC(zone);
      if (zone === 'transnetbw') {
        priceZoneNote = 'Prices shown for DE-LU bidding zone (TransnetBW has no independent price zone)';
      }
      series = await fetchAndParse(eic, periodStart, periodEnd);
    }

    const values = series.map(p => p.value).filter(v => v != null);
    const avg = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : null;
    const min = values.length ? Math.round(Math.min(...values) * 100) / 100 : null;
    const max = values.length ? Math.round(Math.max(...values) * 100) / 100 : null;

    const response = { zone, window, currency: 'EUR', unit: 'MWh', series, avg, min, max, priceZoneNote };
    cache.set(cacheKey, response, 3600);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

async function fetchAndParse(eic, periodStart, periodEnd) {
  const xml = await fetchEntsoe({
    documentType: 'A44',
    in_Domain: eic,
    out_Domain: eic,
    periodStart,
    periodEnd,
  });
  return parsePriceXML(xml);
}

function averageEuropePrices(allSeries) {
  const byTs = {};
  for (const series of allSeries) {
    for (const { timestamp, value } of series) {
      if (!byTs[timestamp]) byTs[timestamp] = { sum: 0, count: 0 };
      if (value != null) { byTs[timestamp].sum += value; byTs[timestamp].count++; }
    }
  }
  return Object.entries(byTs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timestamp, { sum, count }]) => ({
      timestamp,
      value: count > 0 ? Math.round((sum / count) * 100) / 100 : null,
    }));
}

export default router;
