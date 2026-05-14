import { Elysia, t } from "elysia";
import { createUser, loginUser, getCurrentUser } from "../service/users.service";

export const usersRoutes = new Elysia().post(
  "/api/users",
  async ({ body, set }) => {
    const result = await createUser(body);

    if (result.error) {
      set.status = 409;
      return { error: result.error };
    }

    set.status = 201;
    return { data: "OKE" };
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: "email" }),
      password: t.String(),
    }),
  }
).post(
  "/api/users/login",
  async ({ body, set }) => {
    const result = await loginUser(body);

    if (result.error) {
      set.status = 401;
      return { error: result.error };
    }

    set.status = 200;
    return { data: result.token };
  },
  {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String(),
    }),
  }
).get(
  "/api/users/current",
  async ({ headers, set }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const user = await getCurrentUser(token);
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    set.status = 200;
    return { data: user };
  },
  {
    headers: t.Object({
      authorization: t.Optional(t.String()),
    }),
  }
);
