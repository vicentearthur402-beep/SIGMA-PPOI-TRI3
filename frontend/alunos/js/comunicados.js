
const listaComunicados = document.getElementById("listaComunicados");

async function buscarComunicados() {
  listaComunicados.innerHTML = "<p>Carregando comunicados...</p>";

  try {
    const resposta = await fetch(
      "http://127.0.0.1:3000/aluno/comunicados",
      {
        method: "GET",
        credentials: "include"
      }
    );

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os comunicados.");
    }

    const comunicados = await resposta.json();

    mostrarComunicados(comunicados);
  } catch (erro) {
    console.error(erro);
    listaComunicados.textContent =
      "Erro ao carregar os comunicados. Tente novamente.";
  }
}

function mostrarComunicados(comunicados) {
  listaComunicados.innerHTML = "";

  if (comunicados.length === 0) {
    listaComunicados.textContent =
      "Nenhum comunicado publicado ainda.";
    return;
  }

  comunicados.forEach(function(comunicado) {
    const elemento = document.createElement("div");

    const titulo = document.createElement("h2");
    titulo.textContent = comunicado.title;

    const mensagem = document.createElement("p");
    mensagem.textContent = comunicado.content;

    const data = document.createElement("p");
    data.textContent = new Date(
      comunicado.published_at
    ).toLocaleString("pt-BR");

    const professor = document.createElement("p");
    professor.textContent =
      "Publicado por: " + (comunicado.professor || "Professor");

    elemento.append(titulo, mensagem, data, professor);
    listaComunicados.appendChild(elemento);
  });
}

buscarComunicados();
