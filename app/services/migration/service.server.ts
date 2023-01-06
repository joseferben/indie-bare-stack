import type { Database } from "better-sqlite3";
import fs from "fs";

const createMigrationTableSql = /*sql*/ `
CREATE TABLE IF NOT EXISTS migrations (
  last_timestamp INT NULL
)
`;

const findSql = /*sql*/ `
SELECT last_timestamp FROM migrations;
`;

const insertSql = /*sql*/ `
INSERT INTO migrations (
  last_timestamp
) VALUES (?)
`;

const updateSql = /*sql*/ `
UPDATE migrations SET last_timestamp = ?
`;

export default class MigrationService {
  constructor(private database: Database, private migrationsPath: string) {}

  timestamp(): number | null {
    const stmt = this.database.prepare(findSql);
    const state = stmt.get();
    return state ? state.last_timestamp : null;
  }

  ensureTimestamp(ts: number) {
    const storedTs = this.timestamp();
    if (storedTs) {
      const updateStmt = this.database.prepare(updateSql);
      updateStmt.run(ts);
    } else {
      const insertStmt = this.database.prepare(insertSql);
      insertStmt.run(ts);
    }
  }

  migrate() {
    this.database.exec(createMigrationTableSql);
    console.debug("apply migrations...");
    const path = `${process.cwd()}${this.migrationsPath}/`;
    const files = fs.readdirSync(path);
    if (files.length === 0) {
      console.warn("no migrations found");
    }
    for (let file of files) {
      const [fileTimestampRaw] = file.split(".");
      const fileTimestamp = parseInt(fileTimestampRaw);
      const storedTimestamp = this.timestamp();
      if (storedTimestamp === null || fileTimestamp > storedTimestamp) {
        const migration = fs.readFileSync(path + file).toString();
        console.debug(`apply migration ${file}...`);
        try {
          this.database.exec(migration);
          this.ensureTimestamp(fileTimestamp);
          console.debug(`apply migration ${file}... done`);
        } catch (e) {
          console.error(`failed to run migration ${file}`);
          throw e;
        }
      }
    }
    console.debug("apply migrations... done");
  }

  createEmptyFile() {
    const now = Date.now();
    const filename = `${now}.rename_this_migration.sql`;
    console.debug(`create migration ${filename}`);
    const path = `${process.cwd()}/app/engine/migration/migrations/${filename}`;
    fs.writeFileSync(
      path,
      /*sql*/ `
ALTER TABLE table_1
    RENAME COLUMN old_name TO new_name;
ALTER TABLE table_2
    ADD columnd_2 BOOLEAN NOT NULL;
    `
    );
  }
}
