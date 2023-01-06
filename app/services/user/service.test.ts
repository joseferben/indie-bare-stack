import invariant from "tiny-invariant";
import { expect } from "vitest";
import { config } from "~/test/config";
import { cleanAllTables } from "~/test/utils";
import { buildContainer } from "../container.server";

const container = buildContainer(config);

beforeAll(() => {
  container.items.migrationService.migrate();
});

beforeEach(() => {
  cleanAllTables(container.items.database);
});

test("create user", () => {
  const created = container.items.userService.create(
    "dragonslayer@example.com",
    "12345678"
  );
  const user = container.items.userService.find(created.id);
  invariant(user);

  expect(
    container.items.userService.verifyLogin(user.email, "12345678")
  ).toBeTruthy();
});

test("update old password", () => {
  const created = container.items.userService.create(
    "dragonslayer@example.com",
    "12345678"
  );
  const user = container.items.userService.find(created.id);
  invariant(user);

  container.items.userService.updatePassword(
    user,
    "12345678",
    "87654321",
    "87654321"
  );

  expect(
    container.items.userService.verifyLogin(user.email, "87654321")
  ).toBeTruthy();
});
