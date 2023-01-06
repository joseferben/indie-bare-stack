import type { Statement } from "better-sqlite3";
import type { Database } from "better-sqlite3";
import type { RuntypeBase } from "runtypes/lib/runtype";
import invariant from "tiny-invariant";
import type { Entity, SpatialEntity } from "./entity";
import { initOnce } from "./utils";

export interface Repo<E extends Entity> {
  insert(entity: E): void;
  update(entity: E): void;
  find(id: string): E | null;
  findAll(limit?: number): E[];
  delete(entity: E): void;
}

export interface SpatialQuery<E extends SpatialEntity> {
  findByPosition(x: number, y: number): E[];
  findInRectangle(xMin: number, yMin: number, xMax: number, yMax: number): E[];
}

export class SqlRepo<E extends Entity> implements Repo<E> {
  readonly selectStmt: Statement<[string]>;
  readonly insertStmt: Statement<[E]>;
  readonly updateStmt: Statement<[E]>;
  readonly deleteStmt: Statement<[E]>;

  constructor(
    readonly db: Database,
    readonly schema: RuntypeBase<E>,
    selectSql: string,
    insertSql: string,
    updateSql: string,
    deleteSql: string
  ) {
    this.schema = schema;
    this.selectStmt = this.prepareSql(selectSql);
    this.insertStmt = this.prepareSql(insertSql);
    this.updateStmt = this.prepareSql(updateSql);
    this.deleteStmt = this.prepareSql(deleteSql);
  }

  prepareSql(sql: string) {
    try {
      return this.db.prepare(sql);
    } catch (e) {
      console.error(`could not prepare sql statement ${sql}`);
      throw new Error(`could not prepare sql statement ${sql}: ${e}`);
    }
  }

  findAll(): E[] {
    throw new Error("Method not implemented.");
  }

  booleanFields(): string[] {
    invariant(
      this.schema.reflect.tag === "record",
      "only records can be used in repos"
    );
    return Object.entries(this.schema.reflect.fields)
      .filter(([k, v]) => v.tag === "boolean")
      .map(([k, v]) => k);
  }

  find(id: string): E | null {
    const entity = this.selectStmt.get(id);
    if (entity) {
      const result = {};
      for (const [k, v] of Object.entries(entity)) {
        // TODO find better solution for boolean decoding
        // @ts-ignore
        result[k] = this.booleanFields().includes(k) ? v === 1 : v;
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

export class SpatialSqlRepo<E extends SpatialEntity>
  extends SqlRepo<E>
  implements SpatialQuery<E>
{
  readonly selectByPositionStmt: Statement<[{ x: number; y: number }]>;
  readonly selectByRectangleStmt: Statement<
    [{ xMin: number; yMin: number; xMax: number; yMax: number }]
  >;

  constructor(
    readonly db: Database,
    readonly schema: RuntypeBase<E>,
    selectSql: string,
    insertSql: string,
    updateSql: string,
    deleteSql: string,
    selectByPositionSql: string,
    selectByRectangleSql: string
  ) {
    super(db, schema, selectSql, insertSql, updateSql, deleteSql);
    this.schema = schema;
    this.selectByPositionStmt = this.prepareSql(selectByPositionSql);
    this.selectByRectangleStmt = this.prepareSql(selectByRectangleSql);
  }

  findByPosition(x: number, y: number): E[] {
    return this.selectByPositionStmt
      .all({ x, y })
      .map((data: any) => data as E);
  }

  findInRectangle(xMin: number, yMin: number, xMax: number, yMax: number): E[] {
    return this.selectByRectangleStmt
      .all({ xMin, yMin, xMax, yMax })
      .map((data: any) => data as E);
  }
}

export class SpatialInmemoryRepo<E extends SpatialEntity>
  implements Repo<E>, SpatialQuery<E>
{
  map2d: { [k: number]: { [k: number]: E[] } };
  ids: { [k: string]: E };

  constructor() {
    [this.map2d] = initOnce(`map2d_${this.constructor.name}`, () => ({}));
    [this.ids] = initOnce(`ids_${this.constructor.name}`, () => ({}));
  }

  insert(entity: E) {
    if (this.map2d[entity.posX]) {
      if (this.map2d[entity.posX][entity.posY]) {
        this.map2d[entity.posX][entity.posY].push(entity);
      } else {
        this.map2d[entity.posX][entity.posY] = [entity];
      }
    } else {
      this.map2d[entity.posX] = {};
      this.map2d[entity.posX][entity.posY] = [entity];
    }
    this.ids[entity.id] = entity;
  }

  update(updated: E) {
    const old = this.find(updated.id);
    if (!old) {
      throw new Error(`can update entity ${updated}, it does not exist`);
    }
    this.delete(old);
    this.insert(updated);
  }

  find(id: string) {
    return this.ids[id] || null;
  }

  findByPosition(x: number, y: number): E[] {
    return (this.map2d[x] && this.map2d[x][y]) || [];
  }

  findInRectangle(xMin: number, yMin: number, xMax: number, yMax: number): E[] {
    let result: E[] = [];
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const found = this.findByPosition(x, y) || [];
        result = result.concat(found);
      }
    }
    return result;
  }

  findAll() {
    return Object.values(this.ids);
  }

  delete(entity: E) {
    this.map2d[entity.posX][entity.posY] = this.map2d[entity.posX][
      entity.posY
    ].filter((e) => e.id !== entity.id);
    delete this.ids[entity.id];
  }
}
