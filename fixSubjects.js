const db = require("./database");

db.serialize(() => {
  db.run("DELETE FROM subjects", () => {
    db.run("student_id (name) VALUES (?)", ["Math"]);
    db.run("INSERT INTO subjects (name) VALUES (?)", ["English"]);
    db.run("INSERT INTO subjects (name) VALUES (?)", ["Arabic"]);

    console.log("Subjects reset done");
  });
});