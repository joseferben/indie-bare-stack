import type { Statement } from "better-sqlite3";
import type { Database } from "better-sqlite3";
import fs from "fs";
import type { Entity } from "./entity";

export interface Repo<E extends Entity> {
  insert(entity: E): void;
  update(entity: E): void;
  find(id: string): E | null;
  findAll(limit?: number): E[];
  delete(entity: E): void;
}

// TODO use internal_id to join
export class SqlRepo<E extends Entity> implements Repo<E> {
  readonly selectAllStmt: Statement<[number]>;
  readonly selectStmt: Statement<[string]>;
  readonly insertStmt: Statement<[E]>;
  readonly updateStmt: Statement<[E]>;
  readonly deleteStmt: Statement<[E]>;

  constructor(
    readonly db: Database,
    readonly dirname: string,
    readonly booleanFields: string[]
  ) {
    this.selectAllStmt = this.prepareSqlFromFile("select-all.sql");
    this.selectStmt = this.prepareSqlFromFile("select.sql");
    this.insertStmt = this.prepareSqlFromFile("insert.sql");
    this.updateStmt = this.prepareSqlFromFile("update.sql");
    this.deleteStmt = this.prepareSqlFromFile("delete.sql");
  }

  prepareSql(sql: string) {
    try {
      return this.db.prepare(sql);
    } catch (e) {
      console.error(`could not prepare sql statement ${sql}`);
      throw new Error(`could not prepare sql statement ${sql}: ${e}`);
    }
  }

  prepareSqlFromFile(filename: string) {
    try {
      const sql = fs.readFileSync(`${this.dirname}/${filename}`).toString();
      return this.prepareSql(sql);
    } catch (e) {
      throw new Error(`could not read sql file ${filename}: ${e}`);
    }
  }

  findAll(limit: number): E[] {
    const entities = this.selectAllStmt.all(limit);
    return entities.map((entity) => {
      const result = {};
      for (const [k, v] of Object.entries(entity)) {
        // @ts-ignore
        result[k] = this.booleanFields.includes(k) ? v === 1 : v;
      }
      return result as E;
    });
  }

  find(id: string): E | null {
    const entity = this.selectStmt.get(id);
    if (entity) {
      const result = {};
      for (const [k, v] of Object.entries(entity)) {
        // @ts-ignore
        result[k] = this.booleanFields.includes(k) ? v === 1 : v;
      }
      return result as E;
    } else {
      return null;
    }
  }

  insert(entity: E) {
    // create a new copy
    const insertable = {};
    for (const [k, v] of Object.entries(entity)) {
      // @ts-ignore
      insertable[k] = typeof v === "boolean" ? (v ? 1 : 0) : v;
    }
    this.insertStmt.run(insertable as E);
  }

  update(entity: E) {
    const updateable = {};
    for (const [k, v] of Object.entries(entity)) {
      // @ts-ignore
      updateable[k] = typeof v === "boolean" ? (v ? 1 : 0) : v;
    }

    this.updateStmt.run(updateable as E);
  }

  delete(entity: E) {
    this.deleteStmt.run(entity);
  }
}
