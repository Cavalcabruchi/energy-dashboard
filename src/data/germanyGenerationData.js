/**
 * Germany annual electricity generation by source (TWh, net)
 *
 * Historical 2010–2024: based on Fraunhofer ISE Energy-Charts and AGEB Energiebilanz
 *   (± 5 % accuracy; values rounded to nearest TWh)
 * Projected  2025–2050: aligned with Klimaschutzgesetz targets, EEG 2023 expansion paths,
 *   NEP 2037 Scenario B, and ENTSO-E TYNDP 2024 National Trends for Germany.
 *   Coal exit 2030, nuclear already zero (April 2023), gas transitions to H₂-ready by 2040.
 *
 * Sources:
 *   Fraunhofer ISE Energy-Charts (energy-charts.info)
 *   AGEB Energiebilanz Deutschland
 *   Bundesnetzagentur / SMARD.de
 *   Klimaschutzgesetz 2021 amendment
 *   EEG 2023 §4 expansion targets
 *   NEP 2037 (2nd draft, 50Hertz / Amprion / TenneT / TransnetBW, 2023)
 *   ENTSO-E TYNDP 2024 – National Trends scenario
 *   BMWK Langfristszenarien (long-term energy scenarios)
 */

// All values in TWh.  Keys: windOn windOff solar biomass hydro nuclear lignite hardCoal gas other
export const GENERATION_BY_YEAR = {
  // ── Historical ─────────────────────────────────────────────────────────────
  2010: { windOn:38,  windOff:0,  solar:12,  biomass:32, hydro:21, nuclear:141, lignite:146, hardCoal:108, gas:85,  other:14 }, //  597
  2011: { windOn:49,  windOff:1,  solar:19,  biomass:35, hydro:18, nuclear:108, lignite:153, hardCoal:113, gas:84,  other:13 }, //  593 (post-Fukushima, 8 reactors idled)
  2012: { windOn:51,  windOff:1,  solar:26,  biomass:38, hydro:22, nuclear:99,  lignite:162, hardCoal:116, gas:67,  other:16 }, //  598
  2013: { windOn:52,  windOff:1,  solar:31,  biomass:41, hydro:23, nuclear:97,  lignite:162, hardCoal:124, gas:67,  other:15 }, //  613
  2014: { windOn:57,  windOff:2,  solar:35,  biomass:43, hydro:20, nuclear:97,  lignite:156, hardCoal:119, gas:60,  other:15 }, //  604
  2015: { windOn:79,  windOff:8,  solar:39,  biomass:45, hydro:20, nuclear:92,  lignite:156, hardCoal:118, gas:62,  other:14 }, //  633
  2016: { windOn:67,  windOff:12, solar:38,  biomass:46, hydro:21, nuclear:85,  lignite:150, hardCoal:112, gas:80,  other:16 }, //  627
  2017: { windOn:89,  windOff:18, solar:39,  biomass:48, hydro:20, nuclear:76,  lignite:148, hardCoal:93,  gas:87,  other:16 }, //  634
  2018: { windOn:112, windOff:19, solar:46,  biomass:49, hydro:17, nuclear:76,  lignite:131, hardCoal:94,  gas:87,  other:15 }, //  646 (peak)
  2019: { windOn:103, windOff:25, solar:47,  biomass:47, hydro:19, nuclear:75,  lignite:119, hardCoal:55,  gas:91,  other:15 }, //  596
  2020: { windOn:104, windOff:28, solar:50,  biomass:47, hydro:19, nuclear:64,  lignite:99,  hardCoal:36,  gas:95,  other:15 }, //  557 (COVID demand drop)
  2021: { windOn:95,  windOff:26, solar:49,  biomass:48, hydro:19, nuclear:69,  lignite:114, hardCoal:53,  gas:99,  other:15 }, //  587
  2022: { windOn:112, windOff:28, solar:60,  biomass:45, hydro:17, nuclear:34,  lignite:107, hardCoal:67,  gas:97,  other:13 }, //  580
  2023: { windOn:115, windOff:24, solar:62,  biomass:45, hydro:18, nuclear:6,   lignite:75,  hardCoal:38,  gas:95,  other:30 }, //  508 (nuclear exit Apr 2023, ~52 % RE)
  2024: { windOn:130, windOff:33, solar:78,  biomass:44, hydro:19, nuclear:0,   lignite:58,  hardCoal:24,  gas:75,  other:24 }, //  485 (est., ~62 % RE)

  // ── Projected (NEP 2037 Scenario B + EEG 2023 expansion targets) ───────────
  2025: { windOn:141, windOff:38, solar:88,  biomass:44, hydro:19, nuclear:0,   lignite:49,  hardCoal:21,  gas:77,  other:23 }, //  500
  2026: { windOn:152, windOff:44, solar:99,  biomass:44, hydro:20, nuclear:0,   lignite:40,  hardCoal:17,  gas:80,  other:22 }, //  518
  2027: { windOn:163, windOff:49, solar:109, biomass:44, hydro:20, nuclear:0,   lignite:31,  hardCoal:14,  gas:82,  other:22 }, //  534
  2028: { windOn:174, windOff:54, solar:119, biomass:44, hydro:20, nuclear:0,   lignite:22,  hardCoal:10,  gas:85,  other:21 }, //  549
  2029: { windOn:184, windOff:60, solar:130, biomass:45, hydro:21, nuclear:0,   lignite:14,  hardCoal:7,   gas:87,  other:21 }, //  569
  2030: { windOn:195, windOff:65, solar:140, biomass:45, hydro:21, nuclear:0,   lignite:5,   hardCoal:3,   gas:90,  other:20 }, //  584  (80 % RE target)
  2031: { windOn:204, windOff:70, solar:148, biomass:45, hydro:21, nuclear:0,   lignite:4,   hardCoal:2,   gas:87,  other:21 }, //  602
  2032: { windOn:213, windOff:75, solar:156, biomass:44, hydro:21, nuclear:0,   lignite:3,   hardCoal:2,   gas:84,  other:22 }, //  620
  2033: { windOn:222, windOff:80, solar:164, biomass:44, hydro:21, nuclear:0,   lignite:2,   hardCoal:1,   gas:81,  other:23 }, //  638
  2034: { windOn:231, windOff:85, solar:172, biomass:43, hydro:21, nuclear:0,   lignite:1,   hardCoal:0,   gas:78,  other:24 }, //  655
  2035: { windOn:240, windOff:90, solar:180, biomass:43, hydro:21, nuclear:0,   lignite:0,   hardCoal:0,   gas:75,  other:25 }, //  674  (coal exit, ~100 % RE target)
  2036: { windOn:250, windOff:100,solar:188, biomass:42, hydro:21, nuclear:0,   lignite:0,   hardCoal:0,   gas:71,  other:26 }, //  698
  2037: { windOn:260, windOff:110,solar:196, biomass:42, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:67,  other:27 }, //  724
  2038: { windOn:270, windOff:120,solar:204, biomass:41, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:63,  other:28 }, //  748
  2039: { windOn:280, windOff:130,solar:212, biomass:41, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:59,  other:29 }, //  773
  2040: { windOn:290, windOff:140,solar:220, biomass:40, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:55,  other:30 }, //  797  (major electrification: EVs, heat pumps, industry)
  2041: { windOn:298, windOff:145,solar:228, biomass:39, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:49,  other:31 }, //  812
  2042: { windOn:306, windOff:150,solar:236, biomass:38, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:43,  other:32 }, //  827
  2043: { windOn:314, windOff:155,solar:244, biomass:37, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:37,  other:33 }, //  842
  2044: { windOn:322, windOff:160,solar:252, biomass:37, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:31,  other:34 }, //  858
  2045: { windOn:330, windOff:165,solar:260, biomass:36, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:25,  other:35 }, //  873  (Klimaneutralität target)
  2046: { windOn:336, windOff:170,solar:266, biomass:35, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:22,  other:36 }, //  887
  2047: { windOn:342, windOff:175,solar:272, biomass:34, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:19,  other:37 }, //  901
  2048: { windOn:348, windOff:180,solar:278, biomass:33, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:16,  other:38 }, //  915
  2049: { windOn:354, windOff:185,solar:284, biomass:32, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:13,  other:39 }, //  929
  2050: { windOn:360, windOff:190,solar:290, biomass:32, hydro:22, nuclear:0,   lignite:0,   hardCoal:0,   gas:10,  other:40 }, //  944
};

export const LAST_HISTORICAL_YEAR = 2024;

export const SOURCES = [
  { key: 'lignite',  label: 'Lignite',        color: '#6E4B3A' },
  { key: 'hardCoal', label: 'Hard Coal',       color: '#5D6D7E' },
  { key: 'nuclear',  label: 'Nuclear',         color: '#9B59B6' },
  { key: 'gas',      label: 'Gas / H₂-ready',  color: '#F39C12' },
  { key: 'other',    label: 'Other',           color: '#95A5A6' },
  { key: 'hydro',    label: 'Run-of-river Hydro', color: '#5DADE2' },
  { key: 'biomass',  label: 'Biomass',         color: '#A9DFBF' },
  { key: 'solar',    label: 'Solar PV',        color: '#F4D03F' },
  { key: 'windOff',  label: 'Wind Offshore',   color: '#1ABC9C' },
  { key: 'windOn',   label: 'Wind Onshore',    color: '#2ECC71' },
];
