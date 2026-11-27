import apiApp from '../server/apiRouter.js';

export default function handler(req, res) {
  // Normalize rewrites on Vercel serverless environment
  if (req.url && req.url.startsWith('/api/index.js')) {
    const original = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
    if (original) {
      req.url = original;
    }
  }
  return apiApp(req, res);
}

