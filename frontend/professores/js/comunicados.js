
const API = "http://127.0.0.1:3000";

const form = document.getElementById("formComunicado");
const campoTitulo = document.getElementById("titulo");
const campoConteudo = document.getElementById("conteudo");
const lista = document.getElementById("listaComunicados");
const mensagem = document.getElementById("mensagem");
const botaoPublicar = document.getElementById("publicar");
const botaoCancelar = document.getElementById("cancelarEdicao");
const tituloFormulario = document.getElementById("tituloFormulario");

let comunicadoEditando = null;

async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(`${API}${url}`, {
        ...opcoes,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...opcoes.headers
        }
    });

    if (!resposta.ok) {
        const erro = await resposta.text();
        throw new Error(erro || `Erro HTTP ${resposta.status}`);
    }

    if (resposta.status === 204) {
        return null;
    }

    return resposta.json();
}

function mostrarMensagem(texto, tipo = "sucesso") {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

function formatarData(data) {
    if (!data) return "Data não informada";

    const dataValida = new Date(data);

    if (Number.isNaN(dataValida.getTime())) {
        return data;
    }

    return dataValida.toLocaleString("pt-BR");
}

function criarBotao(texto, classe, acao) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = texto;
    botao.className = classe;
    botao.addEventListener("click", acao);

    return botao;
}

async function carregarComunicados() {
    lista.replaceChildren();

    const carregando = document.createElement("p");
    carregando.textContent = "Carregando comunicados...";
    lista.appendChild(carregando);

    try {
        const comunicados = await requisicao("/comunicados");
        lista.replaceChildren();

        if (!comunicados.length) {
            const vazio = document.createElement("p");
            vazio.textContent = "Você ainda não publicou comunicados.";
            lista.appendChild(vazio);
            return;
        }

        comunicados.forEach((comunicado) => {
            const card = document.createElement("article");
            card.className = "comunicado";

            const titulo = document.createElement("h3");
            titulo.textContent = comunicado.title;

            const data = document.createElement("p");
            data.className = "data-comunicado";
            data.textContent =
                `Publicado em: ${formatarData(comunicado.published_at)}`;

            const conteudo = document.createElement("p");
            conteudo.className = "texto-comunicado";
            conteudo.textContent = comunicado.content;

            const acoes = document.createElement("div");
            acoes.className = "acoes";

            const editar = criarBotao("Editar", "", () => {
                campoTitulo.value = comunicado.title;
                campoConteudo.value = comunicado.content;
                comunicadoEditando = comunicado.id;

                tituloFormulario.textContent = "Editar comunicado";
                botaoPublicar.textContent = "Salvar alterações";
                botaoCancelar.hidden = false;

                form.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                campoTitulo.focus();
            });

            const excluir = criarBotao(
                "Excluir",
                "btn-excluir",
                async () => {
                    const confirmar = window.confirm(
                        "Tem certeza de que deseja excluir este comunicado?"
                    );

                    if (!confirmar) return;

                    try {
                        await requisicao(`/comunicados/${comunicado.id}`, {
                            method: "DELETE"
                        });

                        if (comunicadoEditando === comunicado.id) {
                            limparFormulario();
                        }

                        mostrarMensagem("Comunicado excluído com sucesso.");
                        await carregarComunicados();
                    } catch (erro) {
                        mostrarMensagem(erro.message, "erro");
                    }
                }
            );

            acoes.append(editar, excluir);
            card.append(titulo, data, conteudo, acoes);
            lista.appendChild(card);
        });
    } catch (erro) {
        lista.replaceChildren();

        const aviso = document.createElement("p");
        aviso.textContent = "Não foi possível carregar os comunicados.";
        lista.appendChild(aviso);

        mostrarMensagem(erro.message, "erro");
    }
}

function limparFormulario() {
    form.reset();
    comunicadoEditando = null;

    tituloFormulario.textContent = "Publicar comunicado";
    botaoPublicar.textContent = "Publicar comunicado";
    botaoCancelar.hidden = true;
}

botaoCancelar.addEventListener("click", () => {
    limparFormulario();
    mostrarMensagem("Edição cancelada.");
});

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const title = campoTitulo.value.trim();
    const content = campoConteudo.value.trim();

    if (!title || !content) {
        mostrarMensagem(
            "Preencha o título e a mensagem.",
            "erro"
        );
        return;
    }

    const editando = comunicadoEditando !== null;
    const url = editando
        ? `/comunicados/${comunicadoEditando}`
        : "/comunicados";

    botaoPublicar.disabled = true;

    try {
        await requisicao(url, {
            method: editando ? "PUT" : "POST",
            body: JSON.stringify({ title, content })
        });

        limparFormulario();

        mostrarMensagem(
            editando
                ? "Comunicado atualizado com sucesso!"
                : "Comunicado publicado com sucesso!"
        );

        await carregarComunicados();
    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
    } finally {
        botaoPublicar.disabled = false;
    }
});

carregarComunicados();
