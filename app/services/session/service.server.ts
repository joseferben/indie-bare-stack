import type { SessionStorage } from "@remix-run/node";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import type { User } from "../user/entity";
import type UserService from "../user/service.server";

const USER_SESSION_KEY = "userId";

export class SessionService {
  sessionStorage: SessionStorage;
  constructor(readonly userService: UserService) {
    invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");
    this.sessionStorage = createCookieSessionStorage({
      cookie: {
        name: "__session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets: [process.env.SESSION_SECRET],
        secure: process.env.NODE_ENV === "production",
      },
    });
  }

  async getSession(request: Request) {
    const cookie = request.headers.get("Cookie");
    return this.sessionStorage.getSession(cookie);
  }

  async getUserId(request: Request): Promise<string> {
    const session = await this.getSession(request);
    const userId = session.get(USER_SESSION_KEY);
    return userId;
  }

  async getUser(request: Request): Promise<User | null> {
    const userId = await this.getUserId(request);
    if (userId === undefined) return null;

    const user = this.userService.find(userId);
    if (user) return user;

    throw await this.destroy(request);
  }

  async requireUserId(request: Request) {
    const userId = await this.getUserId(request);
    if (!userId) {
      throw redirect(`/`);
    }
    return userId;
  }

  async requireUser(request: Request): Promise<User> {
    const userId = await this.requireUserId(request);

    const user = this.userService.find(userId);
    if (user) return user;

    throw await this.destroy(request);
  }

  async createUserSesstion({
    request,
    userId,
    remember,
    redirectTo,
  }: {
    request: Request;
    userId: string;
    remember: boolean;
    redirectTo: string;
  }) {
    const session = await this.getSession(request);
    session.set(USER_SESSION_KEY, userId);
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await this.sessionStorage.commitSession(session, {
          maxAge: remember
            ? 60 * 60 * 24 * 7 // 7 days
            : undefined,
        }),
      },
    });
  }

  async destroy(request: Request) {
    const session = await this.getSession(request);
    return redirect("/", {
      headers: {
        "Set-Cookie": await this.sessionStorage.destroySession(session),
      },
    });
  }
}
