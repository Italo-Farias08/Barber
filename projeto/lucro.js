const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:3000"
    : "https://barber-7p3h.onrender.com";

// elementos
const ganhosEl = document.getElementById("ganhos");
const gastosEl = document.getElementById("gastos");
const lucroEl = document.getElementById("lucro");
const listaEl = document.getElementById("lista");
const semanaEl = document.getElementById("semana");
const mesEl = document.getElementById("mes");

// =========================
// CARREGAR LUCRO
// =========================
async function carregarLucro() {
  try {
    const res = await fetch(`${API}/lucro-real`);
    const data = await res.json();

    ganhosEl.innerText = `R$ ${Number(data.ganhos).toFixed(2)}`;
    gastosEl.innerText = `R$ ${Number(data.gastos).toFixed(2)}`;
    lucroEl.innerText = `R$ ${Number(data.lucro).toFixed(2)}`;

  } catch (err) {
    console.error("Erro lucro:", err);
  }
}

// =========================
// SEMANA
// =========================
async function carregarSemana() {
  try {
    const res = await fetch(`${API}/lucro-semana`);
    const data = await res.json();

    semanaEl.innerText = `R$ ${Number(data.lucro).toFixed(2)}`;
  } catch {}
}

// =========================
// MÊS
// =========================
async function carregarMes() {
  try {
    const res = await fetch(`${API}/lucro-mes`);
    const data = await res.json();

    mesEl.innerText = `R$ ${Number(data.lucro).toFixed(2)}`;
  } catch {}
}

// =========================
// ADICIONAR GASTO
// =========================
function addGasto() {
  const desc = document.getElementById("desc").value;
  const valor = document.getElementById("valor").value;

  if (!desc || !valor) {
    alert("Preencha tudo");
    return;
  }

  fetch(`${API}/gastos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      descricao: desc,
      valor: valor
    })
  })
    .then(() => {
      document.getElementById("desc").value = "";
      document.getElementById("valor").value = "";

      atualizarTudo();
    })
    .catch(err => console.error(err));
}

// =========================
// LISTAR GASTOS
// =========================
async function carregarGastos() {
  try {
    const res = await fetch(`${API}/gastos`);
    const dados = await res.json();

    listaEl.innerHTML = "";

    if (dados.length === 0) {
      listaEl.innerHTML = "<p>Nenhum gasto</p>";
      return;
    }

    dados.forEach(g => {
      const div = document.createElement("div");
      div.classList.add("item", "fade");

      div.innerHTML = `
        <div>
          ${g.descricao} <br>
          <span>R$ ${Number(g.valor).toFixed(2)}</span>
        </div>

        <button onclick="deletarGasto(${g.id})" style="background:red;color:#fff;">X</button>
      `;

      listaEl.appendChild(div);
    });

  } catch (err) {
    console.error("Erro gastos:", err);
  }
}

// =========================
// DELETAR GASTO
// =========================
function deletarGasto(id) {
  fetch(`${API}/gastos/${id}`, {
    method: "DELETE"
  })
    .then(() => {
      atualizarTudo();
    })
    .catch(err => console.error(err));
}

// =========================
// ATUALIZA TUDO
// =========================
function atualizarTudo() {
  carregarLucro();
  carregarGastos();
  carregarSemana();
  carregarMes();
}

// init
atualizarTudo();