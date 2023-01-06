CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NULL,
    joined_at BIGINT NOT NULL
);
CREATE INDEX users_email on users(email);
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    body TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);