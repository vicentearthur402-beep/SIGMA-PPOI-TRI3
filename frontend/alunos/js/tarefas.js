
const API = "http://127.0.0.1:3000";

const listaTarefas = document.getElementById("listaTarefas");
const filtroMateria = document.getElementById("filtroMateria");

let tarefas = [];

// CARREGAR TAREFAS DO BACKEND
async function carregarTarefas() {
  try {
    const resposta = await fetch(`${API}/minhas-tarefas`, {
      credentials: "include",
    });

    if (!resposta.ok) {
      throw new Error(await resposta.text());
    }

    tarefas = await resposta.json();
    carregarFiltro();
    mostrarTarefas();
  } catch (erro) {
    console.error("Erro ao carregar tarefas:", erro);
    listaTarefas.textContent =
      "Não foi possível carregar as tarefas. Faça login novamente e tente outra vez.";
  }
}

// PREENCHER FILTRO DE MATÉRIAS
function carregarFiltro() {
  const valorAnterior = filtroMateria.value;

  filtroMateria.replaceChildren();

  const todas = document.createElement("option");
  todas.value = "todas";
  todas.textContent = "Todas as matérias";
  filtroMateria.appendChild(todas);

  const materias = [...new Set(tarefas.map(t => t.materia))];

  materias.forEach(nome => {
    const opcao = document.createElement("option");
    opcao.value = nome;
    opcao.textContent = nome;
    filtroMateria.appendChild(opcao);
  });

  if ([...filtroMateria.options].some(o => o.value === valorAnterior)) {
    filtroMateria.value = valorAnterior;
  }
}

filtroMateria.addEventListener("change", mostrarTarefas);

// MOSTRAR TAREFAS
function mostrarTarefas() {
  listaTarefas.replaceChildren();

  const filtradas = filtroMateria.value === "todas"
    ? tarefas
    : tarefas.filter(t => t.materia === filtroMateria.value);

  if (filtradas.length === 0) {
    listaTarefas.textContent = "Nenhuma tarefa encontrada.";
    return;
  }

  filtradas.forEach(tarefa => {
    const card = document.createElement("section");

    const titulo = document.createElement("h3");
    titulo.textContent = tarefa.titulo;

    const materia = document.createElement("p");
    materia.textContent = `Matéria: ${tarefa.materia}`;

    const descricao = document.createElement("p");
    descricao.textContent = tarefa.descricao;

    const prazo = document.createElement("p");
    prazo.textContent =
      `Prazo: ${tarefa.dataEntrega} às ${tarefa.horaEntrega}`;

    const rotuloArquivo = document.createElement("label");
    rotuloArquivo.textContent = "Escolha o arquivo do trabalho: ";

    const arquivo = document.createElement("input");
    arquivo.type = "file";
    arquivo.accept = ".pdf,.txt,.doc,.docx,.odt,.png,.jpg,.jpeg";
    arquivo.required = true;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = "Enviar trabalho";

    const mensagem = document.createElement("p");
    mensagem.setAttribute("role", "status");

    botao.addEventListener("click", async () => {
      const selecionado = arquivo.files[0];

      if (!selecionado) {
        mensagem.textContent = "Selecione um arquivo primeiro.";
        return;
      }

      if (selecionado.size === 0) {
        mensagem.textContent = "O arquivo está vazio.";
        return;
      }

      if (selecionado.size > 10 * 1024 * 1024) {
        mensagem.textContent = "O arquivo deve ter no máximo 10 MB.";
        return;
      }

      const formulario = new FormData();
      formulario.append("arquivo", selecionado);

      botao.disabled = true;
      mensagem.textContent = "Enviando arquivo...";

      try {
        const resposta = await fetch(
          `${API}/tarefas/${tarefa.id}/envios`,
          {
            method: "POST",
            credentials: "include",
            body: formulario,
          }
        );

        if (!resposta.ok) {
          throw new Error(await resposta.text());
        }

        const resultado = await resposta.json();
        mensagem.textContent =
          resultado.mensagem || "Trabalho enviado com sucesso!";

        arquivo.value = "";
      } catch (erro) {
        console.error("Erro ao enviar trabalho:", erro);
        mensagem.textContent = "Falha no envio: " + erro.message;
      } finally {
        botao.disabled = false;
      }
    });

    card.appendChild(titulo);
    card.appendChild(materia);
    card.appendChild(descricao);
    card.appendChild(prazo);
    card.appendChild(rotuloArquivo);
    card.appendChild(arquivo);
    card.appendChild(botao);
    card.appendChild(mensagem);

    listaTarefas.appendChild(card);
  });
}

carregarTarefas();
