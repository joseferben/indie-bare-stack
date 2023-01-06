import type { Config } from "./core/config";
import { buildContainer } from "./services/container.server";

const config: Config = {
  migrationsPath: "/app/migrations",
};

export const services = buildContainer(config);
