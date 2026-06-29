console.log("🔥 THIS FILE IS RUNNING");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const multer = require("multer");
const db = require("./database");

const app = express();





console.log("RUNNING SERVER FROM:", __dirname);

// ================= MULTER STORAGE =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>


    cb(null, Date.now() + "-" + file.originalname)
});

// ================= MULTER FILTER =================
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"   // ✅ أضفنا PDF
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image or video  or pdf allowed"), false);
  }
};

// ================= FINAL UPLOAD (ONLY ONCE) =================
const upload = multer({
  storage,
  fileFilter
});



// ================= BASIC =================
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "secret123",
  resave: false,
  saveUninitialized: false
}));
app.use("/uploads", express.static("uploads"));



// ================= delet users test  =================

///////////////////////// creat admin   =======================
app.get("/create-admin", async (req, res) => {

const hash = bcrypt.hashSync("admin123", 10);
  db.run(
    "INSERT INTO users (username, password, role) VALUES (?,?,?)",
    ["admin", hash, "admin"],
    (err) => {
      if (err) return res.send(err.message);

      res.send("✅ Admin created: admin / admin123");
    }
  );

});

app.get("/fix-admin", async (req, res) => {

  const hash = await bcrypt.hash("admin123", 10);

  db.run(
    "UPDATE users SET password = ?, role = 'admin' WHERE username = 'admin'",
    [hash],
    (err) => {
      if (err) return res.send(err.message);

      res.send("✅ Admin reset done → admin / admin123");
    }
  );

});
// ================= UI (UPDATED ONLY - LABELS + LIGHT DESIGN) =================
const ui = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #f8fafc, #e0f2fe);
  color: #0f172a;
}

/* container */
.container {
  max-width: 1000px;
  margin: auto;
  padding: 40px;
}

/* cards */
.card {
  background: white;
  padding: 25px;
  margin: 20px 0;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

/* BIG BUTTONS */
.btn {
  display: block;
  width: 100%;
  text-align: center;
  padding: 20px;
  margin: 15px 0;
  font-size: 22px;
  font-weight: bold;
  border-radius: 16px;
  text-decoration: none;
  color: white;
  transition: 0.3s;
}

.btn-login {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
}

.btn-create {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.btn:hover {
  transform: scale(1.03);
  opacity: 0.95;
}

/* inputs */
input, select {
  width: 100%;
  padding: 14px;
  margin: 10px 0;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 16px;
}

.about-media {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-media img,
.about-media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}
/* button */
button {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.video-card {
  width: 100%;
  max-width: 600px;
  margin: 15px auto;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.video-card video {
  width: 100%;
  height: 320px;
  object-fit: cover;
  display: block;
}

/* labels (NEW IMPORTANT PART) */
label {
  display: block;
  margin-top: 12px;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.section-btns {
  display: flex;
  gap: 12px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.video-player {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
}

/* video ad */
.ad-video {
  width: 100%;
  max-height: 450px;
  border-radius: 16px;
  margin-top: 10px;
  object-fit: cover;
}

h1 {
  font-size: 38px;
  margin-bottom: 10px;
}
.topbar {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 999;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  padding: 15px 25px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.logo {
  font-size: 22px;
  font-weight: bold;
  color: white;
}
</style>

`;
const navbar = `
<header class="topbar">
  <div class="logo">
    🎓 Creative Minds
  </div>
</header>
`;
// ================= MIDDLEWARE =================


function teacher(req, res, next) {
  if (!req.session.user) return res.redirect("/start");

  if (req.session.user.role !== "teacher") {
    return res.status(403).send("Teachers only");
  }

  next();
}
function admin(req, res, next) {
  if (!req.session.user) return res.redirect("/start");

  if (req.session.user.role !== "admin") {
    return res.status(403).send("Admins only");
  }

  next();
}
function auth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}
// =================protect  UPLOAD VIDEO =================
const path = require("path");
app.get("/video/:filename", auth, (req, res) => {

  const user = req.session.user;

  db.get(
    "SELECT * FROM subject_content WHERE filename = ? AND type='video'",
    [req.params.filename],
    (err, video) => {

      if (err) return res.status(500).send("DB Error");

      if (!video) return res.status(404).send("Video not found");

      // 🔐 حماية الطلاب
      if (
        user.role === "student" &&
        (video.stage !== user.stage || video.grade !== user.grade)
      ) {
        return res.status(403).send("Access denied");
      }

      const filePath = path.join(__dirname, "uploads", req.params.filename);
      res.sendFile(filePath);
    }
  );
});
// ================= UPLOAD VIDEO =================

function validateStageGrade(stage, grade) {

  const valid = {
    "Prep": ["Prep 1", "Prep 2", "Prep 3"],
    "Primary": ["1", "2", "3", "4", "5", "6"],
    "Upper Primary": ["1", "2", "3", "4", "5", "6"]
  };

  return valid[stage]?.includes(grade);
}
app.get("/upload-video", teacher, (req, res) => {

  db.all("SELECT * FROM subjects", (err, subjects) => {
    if (err) return res.send("DB Error");

    res.send(`
      <html>
      <head>${ui}</head>
      <body>
      ${navbar}

        <div class="container">

          <h1>📹 Upload Video</h1>

          <div class="card">
            <form method="POST" action="/upload-video" enctype="multipart/form-data">

              <label>Video Title</label>
              <input name="title" required />

              <label>Select Subject</label>
              <select name="subject_id" required>
                ${subjects.map(s => `
                  <option value="${s.id}">
                    ${s.name}
                  </option>
                `).join("")}
              </select>

              <label>Select Grade</label>
              <select name="grade" required>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Prep 1">Prep 1</option>
                <option value="Prep 2">Prep 2</option>
                <option value="Prep 3">Prep 3</option>
              </select>

              <label>Video File</label>
              <input type="file" name="video" required />

              <button>Upload</button>

            </form>
          </div>

        </div>
      </body>
      </html>
    `);
  });

});

app.post("/upload-video", teacher, upload.single("video"), (req, res) => {

  const grade = req.body.grade?.trim();

  let stage = "";

  if (grade.startsWith("Prep")) {
    stage = "Prep";
  } else {
    const gradeNumber = parseInt(grade);

    if (gradeNumber >= 1 && gradeNumber <= 3) {
      stage = "Primary";
    } else if (gradeNumber >= 4 && gradeNumber <= 6) {
      stage = "Upper Primary";
    }
  }

  if (!validateStageGrade(stage, grade)) {
    return res.send("Invalid stage or grade");
  }

  db.run(`
    INSERT INTO subject_content
    (subject_id, stage, grade, type, title, filename, description)
    VALUES (?,?,?,?,?,?,?)
  `, [
    req.body.subject_id,
    stage,
    grade,
    "video",
    req.body.title,
    req.file?.filename || null,
    req.body.description || null
  ], (err) => {

    if (err) {
      console.log(err);
      return res.send("DB error");
    }

    res.redirect("/upload-video");

  });

});
// ================= UPLOAD SHEET =================
app.get("/upload-sheet", teacher, (req, res) => {

  db.all("SELECT * FROM subjects", (err, subjects) => {
    if (err) return res.send("DB Error");

    const options = subjects.map(s => `
      <option value="${s.id}">
        ${s.name} - Grade ${s.grade} (${s.stage})
      </option>
    `).join("");

    res.send(`
      <html>
      <head>${ui}</head>
      <body>
                   ${navbar}

        <div class="container">

          <h1>📄 Upload Sheet</h1>

          <div class="card">
            <form method="POST" action="/upload-sheet" enctype="multipart/form-data">

              <label>Title</label>
              <input name="title" required />

              <label>Select Subject</label>
<select name="subject_id" required>
  ${subjects.map(s => `
    <option value="${s.id}">
      ${s.name}
    </option>
  `).join("")}
</select>

<label>Select Grade</label>
<select name="grade" required>
  <option value="1">Grade 1</option>
  <option value="2">Grade 2</option>
  <option value="3">Grade 3</option>
  <option value="4">Grade 4</option>
  <option value="5">Grade 5</option>
  <option value="6">Grade 6</option>
  <option value="Prep 1">Prep 1</option>
  <option value="Prep 2">Prep 2</option>
  <option value="Prep 3">Prep 3</option>
</select>

              <label>File</label>
              <input type="file" name="sheet" required />

              <button>Upload</button>

            </form>
          </div>

        </div>

      </body>
      </html>
    `);
  });

});
app.post("/upload-sheet", teacher, upload.single("sheet"), (req, res) => {

  const grade = req.body.grade?.trim();

  let stage = "";

  if (grade.startsWith("Prep")) {
    stage = "Prep";
  } else {
    const gradeNumber = parseInt(grade);

    if (gradeNumber >= 1 && gradeNumber <= 3) {
      stage = "Primary";
    } else if (gradeNumber >= 4 && gradeNumber <= 6) {
      stage = "Upper Primary";
    }
  }

  if (!validateStageGrade(stage, grade)) {
    return res.send("Invalid stage or grade");
  }

  db.run(`
    INSERT INTO subject_content
    (subject_id, stage, grade, type, title, filename, description)
    VALUES (?,?,?,?,?,?,?)
  `, [
    req.body.subject_id,
    stage,
    grade,
    "sheet",
    req.body.title,
    req.file?.filename || null,
    req.body.description || null
  ], (err) => {

    if (err) {
      console.log(err);
      return res.send("DB error");
    }

    res.redirect("/upload-sheet");

  });

});
// ================= ADD HOMEWORK =================
// ================= ADD HOMEWORK =================

app.get("/add-homework", teacher, (req, res) => {

  db.all("SELECT * FROM subjects", (err, subjects) => {
    if (err) return res.send("DB Error");

    res.send(`
      <html>
      <head>${ui}</head>
      <body>

        <div class="container">

          <h1>📝 Add Homework</h1>

          <div class="card">

            <form method="POST" action="/add-homework" enctype="multipart/form-data">

              <label>Title</label>
              <input name="title" required />

              <label>Description</label>
              <input name="description" required />

              <label>Select Subject</label>
              <select name="subject_id" required>
                ${subjects.map(s => `
                  <option value="${s.id}">
                    ${s.name}
                  </option>
                `).join("")}
              </select>

              <label>Select Grade</label>
              <select name="grade" required>
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>

                <option value="Prep 1">Prep 1</option>
                <option value="Prep 2">Prep 2</option>
                <option value="Prep 3">Prep 3</option>
              </select>

              <label>Upload Worksheet (Optional)</label>
              <input type="file" name="file" />

              <button>Add Homework</button>

            </form>

          </div>

        </div>

      </body>
      </html>
    `);
  });

});


// ================= POST HOMEWORK =================

app.post("/add-homework", teacher, upload.single("file"), (req, res) => {

  const subject_id = req.body.subject_id;
  const grade = req.body.grade?.trim();

  let stage = "";

  if (grade.startsWith("Prep")) {
    stage = "Prep";
  } else {
    const gradeNumber = parseInt(grade);

    if (gradeNumber >= 1 && gradeNumber <= 3) {
      stage = "Primary";
    } else if (gradeNumber >= 4 && gradeNumber <= 6) {
      stage = "Upper Primary";
    }
  }

  if (!validateStageGrade(stage, grade)) {
    return res.send("Invalid stage or grade");
  }

  db.run(`
    INSERT INTO subject_content
    (subject_id, stage, grade, type, title, filename, description)
    VALUES (?,?,?,?,?,?,?)
  `, [
    subject_id,
    stage,
    grade,
    "homework",
    req.body.title,
    req.file?.filename || null,
    req.body.description || null
  ], (err) => {

    if (err) {
      console.log(err);
      return res.send("DB error");
    }

    res.redirect("/add-homework");

  });

});
// ================= SUBMIT HOMEWORK =================
app.post("/submit-homework", upload.single("file"), (req, res) => {

  const student_id = req.session.user.id;
  const homework_id = req.body.homework_id;

  if (!req.file) {
    return res.send("Please upload a file");
  }

  db.run(
    "INSERT INTO submissions (homework_id, student_id, filename) VALUES (?, ?, ?)",
    [homework_id, student_id, req.file.filename],
    (err) => {
      if (err) {
        console.log("SUBMISSION ERROR:", err);
        return res.send(err.message);
      }

      res.redirect("/dashboard");
    }
  );

});
app.get("/start", (req, res) => {

  db.get("SELECT * FROM ads ORDER BY id DESC LIMIT 1", (err, ad) => {

    if (err) return res.send("DB Error");

    db.get("SELECT * FROM about ORDER BY id DESC LIMIT 1", (err2, about) => {

      if (err2) return res.send("DB Error");

      res.send(`
        <html>
        <head>
          ${ui}

          <style>
            .start-wrapper{
              display:flex;
              gap:20px;
              flex-wrap:wrap;
              align-items:stretch;
            }

            .box{
              flex:1;
              min-width:300px;
              height:420px;
              overflow:hidden;
              display:flex;
              flex-direction:column;
              justify-content:center;
              border-radius:16px;
            }

            .box video,
            .box img{
              width:100%;
              height:100%;
              object-fit:cover;
            }

            .box-content{
              padding:20px;
            }
          </style>

        </head>

        <body>

          <div class="container">

            <h1>🎓 Welcome to Creative Minds</h1>

            <div class="start-wrapper">

              <!-- 📢 Advertisement -->
              <div class="card box">

                <h3>📢 Advertisement</h3>

                ${
                  ad
                    ? ad.type === "image"
                      ? `
                        <img
                          src="/uploads/${ad.filename}"
                          style="width:100%;height:100%;object-fit:cover;"
                        >
                      `
                      : `
                        <video controls autoplay>
                          <source src="/uploads/${ad.filename}">
                        </video>
                      `
                    : "<p>No Advertisement Yet</p>"
                }

              </div>

              <!-- 👩‍🏫 About Platform -->
              <div class="card box">

                <h3>👩‍🏫 About Platform</h3>

                ${
                  about
                    ? `
                      <div class="about-media">
                        <img src="/uploads/${about.filename}" />
                      </div>
                    `
                    : `<div class="box-content">No About Image Yet</div>`
                }

              </div>

            </div>

            <div class="card">

              <h2>🚀 Get Started</h2>

              <a href="/login" class="btn btn-login">
                LOGIN
              </a>

              

            </div>

          </div>

        </body>
        </html>
      `);

    });

  });

});
// ================= DELETE USER =================
app.get("/delete-user/:id", admin, (req, res) => {

  db.get(
    "SELECT * FROM users WHERE id = ?",
    [req.params.id],
    (err, user) => {

      if (err) return res.send("DB Error");
      if (!user) return res.send("User not found");

      // منع حذف الأدمن
      if (user.role === "admin") {
        return res.send("❌ You cannot delete the admin.");
      }

      db.run(
        "DELETE FROM users WHERE id = ?",
        [req.params.id],
        (err) => {

          if (err) return res.send("DB Error");

          res.redirect("/users");
        }
      );

    }
  );

});
// ================= brows users  =================
app.get("/users", admin, (req, res) => {

  db.all("SELECT * FROM users", (err, users) => {

    let html = `
    <html>
    <head>${ui}</head>
    <body>
    <div class="container">
    <h1>👥 Users</h1>
    <div class="card">
    `;

    users.forEach(u => {
      html += `
        <div style="padding:10px;border-bottom:1px solid #ccc">
          <b>${u.username}</b> (${u.role}) -
          <a href="/delete-user/${u.id}" onclick="return confirm('Delete user?')">
            ❌ Delete
          </a>
        </div>
      `;
    });

    html += `
    </div>
    </div>
    </body>
    </html>
    `;

    res.send(html);
  });

});
// ================= DASHBOARD =================
app.get("/dashboard", auth, (req, res) => {

  const user = req.session.user;

  let studentPanel = "";
  let teacherPanel = "";
  let adminPanel = "";

  // 👨‍🎓 Student
  if (user.role === "student") {
    studentPanel = `
      <div class="card">
        <h2>🎓 Student Tools</h2>

        <a class="btn btn-login" href="/mygrades">📊 My Grades</a>
        <a class="btn btn-login" href="/my-subjects">📚 My Subjects</a>

      </div>
    `;
  }

  // 👨‍🏫 Teacher
  if (user.role === "teacher") {
    teacherPanel = `
      <div class="card">
        <h2>🎓 Teacher Tools</h2>

        <a class="btn btn-login" href="/upload-video">📹 Upload Video</a>
        <a class="btn btn-login" href="/upload-sheet">📄 Upload Sheet</a>
        <a class="btn btn-create" href="/add-homework">📝 Add Homework</a>
        <a class="btn btn-login" href="/submissions">📚 View Submissions</a>
      </div>
    `;
  }

  // 👑 Admin (جديد)
  if (user.role === "admin") {
    adminPanel = `
      <div class="card">
        <h2>👑 Admin Panel</h2>
         <a class="btn btn-create" href="/admin/create-account">
  ➕ Create Account
</a>
                   
              <a class="btn btn-login" href="/users">
  👥 Manage Users
</a>
        
 <a class="btn btn-login" href="/admin-ads">
        📢 Manage Ads
      </a>
      </div>
    `;
  }

  res.send(`
    <html>
    <head>${ui}</head>
    <body>
             ${navbar}

      <div class="container">

        <h1>Dashboard</h1>

        ${studentPanel}
        ${teacherPanel}
        ${adminPanel}

        <a href="/logout">Logout</a>

      </div>

    </body>
    </html>
  `);

});

// ================= create teacher & user  =================

app.get("/admin/create-account", auth, admin, (req, res) => {

  res.send(`
  <html>
  <head>${ui}</head>
  <body>

    <div class="container">

      <h1>➕ Create Account</h1>

      <div class="card">

        <form method="POST" action="/admin/create-account">

          <label>Role</label>

          <select name="role" id="role" onchange="toggleFields()">

            <option value="student">Student</option>
            <option value="teacher">Teacher</option>

          </select>

          <label>Username</label>
          <input name="username" required>

          <label>Password</label>
          <input type="password" name="password" required>

          <label>Phone</label>
          <input name="phone">

          <div id="studentFields">

            <label>Stage</label>

            <select name="stage">

              <option value="Primary">Primary</option>
              <option value="Upper Primary">Upper Primary</option>
              <option value="Prep">Prep</option>

            </select>

            <label>Grade</label>

            <select name="grade">

              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>

              <option value="Prep 1">Prep 1</option>
              <option value="Prep 2">Prep 2</option>
              <option value="Prep 3">Prep 3</option>

            </select>

          </div>

          <button>Create Account</button>

        </form>

      </div>

    </div>

<script>

function toggleFields(){

    const role=document.getElementById("role").value;

    document.getElementById("studentFields").style.display=
        role==="student" ? "block":"none";

}

toggleFields();

</script>

  </body>
  </html>
  `);

});

app.post("/admin/create-account", auth, admin, async (req, res) => {

  const hash = await bcrypt.hash(req.body.password, 10);

  let stage = null;
  let grade = null;

  if (req.body.role === "student") {

    stage = req.body.stage;
    grade = req.body.grade;

  }

  db.run(
    `INSERT INTO users
    (username,password,role,phone,stage,grade)
    VALUES (?,?,?,?,?,?)`,
    [
      req.body.username,
      hash,
      req.body.role,
      req.body.phone,
      stage,
      grade
    ],
    (err)=>{

      if(err){

        console.log(err);

        return res.send("Error creating account");

      }

      res.redirect("/users");

    }
  );

});
// ================= SUBJECT =================

app.get("/subject/:id", auth, (req, res) => {

  const user = req.session.user;
  const type = req.query.type; // video | sheet | homework

  db.get(
    "SELECT * FROM subjects WHERE id = ?",
    [req.params.id],
    (err, subject) => {

      if (err) return res.status(500).send(err.message);
      if (!subject) return res.send("Subject not found");

      db.all(`
        SELECT * FROM subject_content
        WHERE subject_id = ?
        AND stage = ?
        AND REPLACE(grade, 'Grade ', '') = ?
        ${type ? "AND type = ?" : ""}
      `,
      [
        req.params.id,
        user.stage,
        user.grade,
        ...(type ? [type] : [])
      ],
      (err, content) => {

        if (err) return res.status(500).send(err.message);

        const html = content.map(c => {

          if (c.type === "video") {
            return `
              <div class="card">
                <h3>🎥 ${c.title}</h3>
                <video controls style="width:100%; aspect-ratio:16/9; object-fit:cover;">
                  <source src="/video/${c.filename}" type="video/mp4">
                </video>
              </div>
            `;
          }

          if (c.type === "sheet") {
            return `
              <div class="card">
                <h3>📄 ${c.title}</h3>
                <a class="btn btn-login" href="/uploads/${c.filename}" download>
                  Download
                </a>
              </div>
            `;
          }

          if (c.type === "homework") {
  return `
    <div class="card">

      <h3>📝 ${c.title}</h3>

      <p>${c.description || ""}</p>

      ${
        c.filename
          ? `
            <a class="btn btn-login"
               href="/uploads/${c.filename}"
               download>
               📄 Download Worksheet
            </a>
          `
          : ""
      }

      <form
        method="POST"
        action="/submit-homework/${c.id}"
        enctype="multipart/form-data">

        <input
          type="file"
          name="file"
          accept=".pdf,.png,.jpg,.jpeg"
          required>

        <button class="btn btn-create">
          📤 Submit Homework
        </button>

      </form>

    </div>
  `;
}

          return "";
        }).join("");

        res.send(`
          <html>
          <head>${ui}</head>
          <body>
          ${navbar}

            <div class="container">

              <h1>${subject.name}</h1>

              <!-- 🔘 FILTER BUTTONS -->
              <div class="card">
                <a href="/subject/${subject.id}?type=video" class="btn btn-login">📹 Videos</a>
                <a href="/subject/${subject.id}?type=sheet" class="btn btn-login">📄 Sheets</a>
                <a href="/subject/${subject.id}?type=homework" class="btn btn-login">📝 Homework</a>
              </div>

              <!-- 📦 CONTENT -->
              ${type
                ? (html || "<p>No content available</p>")
                : "<p>👇 Please select a section above</p>"
              }

            </div>
          </body>
          </html>
        `);

      });

    }
  );

});
app.post("/submit-homework/:id", auth, upload.single("file"), (req, res) => {

  const homeworkId = req.params.id;
  const user = req.session.user;

  if (!req.file) {
    return res.send("❌ Please upload a file (PDF or Image)");
  }

  db.run(`
    INSERT INTO submissions (student_id, homework_id, filename, filetype, grade)
    VALUES (?, ?, ?, ?, ?)
  `,
  [
    user.id,
    homeworkId,
    req.file.filename,
    req.file.mimetype,
    null
  ],
  (err) => {

    if (err) return res.status(500).send(err.message);

    res.send(`
      <h2>✅ Homework Submitted Successfully</h2>
      <a href="javascript:history.back()">Back</a>
    `);

  });

});
////===============my grades =====================
app.get("/mygrades", auth, (req, res) => {

  const user = req.session.user;

  if (user.role !== "student") {
    return res.status(403).send("Only students can view grades");
  }

  db.all(`
  SELECT 
    submissions.id,
    submissions.grade,
    submissions.filename,
    subject_content.title AS homework_title
  FROM submissions
  JOIN subject_content 
    ON submissions.homework_id = subject_content.id
  WHERE submissions.student_id = ?
`, [user.id], (err, rows) => {

    if (err) {
      console.log("grades error:", err);
      return res.status(500).send("DB Error loading grades");
    }

    let html = rows.map(r => `
      <div class="card">
        <h3>📝 ${r.homework_title}</h3>

        <p><b>Grade:</b> ${r.grade !== null ? r.grade : "Not graded yet"}</p>

        <a href="/uploads/${r.filename}" download>Download Your Submission</a>
      </div>
    `).join("");

    res.send(`
      <html>
      <head>${ui}</head>
      <body>
      ${navbar}

        <div class="container">

          <h1>📊 My Grades</h1>

          ${html || "<p>No submissions yet</p>"}

          <a href="/dashboard">⬅ Back</a>

        </div>
      </body>
      </html>
    `);

  });

});
//========================= my student  my subject ==============

app.get("/my-subjects", auth, (req, res) => {

  const user = req.session.user;

  // 🛑 حماية أساسية
  if (!user) {
    return res.redirect("/login");
  }

  if (user.role === "teacher") {
    return res.redirect("/dashboard");
  }

  if (!user.stage || !user.grade) {
    console.log("❌ BROKEN USER DATA:", user);
    return res.send("User data missing (stage/grade)");
  }

  // 🧼 تحويل stage
  let stage = String(user.stage).trim();

  if (stage.toLowerCase() === "prep") {
    stage = "Prep";
  }

  // 🧠 تحويل grade (الحل الأساسي لمشكلتك)
  let grade = String(user.grade).trim();

  if (grade === "Prep 1") grade = "1";
  if (grade === "Prep 2") grade = "2";
  if (grade === "Prep 3") grade = "3";

  console.log("USER STAGE:", stage);
  console.log("USER GRADE:", grade);
  console.log("LOOKING FOR:", { stage, grade });

  db.all(`
    SELECT DISTINCT subjects.id, subjects.name
    FROM subject_offerings
    JOIN subjects ON subjects.id = subject_offerings.subject_id
    WHERE subject_offerings.stage = ?
    AND subject_offerings.grade = ?
  `, [stage, grade], (err, subjects) => {

    if (err) {
      console.log(err);
      return res.send("DB error");
    }

    console.log("SUBJECTS FOUND:", subjects);

    if (!subjects || subjects.length === 0) {
      return res.send("No subjects found");
    }

    const html = subjects.map(s => `
      <div class="card">
        <h2>📘 ${s.name}</h2>

        <div>
          <h3>📚 Open Subject</h3>

          <a class="btn btn-login" href="/subject/${s.id}?grade=${grade}&stage=${stage}">
            Go to Subject
          </a>

        </div>
      </div>
    `).join("");

    res.send(`
      <html>
      <head>${ui}</head>
      <body>
      ${navbar}

        <div class="container">
          <h1>My Subjects</h1>
          ${html}
        </div>
      </body>
      </html>
    `);

  });

});
// ================= teacher sumissions =================
app.get("/submissions", teacher, (req, res) => {

  db.all(`
    SELECT
      submissions.*,
      users.username,
      subject_content.title AS homework_title
    FROM submissions
    JOIN users ON submissions.student_id = users.id
    JOIN subject_content ON submissions.homework_id = subject_content.id
    WHERE subject_content.type = 'homework'
    ORDER BY submissions.id DESC
  `, (err, rows) => {

    if (err) {
      console.log("SUBMISSIONS ERROR:", err.message);
      return res.send("Database error");
    }

    let html = rows.map(r => {

      let color = "#64748b";

      if (r.grade >= 8) color = "#22c55e";
      else if (r.grade >= 5) color = "#f59e0b";
      else if (r.grade !== null) color = "#ef4444";

      return `
        <div class="card">
          <h3>📝 ${r.homework_title}</h3>
          <p><b>Student:</b> ${r.username}</p>

          <p>
          <p>
  <a href="/uploads/${r.filename}" download>
    📥 Download Submission
  </a>
</p>
            Grade:
            <span style="color:${color}; font-weight:bold;">
              ${r.grade === null ? "Not graded yet" : r.grade}
            </span>
          </p>
          <form method="POST" action="/grade-submission">
      <input type="hidden" name="submission_id" value="${r.id}" />

      <input type="number" name="grade" min="0" max="10" required />

      <button type="submit">Save Grade</button>
    </form>
        </div>
      `;
    }).join("");

    res.send(`
      <html>
      <head>${ui}</head>
      <body>
        <div class="container">
          <h1>📚 Homework Submissions</h1>
          ${html || "<p>No submissions yet</p>"}
          <a href="/dashboard">⬅ Back</a>
        </div>
      </body>
      </html>
    `);

  });

});

app.post("/grade-submission", teacher, (req, res) => {

  const { submission_id, grade } = req.body;

  console.log("GRADE =", grade);
  console.log("SUBMISSION =", submission_id);

  db.run(
    "UPDATE submissions SET grade=? WHERE id=?",
    [grade, submission_id],
    function(err) {

      if (err) {
        console.log("FULL ERROR:", err);
        return res.send(err.message);
      }

      console.log("UPDATED:", this.changes);

      res.redirect("/submissions");
    }
  );

});
// ================= ADMIN ADS PAGE =================
app.get("/admin-ads", auth, admin, (req, res) => {

  db.all("SELECT * FROM ads ORDER BY id DESC", (err, ads) => {

    if (err) {
      console.log(err);
      return res.send("DB Error");
    }

    const html = ads.map(ad => `
      <div class="card">

        ${
          ad.type === "image"
            ? `<img src="/uploads/${ad.filename}" width="300" style="border-radius:12px;">`
            : `<video width="300" controls>
                <source src="/uploads/${ad.filename}">
              </video>`
        }

        <div style="margin-top:10px;">
          <strong>Title:</strong>
          <p>${ad.title || "No title"}</p>
        </div>

        <div style="margin-top:10px;">
          <strong>Description:</strong>
          <p>${ad.description || "No description"}</p>
        </div>

        <br>

        <a href="/edit-ad/${ad.id}">
          <button style="background:orange;">Edit</button>
        </a>

        <form method="POST" action="/delete-ad" style="display:inline;">
          <input type="hidden" name="id" value="${ad.id}" />
          <button style="background:red;">Delete</button>
        </form>

      </div>
    `).join("");

    res.send(`
      <html>
      <head>${ui}</head>
      <body>

        <div class="container">

          <h1>📢 Manage Ads</h1>

          <!-- ================= ADS UPLOAD ================= -->
          <div class="card">

            <form method="POST" action="/upload-ad" enctype="multipart/form-data">

              <label>Upload Ad</label>
              <input type="file" name="media" accept="image/*,video/*" required />

              <input type="text" name="title" placeholder="Title" />
              <input type="text" name="description" placeholder="Description" />

              <button>Upload</button>

            </form>

          </div>

          <!-- ================= ABOUT SECTION (FIXED + PREVIEW) ================= -->
          <div class="card">

            <h2>📝 About Section</h2>

            <form method="POST" action="/upload-about" enctype="multipart/form-data">

              <label>Upload About Image</label>

              <input 
                type="file" 
                name="about_image" 
                accept="image/*" 
                id="aboutInput"
                required
              />

              <br><br>

              <img 
                id="aboutPreview"
                style="width:100%;max-height:250px;object-fit:cover;border-radius:12px;display:none;"
              />

              <br><br>

              <button type="submit" id="aboutBtn" style="background:green;">
                Save About
              </button>

            </form>

          </div>

          <h2>All Ads</h2>
          ${html || "<p>No ads yet</p>"}

          <a href="/dashboard">⬅ Back</a>

        </div>

        <script>
          const aboutInput = document.getElementById("aboutInput");
          const aboutPreview = document.getElementById("aboutPreview");
          const aboutBtn = document.getElementById("aboutBtn");

          aboutBtn.disabled = true;

          aboutInput.addEventListener("change", function () {
            const file = this.files[0];

            if (!file) {
              aboutPreview.style.display = "none";
              aboutBtn.disabled = true;
              return;
            }

            const reader = new FileReader();

            reader.onload = function (e) {
              aboutPreview.src = e.target.result;
              aboutPreview.style.display = "block";
              aboutBtn.disabled = false;
            };

            reader.readAsDataURL(file);
          });
        </script>

      </body>
      </html>
    `);

  });

});

// ================= button 2 =================

app.post("/upload-about", auth, admin, upload.single("about_image"), (req, res) => {

  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  if (!req.file) {
    return res.send(`
      <div style="text-align:center;padding:40px;">
        <h2 style="color:red;">❌ No image received</h2>
        <p>تأكدي من اختيار صورة قبل الضغط على Save</p>
        <a href="/admin-ads">⬅ Back</a>
      </div>
    `);
  }

  db.run("DELETE FROM about", (err) => {

    if (err) {
      console.log(err);
      return res.send("DB Error");
    }

    db.run(
      "INSERT INTO about (filename) VALUES (?)",
      [req.file.filename],
      (err) => {

        if (err) {
          console.log(err);
          return res.send("Insert Error");
        }

        res.redirect("/admin-ads");
      }
    );

  });

});
// ================= UPLOAD AD =================
app.post("/upload-ad", auth, admin, upload.single("media"), (req, res) => {

  // 🔴 حماية من رفع فارغ
  if (!req.file) {
    return res.send("❌ No file uploaded - تأكدي إن اسم input = media");
  }

  const type = req.file.mimetype.startsWith("image/")
    ? "image"
    : "video";

  const filename = req.file.filename;

  // 🔥 منع التكرار (اختياري لكن مُحسن)
  db.get(
    "SELECT * FROM ads WHERE filename = ?",
    [filename],
    (err, row) => {

      if (err) {
        console.log("DB GET ERROR:", err.message);
        return res.send("DB Error (check console)");
      }

      if (row) {
        return res.send("⚠️ This ad already exists");
      }

      db.run(
        "INSERT INTO ads (type, filename, title, description) VALUES (?, ?, ?, ?)",
        [
          type,
          filename,
          req.body.title || "",
          req.body.description || ""
        ],
        (err) => {

          if (err) {
            console.log("DB INSERT ERROR:", err.message);
            return res.send("Upload error (check DB)");
          }

          res.redirect("/admin-ads");
        }
      );

    }
  );

});

// ================= DELETE AD =================
app.post("/delete-ad", auth, admin, (req, res) => {

  db.run(
    "DELETE FROM ads WHERE id=?",
    [req.body.id],
    (err) => {

      if (err) {
        console.log(err);
        return res.send("Delete error");
      }

      res.redirect("/admin-ads");
    }
  );

});



app.get("/edit-ad/:id", auth, admin, (req, res) => {

  db.get("SELECT * FROM ads WHERE id = ?", [req.params.id], (err, ad) => {

    if (err || !ad) return res.send("Ad not found");

    res.send(`
      <html>
      <head>${ui}</head>
      <body>

        <div class="container">
          <h1>Edit Ad</h1>

          <form method="POST" action="/edit-ad/${ad.id}">

            <input type="text" name="title" value="${ad.title || ""}" placeholder="Title" />

            <textarea name="description" placeholder="Description">${ad.description || ""}</textarea>

            <button>Save Changes</button>

          </form>

        </div>

      </body>
      </html>
    `);

  });

});

app.post("/edit-ad/:id", auth, admin, (req, res) => {

  const { title, description } = req.body;

  db.run(
    `UPDATE ads SET title = ?, description = ? WHERE id = ?`,
    [title, description, req.params.id],
    (err) => {

      if (err) {
        console.log(err);
        return res.send("Update Error");
      }

      res.redirect("/admin-ads");

    }
  );

});

// ================= LOGIN =================

app.get("/login", (req, res) => {

  res.send(`
    <html>
    <head>${ui}</head>
    <body>

      <div class="container">

        <h1>🔐 Login</h1>

        <div class="card">

          <form method="POST" action="/login">

            <label>Username</label>
            <input name="username" required />

            <label>Password</label>
            <input type="password" name="password" required />

            <button>Login</button>

          </form>

        </div>

      </div>

    </body>
    </html>
  `);

});

app.post("/login", (req, res) => {

  console.log("🔥 LOGIN HIT");
  console.log("USERNAME:", req.body.username);

  
  db.get(
    "SELECT * FROM users WHERE username = ?",
    [req.body.username.trim()],
    (err, user) => {

      if (err) return res.send("DB Error");

      console.log("USER FROM DB:", user);

      if (!user) return res.send("❌ User not found");

      console.log("DB PASSWORD:", user.password);

      const inputPassword = req.body.password.trim();

      // 🟡 CASE 1: bcrypt password (hashed)
      if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {

        bcrypt.compare(inputPassword, user.password, (err, match) => {

          if (err) return res.send("Error");

          console.log("PASSWORD MATCH (bcrypt):", match);

          if (!match) return res.send("❌ Wrong password");

          req.session.user = {
  id: user.id,
  username: user.username,
  role: user.role,
  phone: user.phone,
  stage: user.stage,
  grade: user.grade
};
          res.redirect("/dashboard");
        });

      }

      // 🟢 CASE 2: old plain password
      else {

        const match = user.password === inputPassword;

        console.log("PASSWORD MATCH (plain):", match);

        if (!match) return res.send("❌ Wrong password");

        req.session.user = user;
        res.redirect("/dashboard");
      }

    }
  );
});


app.get("/test-subjects", (req, res) => {

  db.all(
    "SELECT * FROM subject_offerings",
    (err, rows) => {

      if (err) return res.send(err.message);

      res.send("<pre>" + JSON.stringify(rows, null, 2) + "</pre>");
    }
  );

});

///////////update /
app.get("/debug-users", (req, res) => {

  db.all("SELECT id, username, stage, grade FROM users", (err, rows) => {

    if (err) return res.send(err.message);

    console.log("ALL USERS:", rows);

    res.send(`<pre>${JSON.stringify(rows, null, 2)}</pre>`);
  });

});

app.get("/test-content", (req, res) => {

  db.all(
    "SELECT id, subject_id, stage, grade, type, title FROM subject_content",
    (err, rows) => {

      if (err) return res.send(err.message);

      res.send("<pre>" + JSON.stringify(rows, null, 2) + "</pre>");
    }
  );

});

app.get("/fix-content", (req, res) => {

  db.run(`
    UPDATE subject_content
    SET stage = 'Prep'
    WHERE subject_id = 1
    AND grade = 'Prep 3'
  `);

  res.send("✅ Content Fixed");
});
app.get("/test-subjects-table", (req, res) => {

  db.all("SELECT * FROM subjects", (err, rows) => {
    res.send("<pre>" + JSON.stringify(rows, null, 2) + "</pre>");
  });

});

app.get("/debug-offerings", (req, res) => {
  db.all("SELECT * FROM subject_offerings", (err, rows) => {
    res.send(`<pre>${JSON.stringify(rows, null, 2)}</pre>`);
  });
}); 

app.get("/debug-content", (req, res) => {
  db.all("SELECT * FROM subject_content LIMIT 20", (err, rows) => {
    if (err) return res.send(err.message);
    res.json(rows);
  });
});
 
app.get("/debug-tables", (req, res) => {
  db.all(
    "SELECT name FROM sqlite_master WHERE type='table'",
    (err, rows) => {
      if (err) return res.send(err.message);
      res.json(rows);
    }
  );
});

app.get("/fix-grades", (req, res) => {

  db.run(`
    UPDATE subject_content
SET grade = REPLACE(grade, 'Prep ', '')
WHERE grade LIKE 'Prep %';
  `, function(err) {

    if (err) {
      console.log(err);
      return res.send("❌ Error fixing grades");
    }

    res.send(`
      <h2>✅ Grades Fixed Successfully</h2>
      <p>Updated rows: ${this.changes}</p>
    `);

  });

});

app.get("/check-grades", (req, res) => {

  db.all(`
    SELECT id, grade
    FROM subject_content
  `, (err, rows) => {

    if (err) return res.send(err.message);

    res.send(`<pre>${JSON.stringify(rows, null, 2)}</pre>`);

  });

});

app.get("/debug-content", (req, res) => {

  db.all(`
    SELECT id, subject_id, stage, grade, type, title
    FROM subject_content
    ORDER BY id
  `, (err, rows) => {

    if (err) return res.send(err.message);

    res.json(rows);

  });

});
// ================= LOGOUT =================



app.get("/logout",(req,res)=>{
  req.session.destroy(()=>res.redirect("/start"));
});

app.get("/debug-submissions-columns", (req, res) => {
  db.all("PRAGMA table_info(submissions)", (err, rows) => {
    if (err) return res.send(err.message);

    res.send("<pre>" + JSON.stringify(rows, null, 2) + "</pre>");
  });
});
const subjectsRoute = require("./routes/subjects");

app.use("/api", subjectsRoute);
// ================= SERVER =================
// ====app.listen(process.env.PORT || 3000, () => {
  // ====console.log("🚀 Server running...");
// ====});
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running");
});
