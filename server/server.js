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

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, '../public')));

// Rota específica para assets (caso precise de configuração especial)
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// Rotas da API
app.use('/api/processos', processosRoutes);

// Rota para a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  console.log(`Pasta public: ${path.join(__dirname, '../public')}`);
});