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

db.exec(`
  CREATE TABLE IF NOT EXISTS claims (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id    TEXT NOT NULL REFERENCES bills(id),
    name       TEXT NOT NULL,
    item_ids   TEXT NOT NULL,
    total      INTEGER NOT NULL DEFAULT 0,
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

app.post("/api/bills/:id/claims", (req, res) => {
  const bill = db.prepare("SELECT id FROM bills WHERE id = ?").get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Számla nem található." });

  const { name, itemIds, total } = req.body;
  if (!name || !Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: "Név és tételek megadása kötelező." });
  }

  db.prepare(
    "INSERT INTO claims (bill_id, name, item_ids, total) VALUES (?, ?, ?, ?)"
  ).run(req.params.id, name, JSON.stringify(itemIds), total || 0);

  res.status(201).json({ ok: true });
});

app.get("/api/bills/:id/claims", (req, res) => {
  const bill = db.prepare("SELECT id FROM bills WHERE id = ?").get(req.params.id);
  if (!bill) return res.status(404).json({ error: "Számla nem található." });

  const rows = db.prepare(
    "SELECT name, item_ids, total, created_at FROM claims WHERE bill_id = ? ORDER BY created_at"
  ).all(req.params.id);

  const claims = rows.map((r) => ({
    name: r.name,
    itemIds: JSON.parse(r.item_ids),
    total: r.total,
  }));

  res.json(claims);
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
