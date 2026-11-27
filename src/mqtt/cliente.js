const mqtt = require('mqtt');
const Lectura = require('../models/Lectura');

function iniciarMQTT(onLectura) {
  const client = mqtt.connect(process.env.MQTT_URL, {
    clientId: 'backend_' + Math.random().toString(16).slice(2, 8),
    reconnectPeriod: 5000,
  });

  client.on('connect', () => {
    console.log('MQTT conectado');
    client.subscribe(process.env.MQTT_TOPIC);
  });

  client.on('message', async (topic, payload) => {
    try {
      const raw = JSON.parse(payload.toString());
      const d = raw.advertencia ?? raw;          // soporta ambos formatos

      const temperatura = parseFloat(d.temperatura ?? d.Temperatura);
      const humedad     = parseFloat(d.humedad ?? d.Humedad);
      if (!Number.isFinite(temperatura) || !Number.isFinite(humedad)) return;

      const lectura = await Lectura.create({
        temperatura, humedad,
        alerta: Boolean(raw.alerta ?? raw.advertencia),
        hora: d.hora ?? d.Hora,
        fecha: d.fecha ?? d.Fecha,
      });
      console.log('Guardado:', temperatura, humedad);
      onLectura?.(lectura);                      // avisa a los navegadores
    } catch (e) {
      console.error('Mensaje inválido:', e.message);
    }
  });

  client.on('error', (e) => console.error('MQTT error:', e.message));
  return client;
}

module.exports = iniciarMQTT;
/*const mqtt = require('mqtt');
const Lectura = require('../models/Lectura');

const aNumero = (v) => Number(String(v).replace(/[^\d.-]/g, ''));

function iniciarMQTT() {
  const client = mqtt.connect(process.env.MQTT_URL, {
    clientId: 'backend_' + Math.random().toString(16).slice(2, 8), // único en broker público
    reconnectPeriod: 5000,
  });

  client.on('connect', () => {
    console.log('MQTT conectado');
    client.subscribe(process.env.MQTT_TOPIC);
  });

  client.on('message', async (topic, payload) => {
    try {
      const d = JSON.parse(payload.toString());
      const temperatura = aNumero(d.temperatura ?? d.Temperatura);
      const humedad     = aNumero(d.humedad ?? d.Humedad);

      if (!Number.isFinite(temperatura) || !Number.isFinite(humedad)) return; // descarta basura

      await Lectura.create({
        temperatura, humedad,
        alerta: Boolean(d.alerta),
        hora: d.hora, fecha: d.fecha,
      });
    } catch (e) {
      console.error('Mensaje inválido:', e.message);
    }
  });

  client.on('error', (e) => console.error('MQTT error:', e.message));
  return client;
}

module.exports = iniciarMQTT;*/