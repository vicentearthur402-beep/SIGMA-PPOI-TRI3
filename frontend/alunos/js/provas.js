const listaComunicados = document.getElementById("listaProvas")
const filtroMateria = document.getElementById("filtroMateria")

const provas = [
  {
    materia: "Matemática",
    titulo: "Prova de Matrizes",
    conteudo: "Matrizes e determinantes",
    data: "15/09/2026",
    horario: "08:00"
  },
  {
    materia: "História",
    titulo: "Prova de História do Brasil",
    conteudo: "Período Colonial e Independência",
    data: "10/09/2026",
    horario: "10:00"
   },
   {
    materia: "Língua Inglesa",
    titulo: "English Test",
    conteudo: "Simple Past e Present Perfect",
    data: "20/09/2026",
    horario: "08:00"
   } 
]

provas.sort(function(a, b) {
  const dataA = new Date(a.data.split("/").reverse().join("-") + "T" +a.horario)
  const dataB = new Date(b.data.split("/").reverse().join("-") + "T" +b.horario)
  return dataA - dataB;
})

const materias = new Set();

provas.forEach(function(prova){
  materias.add(prova.materia);
});

materias.forEach(function(materia) {
  const opMateria = document.createElement("option");
    opMateria.textContent = materia;
    opMateria.value = materia;
    filtroMateria.appendChild(opMateria);
})

filtroMateria.addEventListener("change", function() {
    const materiaSelecionada = filtroMateria.value;
  if (materiaSelecionada === "todas") {
    mostrarProvas(provas);
  }
  else {
  const provasFiltradas = provas.filter(function(prova) {
    return prova.materia === materiaSelecionada;
  });
  mostrarProvas(provasFiltradas);
}
});

function mostrarProvas(lista) {
  listaComunicados.innerHTML = "";
  lista.forEach(function(prova) {
    const provaElemento = document.createElement("div");
    listaComunicados.appendChild(provaElemento);

    const materia = document.createElement("h2");
    materia.textContent = prova.materia;
    provaElemento.append(materia);

    const titulo = document.createElement("h3");
    titulo.textContent = prova.titulo;
    provaElemento.append(titulo)

    const conteudo = document.createElement("h4")
    conteudo.textContent = prova.conteudo
    provaElemento.append(conteudo)

    const data = document.createElement("p")
    data.textContent = prova.data
    provaElemento.append(data)

    const horario = document.createElement("p")
    horario.textContent = prova.horario;
    provaElemento.append(horario);

  })
}

mostrarProvas(provas)