import axios from 'axios';
import xml2js from 'xml2js';

const BASE = 'https://web-api.tp.entsoe.eu/api';

export async function fetchEntsoe(params) {
  let response;
  try {
    response = await axios.get(BASE, {
      params: { securityToken: process.env.ENTSOE_API_KEY, ...params },
      timeout: 20000,
      responseType: 'text',           // always get raw string, never attempt JSON parse
      headers: { Accept: 'application/xml' },
    });
  } catch (err) {
    if (err.response) {
      // ENTSO-E returned HTTP error — extract reason from XML body
      const reason = await extractErrorReason(String(err.response.data || ''));
      throw Object.assign(
        new Error(reason || `ENTSO-E error ${err.response.status}`),
        { status: err.response.status }
      );
    }
    const msg = err.code === 'ECONNABORTED' ? 'ENTSO-E request timed out' : 'Cannot reach ENTSO-E API';
    throw Object.assign(new Error(msg), { status: 503 });
  }

  // ENTSO-E sometimes returns HTTP 200 with an Acknowledgement (no data / bad query)
  const xml = String(response.data);
  if (xml.includes('Acknowledgement_MarketDocument')) {
    const reason = await extractErrorReason(xml);
    throw Object.assign(
      new Error(reason || 'No data available for the requested period/zone'),
      { status: 404 }
    );
  }

  return xml;
}

async function extractErrorReason(xml) {
  if (typeof xml !== 'string' || !xml.includes('<')) return null;
  try {
    const parser = new xml2js.Parser({
      explicitArray: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });
    const parsed = await parser.parseStringPromise(xml);
    const root = parsed['Acknowledgement_MarketDocument'] || Object.values(parsed)[0] || {};
    return root?.Reason?.text || null;
  } catch {
    return null;
  }
}
