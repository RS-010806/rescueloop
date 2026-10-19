import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { orchestrateRescueAgents } from './src/server/agentOrchestrator.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON payload parser with generous limit for photo uploads
  app.use(express.json({ limit: '25mb' }));

  // API Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Multi-agent Orchestration Endpoint
  app.post('/api/rescue/orchestrate', async (req, res) => {
    try {
      const { incident, recipients } = req.body;
      if (!incident || !recipients) {
        return res.status(400).json({ error: 'Missing incident or recipients payload' });
      }

      const result = await orchestrateRescueAgents(incident, recipients);
      return res.json(result);
    } catch (error: any) {
      console.error('Orchestration error:', error);
      return res.status(500).json({
        error: error.message || 'Internal agent orchestration failure',
      });
    }
  });

  // Mount Vite dev middleware in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built dist files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RescueLoop AI Command Center operational on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
