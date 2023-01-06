import type { Statement } from "better-sqlite3";
import type { Database } from "better-sqlite3";
import { SqlRepo } from "../../core/repo.server";
import type { User } from "./entity";
import { schema } from "./entity";

// redact password so it won't leak
const selectFragment = /* sql */ `
    id,
    username,
    case when users.password is null then null else 'redacted' end as password,
    email,
    joined_at as joinedAt
`;

const selectSql = /* sql */ `
SELECT ${selectFragment}
FROM users
WHERE id = ?
`;

const insertSql = /* sql */ `
INSERT INTO users (
        id,
        username,
        password,
        email,
        joined_at
    )
VALUES (
        @id,
        @username,
        @password,
        @email,
        @joinedAt
    )
`;

const updateSql = /* sql */ `
UPDATE users
SET username = @username,
    password = @password,
    email = @email
WHERE id = @id
`;

const deleteSql = /* sql */ `
DELETE FROM users
WHERE id = @id`;

const selectByNameSql = /* sql */ `
SELECT ${selectFragment}
FROM users
WHERE username = ?
`;

const selectByEmailSql = /* sql */ `
SELECT ${selectFragment}
FROM users
where email = ?
`;

const selectHashedPasswordByIdSql = /* sql */ `
SELECT password
FROM users
where id = ?
`;

export default class UserRepo extends SqlRepo<User> {
  readonly selectByNameStmt: Statement<[string]>;
  readonly selectByEmailStmt: Statement<[string]>;
  readonly selectHashedPasswordByIdStmt: Statement<[string]>;

  constructor(db: Database) {
    super(db, schema, selectSql, insertSql, updateSql, deleteSql);
    this.selectByNameStmt = this.prepareSql(selectByNameSql);
    this.selectByEmailStmt = this.prepareSql(selectByEmailSql);
    this.selectHashedPasswordByIdStmt = this.prepareSql(
      selectHashedPasswordByIdSql
    );
  }

  findByName(name: string) {
    const user = this.selectByNameStmt.get(name);
    return user ? (user as User) : null;
  }

  findByEmail(email: string) {
    const user = this.selectByEmailStmt.get(email);
    return user ? (user as User) : null;
  }

  findHashedPasswordById(id: string) {
    return this.selectHashedPasswordByIdStmt.get(id).password;
  }
}
