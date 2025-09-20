import { z } from "zod";

export const RegisterSchema = z
  .object({
    fullname: z
      .string()
      .min(4, { message: "Full Name must be at least 4 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(4, { message: "Password must be at least 4 characters long" }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });

export type RegisterSchemaDTO = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(4, { message: "Password must be at least 4 characters long" }),
});

export type LoginSchemaDTO = z.infer<typeof LoginSchema>;
