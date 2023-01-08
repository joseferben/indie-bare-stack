import type { Database, Statement } from "better-sqlite3";
import { SqlRepo } from "~/core/repo.server";
import type { Note } from "./entity";

export class NoteRepo extends SqlRepo<Note> {
  selectByUserIdStmt: Statement<[string]>;
  constructor(readonly db: Database) {
    super(db, []);
    this.selectByUserIdStmt = this.prepareSqlFromFile("select-by-user.sql");
  }

  findByUserId(userId: string): Note[] {
    return this.selectByUserIdStmt.all(userId);
  }
}
