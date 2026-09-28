export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const sheetId = (req.query?.sheetId as string) || '1OkLAv21jl36iQQO_x9EeWq0sSLYtPFt1VCgtgC8CUBA';
    const gid = (req.query?.gid as string) || '0';

    // 1. Fetch via Google Sheets GViz CSV or export with cache busting
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&_t=${Date.now()}`;
    const response = await fetch(gvizUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'text/csv,text/plain,*/*',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (response.ok) {
      const csvText = await response.text();
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({ success: true, source: 'csv_export', csv: csvText });
    }

    // Fallback to export format
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&_t=${Date.now()}`;
    const exportRes = await fetch(exportUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      }
    });
    if (exportRes.ok) {
      const csvText = await exportRes.text();
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({ success: true, source: 'csv_export', csv: csvText });
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(response.status).json({
      success: false,
      error: `Google Sheets returned HTTP ${response.status}: ${response.statusText}`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ success: false, error: errorMsg });
  }
}
