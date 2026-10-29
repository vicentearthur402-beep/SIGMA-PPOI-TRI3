const API = "http://127.0.0.1:3000";

const listaProvas = document.getElementById("listaProvas");
const filtroMateria = document.getElementById("filtroMateria");

let provas = [];

async function carregarProvas() {
    try {
        listaProvas.textContent = "Carregando provas...";

        const resposta = await fetch(`${API}/minhas-provas`, {
            credentials: "include"
        });

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as provas.");
        }

        provas = await resposta.json();

        // Ordena as provas por data e horário
        provas.sort(function(a, b) {
            const dataA = new Date(`${a.data}T${a.horario}`);
            const dataB = new Date(`${b.data}T${b.horario}`);

            return dataA - dataB;
        });

        carregarMaterias();
        mostrarProvas(provas);

    } catch (erro) {
        listaProvas.textContent = erro.message;
    }
}

function carregarMaterias() {
    filtroMateria.replaceChildren();

    const opcaoTodas = document.createElement("option");
    opcaoTodas.value = "todas";
    opcaoTodas.textContent = "TODAS";

    filtroMateria.appendChild(opcaoTodas);

    const materias = new Set();

    provas.forEach(function(prova) {
        materias.add(prova.materia);
    });

    materias.forEach(function(materia) {
        const opcao = document.createElement("option");

        opcao.value = materia;
        opcao.textContent = materia;

        filtroMateria.appendChild(opcao);
    });
}

filtroMateria.addEventListener("change", function() {
    const materiaSelecionada = filtroMateria.value;

    if (materiaSelecionada === "todas") {
        mostrarProvas(provas);
    } else {
        const provasFiltradas = provas.filter(function(prova) {
            return prova.materia === materiaSelecionada;
        });

        mostrarProvas(provasFiltradas);
    }
});

function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function mostrarProvas(lista) {
    listaProvas.replaceChildren();

    if (lista.length === 0) {
        listaProvas.textContent = "Nenhuma prova encontrada.";
        return;
    }

    lista.forEach(function(prova) {
        const provaElemento = document.createElement("div");

        const materia = document.createElement("h2");
        materia.textContent = prova.materia;

        const titulo = document.createElement("h3");
        titulo.textContent = prova.titulo;

        const data = document.createElement("p");
        data.textContent = `Data: ${formatarData(prova.data)}`;

        const horario = document.createElement("p");
        horario.textContent = `Horário: ${prova.horario}`;

        provaElemento.append(materia, titulo, data, horario);
        listaProvas.appendChild(provaElemento);
    });
}

carregarProvas();