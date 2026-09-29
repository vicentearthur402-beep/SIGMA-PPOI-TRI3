const materia = document.getElementById("materia");
const titulo = document.getElementById("titulo");
const descricao = document.getElementById("descricao");
const dataEntrega = document.getElementById("dataEntrega");
const horaEntrega = document.getElementById("horaEntrega");
const publicarTarefa = document.getElementById("publicarTarefa");
const listaTarefas = document.getElementById("listaTarefas");

const tarefas = [];

let tarefaEditando = null;

publicarTarefa.addEventListener("click", function () {
  if (
    materia.value === "" ||
    titulo.value === "" ||
    descricao.value === "" ||
    dataEntrega.value === "" ||
    horaEntrega.value === ""
  ) {
    alert("Preencha todos os campos");
    return;
  }

  if (tarefaEditando !== null) {
    tarefaEditando.materia = materia.value;
    tarefaEditando.titulo = titulo.value;
    tarefaEditando.descricao = descricao.value;
    tarefaEditando.dataEntrega = dataEntrega.value;
    tarefaEditando.horaEntrega = horaEntrega.value;
    tarefaEditando = null;
    mostrarTarefas();
    return;
  }

  const novaTarefa = {
    materia: materia.value,
    titulo: titulo.value,
    descricao: descricao.value,
    dataEntrega: dataEntrega.value,
    horaEntrega: horaEntrega.value,
  };
  tarefas.push(novaTarefa);
  mostrarTarefas();
});

function mostrarTarefas() {
  listaTarefas.textContent = "";
  tarefas.sort(function (a, b) {
    const prazoA = new Date(a.dataEntrega + " " + a.horaEntrega);
    const prazoB = new Date(b.dataEntrega + " " + b.horaEntrega);
    return prazoA - prazoB;
  });

  tarefas.forEach(function (tarefa) {
    const elementoTarefa = document.createElement("div");
    const tituloTarefa = document.createElement("h4");
    tituloTarefa.textContent = tarefa.titulo;
    const materiaTarefa = document.createElement("p");
    materiaTarefa.textContent = "Materia: " + tarefa.materia;
    const descricaoTarefa = document.createElement("p");
    descricaoTarefa.textContent = tarefa.descricao;
    const partesData = tarefa.dataEntrega.split("-");
    const dataFormatada =
      partesData[2] + "/" + partesData[1] + "/" + partesData[0];
    const prazoTarefa = document.createElement("p");
    prazoTarefa.textContent =
      "Prazo: " + dataFormatada + " às " + tarefa.horaEntrega;

    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.addEventListener("click", function () {
      tarefaEditando = tarefa;
      materia.value = tarefa.materia;
      titulo.value = tarefa.titulo;
      descricao.value = tarefa.descricao;
      dataEntrega.value = tarefa.dataEntrega;
      horaEntrega.value = tarefa.horaEntrega;
    });

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";

    botaoExcluir.addEventListener("click", function () {
      if (!confirm("Tem certeza que deseja excluir esta tarefa?")) {
        return;
      }
      const index = tarefas.indexOf(tarefa);
      if (index > -1) {
        tarefas.splice(index, 1);
        mostrarTarefas();
      }
    });

    elementoTarefa.appendChild(botaoExcluir);
    elementoTarefa.appendChild(botaoEditar);

    elementoTarefa.appendChild(tituloTarefa);
    elementoTarefa.appendChild(materiaTarefa);
    elementoTarefa.appendChild(descricaoTarefa);
    elementoTarefa.appendChild(prazoTarefa);

    listaTarefas.appendChild(elementoTarefa);
  });
}
