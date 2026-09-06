const listaComunicados = document.getElementById("listaComunicados");

const comunicados = [
  {
    titulo: "Reunião dos pais",
    mensagem: "A Reunião dos pais será realizado no dia 67 pelo professor Gerivaldo",
    data: "02/09/2026",
    professor: "Diretor sem nome"
  },
  {
    titulo: "Vandalismo",
    mensagem: "Será realizado uma palestra com os estudantes em relação a subir na tampa do vaso",
    data: "03/09/2026",
    professor: "carinha da manutenção"
  }
]

comunicados.sort(function(a,b){
  const dataA = new Date(a.data.split("/").reverse().join("-"));
  const dataB = new Date(b.data.split("/").reverse().join("-"));
  return dataB - dataA;
})

function mostrarComunicados(lista) {
  listaComunicados.innerHTML = "";
  lista.forEach(function(comunicado) {
    const comunicadoElemento = document.createElement("div");
    listaComunicados.appendChild(comunicadoElemento);

    const titulo = document.createElement("h2");
    titulo.textContent = comunicado.titulo;
    comunicadoElemento.append(titulo);

    const mensagem = document.createElement("h3");
    mensagem.textContent = comunicado.mensagem;
    comunicadoElemento.append(mensagem)

    const data = document.createElement("p")
    data.textContent = comunicado.data
    comunicadoElemento.append(data)

    const professor = document.createElement("p")
    professor.textContent = comunicado.professor;
    comunicadoElemento.append(professor);
  })
}

mostrarComunicados(comunicados);