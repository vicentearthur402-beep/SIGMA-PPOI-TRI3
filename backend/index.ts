import { db } from "./db";

const sessoes = new Map();

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/login" && req.method === "POST") {
      const dados = await req.json();
      const usuario = db
        .query(`SELECT * FROM users WHERE email = ?`)
        .get(dados.email);

      if (!usuario) {
        return new Response("Usuário não encontrado", {
          status: 401,
        });
      }

      if (dados.password !== usuario.password) {
        return new Response("Senha incorreta", {
          status: 401,
        });
      }

      const idSessao = crypto.randomUUID();
      sessoes.set(idSessao, usuario.id);

      console.log(usuario);
      console.log(dados);
      return new Response("Login realizado!", {
        headers: {
          "Set-Cookie": `sessao=${idSessao}; HttpOnly; Path=/`,
        },
      });
    }
    if (url.pathname === "/materias" && req.method === "GET") {
      const cookie = req.headers.get("cookie");
      const idSessao = cookie?.split("=")[1];
      const idUsuario = sessoes.get(idSessao);
      if (!idUsuario) {
        return new Response("Não autenticado", {
          status: 401,
        });
      }
      const usuario = db
        .query("SELECT * FROM users WHERE id = ?")
        .get(idUsuario);

      if (!usuario) {
        return new Response("Usuário não encontrado", {
          status: 401,
        });
      }

      console.log(usuario);
      if (usuario.role === "aluno") {
        return new Response("Materias do aluno");
      }

      if (usuario.role === "professor") {
        return new Response("Materias do professor");
      }
    }
    return new Response("Sigma ta funcionando");
  },
});
