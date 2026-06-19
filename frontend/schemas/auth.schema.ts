import z from "zod";
import { BalanceInfoSchema, PortfolioItemSchema } from "./balance.schema";

export const LoginRequestSchema = z.object({
    identifier: z.string(),
    password: z.string().min(6, "Password must be at least 6 characters long.")
});

export const RegisterRequestSchema = z.object({
    name: z.string(),
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string()
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
});

export const LoginResponseSchema = z.object({
    code: z.number(),
    token: z.string().min(1, "Token is empty."),
    message: z.string()
});

export const RegisterResponseSchema = z.object({
    code: z.number(),
    message: z.string()
});

export const UserProfileSchema = z.object({
    name: z.string(),
    username: z.string(),
    balance: BalanceInfoSchema,
    positions: z.object({
        items: z.preprocess((val) => val === null ? [] : val, z.array(PortfolioItemSchema)),
        total_equity_idr: z.number().default(0),
        total_equity_usd: z.number().default(0)
    })
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;