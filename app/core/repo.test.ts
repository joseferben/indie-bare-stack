import { SpatialInmemoryRepo } from "./repo.server";

test("SpatialInmemoryrepo", () => {
  const repo = new SpatialInmemoryRepo();
  const entity = { posX: 1, posY: 2, id: "1" };

  repo.insert(entity);

  const foundById = repo.find("1");
  const foundByPos = repo.findByPosition(1, 2);

  expect(foundById).not.toBeNull();
  expect(foundById).toBe(foundByPos[0]);

  const updated = { ...entity, posX: 10 };
  repo.update(updated);

  expect(repo.findByPosition(10, 2)).toEqual([updated]);
  expect(repo.findAll()).toEqual([updated]);

  repo.delete(entity);

  expect(repo.find("1")).toBeNull();
});
