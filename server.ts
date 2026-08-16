import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialAppState } from './src/data/initialData';
import { AppState } from './src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'app_state.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize state
let currentState: AppState = initialAppState;
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    currentState = { ...initialAppState, ...JSON.parse(raw) };
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentState, null, 2), 'utf-8');
  }
} catch (err) {
  console.error('Error loading data file, using default state:', err);
}

// SSE client connections for real-time sync across devices
const sseClients: Response[] = [];

function broadcastStateUpdate(senderId?: string) {
  const payload = JSON.stringify({
    type: 'STATE_UPDATE',
    timestamp: Date.now(),
    state: currentState,
    senderId,
  });

  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(`data: ${payload}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // API Routes
  app.post('/api/auth/verify', (req: Request, res: Response) => {
    const { password } = req.body;
    if (password === 'myg2026') {
      res.json({ success: true, message: 'Acceso Autorizado MYG 2026' });
    } else {
      res.status(401).json({ success: false, message: 'Contraseña incorrecta. Utilice myg2026' });
    }
  });

  app.get('/api/state', (req: Request, res: Response) => {
    res.json(currentState);
  });

  app.post('/api/state', (req: Request, res: Response) => {
    try {
      const { state, senderId } = req.body;
      if (state) {
        currentState = { ...state, lastSyncTimestamp: Date.now() };
        fs.writeFileSync(DATA_FILE, JSON.stringify(currentState, null, 2), 'utf-8');
        broadcastStateUpdate(senderId);
        res.json({ success: true, lastSyncTimestamp: currentState.lastSyncTimestamp });
      } else {
        res.status(400).json({ error: 'Missing state payload' });
      }
    } catch (err: any) {
      console.error('Error saving state:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Real-time Server-Sent Events endpoint
  app.get('/api/realtime-events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);

    // Send initial ping and current state
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientsCount: sseClients.length })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) {
        sseClients.splice(idx, 1);
      }
    });
  });

  app.get('/api/stats', (req: Request, res: Response) => {
    res.json({
      onlineDevices: Math.max(1, sseClients.length),
      vehiclesCount: currentState.vehicles.length,
      lastSync: currentState.lastSyncTimestamp,
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MYG 2026 Fleet Maintenance Server running on port ${PORT}`);
  });
}

startServer();
