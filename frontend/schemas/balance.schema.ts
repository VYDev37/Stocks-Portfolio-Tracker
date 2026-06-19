import z from "zod";

export const BalanceInfoSchema = z.object({
    stock_balance: z.number().default(0),
    cash_balance: z.number().default(0)
});

export const UserBalanceReqSchema = z.object({
    amount: z.coerce.number().nonnegative("Amount must be positive."),
    fee: z.coerce.number().nonnegative("Fee must be positive."),
    mode: z.enum(["add", "rem", "mod"]),
    asset_type: z.enum(["stock_balance", "cash_balance"]),
    note: z.string().optional(),
    bank_src: z.string(),
    title: z.string().optional(),
    reverse: z.boolean().default(false).optional(),
    date: z.coerce.date().default(() => new Date()),
    provider: z.string().min(1, "Provider is required."),
    account_no: z.string().min(1, "Account number is required."),
    currency: z.string().optional()
});

export const PortfolioAddReqSchema = z.object({
    ticker: z.string(),
    qty: z.number(),
    inv: z.number(),
    fee: z.number(),
    provider: z.string().min(1, "Broker is required."),
    account_no: z.string().min(1, "Account number is required.")
});

export const PortfolioItemSchema = z.object({
    ticker: z.string(),
    total_qty: z.number(),
    invested_total: z.number(),
    current_price: z.number(),
    unrealized_pnl: z.number(),
    pnl_percentage: z.number(),
    updated_at: z.coerce.date(),
    provider: z.string().optional().default(""),
    account_no: z.string().optional().default(""),
    currency: z.string().optional().default("IDR")
});

export const CreateAccountReqSchema = z.object({
    provider: z.string().min(1, "Bank / Wallet name is required."),
    account_no: z.string().min(4, "Account number must be at least 4 characters."),
    currency: z.string().default("IDR")
});

export type BalanceInfo = z.infer<typeof BalanceInfoSchema>;
export type UserBalanceReq = z.infer<typeof UserBalanceReqSchema>;
export type PortfolioAddReq = z.infer<typeof PortfolioAddReqSchema>;
export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;
export type CreateAccountReq = z.infer<typeof CreateAccountReqSchema>;