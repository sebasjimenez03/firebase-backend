function notFound(_, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}
function onError(err, _req, res, _next) {
  console.error('❌', err);
  res.status(500).json({ error: 'Error interno', details: err.message });
}
module.exports = { notFound, onError };
