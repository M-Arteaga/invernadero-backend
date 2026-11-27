// src/routes/lecturas.js
const router = require('express').Router();
const Lectura = require('../models/Lectura');

// GET /api/lecturas?limit=50&desde=2026-11-21&hasta=2026-11-22
router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 500);
  const filtro = {};
  if (req.query.desde || req.query.hasta) {
    filtro.createdAt = {};
    if (req.query.desde) filtro.createdAt.$gte = new Date(req.query.desde);
    if (req.query.hasta) filtro.createdAt.$lte = new Date(req.query.hasta);
  }
  const datos = await Lectura.find(filtro).sort({ createdAt: -1 }).limit(limit);
  res.json(datos.reverse()); // en orden cronológico para graficar
});

// GET /api/lecturas/ultima
router.get('/ultima', async (_req, res) => {
  const l = await Lectura.findOne().sort({ createdAt: -1 });
  if (!l) return res.status(404).json({ error: 'Sin lecturas' });
  res.json(l);
});

// GET /api/lecturas/estadisticas
router.get('/estadisticas', async (_req, res) => {
  const [r] = await Lectura.aggregate([{ $group: {
    _id: null,
    tempProm: { $avg: '$temperatura' }, tempMax: { $max: '$temperatura' }, tempMin: { $min: '$temperatura' },
    humProm:  { $avg: '$humedad' },     humMax:  { $max: '$humedad' },     humMin:  { $min: '$humedad' },
    total: { $sum: 1 },
  }}]);
  res.json(r || {});
});

// DELETE /api/lecturas/:id
router.delete('/:id', async (req, res) => {
  const r = await Lectura.findByIdAndDelete(req.params.id);
  r ? res.status(204).end() : res.status(404).json({ error: 'No encontrada' });
});

module.exports = router;