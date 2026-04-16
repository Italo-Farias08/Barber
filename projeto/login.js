
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  msg.style.color = "#ff4d4d";
  msg.innerText = "";

  if (!username || !password) {
    msg.innerText = "Preencha todos os campos";
    return;
  }

  try {
   const res = await fetch("https://barber-7p3h.onrender.com/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ username, password })
});

    const data = await res.json();

    // ❌ ERRO DO LOGIN
    if (data.erro) {
      msg.innerText = data.erro;
      return;
    }

    // ❌ SEM TOKEN
    if (!data.token) {
      msg.innerText = "Erro inesperado";
      return;
    }

    // ✅ LOGIN OK
    localStorage.setItem("token", data.token);

    msg.style.color = "#ffcc00";
    msg.innerText = "Login aprovado...";

    setTimeout(() => {
      window.location.href = "painel.html"; // 👈 AQUI abre outra página
    }, 800);

  } catch (err) {
    msg.innerText = "Erro no servidor";
  }
}
