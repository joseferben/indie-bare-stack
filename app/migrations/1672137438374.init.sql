CREATE TABLE IF NOT EXISTS users (
    internal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NULL,
    joined_at BIGINT NOT NULL
);
CREATE INDEX users_email on users(email);
CREATE TABLE IF NOT EXISTS notes (
    internal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    title TEXT,
    body TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);