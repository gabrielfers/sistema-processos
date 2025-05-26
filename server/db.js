const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Cria um novo banco de dados ou conecta a um existente
const dbPath = path.resolve(__dirname, 'processos.db');
const db = new sqlite3.Database(dbPath);

// Cria a tabela de processos se não existir
db.serialize(() => {
  // Primeiro, cria a tabela com o schema básico
  db.run(`
    CREATE TABLE IF NOT EXISTS processos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_processo TEXT NOT NULL,
      data_entrada TEXT,
      objeto TEXT,
      competencia TEXT,
      interessado TEXT,
      orgao_gerador TEXT,
      responsavel TEXT,
      descricao TEXT,
      concluido INTEGER DEFAULT 0,
      setor_atual TEXT,
      observacao TEXT,
      data_atualizacao TEXT
    )
  `);

  // Verifica e adiciona colunas faltantes se necessário
  db.all("PRAGMA table_info(processos)", (err, columns) => {
    if (err) {
      console.error('Erro ao verificar colunas:', err);
      return;
    }

    const columnNames = columns.map(col => col.name);
    
    // Adiciona descricao se não existir
    if (!columnNames.includes('descricao')) {
      db.run("ALTER TABLE processos ADD COLUMN descricao TEXT DEFAULT ''", (err) => {
        if (err) console.error('Erro ao adicionar coluna descricao:', err);
      });
    }

    // Adiciona valor_convenio se não existir
    if (!columnNames.includes('valor_convenio')) {
      db.run("ALTER TABLE processos ADD COLUMN valor_convenio REAL DEFAULT 0", (err) => {
        if (err) console.error('Erro ao adicionar coluna valor_convenio:', err);
      });
    }

    // Adiciona valor_recurso_proprio se não existir
    if (!columnNames.includes('valor_recurso_proprio')) {
      db.run("ALTER TABLE processos ADD COLUMN valor_recurso_proprio REAL DEFAULT 0", (err) => {
        if (err) console.error('Erro ao adicionar coluna valor_recurso_proprio:', err);
      });
    }

    // Adiciona valor_royalties se não existir
    if (!columnNames.includes('valor_royalties')) {
      db.run("ALTER TABLE processos ADD COLUMN valor_royalties REAL DEFAULT 0", (err) => {
        if (err) console.error('Erro ao adicionar coluna valor_royalties:', err);
      });
    }

    // Adiciona total se não existir
    if (!columnNames.includes('total')) {
      db.run("ALTER TABLE processos ADD COLUMN total REAL DEFAULT 0", (err) => {
        if (err) console.error('Erro ao adicionar coluna total:', err);
      });
    }
  });
});

module.exports = db;