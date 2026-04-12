const express = require("express");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 3001;
const distPath = path.join(__dirname, "..", "dist");
const indexHtml = path.join(distPath, "index.html");
const hasDistBuild = fs.existsSync(indexHtml);

const app = express();
app.use(express.json({ limit: "1mb" }));

const db = new Database(path.join(__dirname, "bills.db"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS bills (
    id   TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function generateId() {
  return crypto.randomBytes(4).toString("base64url");
}

app.post("/api/bills", (req, res) => {
  const data = JSON.stringify(req.body);
  let id;
  for (let attempt = 0; attempt < 5; attempt++) {
    id = generateId();
    try {
      db.prepare("INSERT INTO bills (id, data) VALUES (?, ?)").run(id, data);
      return res.status(201).json({ id });
    } catch {
      // collision — retry with new id
    }
  }
  res.status(500).json({ error: "Nem sikerült egyedi azonosítót generálni." });
});

app.get("/api/bills/:id", (req, res) => {
  const row = db.prepare("SELECT data FROM bills WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Nem található." });
  res.json(JSON.parse(row.data));
});

if (hasDistBuild) {
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(indexHtml);
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server: http://0.0.0.0:${PORT}`);
  if (hasDistBuild) console.log(`Serving frontend from ${distPath}`);
  else console.log("No dist/ found — API only mode");
});
