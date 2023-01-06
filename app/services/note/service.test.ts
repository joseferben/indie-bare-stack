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

test("create and fined", () => {
  const user = container.items.userService.create(
    "dragonslayer@example.com",
    "12345"
  );
  const note = container.items.noteService.create("title", "body", user);
  invariant(note);
  const found = container.items.noteService.find(note.id);

  expect(found).toHaveProperty("title", "title");
});
