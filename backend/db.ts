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
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('yasmin@sigma.com', '123456', 'aluno')
`);

db.run(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('lucas@sigma.com', '123456', 'aluno')
`);

db.run(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('samuel.lino@sigma.com', '123456', 'aluno')
`);

db.run(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('neymar@sigma.com', '123456', 'aluno')
`);

db.run(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('arrascaeta@sigma.com', '123456', 'aluno')
`);

db.run(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('daniel@sigma.com', '123456', 'aluno')
`);

db.run(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('andre@sigma.com', '123456', 'aluno')
`);

db.run(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('cleosbaldo@sigma.com', '123456', 'professor')
`);

db.run(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('felipe@sigma.com', '123456', 'professor')
`);

db.run(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('samuel.prof@sigma.com', '123456', 'professor')
`);

db.run(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('marcia@sigma.com', '123456', 'professor')
`);

db.run(`
  INSERT OR IGNORE INTO users (email, password, role)
  VALUES ('joao@sigma.com', '123456', 'professor')
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
    ('Língua Portuguesa'),
    ('Matemática')
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

db.run(`
  INSERT INTO students (user_id, name)
  SELECT id, 'Yasmin Conti' FROM users WHERE email = 'yasmin@sigma.com'
  AND NOT EXISTS (
    SELECT 1 FROM students
    WHERE user_id = (SELECT id FROM users WHERE email = 'yasmin@sigma.com')
  )
`);

db.run(`
  INSERT INTO students (user_id, name)
  SELECT id, 'Lucas Gabriel Conti' FROM users WHERE email = 'lucas@sigma.com'
  AND NOT EXISTS (
    SELECT 1 FROM students
    WHERE user_id = (SELECT id FROM users WHERE email = 'lucas@sigma.com')
  )
`);


db.run(`
  INSERT INTO students (user_id, name)
  SELECT id, 'Samuel Lino' FROM users WHERE email = 'samuel.lino@sigma.com'
  AND NOT EXISTS (
    SELECT 1 FROM students
    WHERE user_id = (SELECT id FROM users WHERE email = 'samuel.lino@sigma.com')
  )
`);

db.run(`
  INSERT INTO students (user_id, name)
  SELECT id, 'Neymar' FROM users WHERE email = 'neymar@sigma.com'
  AND NOT EXISTS (
    SELECT 1 FROM students
    WHERE user_id = (SELECT id FROM users WHERE email = 'neymar@sigma.com')
  )
`);

db.run(`
  INSERT INTO students (user_id, name)
  SELECT id, 'Arrascaeta' FROM users WHERE email = 'arrascaeta@sigma.com'
  AND NOT EXISTS (
    SELECT 1 FROM students
    WHERE user_id = (SELECT id FROM users WHERE email = 'arrascaeta@sigma.com')
  )
`);

db.run(`
  INSERT INTO students (user_id, name)
  SELECT id, 'Daniel' FROM users WHERE email = 'daniel@sigma.com'
  AND NOT EXISTS (
    SELECT 1 FROM students
    WHERE user_id = (SELECT id FROM users WHERE email = 'daniel@sigma.com')
  )
`);

db.run(`
  INSERT INTO students (user_id, name)
  SELECT id, 'André' FROM users WHERE email = 'andre@sigma.com'
  AND NOT EXISTS (
    SELECT 1 FROM students
    WHERE user_id = (SELECT id FROM users WHERE email = 'andre@sigma.com')
  )
`);

