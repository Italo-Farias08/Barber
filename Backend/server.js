const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();

app.use(express.json());
app.use(cors());

const db = new Database("banco.db");

// =========================
// TABELA AGENDAMENTOS
// =========================
db.prepare(`
CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  data TEXT NOT NULL,
  horario TEXT NOT NULL,
  valor REAL DEFAULT 0,
  status TEXT DEFAULT 'pendente'
)
`).run();

// =========================
// TABELA GASTOS (FALTAVA ISSO)
// =========================
db.prepare(`
CREATE TABLE IF NOT EXISTS gastos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT,
  valor REAL DEFAULT 0,
  data TEXT DEFAULT (DATE('now'))
)
`).run();
app.get("/teste", (req, res) => {
  res.json({ ok: true });
});

// =========================
// AGENDAR
// =========================
app.post("/agendar", (req, res) => {
  const { nome, data, horario, valor } = req.body;

  try {
    const existe = db.prepare(`
  SELECT id FROM agendamentos
  WHERE data = ? AND horario = ? AND status = 'pendente'
`).get(data, horario);

    if (existe) {
      return res.json({ erro: "Horário já ocupado!" });
    }

    db.prepare(`
      INSERT INTO agendamentos (nome, data, horario, valor)
      VALUES (?, ?, ?, ?)
    `).run(nome, data, horario, Number(valor) || 0);

    res.json({ sucesso: true });

  } catch (err) {
    console.log(err);
    res.json({ erro: "Erro ao agendar" });
  }
});

// =========================
// LISTAR TODOS
// =========================
app.get("/agendamentos", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM agendamentos ORDER BY id DESC
    `).all();

    res.json(rows);
  } catch {
    res.json([]);
  }
});

// =========================
// HORÁRIOS OCUPADOS
// =========================
 app.get("/agendamentos/data/:data", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT TRIM(horario) AS horario
      FROM agendamentos
      WHERE data = ?
      AND status = 'pendente'
    `).all(req.params.data);

    res.json(rows);
  } catch {
    res.json([]);
  }
});

// =========================
// CONCLUIR
// =========================
app.put("/agendamentos/concluir/:id", (req, res) => {
  try {
    db.prepare(`
      UPDATE agendamentos
      SET status = 'concluido'
      WHERE id = ?
    `).run(req.params.id);

    res.json({ sucesso: true });

  } catch (err) {
    console.log(err);
    res.json({ erro: "Erro ao concluir" });
  }
});

// =========================
// APAGAR CONCLUÍDOS (⚠️ TEM QUE VIR ANTES DO /:id)
// =========================
app.delete("/agendamentos/concluidos", (req, res) => {
  try {
    db.prepare(`
      DELETE FROM agendamentos
      WHERE status = 'concluido'
    `).run();

    res.json({ sucesso: true });

  } catch (err) {
    console.log(err);
    res.json({ erro: "Erro ao apagar concluídos" });
  }
});
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // login simples (você pode melhorar depois)
  if (username === "admin" && password === "123") {
    return res.json({
      token: "token_fake_123"
    });
  }

  return res.json({ erro: "Usuário ou senha inválidos" });
});

// =========================
// CANCELAR / ID (DEIXA POR ÚLTIMO)
// =========================
app.delete("/agendamentos/:id", (req, res) => {
  try {
    db.prepare(`
      UPDATE agendamentos
      SET status = 'cancelado'
      WHERE id = ?
    `).run(req.params.id);

    res.json({ sucesso: true });

  } catch {
    res.json({ erro: "Erro ao cancelar" });
  }
});

// =========================
// LUCRO REAL (CORRIGIDO)
// =========================
app.get("/lucro-real", (req, res) => {
  try {
    const ganhos = db.prepare(`
      SELECT SUM(valor) as total FROM agendamentos WHERE status = 'concluido'
    `).get();

    const gastos = db.prepare(`
      SELECT SUM(valor) as total FROM gastos
    `).get();

    const totalGanhos = ganhos.total || 0;
    const totalGastos = gastos.total || 0;

    res.json({
      ganhos: totalGanhos,
      gastos: totalGastos,
      lucro: totalGanhos - totalGastos
    });

  } catch (err) {
    console.log(err);
    res.json({ ganhos: 0, gastos: 0, lucro: 0 });
  }
});
app.post("/gastos", (req, res) => {
  const { descricao, valor } = req.body;

  try {
    if (!descricao || !valor) {
      return res.json({ erro: "Dados inválidos" });
    }

    db.prepare(`
      INSERT INTO gastos (descricao, valor)
      VALUES (?, ?)
    `).run(descricao, Number(valor));

    res.json({ sucesso: true });

  } catch (err) {
    console.log(err);
    res.json({ erro: "Erro ao salvar gasto" });
  }
});
app.get("/gastos", (req, res) => {
  try {
    const gastos = db.prepare(`
      SELECT * FROM gastos ORDER BY id DESC
    `).all();

    res.json(gastos);

  } catch (err) {
    console.log(err);
    res.json([]);
  }
});
app.delete("/gastos/:id", (req, res) => {
  try {
    db.prepare(`
      DELETE FROM gastos WHERE id = ?
    `).run(req.params.id);

    res.json({ sucesso: true });

  } catch (err) {
    console.log(err);
    res.json({ erro: "Erro ao deletar" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta", PORT);
});