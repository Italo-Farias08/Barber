const lista = document.getElementById("lista");

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:3000"
    : "https://barber-7p3h.onrender.com";

function carregarAgendamentos() {
  fetch(`${API}/agendamentos`)
    .then(res => res.json())
    .then(dados => {

      lista.innerHTML = "";

      const pendentes = dados.filter(a => (a.status || "pendente") === "pendente");

      if (pendentes.length === 0) {
        lista.innerHTML = "<p style='color:#c59d5f'>Nenhum agendamento 😢</p>";
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

        // CANCELAR
        const btnCancelar = document.createElement("button");
        btnCancelar.innerText = "❌ Cancelar";

        btnCancelar.onclick = () => {
          fetch(`${API}/agendamentos/${item.id}`, {
            method: "DELETE"
          }).then(() => carregarAgendamentos());
        };

        // CONCLUIR
        const btnConcluir = document.createElement("button");
        btnConcluir.innerText = "✔ Concluir";

        btnConcluir.onclick = async () => {
          await fetch(`${API}/agendamentos/concluir/${item.id}`, {
            method: "PUT"
          });

          carregarAgendamentos();
        };

        div.appendChild(info);
        div.appendChild(btnConcluir);
        div.appendChild(btnCancelar);

        lista.appendChild(div);
      });
    });
}

carregarAgendamentos();