const bcrypt = require("bcrypt");
const db = require("./database");

async function createAdmin() {
  const password = await bcrypt.hash("123456", 10);

  db.run(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    ["amira", password, "teacher"],
    function (err) {
      if (err) {
        console.log("Error:", err.message);
      } else {
        console.log("Teacher Created");
      }

      db.close();
    }
  );
}

createAdmin();