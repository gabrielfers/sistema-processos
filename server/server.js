const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const processosRoutes = require('./routes/processos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rotas
app.use('/api/processos', processosRoutes);

// Rota para a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});