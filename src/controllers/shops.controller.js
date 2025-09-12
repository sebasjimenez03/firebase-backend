const { db } = require('../config/firestore');
const { Timestamp } = require('@google-cloud/firestore');
const { shopSchema } = require('../validators/shop.schema');

// Utilidad de respuesta de error
function httpError(res, e, fallback = 500) {
  const code = e?.code || fallback;
  console.error('Shops error:', { code, message: e?.message, stack: e?.stack });
  return res.status(500).json({ error: e?.message || 'Internal error', code });
}

// GET /api/shops?ownerUserId=&city=&enabled=&limit=&cursor=
async function listShops(req, res) {
  try {
    const { ownerUserId, city, enabled, limit = 50, cursor } = req.query;

    let q = db.collection('shops');
    if (ownerUserId) q = q.where('ownerUserId', '==', ownerUserId);
    if (city)       q = q.where('city', '==', city);
    if (enabled !== undefined) q = q.where('enabled', '==', enabled === 'true');

    // Intento con orderBy para paginación estable
    try {
      let qq = q.orderBy('createdAt', 'desc').limit(Number(limit));
      if (cursor) {
        const curSnap = await db.collection('shops').doc(cursor).get();
        if (curSnap.exists) qq = qq.startAfter(curSnap);
      }
      const snap = await qq.get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const nextCursor = snap.size ? snap.docs[snap.docs.length - 1].id : null;
      return res.json({ items, nextCursor });
    } catch (e) {
      // Fallback sin orderBy si Firestore pide índice
      const needsIndex = e?.code === 9 || /FAILED_PRECONDITION|index/i.test(e?.message || '');
      if (!needsIndex) throw e;
      const snap = await q.limit(Number(limit)).get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.json({ items, nextCursor: null });
    }
  } catch (e) {
    return httpError(res, e);
  }
}

// GET /api/shops/:id
async function getShop(req, res) {
  try {
    const ref = db.collection('shops').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (e) {
    return httpError(res, e);
  }
}

// POST /api/shops
async function createShop(req, res) {
  try {
    const parsed = shopSchema.parse(req.body);
    const now = Timestamp.now();
    const ref = await db.collection('shops').add({
      ...parsed,
      createdAt: now,
      updatedAt: now
    });
    const doc = await ref.get();
    return res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (e) {
    const status = e.name === 'ZodError' ? 400 : 500;
    return res.status(status).json({ error: e.message, issues: e.issues || undefined });
  }
}

// PUT /api/shops/:id
async function updateShop(req, res) {
  try {
    const body = shopSchema.partial().parse(req.body);
    const ref = db.collection('shops').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });

    // Si activas auth: un merchant solo puede tocar su propio shop
    // if (req.user?.role === 'merchant' && doc.data().ownerUserId !== req.user.uid) {
    //   return res.status(403).json({ error: 'Permisos insuficientes' });
    // }

    await ref.update({ ...body, updatedAt: Timestamp.now() });
    const updated = await ref.get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (e) {
    const status = e.name === 'ZodError' ? 400 : 500;
    return res.status(status).json({ error: e.message, issues: e.issues || undefined });
  }
}

// DELETE lógico /api/shops/:id
async function disableShop(req, res) {
  try {
    const ref = db.collection('shops').doc(req.params.id);
    await ref.update({ enabled: false, updatedAt: Timestamp.now() });
    return res.json({ ok: true });
  } catch (e) {
    return httpError(res, e);
  }
}

module.exports = { listShops, getShop, createShop, updateShop, disableShop };
