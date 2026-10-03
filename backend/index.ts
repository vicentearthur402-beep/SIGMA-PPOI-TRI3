import { db } from "./db";

const sessoes = new Map();

function buscarUsuario(req) {
  const cookie = req.headers.get("cookie");
  console.log("COOKIE:", cookie);
  const idSessao = cookie?.split("=")[1];
  const idUsuario = sessoes.get(idSessao);
  console.log("ID USUARIO:", idUsuario);

    if (!idUsuario) {
    return null;
  }

  const usuario = db.query("SELECT * FROM users WHERE id = ?").get(idUsuario);

  if (!usuario) {
    return null;
  }

  return usuario;
}

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

    if (url.pathname === "/login" && req.method === "POST") {
      const dados = await req.json();
      const usuario = db
        .query(`SELECT * FROM users WHERE email = ?`)
        .get(dados.email);

      if (!usuario) {
        return new Response("Usuário não encontrado", {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
            "Access-Control-Allow-Credentials": "true",
          }
        });
      }

      if (dados.password !== usuario.password) {
        return new Response("Senha incorreta", {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
            "Access-Control-Allow-Credentials": "true",
          }
        });
      }

      const idSessao = crypto.randomUUID();
      sessoes.set(idSessao, usuario.id);

      console.log(usuario);
      console.log(dados);
      return Response.json({
        mensagem: "Login bem-sucedido",
        role: usuario.role,
      }, {
        headers: {
          "Set-Cookie": `sessao=${idSessao}; HttpOnly; Path=/`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
          "Access-Control-Allow-Credentials": "true",
        }
      })
    }
    if (url.pathname === "/materias" && req.method === "GET") {
      const usuario = buscarUsuario(req);
      if (!usuario) {
        return new Response("Não autenticado", {
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

console.log("Servidor rodando em http://localhost:3000");
