const materias = [];
const tabelaMaterias = document.getElementById("tabelaMaterias");
const detalhesMaterias = document.getElementById("detalhesMaterias");

const matematica = {
  nome: "Matemática",
  trimestre1: {
    nota1: 9.1,
    nota2: 9.6,
  },
  trimestre2: {
    nota1: 2,
    nota2: 5,
  },
  trimestre3: {
    nota1: 3.5,
    nota2: 8,
  },
};

const historia = {
  nome: "História",
  trimestre1: {
    nota1: 8.5,
    nota2: 6.8,
  },
  trimestre2: {
    nota1: 7.5,
    nota2: 10,
  },
  trimestre3: {
    nota1: 6.0,
    nota2: 3.5,
  },
};

materias.push(matematica);
materias.push(historia);

materias.forEach(function (materia) {
  materia.mediaT1 = Number(calcularMedia(materia.trimestre1).toFixed(1));
  materia.mediaT2 = Number(calcularMedia(materia.trimestre2).toFixed(1));
  materia.mediaT3 = Number(calcularMedia(materia.trimestre3).toFixed(1));
  materia.mediaFinal = Number(
    calcularMediaFinal(materia.mediaT1, materia.mediaT2, materia.mediaT3),
  );
  materia.situacao = isAprovado(materia.mediaFinal);

  const linha = document.createElement("tr");

  const nomeMateria = document.createElement("td");
  nomeMateria.textContent = materia.nome;
  linha.appendChild(nomeMateria);

  const mediaT1 = document.createElement("td");
  mediaT1.textContent = materia.mediaT1;
  linha.appendChild(mediaT1);

  const mediaT2 = document.createElement("td");
  mediaT2.textContent = materia.mediaT2;
  linha.appendChild(mediaT2);

  const mediaT3 = document.createElement("td");
  mediaT3.textContent = materia.mediaT3;
  linha.appendChild(mediaT3);

  const mediaFinal = document.createElement("td");
  mediaFinal.textContent = materia.mediaFinal;
  linha.appendChild(mediaFinal);

  const situacao = document.createElement("td");
  situacao.textContent = materia.situacao;
  linha.appendChild(situacao);

  tabelaMaterias.appendChild(linha);

  const detalhes = document.createElement("details");

  const resumo = document.createElement("summary");
  resumo.textContent = materia.nome;
  detalhes.appendChild(resumo);

  adicionarTrimestre(detalhes, materia.trimestre1, "1º Trimestre")

  const mediaT1Detalhes = document.createElement("p");

  mediaT1Detalhes.textContent = `Média: ${materia.mediaT1.toFixed(1)} `
  detalhes.appendChild(mediaT1Detalhes)


  adicionarTrimestre(detalhes, materia.trimestre2, "2º Trimestre")

  const mediaT2Detalhes = document.createElement("p");
  mediaT2Detalhes.textContent = `Média: ${materia.mediaT2.toFixed(1)} `
  detalhes.appendChild(mediaT2Detalhes)


  adicionarTrimestre(detalhes, materia.trimestre3, "3º Trimestre")
  
  const mediaT3Detalhes = document.createElement("p");
  mediaT3Detalhes.textContent = `Média: ${materia.mediaT3.toFixed(1)} `
  detalhes.appendChild(mediaT3Detalhes)

  const mediaFinalDetalhes = document.createElement("h4");
  mediaFinalDetalhes.textContent = `Média Final: ${materia.mediaFinal.toFixed(1)}`
  detalhes.appendChild(mediaFinalDetalhes)

  const situacaoF = document.createElement("p");
  situacaoF.textContent = `Situação: ${materia.situacao}`
  detalhes.appendChild(situacaoF)


  detalhesMaterias.appendChild(detalhes);
});

console.log(materias);

function calcularMediaFinal(media1, media2, media3) {
  const mFinal = ((media1 + media2 + media3) / 3).toFixed(1);
  return mFinal;
}

function isAprovado(mediaFinal) {
  if (mediaFinal >= 6) {
    return "Aprovado!";
  } else {
    return "Reprovado Doidaum";
  }
}

function calcularMedia(trimestre) {
  return (trimestre.nota1 + trimestre.nota2) / 2;
}

function adicionarTrimestre(detalhes, trimestre, nomeTrimestre) {
  const titulo = document.createElement("h4");
  titulo.textContent = nomeTrimestre;
  detalhes.appendChild(titulo);
  const nota1 = document.createElement("p");
  nota1.textContent = `Nota 1: ${trimestre.nota1.toFixed(1)}`
  detalhes.appendChild(nota1);

  const nota2 = document.createElement("p");
  nota2.textContent = `Nota 2: ${trimestre.nota2.toFixed(1)}`
  detalhes.appendChild(nota2)
}
