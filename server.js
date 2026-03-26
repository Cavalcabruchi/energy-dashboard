import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

import generationRouter from './src/routes/generation.js';
import pricesRouter     from './src/routes/prices.js';
import loadRouter       from './src/routes/load.js';
import germanyRouter    from './src/routes/germany.js';

if (!process.env.ENTSOE_API_KEY) {
  console.error('❌  ENTSOE_API_KEY is not set. Create a .env file with ENTSOE_API_KEY=<your_key>');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/generation', generationRouter);
app.use('/api/prices',     pricesRouter);
app.use('/api/load',       loadRouter);
app.use('/api/germany',   germanyRouter);

app.get('/germany', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'germany.html'))
);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`⚡ Energy Dashboard running → http://localhost:${PORT}`);
});
