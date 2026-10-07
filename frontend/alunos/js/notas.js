const tabelaMaterias = document.getElementById("tabelaMaterias");
const detalhesMaterias = document.getElementById("detalhesMaterias");

async function CarregarNotas() {
  try {
    const resposta = await fetch("http://127.0.0.1:3000/minhas-notas",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!resposta.ok) {
      throw new Error("Erro ao carregar as notas" + resposta.status);
    }

    const notas = await resposta.json();

    materias = [];

notas.forEach(function (registro) {
  let materia = materias.find(function (item) {
    return item.nome === registro.subject;
  });

  if (!materia) {
    materia = {
      nome: registro.subject,
      trimestre1: { nota1: null, nota2: null, recuperacao: null },
      trimestre2: { nota1: null, nota2: null, recuperacao: null },
      trimestre3: { nota1: null, nota2: null, recuperacao: null },
    };

    materias.push(materia);
  }

  const trimestre = materia[`trimestre${registro.trimester}`];

  trimestre.nota1 = registro.grade1;
  trimestre.nota2 = registro.grade2;
  trimestre.recuperacao = registro.recovery;
});

console.log("Matérias organizadas:", materias);
renderizarMaterias();

    console.log("notas recebidas do backend:", notas);
  } catch (erro) {
    console.error("Erro ao carregar as notas:", erro);
  }
}

let materias = [];



function renderizarMaterias() {
materias.forEach(function (materia) {
  materia.mediaT1 = calcularMedia(materia.trimestre1);
  materia.mediaT2 = calcularMedia(materia.trimestre2);
  materia.mediaT3 = calcularMedia(materia.trimestre3);
  materia.mediaFinal = calcularMediaFinal(
    materia.mediaT1,
    materia.mediaT2,
    materia.mediaT3,
  );
  materia.situacao = isAprovado(materia.mediaFinal);

  const linha = document.createElement("tr");

  const nomeMateria = document.createElement("td");
  nomeMateria.textContent = materia.nome;
  linha.appendChild(nomeMateria);

  const mediaT1 = document.createElement("td");
  mediaT1.textContent = formatarNota(materia.mediaT1);
  linha.appendChild(mediaT1);

  const mediaT2 = document.createElement("td");
  mediaT2.textContent = formatarNota(materia.mediaT2);
  linha.appendChild(mediaT2);

  const mediaT3 = document.createElement("td");
  mediaT3.textContent = formatarNota(materia.mediaT3);
  linha.appendChild(mediaT3);

  const mediaFinal = document.createElement("td");
  mediaFinal.textContent = formatarNota(materia.mediaFinal);
  linha.appendChild(mediaFinal);

  const situacao = document.createElement("td");
  situacao.textContent = materia.situacao;
  linha.appendChild(situacao);

  tabelaMaterias.appendChild(linha);

  const detalhes = document.createElement("details");

  const resumo = document.createElement("summary");
  resumo.textContent = materia.nome;
  detalhes.appendChild(resumo);

  adicionarTrimestre(detalhes, materia.trimestre1, "1º Trimestre");

  const mediaT1Detalhes = document.createElement("p");

mediaT1Detalhes.textContent = `Média: ${formatarNota(materia.mediaT1)}`;
  detalhes.appendChild(mediaT1Detalhes);

  adicionarTrimestre(detalhes, materia.trimestre2, "2º Trimestre");

const mediaT2Detalhes = document.createElement("p");
mediaT2Detalhes.textContent = `Média: ${formatarNota(materia.mediaT2)}`;
detalhes.appendChild(mediaT2Detalhes);

  adicionarTrimestre(detalhes, materia.trimestre3, "3º Trimestre");

  const mediaT3Detalhes = document.createElement("p");
  mediaT3Detalhes.textContent = `Média: ${formatarNota(materia.mediaT3)}`;
  detalhes.appendChild(mediaT3Detalhes);

  const mediaFinalDetalhes = document.createElement("h4");
  mediaFinalDetalhes.textContent = `Média Final: ${formatarNota(materia.mediaFinal)}`;
  detalhes.appendChild(mediaFinalDetalhes);

  const situacaoF = document.createElement("p");
  situacaoF.textContent = `Situação: ${materia.situacao}`;
  detalhes.appendChild(situacaoF);

  detalhesMaterias.appendChild(detalhes);
});
}

console.log(materias);

function calcularMediaFinal(media1, media2, media3) {
  if (media1 === null || media2 === null || media3 === null) {
    return null;
  }

  return (media1 + media2 + media3) / 3;
}

function isAprovado(mediaFinal) {
  if (mediaFinal >= 6) {
    return "Aprovado";
  } else {
    return "Reprovado";
  }
}


function calcularMediaNormal(trimestre) {
  if (trimestre.nota1 === null || trimestre.nota2 === null) {
    return null;
  }

  return (trimestre.nota1 + trimestre.nota2) / 2;
}

function formatarNota(nota) {
  if (nota === null) {
    return "—";
  }

  return nota.toFixed(1);
}

function recuperacaoFoiAplicada(trimestre){
  if(trimestre.recuperacao !== null && trimestre.recuperacao > calcularMediaNormal(trimestre)){
    return true
  } else {
    return false
  }
}

function calcularMedia(trimestre) {
  const media = calcularMediaNormal(trimestre);

  if (media === null) {
    return null;
  }

  if (
    trimestre.recuperacao !== null &&
    trimestre.recuperacao > media
  ) {
    return trimestre.recuperacao;
  }

  return media;
}

function adicionarTrimestre(detalhes, trimestre, nomeTrimestre) {
  const titulo = document.createElement("h4");
  titulo.textContent = nomeTrimestre;
  detalhes.appendChild(titulo);
  const nota1 = document.createElement("p");
 nota1.textContent = `Nota 1: ${formatarNota(trimestre.nota1)}`;
  detalhes.appendChild(nota1);

  const nota2 = document.createElement("p");
  nota2.textContent = `Nota 2: ${formatarNota(trimestre.nota2)}`;
  detalhes.appendChild(nota2);
  if(trimestre.recuperacao !== null){
    const rec = document.createElement("p")
    rec.textContent = `Recuperação: ${formatarNota(trimestre.recuperacao)}`
    detalhes.appendChild(rec)

    if(recuperacaoFoiAplicada(trimestre)){
      const aviso = document.createElement("p");
      aviso.textContent = "Recuperação Aplicada";
      detalhes.appendChild(aviso)
    }

  }

}

CarregarNotas();