const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const app = express();

//CORS
const allowed = [
  /^http:\/\/localhost:3000$/,
  /\.vercel\.app$/,
  /\.cloudworkstations\.dev$/
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Postman/SSR
    const ok = allowed.some(re => re.test(origin));
    return ok ? cb(null, true) : cb(new Error("CORS not allowed"));
  },
  credentials: true
}));

app.use(express.json());

const { db } = require('./config/firestore');
//Routes
const productsRoutes = require('./routes/products.routes');
const shopsRoutes = require('./routes/shops.routes');
const collaboratorsRoutes = require('./routes/collaborators.routes');
const { notFound, onError } = require('./middlewares/error'); // Error reporting

db.listCollections()
  .then(cols => {
    console.log('✅ Colecciones:');
    cols.forEach(c => console.log(' -', c.id));
  })
  .catch(err => console.error('❌ Error listando colecciones:', err.message));

// Rutas
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/products', productsRoutes);
app.use('/api/shops', shopsRoutes);
app.use('/api/collaborators', collaboratorsRoutes);

app.use(notFound);
app.use(onError);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
