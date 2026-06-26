const db = require("./database");

db.get(
  "SELECT username, role FROM users WHERE username='admin'",
  (err,row)=>{
    console.log(row);
  }
);