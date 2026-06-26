const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./school.db");

db.serialize(() => {

  console.log("🔄 DATABASE INIT STARTED...");

  // ================= USERS (لازم أول شيء) =================
  db.run(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    homework_id INTEGER,
    filename TEXT,
    grade INTEGER
  )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      phone TEXT,
      stage TEXT,
      grade TEXT
    )
  `);

  // ================= ABOUT =================
  db.run(`
    CREATE TABLE IF NOT EXISTS about (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      filename TEXT
    )
  `);

  // ================= ADS =================
  db.run(`
    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      filename TEXT,
      title TEXT,
      description TEXT
    )
  `);

  // ================= SUBJECTS =================
  db.run(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
    )
  `);

  // ================= SUBJECT OFFERINGS =================
  db.run(`
    CREATE TABLE IF NOT EXISTS subject_offerings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER,
      stage TEXT,
      grade TEXT,
      UNIQUE(subject_id, stage, grade)
      
    )
  `);

  // ================= SUBJECT CONTENT =================
  db.run(`
    CREATE TABLE IF NOT EXISTS subject_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER,
  stage TEXT,
  grade TEXT,
  type TEXT,
  title TEXT,
  filename TEXT,
  description TEXT
);


  `);
///db.run(`ALTER TABLE subject_content ADD COLUMN stage TEXT`);
///db.run(`ALTER TABLE subject_content ADD COLUMN grade TEXT`);
  // ================= ADMIN SEED (صح) =================
  db.get(
    "SELECT * FROM users WHERE username = ?",
    ["admin"],
    (err, row) => {

      if (err) return console.log(err);

      if (!row) {
        db.run(
          "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
          ["admin", "1234", "admin"],
          (err) => {
            if (err) console.log(err);
            else console.log("✔ Admin created");
          }
        );
      } else {
        console.log("✔ Admin already exists");
      }
    }
  );

  // ================= SUBJECT SEED =================
  db.get("SELECT COUNT(*) AS count FROM subjects", (err, row) => {

    if (row.count === 0) {

      db.run(`INSERT INTO subjects (name) VALUES ('Math')`);

      db.run(`INSERT INTO subject_offerings (subject_id, stage, grade) VALUES (1, 'Primary', '1')`);
      db.run(`INSERT INTO subject_offerings (subject_id, stage, grade) VALUES (1, 'Primary', '2')`);
      db.run(`INSERT INTO subject_offerings (subject_id, stage, grade) VALUES (1, 'Primary', '3')`);

      db.run(`INSERT INTO subject_offerings (subject_id, stage, grade) VALUES (1, 'Upper Primary', '4')`);
      db.run(`INSERT INTO subject_offerings (subject_id, stage, grade) VALUES (1, 'Upper Primary', '5')`);
      db.run(`INSERT INTO subject_offerings (subject_id, stage, grade) VALUES (1, 'Upper Primary', '6')`);

      db.run(`INSERT INTO subject_offerings (subject_id, stage, grade) VALUES (1, 'Prep', '1')`);
      db.run(`INSERT INTO subject_offerings (subject_id, stage, grade) VALUES (1, 'Prep', '2')`);
      db.run(`INSERT INTO subject_offerings (subject_id, stage, grade) VALUES (1, 'Prep', '3')`);

      console.log("✔ Seed data inserted");
    }
  });

  console.log("✔ DATABASE READY SUCCESSFULLY");

});

module.exports = db;