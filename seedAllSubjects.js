const db = require("./database");

const subjectsPrimary = ["Math", "English", "Arabic"];
const subjectsPrep = ["Math", "English", "Arabic"];

// ================= PRIMARY 1 - 6 =================
for (let grade = 1; grade <= 6; grade++) {
  subjectsPrimary.forEach(name => {
    db.run(
      "INSERT INTO subjects (name, stage, grade) VALUES (?, ?, ?)",
      [name, "Primary", String(grade)]
    );
  });
}

// ================= PREP 1 - 3 =================
for (let grade = 1; grade <= 3; grade++) {
  subjectsPrep.forEach(name => {
    db.run(
      "INSERT INTO subjects (name, stage, grade) VALUES (?, ?, ?)",
      [name, "Prep", String(grade)]
    );
  });
}

console.log("ALL SUBJECTS SEEDED SUCCESSFULLY");