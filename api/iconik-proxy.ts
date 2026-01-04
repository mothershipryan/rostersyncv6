
import type { VercelRequest, VercelResponse } from '@vercel/node';
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(410).json({ error: 'This endpoint is deprecated. Use /api/gate' });
}
