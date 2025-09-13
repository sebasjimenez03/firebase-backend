const { db } = require('../config/firestore');
const { Timestamp } = require('@google-cloud/firestore');
const { collaboratorSchema } = require('../validators/collaborator.schema');

function httpError(res, e, fallback = 500) {
  const code = e?.code || fallback;
  console.error('GET /api/collaborators error:', { code, message: e?.message, stack: e?.stack });
  return res.status(500).json({
    error: e?.message || 'Internal error',
    code
  });
}

// GET /api/products  (no params)
async function listAllCollaborators(_req, res) {
  try {
    
    try {
      const snap = await db.collection('collaborator')
        .limit(50)
        .get();

      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('📦 Collaborators encontrados:', items.length);
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
    const ref = db.collection('collaborators').doc(req.params.id);
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
    const parsed = collaboratorSchema.parse(req.body);
    const now = Timestamp.now();
    const ref = await db.collection('collaborators').add({
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

module.exports = { listAllCollaborators, getProduct, createProduct };
