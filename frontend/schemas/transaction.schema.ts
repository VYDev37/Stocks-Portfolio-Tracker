import z from "zod";

export const TransactionInfoSchema = z.object({
    id: z.number(),
    ticker: z.string(),
    transaction_type: z.string(),
    owner_id: z.number(),
    transaction_fee: z.number(),
    quantity: z.number(),
    base_price: z.number(),
    price: z.number(),
    realized_pnl: z.number(),
    entry_price_unit: z.number(),
    sell_price_unit: z.number(),
    notes: z.string(),
    title: z.string().optional(),
    provider: z.string().nullable().optional(),
    account_no: z.string().nullable().optional(),
    created_at: z.coerce.date(),
    currency: z.string().optional(),
});

export const UpdateTransactionReqSchema = z.object({
    title: z.string(),
    notes: z.string(),
    price: z.number(),
    reverse: z.boolean()
});

export const TransactionQuerySchema = z.object({
    searchTerm: z.string().optional(),
    filterType: z.enum(["all", "stocks", "stocks_us", "cashflow"]),
    filterProvider: z.string(),
    sortDirection: z.enum(["asc", "desc"]),
    currentPage: z.number().int().positive().default(1),
});

export const TransactionListSchema = TransactionInfoSchema.array();

export type TransactionInfo = z.infer<typeof TransactionInfoSchema>;
export type TransactionList = z.infer<typeof TransactionListSchema>;
export type UpdateTransactionReq = z.infer<typeof UpdateTransactionReqSchema>;
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;

export interface AvailableAccount {
    provider_name: string;
    account_no: string;
    currency?: string;
    amount?: number;
    is_new?: boolean;
}