const lista = document.getElementById("lista");

const BASE_URL = "https://barber-7p3h.onrender.com";

function carregarAgendamentos() {
  fetch(`${BASE_URL}/agendamentos`)
    .then(res => res.json())
    .then(dados => {

      lista.innerHTML = "";

      if (!dados || dados.length === 0) {
        lista.innerHTML = "<p style='color:#c59d5f'>Nenhum agendamento 😢</p>";
        return;
      }

      dados.forEach(item => {

        if (!item.data || !item.horario) return;

        const div = document.createElement("div");
        div.classList.add("card");

        const info = document.createElement("div");
        info.classList.add("info");

        const data = item.data;
        const horario = item.horario.toString().substring(0,5);

        info.innerHTML = `
          <div>👤 <strong>${item.nome || "Sem nome"}</strong></div>
          <div>📅 ${data}</div>
          <div>⏰ ${horario}</div>
        `;

        const btn = document.createElement("button");
        btn.innerText = "❌ Cancelar";

        btn.onclick = () => {
          fetch(`${BASE_URL}/agendamentos/${item.id}`, {
            method: "DELETE"
          })
          .then(() => div.remove());
        };

        div.appendChild(info);
        div.appendChild(btn);

        lista.appendChild(div);
      });

    })
    .catch(err => {
      console.error(err);
      lista.innerHTML = "<p>Erro ao carregar ❌</p>";
    });
}

carregarAgendamentos();