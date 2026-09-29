import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Server } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Fetch Google Sheet data proxy endpoint
  app.get('/api/sheet-data', async (req, res) => {
    try {
      const sheetId = (req.query.sheetId as string) || '1OkLAv21jl36iQQO_x9EeWq0sSLYtPFt1VCgtgC8CUBA';
      const gid = (req.query.gid as string) || '0';
      const authHeader = req.headers.authorization;

      // 1. If OAuth token provided, try Sheets API v4
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000`;
          const apiRes = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (apiRes.ok) {
            const data = await apiRes.json();
            return res.json({ success: true, source: 'oauth_api', values: data.values });
          }
        } catch (e) {
          console.warn('OAuth API fetch failed, falling back to CSV export:', e);
        }
      }

      // 1. Try Google Sheets GViz CSV first (direct, no auth redirects)
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}&_t=${Date.now()}`;
      try {
        const gvizRes = await fetch(gvizUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
            Accept: 'text/csv,text/plain,*/*',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        if (gvizRes.ok) {
          const csvText = await gvizRes.text();
          if (csvText && !csvText.includes('<!DOCTYPE html>') && csvText.trim().length > 10) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            return res.json({ success: true, source: 'csv_export', csv: csvText });
          }
        }
      } catch (gvizErr) {
        console.warn('GViz fetch failed, trying direct export:', gvizErr);
      }

      // 2. Fetch via CSV export URL with cache-busting timestamp and redirect follow
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&_t=${Date.now()}`;
      const response = await fetch(csvUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          Accept: 'text/csv,text/plain,*/*',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: `Google Sheets returned HTTP ${response.status}: ${response.statusText}. Please verify the sheet link and sharing permissions.`,
        });
      }

      const csvText = await response.text();
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.json({ success: true, source: 'csv_export', csv: csvText });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching sheet data:', err);
      return res.status(500).json({ success: false, error: errorMsg });
    }
  });

  let viteServer: any = null;

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    viteServer = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(viteServer.middlewares);
  }

  const server: Server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });

  // Handle port conflicts gracefully
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please terminate the lingering process or wait for cleanup.`);
    } else {
      console.error('Server encountered an error:', err);
    }
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Gracefully closing HTTP and Vite servers...`);
    if (viteServer) {
      try {
        await viteServer.close();
      } catch (e) {
        console.error('Error closing Vite server:', e);
      }
    }
    server.close(() => {
      console.log('HTTP server closed successfully.');
      process.exit(0);
    });
    // Force exit after 3 seconds if not closed
    setTimeout(() => {
      console.warn('Forcing exit after timeout.');
      process.exit(1);
    }, 3000).unref();
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
