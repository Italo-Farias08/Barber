const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

const SECRET = "barber_secret_key_123";

app.use(express.json());
app.use(cors({ origin: "*" }));

const db = new Database("banco.db");

// =========================
// 🔥 TABELAS
// =========================

// Agendamentos
db.prepare(`
CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  data TEXT NOT NULL,
  horario TEXT NOT NULL
)
`).run();

// Admins
db.prepare(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)
`).run();

// Índice único
db.prepare(`
CREATE UNIQUE INDEX IF NOT EXISTS idx_agenda_unico
ON agendamentos (data, horario)
`).run();

// =========================
// 🔥 VALIDAÇÕES
// =========================

function validarNome(nome) {
  if (!nome) return false;
  if (nome.length < 2 || nome.length > 50) return false;
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome)) return false;
  return true;
}

function validarData(data) {
  return /^\d{4}-\d{2}-\d{2}$/.test(data);
}

function validarHorario(horario) {
  return /^\d{2}:\d{2}$/.test(horario);
}

// =========================
// 🔥 AGENDAR
// =========================

app.post("/agendar", (req, res) => {
  let { nome, data, horario } = req.body;

  if (!validarNome(nome)) return res.json({ erro: "Nome inválido" });
  if (!validarData(data)) return res.json({ erro: "Data inválida" });
  if (!validarHorario(horario)) return res.json({ erro: "Horário inválido" });

  nome = nome.trim();
  data = data.trim();
  horario = horario.trim();

  try {
    const stmt = db.prepare(
      "INSERT INTO agendamentos (nome, data, horario) VALUES (?, ?, ?)"
    );
    const info = stmt.run(nome, data, horario);

    res.json({ sucesso: true, id: info.lastInsertRowid });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.json({ erro: "Horário já está ocupado!" });
    }
    return res.json({ erro: "Erro ao salvar agendamento" });
  }
});

// =========================
// 🔥 LISTAR TODOS
// =========================

app.get("/agendamentos", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM agendamentos").all();
    res.json(rows);
  } catch {
    res.json([]);
  }
});

// =========================
// 🔥 POR DATA
// =========================

app.get("/agendamentos/:data", (req, res) => {
  const data = req.params.data;

  if (!validarData(data)) return res.json([]);

  try {
    const rows = db
      .prepare("SELECT horario FROM agendamentos WHERE data = ?")
      .all(data);

    res.json(rows);
  } catch {
    res.json([]);
  }
});

// =========================
// 🔥 DELETAR
// =========================

app.delete("/agendamentos/:id", (req, res) => {
  const id = req.params.id;

  if (!id || isNaN(id)) {
    return res.json({ erro: "ID inválido" });
  }

  try {
    db.prepare("DELETE FROM agendamentos WHERE id = ?").run(id);
    res.json({ sucesso: true });
  } catch {
    res.json({ erro: "Erro ao deletar" });
  }
});

// =========================
// 🔐 LOGIN ADMIN
// =========================

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  try {
    const user = db
      .prepare("SELECT * FROM admins WHERE username = ?")
      .get(username);

    if (!user) {
      return res.json({ erro: "Usuário não existe" });
    }

    bcrypt.compare(password, user.password, (err, senhaOk) => {
      if (err || !senhaOk) {
        return res.json({ erro: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET,
        { expiresIn: "2h" }
      );

      res.json({ token });
    });
  } catch {
    res.json({ erro: "Erro no servidor" });
  }
});

// =========================
// 🔒 MIDDLEWARE
// =========================

function autenticar(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ erro: "Sem token" });
  }

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido" });
  }
}

app.get("/admin", autenticar, (req, res) => {
  res.json({ ok: true, msg: "Área admin liberada" });
});

// =========================
// 🚀 START
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});