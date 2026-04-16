const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

const SECRET = "barber_secret_key_123";

app.use(express.json());
app.use(cors({ origin: "*" }));

const db = new sqlite3.Database("./banco.db");

// =========================
// 🔥 TABELAS
// =========================

// Agendamentos
db.run(`
CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  data TEXT NOT NULL,
  horario TEXT NOT NULL
)
`);

// Admins
db.run(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)
`);

// Índice único (evita duplicar horário)
db.run(`
CREATE UNIQUE INDEX IF NOT EXISTS idx_agenda_unico
ON agendamentos (data, horario)
`);

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

  db.run(
    "INSERT INTO agendamentos (nome, data, horario) VALUES (?, ?, ?)",
    [nome, data, horario],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.json({ erro: "Horário já está ocupado!" });
        }
        return res.json({ erro: "Erro ao salvar agendamento" });
      }

      res.json({ sucesso: true, id: this.lastID });
    }
  );
});

// =========================
// 🔥 LISTAR TODOS
// =========================

app.get("/agendamentos", (req, res) => {
  db.all("SELECT * FROM agendamentos", [], (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

// =========================
// 🔥 POR DATA
// =========================

app.get("/agendamentos/:data", (req, res) => {
  const data = req.params.data;

  if (!validarData(data)) return res.json([]);

  db.all(
    "SELECT horario FROM agendamentos WHERE data = ?",
    [data],
    (err, rows) => {
      if (err) return res.json([]);
      res.json(rows);
    }
  );
});

// =========================
// 🔥 DELETAR
// =========================

app.delete("/agendamentos/:id", (req, res) => {
  const id = req.params.id;

  if (!id || isNaN(id)) {
    return res.json({ erro: "ID inválido" });
  }

  db.run(
    "DELETE FROM agendamentos WHERE id = ?",
    [id],
    function (err) {
      if (err) return res.json({ erro: "Erro ao deletar" });

      res.json({ sucesso: true });
    }
  );
});

// =========================
// 🔐 LOGIN ADMIN
// =========================

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM admins WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) return res.json({ erro: "Erro no servidor" });

      if (!user) {
        return res.json({ erro: "Usuário não existe" });
      }

      const senhaOk = await bcrypt.compare(password, user.password);

      if (!senhaOk) {
        return res.json({ erro: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET,
        { expiresIn: "2h" }
      );

      res.json({ token });
    }
  );
});

// =========================
// 🔒 MIDDLEWARE (opcional)
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

// (se quiser proteger)
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