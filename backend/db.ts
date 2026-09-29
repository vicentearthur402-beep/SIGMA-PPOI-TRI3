import { Database } from "bun:sqlite";

export const db = new Database("backend/database.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    role text NOT NULL
)
    `);

db.run(`
  CREATE TABLE IF NOT EXISTS students(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS teachers(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS subjects(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`);

db.run(`
  INSERT OR IGNORE INTO subjects (name) VALUES
    ('Artes'),
    ('Biologia'),
    ('Educação Física'),
    ('Filosofia'),
    ('Física'),
    ('Geografia'),
    ('História'),
    ('Língua Portuguesa'),
    ('Matemática'),
    ('Química'),
    ('Sociologia'),
    ('Programação'),
    ('Banco de Dados'),
    ('Engenharia de Software'),
    ('Redes de Computadores'),
    ('Prática Profissionalizante Orientada'),
    ('Inglês'),
    ('Python')
`);

db.run(`
  CREATE TABLE IF NOT EXISTS grades(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    trimester INTEGER NOT NULL,
    grade_1 REAL,
    grade_2 REAL,
    recovery REAL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS tasks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TEXT NOT NULL,
    due_time TEXT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS submissions(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS tests(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS announcements(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at TEXT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
  )
`);