const materia = document.getElementById("materia")
const titulo = document.getElementById("titulo")
const descricao = document.getElementById("descricao")
const dataEntrega = document.getElementById("dataEntrega")
const horaEntrega = document.getElementById("horaEntrega")
const publicarTarefa = document.getElementById("publicarTarefa")
const listaTarefas = document.getElementById("listaTarefas")


const tarefas = [];

publicarTarefa.addEventListener("click", function() {
  if (
    materia.value === "" ||
    titulo.value === "" ||
    descricao.value === "" ||
    dataEntrega.value === "" ||
    horaEntrega.value === ""
  ) {
    alert("Preencha todos os campus")
    return;
  }
  const novaTarefa = {
    materia: materia.value,
    titulo: titulo.value,
    descricao: descricao.value,
    dataEntrega: dataEntrega.value,
    horaEntrega: horaEntrega.value
  }
  tarefas.push(novaTarefa);
  mostrarTarefas();
})

function mostrarTarefas() {
  listaTarefas.textContent = "";
  tarefas.forEach(function (tarefa ){
    const elementoTarefa = document.createElement("div");
    const tituloTarefa = document.createElement("h4");
    tituloTarefa.textContent = tarefa.titulo;
    const materiaTarefa = document.createElement("p")
    materiaTarefa.textContent = "Materia: " + tarefa.materia
    const descricaoTarefa = document.createElement("h5")
    descricaoTarefa.textContent = tarefa.descricao
    const dataEntregaTarefa = document.createElement("p")
    dataEntregaTarefa.textContent = tarefa.dataEntrega
    const horaEntregaTarefa = document.createElement("p")
    horaEntregaTarefa.textContent = tarefa.horaEntrega

    elementoTarefa.appendChild(tituloTarefa);
    elementoTarefa.appendChild(materiaTarefa);
    elementoTarefa.appendChild(descricaoTarefa);
    elementoTarefa.appendChild(dataEntregaTarefa);
    elementoTarefa.appendChild(horaEntregaTarefa);

    listaTarefas.appendChild(elementoTarefa)
  })
}