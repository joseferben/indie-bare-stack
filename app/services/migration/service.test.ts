import { config } from "~/test/config";
import { buildContainer } from "../container.server";

const container = buildContainer(config);

test("migrate all", () => {
  container.items.migrationService.migrate();
});
