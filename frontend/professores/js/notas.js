const materia = document.getElementById("materia");
const salvarNotas = document.getElementById("salvarNotas");
const mensagemSalvamento = document.getElementById("mensagemSalvamento");

const alunos = ["Lucas Gabriel Conti", "Arthur", "Samuel Lino", "Claudio"];

alunos.sort();

const materias = {
  artes: "Artes",
  biologia: "Biologia",
  "educacao-fisica": "Educação Física",
};

const notasPorMateria = {};
const referenciasAlunos = {};

const tabela = document.querySelector("tbody");

alunos.forEach(function (aluno) {
  referenciasAlunos[aluno] = {};
  function calcularMedia() {
    const valorNota1 = Number(inputNota1.value);
    const valorNota2 = Number(inputNota2.value);
    const valorRec1 = Number(inputRec1.value);
    const valorNota4 = Number(inputNota4.value);
    const valorNota5 = Number(inputNota5.value);
    const valorRec2 = Number(inputRec2.value);
    const valorNota6 = Number(inputNota6.value);
    const valorNota7 = Number(inputNota7.value);
    const valorRec3 = Number(inputRec3.value);

    if (inputNota1.value === "" || inputNota2.value === "") {
      mediaFinal.textContent = "—";
      return;
    }

    const media1 = (valorNota1 + valorNota2) / 2;
    const media1Final = Math.max(media1, valorRec1);

    if (inputNota4.value === "" || inputNota5.value === "") {
      mediaFinal.textContent = "—";
      return;
    }
    const media2 = (valorNota4 + valorNota5) / 2;
    const media2Final = Math.max(media2, valorRec2);

    if (inputNota6.value === "" || inputNota7.value === "") {
      mediaFinal.textContent = "—";
      return;
    }
    const media3 = (valorNota6 + valorNota7) / 2;
    const media3Final = Math.max(media3, valorRec3);

    const mediaFinalNormal = (media1Final + media2Final + media3Final) / 3;
    mediaFinal.textContent = mediaFinalNormal.toFixed(1);
  }

  const linha = document.createElement("tr");

  const nome = document.createElement("td");
  nome.textContent = aluno;
  linha.appendChild(nome);

  const nota1 = document.createElement("td");

  const inputNota1 = document.createElement("input");
  inputNota1.type = "number";
  inputNota1.min = "0";
  inputNota1.max = "10";

  nota1.appendChild(inputNota1);
  linha.appendChild(nota1);

  const nota2 = document.createElement("td");

  const inputNota2 = document.createElement("input");
  inputNota2.type = "number";
  inputNota2.min = "0";
  inputNota2.max = "10";

  nota2.appendChild(inputNota2);
  linha.appendChild(nota2);

  const rec1 = document.createElement("td");

  const inputRec1 = document.createElement("input");
  inputRec1.type = "number";
  inputRec1.min = "0";
  inputRec1.max = "10";

  rec1.appendChild(inputRec1);
  linha.appendChild(rec1);

  const nota4 = document.createElement("td");

  const inputNota4 = document.createElement("input");
  inputNota4.type = "number";
  inputNota4.min = "0";
  inputNota4.max = "10";

  nota4.appendChild(inputNota4);
  linha.appendChild(nota4);

  const nota5 = document.createElement("td");

  const inputNota5 = document.createElement("input");
  inputNota5.type = "number";
  inputNota5.min = "0";
  inputNota5.max = "10";

  nota5.appendChild(inputNota5);
  linha.appendChild(nota5);

  const rec2 = document.createElement("td");

  const inputRec2 = document.createElement("input");
  inputRec2.type = "number";
  inputRec2.min = "0";
  inputRec2.max = "10";

  rec2.appendChild(inputRec2);
  linha.appendChild(rec2);

  const nota6 = document.createElement("td");

  const inputNota6 = document.createElement("input");
  inputNota6.type = "number";
  inputNota6.min = "0";
  inputNota6.max = "10";

  nota6.appendChild(inputNota6);
  linha.appendChild(nota6);

  const nota7 = document.createElement("td");

  const inputNota7 = document.createElement("input");
  inputNota7.type = "number";
  inputNota7.min = "0";
  inputNota7.max = "10";

  nota7.appendChild(inputNota7);
  linha.appendChild(nota7);

  const rec3 = document.createElement("td");

  const inputRec3 = document.createElement("input");
  inputRec3.type = "number";
  inputRec3.min = "0";
  inputRec3.max = "10";

  rec3.appendChild(inputRec3);
  linha.appendChild(rec3);

  const mediaFinal = document.createElement("td");
  mediaFinal.textContent = "—";

  linha.appendChild(mediaFinal);

  referenciasAlunos[aluno] = {
    inputNota1,
    inputNota2,
    inputRec1,
    inputNota4,
    inputNota5,
    inputRec2,
    inputNota6,
    inputNota7,
    inputRec3,
    mediaFinal,
    calcularMedia,
  };

  console.log(mediaFinal);

  tabela.appendChild(linha);

  materia.addEventListener("change", function () {
    if (
      notasPorMateria[materia.value] &&
      notasPorMateria[materia.value][aluno]
    ) {
      const notasAluno = notasPorMateria[materia.value][aluno];
      console.log(notasAluno.primeiroTrimestre);
      inputNota1.value = notasAluno.primeiroTrimestre.nota1;
      inputNota2.value = notasAluno.primeiroTrimestre.nota2;
      inputRec1.value = notasAluno.primeiroTrimestre.rec;

      inputNota4.value = notasAluno.segundoTrimestre.nota1;
      inputNota5.value = notasAluno.segundoTrimestre.nota2;
      inputRec2.value = notasAluno.segundoTrimestre.rec;

      inputNota6.value = notasAluno.terceiroTrimestre.nota1;
      inputNota7.value = notasAluno.terceiroTrimestre.nota2;
      inputRec3.value = notasAluno.terceiroTrimestre.rec;

      calcularMedia();
    } else {
      inputNota1.value = "";
      inputNota2.value = "";
      inputRec1.value = "";

      inputNota4.value = "";
      inputNota5.value = "";
      inputRec2.value = "";

      inputNota6.value = "";
      inputNota7.value = "";
      inputRec3.value = "";
      mediaFinal.textContent = "—";
    }
  });
});

salvarNotas.addEventListener("click", function () {
  const alunosSalvos = Object.keys(referenciasAlunos);
  let haveWrongGrades = false;

  for (const aluno of alunosSalvos) {
    const referencias = referenciasAlunos[aluno];
    const notas = [
      referencias.inputNota1,
      referencias.inputNota2,
      referencias.inputRec1,
      referencias.inputNota4,
      referencias.inputNota5,
      referencias.inputRec2,
      referencias.inputNota6,
      referencias.inputNota7,
      referencias.inputRec3,
    ];

    for (const nota of notas) {
      if (
        nota.value !== "" &&
        (Number(nota.value) < 0 || Number(nota.value) > 10)
      ) {
        haveWrongGrades = true;
      }
    }
  }

  if (haveWrongGrades) {
    alert("Todas as notas devem estar entre 0 e 10.");
    return;
  }

  for (const aluno of alunosSalvos) {
    const referencias = referenciasAlunos[aluno];

    referencias.calcularMedia();
  }

  if (!notasPorMateria[materia.value]) {
    notasPorMateria[materia.value] = {};
  }
  for (const aluno of alunosSalvos) {
    const referencias = referenciasAlunos[aluno];

    const notasSalvas = notasPorMateria[materia.value][aluno] || {};

    notasPorMateria[materia.value][aluno] = {
      primeiroTrimestre: {
        nota1: Number(referencias.inputNota1.value),
        nota2: Number(referencias.inputNota2.value),
        rec:
          referencias.inputRec1.value === ""
            ? null
            : Number(referencias.inputRec1.value),
      },
      segundoTrimestre: {
        nota1: Number(referencias.inputNota4.value),
        nota2: Number(referencias.inputNota5.value),
        rec:
          referencias.inputRec2.value === ""
            ? null
            : Number(referencias.inputRec2.value),
      },
      terceiroTrimestre: {
        nota1: Number(referencias.inputNota6.value),
        nota2: Number(referencias.inputNota7.value),
        rec:
          referencias.inputRec3.value === ""
            ? null
            : Number(referencias.inputRec3.value),
      },
    };
  }
  console.log(notasPorMateria);
  console.log(materia.value);
  console.log(materias[materia.value]);
  mensagemSalvamento.textContent = "Notas salvas com sucesso!";
  console.log(notasPorMateria);
});





