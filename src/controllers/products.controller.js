const { db } = require('../config/firestore');
const { Timestamp } = require('@google-cloud/firestore');
const { productSchema } = require('../validators/product.schema');

function httpError(res, e, fallback = 500) {
  const code = e?.code || fallback;
  console.error('GET /api/products error:', { code, message: e?.message, stack: e?.stack });
  return res.status(500).json({
    error: e?.message || 'Internal error',
    code
  });
}

// GET /api/products?shopId=&limit=&cursor=
async function listProductsByShop(req, res) {
  try {

    const { shopId } = req.query;
    let q = db.collection('products');
    if (shopId) q = q.where('shopId', '==', shopId);

    const snap = await q.limit(50).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ items, nextCursor: null });
    
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// GET /api/products  (no params)
async function listAllProducts(_req, res) {
  try {
    
    try {
      const snap = await db.collection('products')
        .orderBy('createAt', 'desc')
        .limit(50)
        .get();

      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('📦 Productos encontrados (ordenados):', items.length);
      return res.json(items);

    } catch (e) {
      
      const needsIndex = e?.code === 9 || /FAILED_PRECONDITION|index/i.test(e?.message || '');
      if (!needsIndex) throw e;

      // Plan B: sin orderBy (para probar rápido)
      const snap = await db.collection('products').limit(50).get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.warn('⚠️ Sin índice: devolviendo sin orderBy. Total:', items.length);
      return res.json(items);
    }
  } catch (e) {
    return httpError(res, e);
  }
}

// 
async function getProduct(req, res) {
  try {
    const ref = db.collection('products').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (e) {
    return httpError(res, e);
  }
}

// POST /api/products (merchant o admin)
async function createProduct(req, res) {
  try {
    const parsed = productSchema.parse(req.body);
    const now = Timestamp.now();
    const ref = await db.collection('products').add({
      ...parsed,
      createdAt: now,
      updatedAt: now
    });
    const doc = await ref.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (e) {
    const status = e.name === 'ZodError' ? 400 : 500;
    res.status(status).json({ error: e.message, issues: e.issues || undefined });
  }
}

module.exports = { listAllProducts, getProduct, createProduct, listProductsByShop};
