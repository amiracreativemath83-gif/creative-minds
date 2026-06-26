const db = require("./database");

const subjects = ["Math", "English", "Arabic"];

db.serialize(() => {

  subjects.forEach(name => {
    db.run(
      "INSERT OR IGNORE INTO subjects (name) VALUES (?)",
      [name],
      (err) => {
        if (err) {
          console.log("Seed error:", err.message);
        }
      }
    );
  });

  console.log("Clean subjects seeded ✔");

});