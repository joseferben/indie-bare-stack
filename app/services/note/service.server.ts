import { nanoid } from "nanoid";
import { SqlService } from "~/core/service.server";
import type { User } from "../user/entity";
import type { Note } from "./entity";
import type { NoteRepo } from "./repo.server";

export default class NoteService extends SqlService<Note> {
  constructor(readonly repo: NoteRepo) {
    super(repo);
  }

  create(title: string, body: string, user: User) {
    const id = nanoid();
    this.repo.insert({ id, title, body, userId: user.id });
    return this.repo.find(id);
  }

  findByUser(user: User) {
    return this.repo.findByUserId(user.id);
  }
}
