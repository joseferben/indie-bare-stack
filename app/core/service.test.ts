import { SpatialInmemoryRepo } from "./repo.server";
import { Service } from "./service.server";

test("refresh()", () => {
  const repo = new SpatialInmemoryRepo();
  const service = new Service(repo);
  const entity = { posX: 1, posY: 2, id: "1" };
  service.insert(entity);
  service.update({ posX: 10, posY: 20, id: "1" });
  expect(entity).toHaveProperty("posX", 1);

  service.refresh(entity);

  expect(entity).toHaveProperty("posX", 10);
});
