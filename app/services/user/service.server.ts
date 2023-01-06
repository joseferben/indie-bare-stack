import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import invariant from "tiny-invariant";
import { SqlService } from "../../core/service.server";
import type { User } from "./entity";
import type UserRepo from "./repo.server";

export default class UserService extends SqlService<User> {
  constructor(readonly repo: UserRepo) {
    super(repo);
  }

  findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  create(email: string, password: string) {
    const now = Date.now();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user: User = {
      id: nanoid(),
      password: hashedPassword,
      email,
      joinedAt: now,
    };
    this.repo.insert(user);
    return user;
  }

  deleteByEmail(email: string) {
    const user = this.findByEmail(email);
    if (user) {
      this.repo.delete(user);
    }
  }

  isValidPassword(user: User, password: string): boolean {
    const hashedPassword = this.repo.findHashedPasswordById(user.id);
    return bcrypt.compareSync(password, hashedPassword);
  }

  verifyLogin(email: string, password: string): User | null {
    const user = this.findByEmail(email);

    if (!user || !user.password) {
      return null;
    }

    const isValid = this.isValidPassword(user, password);

    if (!isValid) {
      return null;
    }

    return user;
  }

  updatePassword(
    user: User,
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ) {
    invariant(
      newPassword === newPasswordConfirmation,
      "can not update password that do not match"
    );
    invariant(user.password, "can not update password if password was not set");
    const foundCurrentHashedPassword = this.repo.findHashedPasswordById(
      user.id
    );
    invariant(
      bcrypt.compareSync(currentPassword, foundCurrentHashedPassword),
      "current password does not match"
    );
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    this.update(user);
  }

  setPassword(user: User, password: string, passwordConfirmation: string) {
    invariant(!user.password, "can not set password if already set");
    invariant(
      password === passwordConfirmation,
      "can not set password with non matching confirmation"
    );
    const hashedPassword = bcrypt.hashSync(password, 10);
    user.password = hashedPassword;
    this.update(user);
  }
}
