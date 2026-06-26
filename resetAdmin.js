const db = require("./database");
const bcrypt = require("bcrypt");

async function run() {

  const hash = await bcrypt.hash("123456", 10);

  db.run(
    "UPDATE users SET password=? WHERE username='admin'",
    [hash],
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Admin password reset");
      }
      process.exit();
    }
  );
}

run();