const lista = document.getElementById("lista");

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:3000"
    : "https://barber-7p3h.onrender.com";

async function carregarAgendamentos() {
  try {
    const res = await fetch(`${API}/agendamentos`);
    const dados = await res.json();

    lista.innerHTML = "";

    const pendentes = dados.filter(
      a => (a.status || "pendente") === "pendente"
    );

    if (pendentes.length === 0) {
      lista.innerHTML =
        "<p style='color:#c59d5f'>Nenhum agendamento 😢</p>";
      return;
    }

    pendentes.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("card");

      const info = document.createElement("div");
      info.classList.add("info");

      const horario = item.horario?.toString().substring(0, 5);

      info.innerHTML = `
        <div>👤 <strong>${item.nome}</strong></div>
        <div>📅 ${item.data}</div>
        <div>⏰ ${horario}</div>
        <div>💰 R$ ${item.valor || 0}</div>
        <div style="color:#ffc107">PENDENTE</div>
      `;

      // BOTÃO CONCLUIR
      const btnConcluir = document.createElement("button");
      btnConcluir.innerText = "✔ Concluir";

      btnConcluir.addEventListener("click", async () => {
        try {
          const res = await fetch(
            `${API}/agendamentos/concluir/${item.id}`,
            { method: "PUT" }
          );

          if (!res.ok) throw new Error("Erro ao concluir");

          carregarAgendamentos();
        } catch (err) {
          console.log(err);
          alert("Erro ao concluir agendamento");
        }
      });

      // BOTÃO CANCELAR
      const btnCancelar = document.createElement("button");
      btnCancelar.innerText = "❌ Cancelar";

      btnCancelar.addEventListener("click", async () => {
        try {
          const res = await fetch(
            `${API}/agendamentos/${item.id}`,
            { method: "DELETE" }
          );

          if (!res.ok) throw new Error("Erro ao cancelar");

          carregarAgendamentos();
        } catch (err) {
          console.log(err);
          alert("Erro ao cancelar agendamento");
        }
      });

      div.appendChild(info);
      div.appendChild(btnConcluir);
      div.appendChild(btnCancelar);

      lista.appendChild(div);
    });
  } catch (err) {
    console.log("Erro geral:", err);
    lista.innerHTML =
      "<p style='color:red'>Erro ao carregar agendamentos</p>";
  }
}

carregarAgendamentos();