const diasDiv = document.getElementById("dias");
const horariosDiv = document.getElementById("horarios");
const botao = document.querySelector(".btn-confirmar");
const modal = document.getElementById("modalNome");
const inputNome = document.getElementById("nomeCliente");
const confirmarNomeBtn = document.getElementById("confirmarNome");

// 🔥 API AUTOMÁTICA (LOCAL / ONLINE)
const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:3000"
    : "https://barber-7p3h.onrender.com";

let dataSelecionada = null;
let horarioSelecionado = null;

// 🔥 pega valor e garante número
const valorServico = Number(localStorage.getItem("valorServico")) || 0;

// horários
const horarios = [];
for (let i = 8; i <= 21; i++) {
  horarios.push(`${i.toString().padStart(2, "0")}:00`);
}

const nomesDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const hoje = new Date();

// 🔔 NOTIFICAÇÃO
function mostrarMensagem(texto, cor = "#c59d5f") {
  const msg = document.createElement("div");
  msg.innerText = texto;

  msg.style.position = "fixed";
  msg.style.bottom = "20px";
  msg.style.left = "50%";
  msg.style.transform = "translateX(-50%)";
  msg.style.background = cor;
  msg.style.color = "#000";
  msg.style.padding = "12px 20px";
  msg.style.borderRadius = "10px";
  msg.style.fontWeight = "bold";
  msg.style.zIndex = "9999";
  msg.style.opacity = "0";
  msg.style.transition = "0.5s";

  document.body.appendChild(msg);

  setTimeout(() => (msg.style.opacity = "1"), 10);
  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 500);
  }, 2500);
}

// DIAS
function gerarProximosDias(qtd = 10) {
  diasDiv.innerHTML = "";

  for (let i = 0; i < qtd; i++) {
    const data = new Date();
    data.setDate(hoje.getDate() + i);

    if (data.getDay() === 0) continue;

    const div = document.createElement("div");
    div.classList.add("dia");

    div.innerHTML = `
      <small>${nomesDias[data.getDay()]}</small>
      <strong>${data.getDate()}</strong>
    `;

    div.onclick = () => selecionarDia(div, data);
    diasDiv.appendChild(div);
  }
}

// DIA
function selecionarDia(elemento, data) {
  document.querySelectorAll(".dia").forEach(d => d.classList.remove("selecionado"));
  elemento.classList.add("selecionado");

  dataSelecionada = data;

  const dataFormatada = data.toISOString().split("T")[0];

  horariosDiv.innerHTML = "<h3>Carregando horários...</h3>";

  fetch(`${API}/agendamentos/data/${dataFormatada}`)
    .then(async res => {
      if (!res.ok) throw new Error("Erro API horários");
      return res.json();
    })
    .then(ocupados => {

      console.log("OCUPADOS:", ocupados);

      const horariosOcupados = Array.isArray(ocupados)
        ? ocupados.map(h => h.horario).filter(Boolean)
        : [];

      renderizarHorarios(horariosOcupados);
    })
    .catch(err => {
      console.error("Erro horários:", err);
      renderizarHorarios([]); // 🔥 garante que sempre aparece algo
    });
}

// HORÁRIOS
function renderizarHorarios(horariosOcupados) {
  horariosDiv.innerHTML = "<h3>Horários disponíveis:</h3>";

  const agora = new Date();

  horarios.forEach(h => {
    const btn = document.createElement("div");
    btn.classList.add("horario");
    btn.innerText = h;

    const [hora, minuto] = h.split(":");
    const dataHora = new Date(dataSelecionada);
    dataHora.setHours(hora, minuto, 0, 0);

    const jaPassou = dataHora < agora;
    const ocupado = horariosOcupados.includes(h);

    if (ocupado || jaPassou) {
      btn.innerText += " ❌";
      btn.style.opacity = "0.4";
      btn.style.pointerEvents = "none";
    } else {
      btn.onclick = () => selecionarHorario(btn);
    }

    horariosDiv.appendChild(btn);
  });
}

// HORÁRIO
function selecionarHorario(elemento) {
  document.querySelectorAll(".horario").forEach(h => h.classList.remove("selecionado"));
  elemento.classList.add("selecionado");

  horarioSelecionado = elemento.innerText.replace(" ❌", "").trim();
}

// BOTÃO
botao.addEventListener("click", () => {
  if (!dataSelecionada || !horarioSelecionado) {
    mostrarMensagem("⚠️ Selecione dia e horário!", "#ff4d4d");
    return;
  }

  modal.style.display = "flex";
});

// CONFIRMAR
confirmarNomeBtn.addEventListener("click", () => {
  const nome = inputNome.value.trim();

  if (!nome) {
    mostrarMensagem("Digite seu nome!", "#ff4d4d");
    return;
  }

  if (!valorServico) {
    mostrarMensagem("Selecione um serviço!", "#ff4d4d");
    return;
  }

const dataFormatada = `${dataSelecionada.getFullYear()}-${String(
  dataSelecionada.getMonth() + 1
).padStart(2, "0")}-${String(dataSelecionada.getDate()).padStart(2, "0")}`;
  const horarioFinal = horarioSelecionado;

  // 🔥 MONTA WHATSAPP ANTES (IMPORTANTE)
  const numero = "5581991204180";

  const mensagem = `🧾 *AGENDAMENTO CONFIRMADO*

👤 Nome: ${nome}
💰 Serviço: R$${valorServico}
📅 Data: ${dataFormatada}
⏰ Horário: ${horarioFinal}

💈 Novo agendamento recebido!`;

  const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensagem)}`;

  // 🔥 ABRE IMEDIATO (não bloqueia)
  window.open(url, "_blank");

  // 🔥 AGORA SALVA NO BACK
  fetch(`${API}/agendar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nome,
      data: dataFormatada,
      horario: horarioFinal,
      valor: valorServico
    })
  })
    .then(res => res.json())
    .then(res => {
      console.log("RESPOSTA:", res);

      modal.style.display = "none";

      if (res.erro) {
        mostrarMensagem(res.erro, "#ff4d4d");
        return;
      }

      mostrarMensagem("✅ Agendado com sucesso!");
    })
    .catch(err => {
      console.error("ERRO FETCH:", err);
      mostrarMensagem("Erro ao agendar!", "#ff4d4d");
    });
});

// iniciar
gerarProximosDias();