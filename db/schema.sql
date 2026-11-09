CREATE TABLE IF NOT EXISTS interessados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  whatsapp TEXT NOT NULL,
  aquario TEXT NOT NULL CHECK (aquario IN ('doce','marinho','ambos','planejando')),
  consentimento INTEGER NOT NULL CHECK (consentimento = 1),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_interessados_created_at ON interessados(created_at);