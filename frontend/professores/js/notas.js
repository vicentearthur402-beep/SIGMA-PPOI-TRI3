const materia = document.getElementById("materia")
const salvarNotas = document.getElementById("salvarNotas")

const alunos = [
  "Lucas Gabriel Conti"
]

const materias = {
  artes: "Artes",
  biologia: "Biologia",
  "educacao-fisica": "Educação Física"
}

const materiaSelecionada = materia.value


const tabela = document.querySelector("tbody")

alunos.forEach(function(aluno){

  function calcularMedia(){
  
    const valorNota1 = Number(inputNota1.value)
  const valorNota2 = Number(inputNota2.value);
  const valorRec1 = Number(inputRec1.value);
  const valorNota4 = Number(inputNota4.value);
  const valorNota5 = Number(inputNota5.value);
  const valorRec2 = Number(inputRec2.value);
  const valorNota6 = Number(inputNota6.value);
  const valorNota7 = Number(inputNota7.value);
  const valorRec3 = Number(inputRec3.value);

  const media1 = (valorNota1 + valorNota2) / 2
  const media1Final = Math.max(media1, valorRec1);
  const media2 = (valorNota4 + valorNota5) / 2
  const media2Final = Math.max(media2, valorRec2);
  const media3 = (valorNota6 + valorNota7) / 2
    const media3Final = Math.max(media3, valorRec3);

  const mediaFinalNormal = (media1Final + media2Final + media3Final) / 3
  mediaFinal.textContent = mediaFinalNormal.toFixed(1);


}

  const linha = document.createElement("tr");

  const nome = document.createElement("td");
  nome.textContent = aluno;
  linha.appendChild(nome);


  const nota1 = document.createElement("td")

  const inputNota1 = document.createElement("input");
  inputNota1.type = "number";
  inputNota1.min = "0"
  inputNota1.max = "10"

  nota1.appendChild(inputNota1);
  linha.appendChild(nota1);


  const nota2 = document.createElement("td")

  const inputNota2 = document.createElement("input");
  inputNota2.type = "number";
  inputNota2.min = "0"
  inputNota2.max = "10"

  nota2.appendChild(inputNota2);
  linha.appendChild(nota2);


  const rec1 = document.createElement("td")

  const inputRec1 = document.createElement("input");
  inputRec1.type = "number";
  inputRec1.min = "0"
  inputRec1.max = "10"

  rec1.appendChild(inputRec1);
  linha.appendChild(rec1);

  const nota4 = document.createElement("td")

  const inputNota4 = document.createElement("input");
  inputNota4.type = "number";
  inputNota4.min = "0"
  inputNota4.max = "10"

  nota4.appendChild(inputNota4);
  linha.appendChild(nota4);


  const nota5 = document.createElement("td")

  const inputNota5 = document.createElement("input");
  inputNota5.type = "number";
  inputNota5.min = "0"
  inputNota5.max = "10"

  nota5.appendChild(inputNota5);
  linha.appendChild(nota5);


  const rec2 = document.createElement("td")

  const inputRec2 = document.createElement("input");
  inputRec2.type = "number";
  inputRec2.min = "0"
  inputRec2.max = "10"

  rec2.appendChild(inputRec2);
  linha.appendChild(rec2);


  const nota6 = document.createElement("td")

  const inputNota6 = document.createElement("input");
  inputNota6.type = "number";
  inputNota6.min = "0"
  inputNota6.max = "10"

  nota6.appendChild(inputNota6);
  linha.appendChild(nota6);

  const nota7 = document.createElement("td")

  const inputNota7 = document.createElement("input");
  inputNota7.type = "number";
  inputNota7.min = "0"
  inputNota7.max = "10"

  nota7.appendChild(inputNota7);
  linha.appendChild(nota7);

  const rec3 = document.createElement("td")

  const inputRec3 = document.createElement("input");
  inputRec3.type = "number";
  inputRec3.min = "0"
  inputRec3.max = "10"

  rec3.appendChild(inputRec3);
  linha.appendChild(rec3);

  const mediaFinal = document.createElement("td");
  mediaFinal.textContent = "—";

  linha.appendChild(mediaFinal);

  console.log(mediaFinal)

  tabela.appendChild(linha);

  salvarNotas.addEventListener("click", function() {
  calcularMedia()
  console.log(valorNota1)
})

})

