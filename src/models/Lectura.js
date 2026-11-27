// src/models/Lectura.js
const { Schema, model } = require('mongoose');

const lecturaSchema = new Schema({
  temperatura: { type: Number, required: true },
  humedad:     { type: Number, required: true },
  alerta:      { type: Boolean, default: false },
  hora:        String,   // la del RTC, solo informativa
  fecha:       String,
}, { timestamps: true }); // createdAt = hora del servidor, más confiable que la del RTC

lecturaSchema.index({ createdAt: -1 });

module.exports = model('Lectura', lecturaSchema);