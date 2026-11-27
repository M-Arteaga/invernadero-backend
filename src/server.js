require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');
const iniciarMQTT = require('./mqtt/cliente');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/lecturas', require('./routes/lecturas'));
app.use(express.static(path.join(__dirname, '..', 'docs')));

// Servidor HTTP + WebSocket en el mismo puerto
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const difundir = (obj) => {
  const msg = JSON.stringify(obj);
  wss.clients.forEach((c) => c.readyState === 1 && c.send(msg));
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas conectado');
    iniciarMQTT(difundir);
    const puerto = process.env.PORT || 3000;
    server.listen(puerto, () => console.log(`http://localhost:${puerto}`));
  })
  .catch((e) => { console.error('Error Mongo:', e.message); process.exit(1); });

/*require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const iniciarMQTT = require('./mqtt/cliente');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/lecturas', require('./routes/lecturas'));
app.use(express.static(path.join(__dirname, '..', 'public')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas conectado');
    iniciarMQTT();
    app.listen(process.env.PORT, () => console.log(`http://localhost:${process.env.PORT}`));
  })
  .catch((e) => { console.error('Error Mongo:', e.message); process.exit(1); });*/