const email = document.getElementById("email");
const password = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

loginButton.addEventListener("click", async function () {
  if (email.value === "" || password.value === "") {
    loginMessage.style.display = "block";
  }

  const resposta = await fetch("http://localhost:3000/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  });
  if (resposta.ok) {
    const dados = await resposta.json();
    console.log(dados.role);
    if (dados.role === "aluno") {
      window.location.href = "frontend\\alunos\\aluno.html";
    }
    if (dados.role === "professor") {
      window.location.href = "frontend\\professores\\professor.html";
    }
    loginMessage.textContent = "Login Realizado!";
  } else {
    loginMessage.textContent = "Usuário não encontrado!";
    loginMessage.style.display = "block";
  }
});
