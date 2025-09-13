import { onRequest } from 'firebase-functions/v2/https';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Firestore } from '@google-cloud/firestore';

const app = express();
app.use(cors());

const db = new Firestore({
  projectId: process.env.GCLOUD_PROJECT,
  databaseId: 'ecotupper-db',
  servicePath: 'europe-southwest1-firestore.googleapis.com',
  apiEndpoint: 'europe-southwest1-firestore.googleapis.com'
});

// ⚠️ OJO: la función se llama "api". La URL base será .../api
// Así que aquí NO pongas /api/..., pon solo /products.
app.get('/products', async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection('products').limit(50).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

app.get('/collaborators', async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection('collaborators').limit(50).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

app.get('/orders', async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection('orders').limit(50).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

export const api = onRequest({ region: 'europe-southwest1' }, app);
