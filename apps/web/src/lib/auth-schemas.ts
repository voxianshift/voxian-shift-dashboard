import { z } from "zod"

const email = z.email("Enter a valid email")
const password = z.string().min(8, "At least 8 characters")

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password") })

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name"),
    email,
    password,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] })

export const forgotSchema = z.object({ email })

export const resetSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] })
