import { buildContainer } from "../container.server";
import { testConfig } from "../test/config";

const container = buildContainer(testConfig);

test("migrate all", () => {
  container.items.migrationService.migrate();
});
