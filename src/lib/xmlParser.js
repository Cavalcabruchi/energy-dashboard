import xml2js from 'xml2js';
import { parseResolutionMinutes } from './dateUtils.js';

export const PSR_META = {
  B01: { label: 'Biomass',             category: 'renewable',    color: '#A9DFBF' },
  B02: { label: 'Lignite',             category: 'nonrenewable', color: '#6E4B3A' },
  B03: { label: 'Coal Gas',            category: 'nonrenewable', color: '#778899' },
  B04: { label: 'Natural Gas',         category: 'nonrenewable', color: '#F39C12' },
  B05: { label: 'Hard Coal',           category: 'nonrenewable', color: '#5D6D7E' },
  B06: { label: 'Oil',                 category: 'nonrenewable', color: '#C0392B' },
  B07: { label: 'Oil Shale',           category: 'nonrenewable', color: '#A04000' },
  B08: { label: 'Peat',                category: 'nonrenewable', color: '#7D6608' },
  B09: { label: 'Geothermal',          category: 'renewable',    color: '#E59866' },
  B10: { label: 'Pumped Storage',      category: 'renewable',    color: '#85C1E9' },
  B11: { label: 'Run-of-river Hydro',  category: 'renewable',    color: '#5DADE2' },
  B12: { label: 'Reservoir Hydro',     category: 'renewable',    color: '#2E86C1' },
  B13: { label: 'Marine',              category: 'renewable',    color: '#76D7C4' },
  B14: { label: 'Nuclear',             category: 'nonrenewable', color: '#9B59B6' },
  B15: { label: 'Other Renewable',     category: 'renewable',    color: '#82E0AA' },
  B16: { label: 'Solar',               category: 'renewable',    color: '#F4D03F' },
  B17: { label: 'Waste',               category: 'nonrenewable', color: '#BDC3C7' },
  B18: { label: 'Wind Offshore',       category: 'renewable',    color: '#1ABC9C' },
  B19: { label: 'Wind Onshore',        category: 'renewable',    color: '#2ECC71' },
  B20: { label: 'Other Non-Renewable', category: 'nonrenewable', color: '#95A5A6' },
};

const parser = new xml2js.Parser({
  explicitArray: false,
  tagNameProcessors: [xml2js.processors.stripPrefix],  // handles ns0:GL_MarketDocument etc.
});

export async function parseGenerationXML(xml) {
  let parsed;
  try { parsed = await parser.parseStringPromise(xml); }
  catch { return []; }
  const doc = parsed['GL_MarketDocument'];
  if (!doc) return [];  // no data for this zone/period — return empty instead of throwing

  const allSeries = [].concat(doc.TimeSeries || []);
  const byType = {};

  for (const ts of allSeries) {
    // Skip out-of-zone series (only keep inBiddingZone)
    if (!ts['inBiddingZone_Domain.mRID'] && ts['out_BiddingZone_Domain.mRID']) continue;

    const psrType = ts?.MktPSRType?.psrType;
    if (!psrType) continue;

    const periods = [].concat(ts.Period || []);
    for (const period of periods) {
      const startStr = period?.timeInterval?.start;
      if (!startStr) continue;
      const startMs = new Date(startStr).getTime();
      const resMins = parseResolutionMinutes(period.resolution);
      const points = [].concat(period.Point || []);

      for (const pt of points) {
        const pos = parseInt(pt.position, 10) - 1;
        const ts_ms = startMs + pos * resMins * 60000;
        const ts_iso = new Date(ts_ms).toISOString();
        const val = pt.quantity != null ? parseFloat(pt.quantity) : null;

        if (!byType[psrType]) byType[psrType] = {};
        byType[psrType][ts_iso] = (byType[psrType][ts_iso] ?? 0) + (val ?? 0);
      }
    }
  }

  return Object.entries(byType).map(([psr, tsMap]) => {
    const meta = PSR_META[psr] || { label: psr, category: 'unknown', color: '#888' };
    const sortedEntries = Object.entries(tsMap).sort(([a], [b]) => a.localeCompare(b));
    return {
      psr,
      label: meta.label,
      category: meta.category,
      color: meta.color,
      data: sortedEntries.map(([timestamp, value]) => ({ timestamp, value })),
    };
  });
}

export async function parsePriceXML(xml) {
  let parsed;
  try { parsed = await parser.parseStringPromise(xml); }
  catch { return []; }
  const doc = parsed['Publication_MarketDocument'];
  if (!doc) return [];  // no data for this zone/period

  const allSeries = [].concat(doc.TimeSeries || []);
  const points = [];

  for (const ts of allSeries) {
    const periods = [].concat(ts.Period || []);
    for (const period of periods) {
      const startStr = period?.timeInterval?.start;
      if (!startStr) continue;
      const startMs = new Date(startStr).getTime();
      const resMins = parseResolutionMinutes(period.resolution);
      const pts = [].concat(period.Point || []);

      for (const pt of pts) {
        const pos = parseInt(pt.position, 10) - 1;
        const ts_ms = startMs + pos * resMins * 60000;
        const val = pt['price.amount'] != null ? parseFloat(pt['price.amount']) : null;
        points.push({ timestamp: new Date(ts_ms).toISOString(), value: val });
      }
    }
  }

  return points.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export async function parseLoadXML(xml) {
  let parsed;
  try { parsed = await parser.parseStringPromise(xml); }
  catch { return []; }
  const doc = parsed['GL_MarketDocument'];
  if (!doc) return [];  // no data for this zone/period

  const allSeries = [].concat(doc.TimeSeries || []);
  const points = [];

  for (const ts of allSeries) {
    const periods = [].concat(ts.Period || []);
    for (const period of periods) {
      const startStr = period?.timeInterval?.start;
      if (!startStr) continue;
      const startMs = new Date(startStr).getTime();
      const resMins = parseResolutionMinutes(period.resolution);
      const pts = [].concat(period.Point || []);

      for (const pt of pts) {
        const pos = parseInt(pt.position, 10) - 1;
        const ts_ms = startMs + pos * resMins * 60000;
        const val = pt.quantity != null ? parseFloat(pt.quantity) : null;
        points.push({ timestamp: new Date(ts_ms).toISOString(), value: val });
      }
    }
  }

  return points.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
