
console.log("TAREFAS.JS FOI CARREGADO!");

const materia = document.getElementById("materia");
const titulo = document.getElementById("titulo");
const descricao = document.getElementById("descricao");
const dataEntrega = document.getElementById("dataEntrega");
const horaEntrega = document.getElementById("horaEntrega");
const publicarTarefa = document.getElementById("publicarTarefa");
const listaTarefas = document.getElementById("listaTarefas");

const API = "http://127.0.0.1:3000";
const tarefas = [];

let tarefaEditando = null;

// CARREGAR MATÉRIAS
async function carregarMaterias() {
  try {
    const resposta = await fetch(`${API}/materias`, {
      credentials: "include",
    });

    if (!resposta.ok) throw new Error(await resposta.text());

    const materias = await resposta.json();

    materia.textContent = "";

    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione a matéria";
    materia.appendChild(opcaoInicial);

    materias.forEach(function (item) {
      const opcao = document.createElement("option");
      opcao.value = item.id;
      opcao.textContent = item.name;
      materia.appendChild(opcao);
    });
  } catch (erro) {
    console.error("Erro ao carregar matérias:", erro);
    materia.innerHTML =
      '<option value="">Erro ao carregar matérias</option>';
  }
}

// CARREGAR TAREFAS
async function carregarTarefas() {
  try {
    const resposta = await fetch(`${API}/tarefas`, {
      credentials: "include",
    });

    if (!resposta.ok) throw new Error(await resposta.text());

    const dados = await resposta.json();

    tarefas.length = 0;
    tarefas.push(...dados);

    mostrarTarefas();
  } catch (erro) {
    console.error("Erro ao carregar tarefas:", erro);
    listaTarefas.textContent =
      "Não foi possível carregar as tarefas.";
  }
}

// PUBLICAR OU EDITAR TAREFA
publicarTarefa.addEventListener("click", async function () {
  if (
    materia.value === "" ||
    titulo.value.trim() === "" ||
    descricao.value.trim() === "" ||
    dataEntrega.value === "" ||
    horaEntrega.value === ""
  ) {
    alert("Preencha todos os campos.");
    return;
  }

  const dados = {
    subjectId: Number(materia.value),
    title: titulo.value.trim(),
    description: descricao.value.trim(),
    dueDate: dataEntrega.value,
    dueTime: horaEntrega.value,
  };

  const editando = tarefaEditando !== null;

  const url = editando
    ? `${API}/tarefas/${tarefaEditando}`
    : `${API}/tarefas`;

  try {
    publicarTarefa.disabled = true;

    const resposta = await fetch(url, {
      method: editando ? "PUT" : "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) throw new Error(await resposta.text());

    const resultado = await resposta.json();

    alert(resultado.mensagem);
    cancelarEdicao();
    await carregarTarefas();
  } catch (erro) {
    console.error("Erro ao salvar tarefa:", erro);
    alert("Não foi possível salvar a tarefa: " + erro.message);
  } finally {
    publicarTarefa.disabled = false;
  }
});

// LIMPAR FORMULÁRIO
function cancelarEdicao() {
  tarefaEditando = null;
  materia.value = "";
  titulo.value = "";
  descricao.value = "";
  dataEntrega.value = "";
  horaEntrega.value = "";
  publicarTarefa.textContent = "Publicar Tarefa";
}

// CONSULTAR ENTREGAS DE UMA TAREFA
async function verEntregas(tarefa, areaEntregas, botao) {
  if (areaEntregas.dataset.carregadas === "true") {
    areaEntregas.hidden = !areaEntregas.hidden;
    return;
  }

  botao.disabled = true;
  botao.textContent = "Carregando...";

  try {
    const resposta = await fetch(
      `${API}/tarefas/${tarefa.id}/envios`,
      { credentials: "include" }
    );

    if (!resposta.ok) throw new Error(await resposta.text());

    const envios = await resposta.json();

    areaEntregas.textContent = "";

    const subtitulo = document.createElement("h5");
    subtitulo.textContent = `Entregas recebidas: ${envios.length}`;
    areaEntregas.appendChild(subtitulo);

    if (envios.length === 0) {
      const mensagem = document.createElement("p");
      mensagem.textContent = "Nenhum aluno entregou esta tarefa ainda.";
      areaEntregas.appendChild(mensagem);
    }

    envios.forEach(function (envio) {
      const item = document.createElement("div");

      const aluno = document.createElement("p");
      aluno.textContent = `Aluno: ${envio.aluno}`;

      const arquivo = document.createElement("p");
      arquivo.textContent = `Arquivo: ${envio.arquivo}`;

      const data = document.createElement("p");
      const dataEnvio = new Date(envio.enviadoEm);

      data.textContent = `Enviado em: ${
        Number.isNaN(dataEnvio.getTime())
          ? envio.enviadoEm
          : dataEnvio.toLocaleString("pt-BR")
      }`;

      const baixar = document.createElement("a");
      baixar.href = `${API}/envios/${envio.id}/arquivo`;
      baixar.textContent = "Baixar arquivo";
      baixar.setAttribute("download", "");

      item.appendChild(aluno);
      item.appendChild(arquivo);
      item.appendChild(data);
      item.appendChild(baixar);

      areaEntregas.appendChild(item);
    });

    areaEntregas.dataset.carregadas = "true";
    areaEntregas.hidden = false;
  } catch (erro) {
    console.error("Erro ao consultar entregas:", erro);
    alert("Não foi possível carregar as entregas: " + erro.message);
  } finally {
    botao.disabled = false;
    botao.textContent = areaEntregas.hidden
      ? "Ver entregas"
      : "Ocultar entregas";
  }
}

// MOSTRAR TAREFAS PUBLICADAS
function mostrarTarefas() {
  listaTarefas.textContent = "";

  tarefas.sort(function (a, b) {
    const prazoA = new Date(`${a.dataEntrega}T${a.horaEntrega}`);
    const prazoB = new Date(`${b.dataEntrega}T${b.horaEntrega}`);
    return prazoA - prazoB;
  });

  if (tarefas.length === 0) {
    listaTarefas.textContent = "Nenhuma tarefa publicada.";
    return;
  }

  tarefas.forEach(function (tarefa) {
    const elementoTarefa = document.createElement("div");

    const tituloTarefa = document.createElement("h4");
    tituloTarefa.textContent = tarefa.titulo;

    const materiaTarefa = document.createElement("p");
    materiaTarefa.textContent = "Matéria: " + tarefa.materia;

    const descricaoTarefa = document.createElement("p");
    descricaoTarefa.textContent = tarefa.descricao;

    const partesData = tarefa.dataEntrega.split("-");
    const dataFormatada =
      `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

    const prazoTarefa = document.createElement("p");
    prazoTarefa.textContent =
      `Prazo: ${dataFormatada} às ${tarefa.horaEntrega}`;

    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";

    botaoEditar.addEventListener("click", function () {
      tarefaEditando = tarefa.id;
      materia.value = String(tarefa.subjectId);
      titulo.value = tarefa.titulo;
      descricao.value = tarefa.descricao;
      dataEntrega.value = tarefa.dataEntrega;
      horaEntrega.value = tarefa.horaEntrega;
      publicarTarefa.textContent = "Salvar alterações";

      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";

    botaoExcluir.addEventListener("click", async function () {
      if (!confirm("Tem certeza que deseja excluir esta tarefa?")) {
        return;
      }

      try {
        const resposta = await fetch(
          `${API}/tarefas/${tarefa.id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!resposta.ok) throw new Error(await resposta.text());

        const resultado = await resposta.json();
        alert(resultado.mensagem);

        if (tarefaEditando === tarefa.id) cancelarEdicao();

        await carregarTarefas();
      } catch (erro) {
        console.error("Erro ao excluir tarefa:", erro);
        alert("Não foi possível excluir a tarefa: " + erro.message);
      }
    });

    // NOVO: BOTÃO DE ENTREGAS
    const botaoEntregas = document.createElement("button");
    botaoEntregas.textContent = "Ver entregas";

    const areaEntregas = document.createElement("div");
    areaEntregas.hidden = true;

    botaoEntregas.addEventListener("click", function () {
      verEntregas(tarefa, areaEntregas, botaoEntregas);
    });

    elementoTarefa.appendChild(tituloTarefa);
    elementoTarefa.appendChild(materiaTarefa);
    elementoTarefa.appendChild(descricaoTarefa);
    elementoTarefa.appendChild(prazoTarefa);
    elementoTarefa.appendChild(botaoEditar);
    elementoTarefa.appendChild(botaoExcluir);
    elementoTarefa.appendChild(botaoEntregas);
    elementoTarefa.appendChild(areaEntregas);

    listaTarefas.appendChild(elementoTarefa);
  });
}

// INICIALIZAÇÃO
carregarMaterias();
carregarTarefas();
