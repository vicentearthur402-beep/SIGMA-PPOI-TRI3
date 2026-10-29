import { db } from "./db";
import { mkdir } from "node:fs/promises";
import { resolve, sep } from "node:path";

const sessoes = new Map<string, number>();

function buscarUsuario(req: Request) {
  console.log("ENTREI EM buscarUsuario");
  const cookie = req.headers.get("cookie");

  const idSessao = cookie
    ?.split(";")
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith("sessao="))
    ?.slice("sessao=".length);

  console.log("Cookie recebido:", cookie ? "Sim" : "Não");
  console.log("ID da sessão encontrado:", Boolean(idSessao));

  if (!idSessao) {
    console.log("Motivo: cookie ausente.");
    return null;
  }

  const idUsuario = sessoes.get(idSessao);

  console.log("Sessões ativas:", sessoes.size);
  console.log("Usuário encontrado:", idUsuario ?? "Nenhum");

  if (idUsuario === undefined) {
    console.log("Motivo: sessão não existe no Map.");
    return null;
  }

  return db.query("SELECT * FROM users WHERE id = ?").get(idUsuario) as {
    id: number;
    email: string;
    password: string;
    role: string;
  } | null;
}

const cabecalhos = {
  "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
  "Access-Control-Allow-Credentials": "true",
};

function respostaErro(mensagem: string, status: number) {
  return new Response(mensagem, {
    status,
    headers: cabecalhos,
  });
}

Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);
    // DADOS DO USUÁRIO CONECTADO
    if (req.method === "GET" && url.pathname === "/me") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      let pessoa: { name: string } | null;

      if (usuario.role === "aluno") {
        pessoa = db
          .query(
            `
      SELECT name
      FROM students
      WHERE user_id = ?
    `,
          )
          .get(usuario.id) as { name: string } | null;
      } else if (usuario.role === "professor") {
        pessoa = db
          .query(
            `
      SELECT name
      FROM teachers
      WHERE user_id = ?
    `,
          )
          .get(usuario.id) as { name: string } | null;
      } else {
        return respostaErro("Perfil inválido", 403);
      }

      if (!pessoa) {
        return respostaErro("Perfil não encontrado", 404);
      }

      return Response.json(
        {
          nome: pessoa.name,
          perfil: usuario.role,
        },
        { headers: cabecalhos },
      );
    }
    // CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          ...cabecalhos,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
    // ENVIAR TRABALHO
    if (
      req.method === "POST" &&
      /^\/tarefas\/\d+\/envios$/.test(url.pathname)
    ) {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "aluno") {
        return respostaErro("Acesso permitido somente para alunos", 403);
      }

      const tarefaId = Number(url.pathname.split("/")[2]);

      const aluno = db
        .query("SELECT id FROM students WHERE user_id = ?")
        .get(usuario.id) as { id: number } | null;

      if (!aluno) {
        return respostaErro("Aluno não encontrado", 404);
      }

      const tarefa = db
        .query(
          `
    SELECT id, due_date, due_time
    FROM tasks
    WHERE id = ?
  `,
        )
        .get(tarefaId) as {
          id: number;
          due_date: string;
          due_time: string;
        } | null;

      if (!tarefa) {
        return respostaErro("Tarefa não encontrada", 404);
      }

      // VERIFICAR PRAZO DE ENTREGA
      const prazo = new Date(`${tarefa.due_date}T${tarefa.due_time}:00`);

      if (Number.isNaN(prazo.getTime())) {
        return respostaErro("Prazo da tarefa inválido", 500);
      }

      if (Date.now() >= prazo.getTime()) {
        return respostaErro(
          "Prazo encerrado! Não é mais possível enviar esta tarefa.",
          403,
        );
      }

      const formulario = await req.formData();
      const arquivo = formulario.get("arquivo");

      if (!(arquivo instanceof File) || arquivo.size === 0) {
        return respostaErro("Selecione um arquivo válido", 400);
      }

      // Limite de 10 MB
      if (arquivo.size > 10 * 1024 * 1024) {
        return respostaErro("O arquivo deve ter no máximo 10 MB", 400);
      }

      const pasta = "backend/uploads";
      await mkdir(pasta, { recursive: true });

      const nomeOriginal = arquivo.name.replace(/[/\\]/g, "_");
      const nomeArmazenado = `${crypto.randomUUID()}-${nomeOriginal}`;
      const caminho = `${pasta}/${nomeArmazenado}`;

      await Bun.write(caminho, arquivo);

      try {
        db.query(
          `
      INSERT INTO submissions
        (task_id, student_id, file_name, file_path, submitted_at)
      VALUES (?, ?, ?, ?, ?)
    `,
        ).run(
          tarefaId,
          aluno.id,
          nomeOriginal,
          caminho,
          new Date().toISOString(),
        );
      } catch (erro) {
        // Evita deixar arquivo órfão caso o registro falhe.
        await Bun.file(caminho).delete();
        console.error(erro);
        return respostaErro("Não foi possível registrar a entrega", 500);
      }

      return Response.json(
        { mensagem: "Trabalho enviado com sucesso!" },
        { headers: cabecalhos },
      );
    }

    // LOGIN
    if (url.pathname === "/login" && req.method === "POST") {
      const dados = (await req.json()) as {
        email: string;
        password: string;
      };

      const usuario = db
        .query("SELECT * FROM users WHERE email = ?")
        .get(dados.email) as {
          id: number;
          email: string;
          password: string;
          role: string;
        } | null;

      if (!usuario) {
        return respostaErro("Usuário não encontrado", 401);
      }

      if (dados.password !== usuario.password) {
        return respostaErro("Senha incorreta", 401);
      }

      const idSessao = crypto.randomUUID();
      sessoes.set(idSessao, usuario.id);

      return Response.json(
        {
          mensagem: "Login bem-sucedido",
          role: usuario.role,
        },
        {
          headers: {
            ...cabecalhos,
            "Set-Cookie": `sessao=${idSessao}; HttpOnly; Path=/; SameSite=Lax`,
          },
        },
      );
    }

    // MATÉRIAS
    if (url.pathname === "/materias" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const materias = db
        .query("SELECT id, name FROM subjects ORDER BY name")
        .all();

      return Response.json(materias, { headers: cabecalhos });
    }

    // ALUNOS
    if (url.pathname === "/alunos" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const alunos = db
        .query("SELECT id, name FROM students ORDER BY name")
        .all();

      return Response.json(alunos, { headers: cabecalhos });
    }

    // SALVAR NOTAS
    if (url.pathname === "/notas" && req.method === "POST") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const dados = (await req.json()) as {
        subjectId: number;
        notas: {
          studentId: number;
          trimester: number;
          grade1: number | null;
          grade2: number | null;
          recovery: number | null;
        }[];
      };

      const subjectId = Number(dados.subjectId);

      if (!Number.isInteger(subjectId) || !Array.isArray(dados.notas)) {
        return respostaErro("Dados inválidos", 400);
      }

      const materiaExiste = db
        .query("SELECT id FROM subjects WHERE id = ?")
        .get(subjectId);

      if (!materiaExiste) {
        return respostaErro("Matéria não encontrada", 400);
      }

      for (const nota of dados.notas) {
        const studentId = Number(nota.studentId);
        const trimester = Number(nota.trimester);

        if (!Number.isInteger(studentId) || ![1, 2, 3].includes(trimester)) {
          return respostaErro("Aluno ou trimestre inválido", 400);
        }

        const alunoExiste = db
          .query("SELECT id FROM students WHERE id = ?")
          .get(studentId);

        if (!alunoExiste) {
          return respostaErro("Aluno não encontrado", 400);
        }

        for (const valor of [nota.grade1, nota.grade2, nota.recovery]) {
          if (
            valor !== null &&
            valor !== undefined &&
            (typeof valor !== "number" ||
              !Number.isFinite(valor) ||
              valor < 0 ||
              valor > 10)
          ) {
            return respostaErro("Notas devem estar entre 0 e 10", 400);
          }
        }

        const existente = db
          .query(
            `
            SELECT id FROM grades
            WHERE student_id = ?
              AND subject_id = ?
              AND trimester = ?
          `,
          )
          .get(studentId, subjectId, trimester) as { id: number } | null;

        if (existente) {
          db.query(
            `
            UPDATE grades
            SET grade_1 = ?, grade_2 = ?, recovery = ?
            WHERE id = ?
          `,
          ).run(
            nota.grade1 ?? null,
            nota.grade2 ?? null,
            nota.recovery ?? null,
            existente.id,
          );
        } else {
          db.query(
            `
            INSERT INTO grades
              (student_id, subject_id, trimester,
               grade_1, grade_2, recovery)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          ).run(
            studentId,
            subjectId,
            trimester,
            nota.grade1 ?? null,
            nota.grade2 ?? null,
            nota.recovery ?? null,
          );
        }
      }

      return Response.json(
        { mensagem: "Notas salvas com sucesso!" },
        { headers: cabecalhos },
      );
    }

    // CONSULTAR NOTAS DO PROFESSOR
    if (url.pathname === "/notas" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const subjectId = Number(url.searchParams.get("subjectId"));

      if (!Number.isInteger(subjectId) || subjectId <= 0) {
        return respostaErro("ID da matéria inválido", 400);
      }

      const notas = db
        .query(
          `
        SELECT
          student_id AS studentId,
          trimester,
          grade_1 AS grade1,
          grade_2 AS grade2,
          recovery
        FROM grades
        WHERE subject_id = ?
        ORDER BY student_id, trimester
      `,
        )
        .all(subjectId);

      return Response.json(notas, { headers: cabecalhos });
    }

    // NOTAS DO ALUNO LOGADO
    if (url.pathname === "/minhas-notas" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "aluno") {
        return respostaErro("Acesso permitido somente para alunos", 403);
      }

      const aluno = db
        .query("SELECT id FROM students WHERE user_id = ?")
        .get(usuario.id) as { id: number } | null;

      if (!aluno) {
        return respostaErro("Aluno não encontrado", 404);
      }

      const notas = db
        .query(
          `
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
      `,
        )
        .all(aluno.id);

      return Response.json(notas, { headers: cabecalhos });
    }
    // GET /minhas-tarefas
    // BAIXAR ARQUIVO DE UMA ENTREGA
    if (req.method === "GET" && /^\/envios\/\d+\/arquivo$/.test(url.pathname)) {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso permitido somente para professores", 403);
      }

      const envioId = Number(url.pathname.split("/")[2]);

      const envio = db
        .query(
          `
    SELECT
      submissions.file_path,
      submissions.file_name
    FROM submissions
    JOIN tasks
      ON tasks.id = submissions.task_id
    JOIN teachers
      ON teachers.id = tasks.teacher_id
    WHERE submissions.id = ?
      AND teachers.user_id = ?
  `,
        )
        .get(envioId, usuario.id) as {
          file_path: string;
          file_name: string;
        } | null;

      if (!envio) {
        return respostaErro("Entrega não encontrada", 404);
      }

      const arquivo = Bun.file(envio.file_path);

      if (!(await arquivo.exists())) {
        return respostaErro("Arquivo não encontrado no servidor", 404);
      }

      const nomeSeguro = envio.file_name.replace(/["\r\n]/g, "_");

      return new Response(arquivo, {
        headers: {
          ...cabecalhos,
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${nomeSeguro}"`,
        },
      });
    }
    if (req.method === "GET" && url.pathname === "/minhas-tarefas") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "aluno") {
        return respostaErro("Acesso permitido somente para alunos", 403);
      }

      const tarefas = db
        .query(
          `
    SELECT
      tasks.id AS id,
      subjects.name AS materia,
      tasks.title AS titulo,
      tasks.description AS descricao,
      tasks.due_date AS dataEntrega,
      tasks.due_time AS horaEntrega,
      teachers.name AS professor
    FROM tasks
    JOIN subjects ON subjects.id = tasks.subject_id
    JOIN teachers ON teachers.id = tasks.teacher_id
    ORDER BY tasks.due_date ASC, tasks.due_time ASC
  `,
        )
        .all();

      return Response.json(tarefas, { headers: cabecalhos });
    }

    // PUBLICAR TAREFA
    if (url.pathname === "/tarefas" && req.method === "POST") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const professor = db
        .query("SELECT id FROM teachers WHERE user_id = ?")
        .get(usuario.id) as { id: number } | null;

      if (!professor) {
        return respostaErro("Cadastro do professor não encontrado", 404);
      }

      const dados = (await req.json()) as {
        subjectId: number;
        title: string;
        description: string;
        dueDate: string;
        dueTime: string;
      };

      const subjectId = Number(dados.subjectId);

      if (
        !Number.isInteger(subjectId) ||
        !dados.title?.trim() ||
        !dados.description?.trim() ||
        !dados.dueDate ||
        !dados.dueTime
      ) {
        return respostaErro("Preencha todos os campos corretamente", 400);
      }

      const materiaExiste = db
        .query("SELECT id FROM subjects WHERE id = ?")
        .get(subjectId);

      if (!materiaExiste) {
        return respostaErro("Matéria não encontrada", 400);
      }

      db.query(
        `
        INSERT INTO tasks
          (teacher_id, subject_id, title, description,
           due_date, due_time)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      ).run(
        professor.id,
        subjectId,
        dados.title.trim(),
        dados.description.trim(),
        dados.dueDate,
        dados.dueTime,
      );

      return Response.json(
        { mensagem: "Tarefa publicada com sucesso!" },
        { headers: cabecalhos },
      );
    }

    // LISTAR ENTREGAS DE UMA TAREFA
    if (req.method === "GET" && /^\/tarefas\/\d+\/envios$/.test(url.pathname)) {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const tarefaId = Number(url.pathname.split("/")[2]);

      const tarefa = db
        .query(
          `
        SELECT id FROM tasks
        WHERE id = ?
          AND teacher_id IN (
            SELECT id FROM teachers WHERE user_id = ?
          )
      `,
        )
        .get(tarefaId, usuario.id);

      if (!tarefa) {
        return respostaErro("Tarefa não encontrada", 404);
      }

      const envios = db
        .query(
          `
        SELECT
          submissions.id,
          students.name AS aluno,
          submissions.file_name AS arquivo,
          submissions.submitted_at AS enviadoEm
        FROM submissions
        JOIN students ON students.id = submissions.student_id
        WHERE submissions.task_id = ?
        ORDER BY submissions.submitted_at DESC
      `,
        )
        .all(tarefaId);

      return Response.json(envios, { headers: cabecalhos });
    }

    // LISTAR TAREFAS DO PROFESSOR LOGADO
    if (url.pathname === "/tarefas" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const tarefas = db
        .query(
          `
        SELECT
          tasks.id AS id,
          tasks.subject_id AS subjectId,
          subjects.name AS materia,
          tasks.title AS titulo,
          tasks.description AS descricao,
          tasks.due_date AS dataEntrega,
          tasks.due_time AS horaEntrega
        FROM tasks
        JOIN teachers ON teachers.id = tasks.teacher_id
        JOIN subjects ON subjects.id = tasks.subject_id
        WHERE teachers.user_id = ?
        ORDER BY tasks.due_date, tasks.due_time
      `,
        )
        .all(usuario.id);

      return Response.json(tarefas, { headers: cabecalhos });
    }

    // EDITAR TAREFA
    if (url.pathname.startsWith("/tarefas/") && req.method === "PUT") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const id = Number(url.pathname.split("/")[2]);

      if (!Number.isInteger(id) || id <= 0) {
        return respostaErro("ID da tarefa inválido", 400);
      }

      const dados = (await req.json()) as {
        subjectId: number;
        title: string;
        description: string;
        dueDate: string;
        dueTime: string;
      };

      const { subjectId, title, description, dueDate, dueTime } = dados;

      if (
        !Number.isInteger(Number(subjectId)) ||
        !title?.trim() ||
        !description?.trim() ||
        !dueDate ||
        !dueTime
      ) {
        return respostaErro("Preencha todos os campos", 400);
      }

      const tarefa = db
        .query(
          `
        SELECT tasks.id
        FROM tasks
        JOIN teachers ON teachers.id = tasks.teacher_id
        WHERE tasks.id = ? AND teachers.user_id = ?
      `,
        )
        .get(id, usuario.id);

      if (!tarefa) {
        return respostaErro("Tarefa não encontrada", 404);
      }

      const materiaExiste = db
        .query("SELECT id FROM subjects WHERE id = ?")
        .get(Number(subjectId));

      if (!materiaExiste) {
        return respostaErro("Matéria não encontrada", 400);
      }

      db.query(
        `
        UPDATE tasks
        SET subject_id = ?, title = ?, description = ?,
            due_date = ?, due_time = ?
        WHERE id = ?
      `,
      ).run(
        Number(subjectId),
        title.trim(),
        description.trim(),
        dueDate,
        dueTime,
        id,
      );

      return Response.json(
        { mensagem: "Tarefa atualizada com sucesso!" },
        { headers: cabecalhos },
      );
    }

    // EXCLUIR TAREFA
    if (url.pathname.startsWith("/tarefas/") && req.method === "DELETE") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const id = Number(url.pathname.split("/")[2]);

      if (!Number.isInteger(id) || id <= 0) {
        return respostaErro("ID da tarefa inválido", 400);
      }

      const resultado = db
        .query(
          `
        DELETE FROM tasks
        WHERE id = ?
          AND teacher_id IN (
            SELECT id FROM teachers WHERE user_id = ?
          )
      `,
        )
        .run(id, usuario.id);

      if (resultado.changes === 0) {
        return respostaErro("Tarefa não encontrada", 404);
      }

      return Response.json(
        { mensagem: "Tarefa excluída com sucesso!" },
        { headers: cabecalhos },
      );
    }


    // PUBLICAR PROVA
    if (url.pathname === "/provas" && req.method === "POST") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const professor = db
        .query("SELECT id FROM teachers WHERE user_id = ?")
        .get(usuario.id) as { id: number } | null;

      if (!professor) {
        return respostaErro("Cadastro do professor não encontrado", 404);
      }

      const dados = (await req.json()) as {
        subjectId: number;
        title: string;
        date: string;
        time: string;
      };

      const subjectId = Number(dados.subjectId);

      if (
        !Number.isInteger(subjectId) ||
        subjectId <= 0 ||
        !dados.title?.trim() ||
        !dados.date ||
        !dados.time
      ) {
        return respostaErro("Preencha todos os campos corretamente", 400);
      }

      const materiaExiste = db
        .query("SELECT id FROM subjects WHERE id = ?")
        .get(subjectId);

      if (!materiaExiste) {
        return respostaErro("Matéria não encontrada", 400);
      }

      // Validar formato dos campos de data e horário.
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(dados.date) ||
        !/^\d{2}:\d{2}$/.test(dados.time)
      ) {
        return respostaErro("Data ou horário inválido", 400);
      }

      db.query(`
        INSERT INTO tests (teacher_id, subject_id, title, date, time)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        professor.id,
        subjectId,
        dados.title.trim(),
        dados.date,
        dados.time
      );

      return Response.json(
        { mensagem: "Prova publicada com sucesso!" },
        { headers: cabecalhos }
      );
    }

    // LISTAR PROVAS DO PROFESSOR LOGADO
    if (url.pathname === "/provas" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const provas = db.query(`
        SELECT
          tests.id AS id,
          tests.subject_id AS subjectId,
          subjects.name AS materia,
          tests.title AS titulo,
          tests.date AS data,
          tests.time AS horario
        FROM tests
        JOIN subjects ON subjects.id = tests.subject_id
        JOIN teachers ON teachers.id = tests.teacher_id
        WHERE teachers.user_id = ?
        ORDER BY tests.date, tests.time
      `).all(usuario.id);

      return Response.json(provas, { headers: cabecalhos });
    }

    // LISTAR PROVAS PARA O ALUNO LOGADO
    if (url.pathname === "/minhas-provas" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "aluno") {
        return respostaErro("Acesso permitido somente para alunos", 403);
      }

      const provas = db.query(`
        SELECT
          tests.id AS id,
          subjects.name AS materia,
          tests.title AS titulo,
          tests.date AS data,
          tests.time AS horario
        FROM tests
        JOIN subjects ON subjects.id = tests.subject_id
        ORDER BY tests.date, tests.time
      `).all();

      return Response.json(provas, { headers: cabecalhos });
    }


    // PUBLICAR PROVA
    if (url.pathname === "/provas" && req.method === "POST") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const professor = db
        .query("SELECT id FROM teachers WHERE user_id = ?")
        .get(usuario.id) as { id: number } | null;

      if (!professor) {
        return respostaErro("Cadastro do professor não encontrado", 404);
      }

      const dados = (await req.json()) as {
        subjectId: number;
        title: string;
        date: string;
        time: string;
      };

      const subjectId = Number(dados.subjectId);

      if (
        !Number.isInteger(subjectId) ||
        subjectId <= 0 ||
        !dados.title?.trim() ||
        !dados.date ||
        !dados.time
      ) {
        return respostaErro("Preencha todos os campos corretamente", 400);
      }

      const materiaExiste = db
        .query("SELECT id FROM subjects WHERE id = ?")
        .get(subjectId);

      if (!materiaExiste) {
        return respostaErro("Matéria não encontrada", 400);
      }

      // Validar formato dos campos de data e horário.
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(dados.date) ||
        !/^\d{2}:\d{2}$/.test(dados.time)
      ) {
        return respostaErro("Data ou horário inválido", 400);
      }

      db.query(`
        INSERT INTO tests (teacher_id, subject_id, title, date, time)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        professor.id,
        subjectId,
        dados.title.trim(),
        dados.date,
        dados.time
      );

      return Response.json(
        { mensagem: "Prova publicada com sucesso!" },
        { headers: cabecalhos }
      );
    }

    // LISTAR PROVAS DO PROFESSOR LOGADO
    if (url.pathname === "/provas" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const provas = db.query(`
        SELECT
          tests.id AS id,
          tests.subject_id AS subjectId,
          subjects.name AS materia,
          tests.title AS titulo,
          tests.date AS data,
          tests.time AS horario
        FROM tests
        JOIN subjects ON subjects.id = tests.subject_id
        JOIN teachers ON teachers.id = tests.teacher_id
        WHERE teachers.user_id = ?
        ORDER BY tests.date, tests.time
      `).all(usuario.id);

      return Response.json(provas, { headers: cabecalhos });
    }

    // LISTAR PROVAS PARA O ALUNO LOGADO
    if (url.pathname === "/minhas-provas" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "aluno") {
        return respostaErro("Acesso permitido somente para alunos", 403);
      }

      const provas = db.query(`
        SELECT
          tests.id AS id,
          subjects.name AS materia,
          tests.title AS titulo,
          tests.date AS data,
          tests.time AS horario
        FROM tests
        JOIN subjects ON subjects.id = tests.subject_id
        ORDER BY tests.date, tests.time
      `).all();

      return Response.json(provas, { headers: cabecalhos });
    }


    // EDITAR PROVA
    if (
      /^\/provas\/\d+$/.test(url.pathname) &&
      req.method === "PUT"
    ) {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso permitido somente para professores", 403);
      }

      const id = Number(url.pathname.split("/")[2]);

      const dados = await req.json() as {
        subjectId: number;
        title: string;
        date: string;
        time: string;
      };

      const subjectId = Number(dados.subjectId);
      const titulo = dados.title?.trim();
      const data = dados.date;
      const horario = dados.time;

      if (
        !Number.isInteger(id) ||
        id <= 0 ||
        !Number.isInteger(subjectId) ||
        subjectId <= 0 ||
        !titulo ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data || "") ||
        !/^\d{2}:\d{2}$/.test(horario || "")
      ) {
        return respostaErro("Preencha os dados da prova corretamente", 400);
      }

      // Confere se a prova pertence ao professor autenticado
      const prova = db.query(`
        SELECT tests.id
        FROM tests
        JOIN teachers ON teachers.id = tests.teacher_id
        WHERE tests.id = ?
          AND teachers.user_id = ?
      `).get(id, usuario.id);

      if (!prova) {
        return respostaErro("Prova não encontrada", 404);
      }

      const materia = db.query(
        "SELECT id FROM subjects WHERE id = ?"
      ).get(subjectId);

      if (!materia) {
        return respostaErro("Matéria não encontrada", 400);
      }

      db.query(`
        UPDATE tests
        SET subject_id = ?,
            title = ?,
            date = ?,
            time = ?
        WHERE id = ?
          AND teacher_id IN (
            SELECT id FROM teachers WHERE user_id = ?
          )
      `).run(
        subjectId,
        titulo,
        data,
        horario,
        id,
        usuario.id
      );

      return Response.json(
        { mensagem: "Prova atualizada com sucesso!" },
        { headers: cabecalhos }
      );
    }

    // EXCLUIR PROVA
    if (
      /^\/provas\/\d+$/.test(url.pathname) &&
      req.method === "DELETE"
    ) {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso permitido somente para professores", 403);
      }

      const id = Number(url.pathname.split("/")[2]);

      if (!Number.isInteger(id) || id <= 0) {
        return respostaErro("ID da prova inválido", 400);
      }

      const resultado = db.query(`
        DELETE FROM tests
        WHERE id = ?
          AND teacher_id IN (
            SELECT id FROM teachers WHERE user_id = ?
          )
      `).run(id, usuario.id);

      if (resultado.changes === 0) {
        return respostaErro("Prova não encontrada", 404);
      }

      return Response.json(
        { mensagem: "Prova excluída com sucesso!" },
        { headers: cabecalhos }
      );
    }


    // LISTAR COMUNICADOS DO PROFESSOR LOGADO
    if (url.pathname === "/comunicados" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado. Faça login novamente.", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const comunicados = db.query(`
  SELECT
    announcements.id AS id,
    announcements.title AS title,
    announcements.content AS content,
    announcements.published_at AS published_at,
    teachers.name AS professor
  FROM announcements
  JOIN teachers
    ON teachers.id = announcements.teacher_id
  ORDER BY announcements.published_at DESC
`).all();

      return Response.json(comunicados, { headers: cabecalhos });
    }

    // PUBLICAR COMUNICADO
    if (url.pathname === "/comunicados" && req.method === "POST") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado. Faça login novamente.", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const professor = db
        .query("SELECT id FROM teachers WHERE user_id = ?")
        .get(usuario.id) as { id: number } | null;

      if (!professor) {
        return respostaErro("Cadastro do professor não encontrado", 404);
      }
      let dados: { title: string; content: string };

      try {
        dados = await req.json();
      } catch {
        return respostaErro("JSON inválido", 400);
      }

      const title = dados.title?.trim();
      const content = dados.content?.trim();

      if (!title || !content) {
        return respostaErro("Preencha o título e o conteúdo do comunicado", 400);
      }

      if (title.length > 150 || content.length > 5000) {
        return respostaErro("O título ou conteúdo excede o limite permitido", 400);
      }

      const publicadoEm = new Date().toISOString();

      const resultado = db.query(`
        INSERT INTO announcements
          (teacher_id, title, content, published_at)
        VALUES (?, ?, ?, ?)
      `).run(professor.id, title, content, publicadoEm);

      return Response.json(
        {
          mensagem: "Comunicado publicado com sucesso!",
          id: Number(resultado.lastInsertRowid),
        },
        {
          status: 201,
          headers: cabecalhos,
        },
      );
    }

    // EDITAR COMUNICADO
    if (
      url.pathname.startsWith("/comunicados/") &&
      req.method === "PUT"
    ) {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado. Faça login novamente.", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const id = Number(url.pathname.split("/")[2]);

      if (!Number.isInteger(id) || id <= 0) {
        return respostaErro("ID do comunicado inválido", 400);
      }

      let dados: { title: string; content: string };

      try {
        dados = await req.json();
      } catch {
        return respostaErro("JSON inválido", 400);
      }

      const title = dados.title?.trim();
      const content = dados.content?.trim();

      if (!title || !content) {
        return respostaErro("Preencha o título e o conteúdo do comunicado", 400);
      }

      if (title.length > 150 || content.length > 5000) {
        return respostaErro("O título ou conteúdo excede o limite permitido", 400);
      }

      const resultado = db.query(`
        UPDATE announcements
        SET title = ?, content = ?
        WHERE id = ?
          AND teacher_id IN (
            SELECT id FROM teachers WHERE user_id = ?
          )
      `).run(title, content, id, usuario.id);

      if (resultado.changes === 0) {
        return respostaErro("Comunicado não encontrado", 404);
      }

      return Response.json(
        { mensagem: "Comunicado atualizado com sucesso!" },
        { headers: cabecalhos },
      );
    }

    // EXCLUIR COMUNICADO
    if (
      url.pathname.startsWith("/comunicados/") &&
      req.method === "DELETE"
    ) {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado. Faça login novamente.", 401);
      }

      if (usuario.role !== "professor") {
        return respostaErro("Acesso negado", 403);
      }

      const id = Number(url.pathname.split("/")[2]);

      if (!Number.isInteger(id) || id <= 0) {
        return respostaErro("ID do comunicado inválido", 400);
      }

      const resultado = db.query(`
        DELETE FROM announcements
        WHERE id = ?
          AND teacher_id IN (
            SELECT id FROM teachers WHERE user_id = ?
          )
      `).run(id, usuario.id);

      if (resultado.changes === 0) {
        return respostaErro("Comunicado não encontrado", 404);
      }

      return Response.json(
        { mensagem: "Comunicado excluído com sucesso!" },
        { headers: cabecalhos },
      );
    }

    // LISTAR COMUNICADOS PARA OS ALUNOS
    if (url.pathname === "/aluno/comunicados" && req.method === "GET") {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return respostaErro("Não autenticado. Faça login novamente.", 401);
      }

      if (usuario.role !== "aluno") {
        return respostaErro("Acesso permitido somente para alunos", 403);
      }

      const comunicados = db.query(`
    SELECT
      announcements.id AS id,
      announcements.title AS title,
      announcements.content AS content,
      announcements.published_at AS published_at,
      teachers.name AS professor
    FROM announcements
    JOIN teachers
      ON teachers.id = announcements.teacher_id
    JOIN users
      ON users.id = teachers.user_id
    ORDER BY announcements.published_at DESC
  `).all();

      return Response.json(comunicados, {
        headers: cabecalhos,
      });
    }

    // LOGOUT — ENCERRAR SESSÃO
    if (url.pathname === "/logout" && req.method === "POST") {
      const cookie = req.headers.get("cookie");

      const idSessao = cookie
        ?.split(";")
        .map((parte) => parte.trim())
        .find((parte) => parte.startsWith("sessao="))
        ?.slice("sessao=".length);

      // Remove a sessão da memória do servidor
      if (idSessao) {
        sessoes.delete(idSessao);
      }

      // Expira o cookie no navegador
      return Response.json(
        { mensagem: "Logout realizado com sucesso!" },
        {
          headers: {
            ...cabecalhos,
            "Set-Cookie":
              "sessao=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0",
          },
        },
      );
    }

    // ROTA PADRÃO
    // SERVIR O FRONTEND
    const pastaFrontend = resolve(import.meta.dir, "..");

    console.log("Pasta do frontend:", pastaFrontend);
    console.log(
      "Index encontrado:",
      await Bun.file(resolve(pastaFrontend, "index.html")).exists(),
    );

    const caminhoSolicitado =
      url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);

    const caminhoArquivo = resolve(pastaFrontend, `.${caminhoSolicitado}`);

    // Impede acesso a arquivos fora da pasta frontend
    if (
      caminhoArquivo !== pastaFrontend &&
      !caminhoArquivo.startsWith(pastaFrontend + sep)
    ) {
      return new Response("Acesso negado", {
        status: 403,
        headers: cabecalhos,
      });
    }
    // BLOQUEAR ACESSO AOS ARQUIVOS INTERNOS DO BACKEND
    if (
      caminhoSolicitado === "/backend" ||
      caminhoSolicitado.startsWith("/backend/")
    ) {
      return new Response("Acesso negado", {
        status: 403,
        headers: cabecalhos,
      });
    }
    // PROTEGER AS PÁGINAS DE CADA PERFIL

    // PROTEGER AS PÁGINAS DE CADA PERFIL
    const caminhoProfessor =
      caminhoSolicitado.startsWith("/professores/") ||
      caminhoSolicitado.startsWith("/frontend/professores/");

    const caminhoAluno =
      caminhoSolicitado.startsWith("/alunos/") ||
      caminhoSolicitado.startsWith("/frontend/alunos/");

    if (caminhoProfessor || caminhoAluno) {
      const usuario = buscarUsuario(req);

      if (!usuario) {
        return Response.redirect(new URL("/", req.url), 302);
      }

      if (caminhoProfessor && usuario.role !== "professor") {
        return Response.redirect(new URL("/frontend/alunos/aluno.html", req.url), 302);
      }

      if (caminhoAluno && usuario.role !== "aluno") {
        return Response.redirect(
          new URL("frontend/professores/professor.html", req.url),
          302,
        );
      }
    }

    const arquivo = Bun.file(caminhoArquivo);

    if (await arquivo.exists()) {
      return new Response(arquivo, {
        headers: cabecalhos,
      });
    }

    return new Response("Página não encontrada", {
      status: 404,
      headers: cabecalhos,
    });
  },
});

console.log("Servidor rodando em http://localhost:3000");
