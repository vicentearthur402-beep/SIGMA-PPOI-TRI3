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
          },
        });
      }

      if (dados.password !== usuario.password) {
        return new Response("Senha incorreta", {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
            "Access-Control-Allow-Credentials": "true",
          },
        });
      }

      const idSessao = crypto.randomUUID();
      sessoes.set(idSessao, usuario.id);

      console.log(usuario);
      console.log(dados);
      return Response.json(
        {
          mensagem: "Login bem-sucedido",
          role: usuario.role,
        },
        {
          headers: {
            "Set-Cookie": `sessao=${idSessao}; HttpOnly; Path=/`,
            "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
            "Access-Control-Allow-Credentials": "true",
          },
        },
      );
    }
    if (url.pathname === "/materias" && req.method === "GET") {
      const usuario = buscarUsuario(req);
      if (!usuario) {
        return new Response("Não autenticado", {
          status: 401,
        });
      }

      if (usuario.role === "aluno") {
        return new Response("Materias do aluno");
      }

      if (usuario.role === "professor") {
        const materias = db
          .query("SELECT id, name FROM subjects ORDER BY name")
          .all();

        return Response.json(materias, {
          headers: {
            "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
            "Access-Control-Allow-Credentials": "true",
          },
        });
      }
    }
    if (url.pathname === "/alunos" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return new Response("Não autenticado", {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
            "Access-Control-Allow-Credentials": "true",
          },
        });
      }

      if (usuario.role !== "professor") {
        return new Response("Acesso negado", {
          status: 403,
          headers: {
            "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
            "Access-Control-Allow-Credentials": "true",
          },
        });
      }

      const alunos = db
        .query("SELECT id, name FROM students ORDER BY name")
        .all();

      return Response.json(alunos, {
        headers: {
          "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

    if (url.pathname === "/notas" && req.method === "POST") {
      const usuario = buscarUsuario(req);

      const cabecalhos = {
        "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
        "Access-Control-Allow-Credentials": "true",
      };

      if (!usuario) {
        return new Response("Não autenticado", {
          status: 401,
          headers: cabecalhos,
        });
      }

      if (usuario.role !== "professor") {
        return new Response("Acesso negado", {
          status: 403,
          headers: cabecalhos,
        });
      }

      const dados = await req.json();
      const { subjectId, notas } = dados;

      if (!Number.isInteger(Number(subjectId)) || !Array.isArray(notas)) {
        return new Response("Dados inválidos", {
          status: 400,
          headers: cabecalhos,
        });
      }

      const materiaExiste = db
        .query("SELECT id FROM subjects WHERE id = ?")
        .get(Number(subjectId));

      if (!materiaExiste) {
        return new Response("Matéria não encontrada", {
          status: 400,
          headers: cabecalhos,
        });
      }

      for (const nota of notas) {
        const { studentId, trimester, grade1, grade2, recovery } = nota;

        if (
          !Number.isInteger(Number(studentId)) ||
          ![1, 2, 3].includes(Number(trimester))
        ) {
          return new Response("Aluno ou trimestre inválido", {
            status: 400,
            headers: cabecalhos,
          });
        }

        const alunoExiste = db
          .query("SELECT id FROM students WHERE id = ?")
          .get(Number(studentId));

        if (!alunoExiste) {
          return new Response("Aluno não encontrado", {
            status: 400,
            headers: cabecalhos,
          });
        }

        const valores = [grade1, grade2, recovery];

        for (const valor of valores) {
          if (
            valor !== null &&
            valor !== undefined &&
            (typeof valor !== "number" ||
              !Number.isFinite(valor) ||
              valor < 0 ||
              valor > 10)
          ) {
            return new Response("Notas devem estar entre 0 e 10", {
              status: 400,
              headers: cabecalhos,
            });
          }
        }

        const existente = db
          .query(
            `SELECT id FROM grades
             WHERE student_id = ? AND subject_id = ? AND trimester = ?`,
          )
          .get(Number(studentId), Number(subjectId), Number(trimester));

        if (existente) {
          db.query(
            `UPDATE grades
             SET grade_1 = ?, grade_2 = ?, recovery = ?
             WHERE id = ?`,
          ).run(grade1 ?? null, grade2 ?? null, recovery ?? null, existente.id);
        } else {
          db.query(
            `INSERT INTO grades
             (student_id, subject_id, trimester, grade_1, grade_2, recovery)
             VALUES (?, ?, ?, ?, ?, ?)`,
          ).run(
            Number(studentId),
            Number(subjectId),
            Number(trimester),
            grade1 ?? null,
            grade2 ?? null,
            recovery ?? null,
          );
        }
      }

      return Response.json(
        { mensagem: "Notas salvas com sucesso!" },
        { headers: cabecalhos },
      );
    }
  if (url.pathname === "/notas" && req.method === "GET") {
    const usuario = buscarUsuario(req);

    const cabecalhos = {
      "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
      "Access-Control-Allow-Credentials": "true",
    };

    if (!usuario) {
      return new Response("Não autenticado", {
        status: 401,
        headers: cabecalhos,
      });
    }

    if (usuario.role !== "professor") {
      return new Response("Acesso negado", {
        status: 403,
        headers: cabecalhos,
      });
    }

    const subjectId = Number(url.searchParams.get("subjectId"));

    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      return new Response("ID da matéria inválido", {
        status: 400,
        headers: cabecalhos,
      });
    }

const notas = db.query(`
  SELECT
    student_id AS "studentId",
    trimester,
    grade_1 AS "grade1",
    grade_2 AS "grade2",
    recovery
  FROM grades
  WHERE subject_id = ?
  ORDER BY student_id, trimester
`).all(subjectId);

    return Response.json(notas, { headers: cabecalhos });
  }

  
if (url.pathname === "/minhas-notas" && req.method === "GET") {
  const usuario = buscarUsuario(req);

  const cabecalhos = {
    "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
    "Access-Control-Allow-Credentials": "true",
  };

  if (!usuario) {
    return new Response("Não autenticado", {
      status: 401,
      headers: cabecalhos,
    });
  }

  if (usuario.role !== "aluno") {
    return new Response("Acesso permitido somente para alunos", {
      status: 403,
      headers: cabecalhos,
    });
  }

  const aluno = db
    .query("SELECT id FROM students WHERE user_id = ?")
    .get(usuario.id);

  if (!aluno) {
    return new Response("Aluno não encontrado", {
      status: 404,
      headers: cabecalhos,
    });
  }

const notas = db.query(`
  SELECT
    subjects.id AS subjectId,
    subjects.name AS subject,
    trimestres.trimester AS trimester,
    grades.grade_1 AS grade1,
    grades.grade_2 AS grade2,
    grades.recovery AS recovery
  FROM subjects
  CROSS JOIN (
    SELECT 1 AS trimester
    UNION ALL SELECT 2
    UNION ALL SELECT 3
  ) AS trimestres
  LEFT JOIN grades
    ON grades.subject_id = subjects.id
    AND grades.student_id = ?
    AND grades.trimester = trimestres.trimester
  ORDER BY subjects.name, trimestres.trimester
`).all(aluno.id);

  return Response.json(notas, {
    headers: cabecalhos,
  });
}


    return new Response("Sigma ta funcionando");
  },
});

console.log("Servidor rodando em http://localhost:3000");
