export const EIC = {
  germany:     '10Y1001A1001A83F',
  transnetbw:  '10YDE-VE-------2',
  france:      '10YFR-RTE------C',
  spain:       '10YES-REE------0',
  italy:       '10YIT-GRTN-----B',
  netherlands: '10YNL----------L',
  belgium:     '10YBE----------2',
  austria:     '10YAT-APG------L',
  poland:      '10YPL-AREA-----S',
  czechia:     '10YCZ-CEPS-----N',
  switzerland: '10YCH-SWISSGRIDZ',
};

export const EUROPE_EICS = [
  EIC.germany, EIC.france, EIC.spain, EIC.italy,
  EIC.netherlands, EIC.belgium, EIC.austria,
  EIC.poland, EIC.czechia, EIC.switzerland,
];

// TransnetBW has no independent price bidding zone — falls back to DE-LU
export function getPriceEIC(zone) {
  if (zone === 'transnetbw') return EIC.germany;
  return EIC[zone] || EIC.germany;
}

export function getGenerationEIC(zone) {
  return EIC[zone] || null;
}

export const ZONE_LABELS = {
  europe:     'Europe',
  germany:    'Germany',
  transnetbw: 'Baden-Württemberg (TransnetBW)',
};
