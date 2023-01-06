import invariant from "tiny-invariant";
import type { Entity, SpatialEntity } from "./entity";
import type { Repo, SpatialQuery } from "./repo.server";

export class Service<E extends Entity> {
  constructor(readonly repo: Repo<E>) {}

  find(id: string) {
    return this.repo.find(id);
  }

  save(entity: E) {
    if (this.repo.find(entity.id)) {
      this.repo.update(entity);
    } else {
      this.repo.insert(entity);
    }
  }

  insert(entity: E) {
    this.repo.insert(entity);
  }

  update(entity: E) {
    this.repo.update(entity);
  }

  delete(entity: E) {
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

export class SpatialService<E extends SpatialEntity> extends Service<E> {
  constructor(readonly repo: Repo<E> & SpatialQuery<E>) {
    super(repo);
  }

  findByPosition(x: number, y: number) {
    return this.repo.findByPosition(Math.round(x), Math.round(y));
  }

  findInRectangle(xMin: number, yMin: number, xMax: number, yMax: number) {
    return this.repo.findInRectangle(
      Math.round(xMin),
      Math.round(yMin),
      Math.round(xMax),
      Math.round(yMax)
    );
  }
}
