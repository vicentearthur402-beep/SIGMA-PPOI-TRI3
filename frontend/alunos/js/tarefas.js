
const listaTarefas = document.getElementById("listaTarefas");

const tarefas = [
 {
  materia: "Matemática",
  titulo: "Lista de Exercícios - Matriz",
  descricao: "Resolver os exercícios da página 20 - 25.",
  dataEntrega: "10/09/2026",
  dataLimite: "2026-09-10",
  entregue: false
},
 {
  materia: "Matemática",
  titulo: "Lista de Exercícios - Matriz",
  descricao: "Resolver os exercícios da página 26 - 3667.",
  dataEntrega: "10/09/2026",
  dataLimite: "2026-09-10",
  entregue: false
},
{
  materia: "Língua Inglesa",
  titulo: "Assignment TO BE",
  descricao: "Resolver os exercícios da página 6 - 7.",
  dataEntrega: "19/09/2026",
  dataLimite: "2026-09-19",
  entregue: false
},
{
  materia: "Ed Fisica",
  titulo: "Prova Criquete na Neve",
  descricao: "Resolver Lista entregue na sala de aula",
  dataEntrega: "19/09/2026",
  dataLimite: "2026-09-19",
  entregue: false
}
]


const filtroMateria = document.getElementById("filtroMateria");
const materias = new Set();

tarefas.forEach(function(tarefa){
  materias.add(tarefa.materia)
});

materias.forEach(function(materia) {
    const opMateria = document.createElement("option");
    opMateria.textContent = materia;
    opMateria.value = materia;
    // console.log(opMateria.value)
    filtroMateria.appendChild(opMateria);
});

filtroMateria.addEventListener("change", function() {
  const materiaSelecionada = filtroMateria.value;
  console.log(materiaSelecionada)
  if (materiaSelecionada === "todas") {
    mostrarTarefas(tarefas);
  }
  else {
  const tarefasFiltradas = tarefas.filter(function(tarefa) {
    return tarefa.materia === materiaSelecionada;
  });
  mostrarTarefas(tarefasFiltradas);
}
})

// console.log(tarefas)

function mostrarTarefas(lista) {
  listaTarefas.innerHTML = "";
  lista.forEach(function(tarefa) {
    const tarefaElemento = document.createElement("div");

listaTarefas.appendChild(tarefaElemento)

const materia = document.createElement("h2")
materia.textContent = tarefa.materia;
tarefaElemento.append(materia)

const titulo = document.createElement("h3");
titulo.textContent = tarefa.titulo;
tarefaElemento.append(titulo);

const descricao = document.createElement("p");
descricao.textContent = tarefa.descricao;
tarefaElemento.append(descricao);

const data = document.createElement("p");
data.textContent = `Entrega: ${tarefa.dataEntrega}`;
tarefaElemento.append(data)

const arquivo = document.createElement("input");
arquivo.type = "file";
tarefaElemento.append(arquivo);
const botaoEnviar = document.createElement("button");
botaoEnviar.textContent = "Enviar Tarefa";
tarefaElemento.append(botaoEnviar);

botaoEnviar.addEventListener("click", function() {
  if (tarefa.entregue === true) {
    alert("Essa tarefa já foi entregue.");
    return;
  }
  const hoje = new Date();
  const dataLimite = new Date(tarefa.dataLimite + "T23:59:59")
  if (hoje > dataLimite) {
    alert("Data já fechou já paizao, se perdeu")
    return;
  }
  if (arquivo.files.length === 0) {
    alert("Selecione um arquivo antes de enviar")
  }
  else {
    tarefa.entregue=true
    tarefa.arquivoEnviado = arquivo.files[0];
    const nomeArquivo = document.createElement("p");
    nomeArquivo.textContent = `Arquivo enviado: ${tarefa.arquivoEnviado.name}`
    tarefaElemento.append(nomeArquivo);
    tarefa.dataEnvio = new Date();
    const dataEnvioTexto = document.createElement("p")
    const dataFormatada = tarefa.dataEnvio.toLocaleDateString("pt-BR");
    const horaFormatada = tarefa.dataEnvio.toLocaleTimeString("pt-BR");
    dataEnvioTexto.textContent = `Enviado em: ${dataFormatada} às ${horaFormatada}`;
    tarefaElemento.append(dataEnvioTexto);
    botaoEnviar.disabled = true;
    const IsEntregue = document.createElement("p");
    IsEntregue.textContent = "Já entregue!"
    tarefaElemento.append(IsEntregue);
    console.log(tarefa)
  }
  
})

  });

}

mostrarTarefas(tarefas)