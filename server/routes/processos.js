const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - Listar todos os processos ou buscar por termo
router.get('/', (req, res) => {
  const { busca, status, setor, competencia, data_inicio, data_fim } = req.query;
  let sql = 'SELECT * FROM processos WHERE 1=1';
  let params = [];

  // Filtro por busca geral
  if (busca) {
    sql += ` AND (numero_processo LIKE ? OR interessado LIKE ? OR objeto LIKE ? OR setor_atual LIKE ?)`;
    const termoBusca = `%${busca}%`;
    params.push(termoBusca, termoBusca, termoBusca, termoBusca);
  }

  // Filtro por status
  if (status !== undefined && status !== '') {
    sql += ` AND concluido = ?`;
    params.push(status === 'concluido' ? 1 : 0);
  }

  // Filtro por setor
  if (setor) {
    sql += ` AND setor_atual = ?`;
    params.push(setor);
  }

  // Filtro por competência
  if (competencia) {
    sql += ` AND competencia = ?`;
    params.push(competencia);
  }

  // Filtro por período de data
  if (data_inicio) {
    sql += ` AND data_entrada >= ?`;
    params.push(data_inicio);
  }

  if (data_fim) {
    sql += ` AND data_entrada <= ?`;
    params.push(data_fim);
  }

  sql += ` ORDER BY data_entrada DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar processos:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// POST - Criar novo processo
router.post('/', (req, res) => {
  const {
    numero_processo,
    data_entrada,
    competencia,
    objeto,
    interessado,
    orgao_gerador,
    responsavel,
    setor_atual,
    descricao,
    observacao,
    valor_convenio,
    valor_recurso_proprio,
    valor_royalties,
    concluido
  } = req.body;

  // Validação mais robusta
  if (!numero_processo || numero_processo.trim() === '') {
    return res.status(400).json({ error: 'Número do processo é obrigatório' });
  }

  // Verificar se já existe um processo com o mesmo número
  db.get('SELECT id FROM processos WHERE numero_processo = ?', [numero_processo], (err, row) => {
    if (err) {
      console.error('Erro ao verificar processo existente:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    if (row) {
      return res.status(400).json({ error: 'Já existe um processo com este número' });
    }

    // Sanitizar e converter valores
    const valorConvenio = valor_convenio ? parseFloat(valor_convenio) : 0;
    const valorRecursoProprio = valor_recurso_proprio ? parseFloat(valor_recurso_proprio) : 0;
    const valorRoyalties = valor_royalties ? parseFloat(valor_royalties) : 0;
    const total = valorConvenio + valorRecursoProprio + valorRoyalties;
    const data_atualizacao = new Date().toISOString();
    const dataEntrada = data_entrada || new Date().toISOString().split('T')[0];

    const sql = `INSERT INTO processos (
      numero_processo, data_entrada, competencia, objeto, interessado,
      orgao_gerador, responsavel, setor_atual, descricao,
      observacao, valor_convenio, valor_recurso_proprio, valor_royalties, total,
      concluido, data_atualizacao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      numero_processo.trim(),
      dataEntrada,
      competencia || '',
      objeto || '',
      interessado || '',
      orgao_gerador || '',
      responsavel || '',
      setor_atual || '',
      descricao || '',
      observacao || '',
      valorConvenio,
      valorRecursoProprio,
      valorRoyalties,
      total,
      concluido ? 1 : 0,
      data_atualizacao
    ];

    db.run(sql, params, function(err) {
      if (err) {
        console.error('Erro ao criar processo:', err);
        return res.status(500).json({ 
          error: 'Erro ao criar processo'
        });
      }
      res.status(201).json({ 
        id: this.lastID, 
        message: 'Processo criado com sucesso' 
      });
    });
  });
});

// PUT - Atualizar processo
router.put('/:id', (req, res) => {
  const { id } = req.params;
  
  const {
    numero_processo,
    data_entrada,
    competencia,
    objeto,
    interessado,
    orgao_gerador,
    responsavel,
    setor_atual,
    descricao,
    observacao,
    valor_convenio,
    valor_recurso_proprio,
    valor_royalties,
    concluido
  } = req.body;

  // Validação
  if (!numero_processo || numero_processo.trim() === '') {
    return res.status(400).json({ error: 'Número do processo é obrigatório' });
  }

  // Sanitizar e converter valores
  const valorConvenio = valor_convenio ? parseFloat(valor_convenio) : 0;
  const valorRecursoProprio = valor_recurso_proprio ? parseFloat(valor_recurso_proprio) : 0;
  const valorRoyalties = valor_royalties ? parseFloat(valor_royalties) : 0;
  const total = valorConvenio + valorRecursoProprio + valorRoyalties;
  const data_atualizacao = new Date().toISOString();

  const sql = `UPDATE processos SET
    numero_processo = ?, data_entrada = ?, competencia = ?, objeto = ?,
    interessado = ?, orgao_gerador = ?, responsavel = ?, setor_atual = ?,
    descricao = ?, observacao = ?, valor_convenio = ?,
    valor_recurso_proprio = ?, valor_royalties = ?, total = ?, concluido = ?, data_atualizacao = ?
    WHERE id = ?`;

  const params = [
    numero_processo.trim(),
    data_entrada || '',
    competencia || '',
    objeto || '',
    interessado || '',
    orgao_gerador || '',
    responsavel || '',
    setor_atual || '',
    descricao || '',
    observacao || '',
    valorConvenio,
    valorRecursoProprio,
    valorRoyalties,
    total,
    concluido ? 1 : 0,
    data_atualizacao,
    id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Erro ao atualizar processo:', err);
      return res.status(500).json({ 
        error: 'Erro ao atualizar processo'
      });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }
    res.json({ message: 'Processo atualizado com sucesso' });
  });
});

// DELETE - Excluir processo
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM processos WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erro ao excluir processo:', err);
      return res.status(500).json({ error: 'Erro ao excluir processo' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Processo não encontrado' });
    }
    res.json({ message: 'Processo excluído com sucesso' });
  });
});

module.exports = router;