import { Router } from 'express';
import { fetchEntsoe } from '../lib/entsoe.js';
import { parseLoadXML } from '../lib/xmlParser.js';
import { getDateRange } from '../lib/dateUtils.js';
import { EIC, EUROPE_EICS, getGenerationEIC } from '../lib/eicCodes.js';
import { cache } from '../lib/cache.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const zone = req.query.zone || 'germany';
    const window = req.query.window || 'weekly';

    const cacheKey = `load:${zone}:${window}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const { periodStart, periodEnd } = getDateRange(window);

    let series;
    if (zone === 'europe') {
      const results = await Promise.allSettled(
        EUROPE_EICS.map(eic => fetchAndParse(eic, periodStart, periodEnd))
      );
      const fulfilled = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      series = sumEuropeLoad(fulfilled);
    } else {
      const eic = getGenerationEIC(zone);
      if (!eic) return res.status(400).json({ error: 'Unknown zone' });
      series = await fetchAndParse(eic, periodStart, periodEnd);
    }

    const response = { zone, window, unit: 'MW', series };
    cache.set(cacheKey, response);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

async function fetchAndParse(eic, periodStart, periodEnd) {
  const xml = await fetchEntsoe({
    documentType: 'A65',
    processType: 'A16',
    in_Domain: eic,
    periodStart,
    periodEnd,
  });
  return parseLoadXML(xml);
}

function sumEuropeLoad(allSeries) {
  const byTs = {};
  for (const series of allSeries) {
    for (const { timestamp, value } of series) {
      byTs[timestamp] = (byTs[timestamp] || 0) + (value || 0);
    }
  }
  return Object.entries(byTs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timestamp, value]) => ({ timestamp, value }));
}

export default router;
