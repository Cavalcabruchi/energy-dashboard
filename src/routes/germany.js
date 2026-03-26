import { Router } from 'express';
import { GENERATION_BY_YEAR, LAST_HISTORICAL_YEAR, SOURCES } from '../data/germanyGenerationData.js';

const router = Router();

router.get('/generation-mix', (_req, res) => {
  const years = Object.keys(GENERATION_BY_YEAR).map(Number).sort((a, b) => a - b);
  res.json({
    years,
    lastHistoricalYear: LAST_HISTORICAL_YEAR,
    sources: SOURCES,
    data: GENERATION_BY_YEAR,
  });
});

export default router;
