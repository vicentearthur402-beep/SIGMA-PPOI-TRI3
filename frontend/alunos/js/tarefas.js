
const API = "http://127.0.0.1:3000";

const listaTarefas = document.getElementById("listaTarefas");
const filtroMateria = document.getElementById("filtroMateria");

let tarefas = [];

async function carregarTarefas() {
  listaTarefas.textContent = "Carregando tarefas...";

  try {
    const resposta = await fetch(`${API}/minhas-tarefas`, {
      method: "GET",
      credentials: "include"
    });

    if (resposta.status === 401) {
      listaTarefas.textContent =
        "Sua sessão expirou. Entre novamente no SIGMA.";
      return;
    }

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    tarefas = await resposta.json();

    carregarMaterias();
    mostrarTarefasFiltradas();
  } catch (erro) {
    console.error("Erro ao carregar tarefas:", erro);
    listaTarefas.textContent =
      "Não foi possível carregar as tarefas. Verifique se o servidor está funcionando.";
  }
}

function carregarMaterias() {
  filtroMateria.innerHTML = "";

  const todas = document.createElement("option");
  todas.value = "todas";
  todas.textContent = "Todas";
  filtroMateria.appendChild(todas);

  const materias = [...new Set(tarefas.map(tarefa => tarefa.materia))];

  materias.sort((a, b) => a.localeCompare(b, "pt-BR"));

  materias.forEach(materia => {
    const opcao = document.createElement("option");
    opcao.value = materia;
    opcao.textContent = materia;
    filtroMateria.appendChild(opcao);
  });
}

function formatarData(data) {
  if (!data) return "Não informada";

  const partes = data.split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function mostrarTarefasFiltradas() {
  const materiaSelecionada = filtroMateria.value;

  const filtradas = materiaSelecionada === "todas"
    ? tarefas
    : tarefas.filter(
        tarefa => tarefa.materia === materiaSelecionada
      );

  mostrarTarefas(filtradas);
}

function mostrarTarefas(lista) {
  listaTarefas.innerHTML = "";

  if (lista.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.textContent = tarefas.length === 0
      ? "Nenhuma tarefa publicada ainda."
      : "Nenhuma tarefa encontrada para esta matéria.";

    listaTarefas.appendChild(mensagem);
    return;
  }

  lista.forEach(tarefa => {
    const elemento = document.createElement("article");

    const materia = document.createElement("h2");
    materia.textContent = tarefa.materia;
    elemento.appendChild(materia);

    const titulo = document.createElement("h3");
    titulo.textContent = tarefa.titulo;
    elemento.appendChild(titulo);

    const descricao = document.createElement("p");
    descricao.textContent = tarefa.descricao;
    elemento.appendChild(descricao);

    const professor = document.createElement("p");
    professor.textContent = `Professor: ${tarefa.professor}`;
    elemento.appendChild(professor);

    const entrega = document.createElement("p");
    entrega.textContent =
      `Entrega: ${formatarData(tarefa.dataEntrega)} às ${tarefa.horaEntrega}`;
    elemento.appendChild(entrega);

    const arquivo = document.createElement("input");
    arquivo.type = "file";
    arquivo.setAttribute("aria-label", `Arquivo para ${tarefa.titulo}`);
    elemento.appendChild(arquivo);

    const botaoEnviar = document.createElement("button");
    botaoEnviar.type = "button";
    botaoEnviar.textContent = "Enviar tarefa";

    botaoEnviar.addEventListener("click", () => {
      if (arquivo.files.length === 0) {
        alert("Selecione um arquivo primeiro.");
        return;
      }

      alert(
        "A tarefa já aparece no SIGMA! O envio real do arquivo ainda precisa ser conectado ao servidor."
      );
    });

    elemento.appendChild(botaoEnviar);
    listaTarefas.appendChild(elemento);
  });
}

filtroMateria.addEventListener("change", mostrarTarefasFiltradas);

carregarTarefas();
