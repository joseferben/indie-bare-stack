import Database from "better-sqlite3";
import type { Config } from "~/core/config";
import { createContainer } from "iti";
import MigrationService from "./migration/service.server";
import { SessionService } from "./session/service.server";
import UserRepo from "./user/repo.server";
import UserService from "./user/service.server";
import { NoteRepo } from "./note/repo.server";
import NoteService from "./note/service.server";

export const buildContainer = (config: Config) =>
  createContainer()
    .add({
      database: () => {
        const database = new Database(process.env.DATABASE_URL || ":memory:");
        database.pragma("journal_mode = WAL");
        return database;
      },
    })
    .add((ctx) => ({
      migrationService: () =>
        new MigrationService(ctx.database, config.migrationsPath),
      userRepo: () => new UserRepo(ctx.database),
      noteRepo: () => new NoteRepo(ctx.database),
    }))
    .add((ctx) => ({
      userService: () => new UserService(ctx.userRepo),
      noteService: () => new NoteService(ctx.noteRepo),
    }))
    .add((ctx) => ({
      sessionService: () => new SessionService(ctx.userService),
    }))
    .add((ctx) => ({
      start: () => () => console.log("schedules something here"),
    }));
