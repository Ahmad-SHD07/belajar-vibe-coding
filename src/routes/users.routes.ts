import { Elysia, t } from "elysia";
import { createUser } from "../service/users.service";

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
);
