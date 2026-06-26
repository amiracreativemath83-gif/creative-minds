const db = require("./database");

db.serialize(() => {

  console.log("🔄 SEED STARTING...");

  // ================= CLEAN TABLES =================


  db.run(`
CREATE TABLE IF NOT EXISTS homepage_ads (
  id INTEGER PRIMARY KEY,
  video_filename TEXT,
  image_filename TEXT
)
`);

db.run(`
INSERT OR IGNORE INTO homepage_ads
(id, video_filename, image_filename)
VALUES (1, '', '')
`);  



  db.run("DELETE FROM subject_offerings");
  db.run("DELETE FROM subjects");

  const subjects = ["Math"];

  subjects.forEach((name) => {

    // ================= INSERT SUBJECT =================
    db.run(
      "INSERT INTO subjects (name) VALUES (?)",
      [name],
      function (err) {

        if (err) {
          return console.log("❌ Subject seed error:", err.message);
        }

        const subjectId = this.lastID;

        console.log(`✔ Inserted subject: ${name} (ID: ${subjectId})`);

        // ================= PRIMARY 1 → 6 =================
        for (let g = 1; g <= 6; g++) {
          db.run(
            `INSERT INTO subject_offerings (subject_id, stage, grade)
             VALUES (?, 'Primary', ?)`,
            [subjectId, String(g)]
          );
        }

        // ================= PREP 1 → 3 =================
        for (let g = 1; g <= 3; g++) {
          db.run(
            `INSERT INTO subject_offerings (subject_id, stage, grade)
             VALUES (?, 'Prep', ?)`,
            [subjectId, String(g)]
          );
        }

        console.log(`✔ Offerings created for ${name}`);
      }
    );

  });

});