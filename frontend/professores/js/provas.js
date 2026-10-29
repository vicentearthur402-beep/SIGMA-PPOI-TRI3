const API = "http://127.0.0.1:3000";

const formProva = document.getElementById("formProva");
const materiaSelect = document.getElementById("materia");
const tituloInput = document.getElementById("titulo");
const dataInput = document.getElementById("dataProva");
const horaInput = document.getElementById("horaProva");
const mensagem = document.getElementById("mensagem");
const listaProvas = document.getElementById("listaProvas");
const botaoPublicar = document.getElementById("publicarProva");
const botaoCancelar = document.getElementById("cancelarEdicao");
const tituloFormulario = document.getElementById("tituloFormulario");

let provaEditandoId = null;

async function requisicaoAPI(url, opcoes = {}) {
    const resposta = await fetch(`${API}${url}`, {
        ...opcoes,
        credentials: "include",
        headers: {
            ...(opcoes.headers || {}),
            ...(opcoes.body ? { "Content-Type": "application/json" } : {})
        }
    });

    if (!resposta.ok) {
        const erro = await resposta.text();
        throw new Error(erro || "Não foi possível completar a operação.");
    }

    if (resposta.status === 204) {
        return null;
    }

    return resposta.json();
}

function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

async function carregarMaterias() {
    try {
        const materias = await requisicaoAPI("/materias");

        materiaSelect.replaceChildren();

        const opcaoInicial = document.createElement("option");
        opcaoInicial.value = "";
        opcaoInicial.textContent = "Selecione uma matéria";
        materiaSelect.appendChild(opcaoInicial);

        materias.forEach(function(materia) {
            const opcao = document.createElement("option");
            opcao.value = materia.id;
            opcao.textContent = materia.name;
            materiaSelect.appendChild(opcao);
        });
    } catch (erro) {
        materiaSelect.replaceChildren();

        const opcaoErro = document.createElement("option");
        opcaoErro.value = "";
        opcaoErro.textContent = "Erro ao carregar matérias";
        materiaSelect.appendChild(opcaoErro);

        mensagem.textContent = erro.message;
    }
}

async function carregarProvas() {
    listaProvas.replaceChildren();

    const carregando = document.createElement("p");
    carregando.textContent = "Carregando provas...";
    listaProvas.appendChild(carregando);

    try {
        const provas = await requisicaoAPI("/provas");

        listaProvas.replaceChildren();

        if (provas.length === 0) {
            const vazio = document.createElement("p");
            vazio.textContent = "Você ainda não publicou nenhuma prova.";
            listaProvas.appendChild(vazio);
            return;
        }

        provas.forEach(function(prova) {
            const card = document.createElement("article");
            card.className = "card-prova";

            const materia = document.createElement("h3");
            materia.textContent = prova.materia;

            const titulo = document.createElement("p");
            titulo.textContent = `Prova: ${prova.titulo}`;

            const data = document.createElement("p");
            data.textContent = `Data: ${formatarData(prova.data)}`;

            const horario = document.createElement("p");
            horario.textContent = `Horário: ${prova.horario}`;

            const acoes = document.createElement("div");
            acoes.className = "acoes-prova";

            const botaoEditar = document.createElement("button");
            botaoEditar.type = "button";
            botaoEditar.className = "botao-editar";
            botaoEditar.textContent = "Editar";

            botaoEditar.addEventListener("click", function() {
                editarProva(prova);
            });

            const botaoExcluir = document.createElement("button");
            botaoExcluir.type = "button";
            botaoExcluir.className = "botao-excluir";
            botaoExcluir.textContent = "Excluir";

            botaoExcluir.addEventListener("click", function() {
                excluirProva(prova.id, botaoExcluir);
            });

            acoes.append(botaoEditar, botaoExcluir);
            card.append(materia, titulo, data, horario, acoes);
            listaProvas.appendChild(card);
        });
    } catch (erro) {
        listaProvas.replaceChildren();

        const erroElemento = document.createElement("p");
        erroElemento.textContent = erro.message;
        listaProvas.appendChild(erroElemento);
    }
}

function editarProva(prova) {
    provaEditandoId = prova.id;

    materiaSelect.value = String(prova.subjectId);
    tituloInput.value = prova.titulo;
    dataInput.value = prova.data;
    horaInput.value = prova.horario;

    tituloFormulario.textContent = "Editar Prova";
    botaoPublicar.textContent = "Salvar alterações";
    botaoCancelar.hidden = false;
    mensagem.textContent = "";

    formProva.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function cancelarEdicao() {
    provaEditandoId = null;

    formProva.reset();

    tituloFormulario.textContent = "Nova Prova";
    botaoPublicar.textContent = "Publicar prova";
    botaoCancelar.hidden = true;
    mensagem.textContent = "";
}

botaoCancelar.addEventListener("click", cancelarEdicao);

formProva.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    mensagem.textContent = "";
    botaoPublicar.disabled = true;

    const estavaEditando = provaEditandoId !== null;
    botaoPublicar.textContent = estavaEditando
        ? "Salvando..."
        : "Publicando...";

    try {
        const dados = {
            subjectId: Number(materiaSelect.value),
            title: tituloInput.value.trim(),
            date: dataInput.value,
            time: horaInput.value
        };

        if (estavaEditando) {
            await requisicaoAPI(`/provas/${provaEditandoId}`, {
                method: "PUT",
                body: JSON.stringify(dados)
            });

            mensagem.textContent = "Prova atualizada com sucesso!";
        } else {
            await requisicaoAPI("/provas", {
                method: "POST",
                body: JSON.stringify(dados)
            });

            mensagem.textContent = "Prova publicada com sucesso!";
        }

        cancelarEdicao();
        await carregarProvas();
    } catch (erro) {
        mensagem.textContent = erro.message;
    } finally {
        botaoPublicar.disabled = false;

        botaoPublicar.textContent = provaEditandoId !== null
            ? "Salvar alterações"
            : "Publicar prova";
    }
});

async function excluirProva(id, botao) {
    const confirmou = confirm(
        "Tem certeza de que deseja excluir esta prova? Essa ação não pode ser desfeita."
    );

    if (!confirmou) {
        return;
    }

    botao.disabled = true;
    botao.textContent = "Excluindo...";

    try {
        await requisicaoAPI(`/provas/${id}`, {
            method: "DELETE"
        });

        if (provaEditandoId === id) {
            cancelarEdicao();
        }

        mensagem.textContent = "Prova excluída com sucesso!";
        await carregarProvas();
    } catch (erro) {
        mensagem.textContent = erro.message;
        botao.disabled = false;
        botao.textContent = "Excluir";
    }
}

carregarMaterias();
carregarProvas();