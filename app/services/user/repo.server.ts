import type { Statement } from "better-sqlite3";
import type { Database } from "better-sqlite3";
import { SqlRepo } from "../../core/repo.server";
import type { User } from "./entity";

// redact password so it won't leak
const selectFragment = /* sql */ `
    id,
    case when users.password is null then null else 'redacted' end as password,
    email,
    joined_at as joinedAt
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
  readonly selectByEmailStmt: Statement<[string]>;
  readonly selectHashedPasswordByIdStmt: Statement<[string]>;

  constructor(db: Database) {
    super(db, __dirname, []);
    this.selectByEmailStmt = this.prepareSql(selectByEmailSql);
    this.selectHashedPasswordByIdStmt = this.prepareSql(
      selectHashedPasswordByIdSql
    );
  }

  findByEmail(email: string) {
    const user = this.selectByEmailStmt.get(email);
    return user ? (user as User) : null;
  }

  findHashedPasswordById(id: string) {
    return this.selectHashedPasswordByIdStmt.get(id).password;
  }
}
