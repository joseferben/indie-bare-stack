import invariant from "tiny-invariant";
import { expect } from "vitest";
import { buildContainer } from "../container.server";
import { testConfig } from "../test/config";
import { cleanAllTables } from "../test/utils";

const container = buildContainer(testConfig);

beforeAll(() => {
  container.items.migrationService.migrate();
});

beforeEach(() => {
  cleanAllTables(container.items.database);
});

test("set password initally", () => {
  const player = container.items.playerService.create("dragonslayer");
  const user = container.items.userService.find(player.userId);
  invariant(user);

  container.items.userService.setPassword(user, "12345678", "12345678");
  expect(
    container.items.userService.verifyLogin(user.username, "12345678")
  ).toBeTruthy();
});

test("update old password", () => {
  const player = container.items.playerService.create("dragonslayer");
  const user = container.items.userService.find(player.userId);
  invariant(user);
  container.items.userService.setPassword(user, "12345678", "12345678");

  container.items.userService.updatePassword(
    user,
    "12345678",
    "87654321",
    "87654321"
  );

  expect(
    container.items.userService.verifyLogin(user.username, "87654321")
  ).toBeTruthy();
});
