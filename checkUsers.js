const db = require("./database");

db.all("SELECT id, username, role FROM users", (err, rows) => {
  console.log(rows);
});