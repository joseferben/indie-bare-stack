import type { Static } from "runtypes";
import { Number, String, Record } from "runtypes";

// TODO redact password so it can't be retrieved
export const schema = Record({
  id: String,
  username: String,
  joinedAt: Number,
  password: String.nullable(),
  email: String.nullable(),
});

export type User = Static<typeof schema>;
