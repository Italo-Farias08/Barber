const lista = document.getElementById("lista");
const horarios = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00"
];
function carregarAgendamentos() {
  fetch("https://barber-7p3h.onrender.com")
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

        // 🔥 se algum dia tiver status
        if (item.status === "ocupado") {
          div.classList.add("ocupado");
        }

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
          fetch(`http://localhost:3000/agendamentos/${item.id}`, {
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