const lista = document.getElementById("lista");

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:3000"
    : "https://barber-7p3h.onrender.com";

function carregarConcluidos() {
  fetch(`${API}/agendamentos`)
    .then(res => res.json())
    .then(dados => {

      lista.innerHTML = "";

      const concluidos = dados.filter(a => a.status === "concluido");

      if (concluidos.length === 0) {
        lista.innerHTML = "<div class='empty'>Nenhum agendamento concluído 😢</div>";
        return;
      }

      concluidos.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("card");

        div.innerHTML = `
          <strong>👤 ${item.nome}</strong>
          <div class="info">📅 ${item.data} • ⏰ ${item.horario}</div>
          <div class="info">💰 R$ ${item.valor || 0}</div>
          <div class="status">✔ CONCLUÍDO</div>
        `;

        lista.appendChild(div);
      });

    })
    .catch(err => {
      console.error("ERRO:", err);
      lista.innerHTML = "<div class='empty'>Erro ao carregar dados</div>";
    });
}

// 🔥 APAGAR TODOS (CORRIGIDO)
function apagarTudo() {
  if (!confirm("Tem certeza que quer apagar TODOS os concluídos?")) return;

  fetch(`${API}/agendamentos/concluidos`, {
    method: "DELETE"
  })
    .then(async (res) => {
      const data = await res.json();
      console.log("DELETE RESPONSE:", data);

      // 🔥 garante atualização real
      carregarConcluidos();
    })
    .catch(err => console.error("ERRO DELETE:", err));
}

// init
carregarConcluidos();