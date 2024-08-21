import { z } from "zod";

export const LoginSchema = z.object({
  email: z.optional(
    z
      .string()
      .min(1, {
        message: "Email is required",
      })
      .email()
  ),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});
