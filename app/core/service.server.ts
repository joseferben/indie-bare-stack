import invariant from "tiny-invariant";
import type { Entity } from "./entity";
import type { SqlRepo } from "./repo.server";

export interface Service<E extends Entity> {
  insert(entity: E): void;
  update(entity: E): void;
  find(id: string): E | null;
  findAll(limit?: number): E[];
  delete(entity: E): void;
  refresh(entity: E): void;
}

export class SqlService<E extends Entity> implements Service<E> {
  constructor(readonly repo: SqlRepo<E>) {}

  insert(entity: E): void {
    this.repo.insert(entity);
  }
  update(entity: E): void {
    this.repo.update(entity);
  }
  find(id: string): E | null {
    return this.repo.find(id);
  }
  findAll(limit?: number | undefined): E[] {
    return this.repo.findAll(limit || 100);
  }
  delete(entity: E): void {
    this.repo.delete(entity);
  }

  /** Refreshes entity from the database, all users of entity instanc see updated values */
  refresh(entity: E) {
    const refreshed = this.find(entity.id);
    invariant(refreshed !== null, "can not refresh entity that does not exist");
    for (const k of Object.keys(entity)) {
      // @ts-ignore
      entity[k] = refreshed[k];
    }
  }
}
