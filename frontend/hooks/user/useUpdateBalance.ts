"use client";

import { useState } from "react";
import { axios } from "@/lib";
import z from "zod";

import { UserBalanceReqSchema, type UserBalanceReq } from "@/schemas/balance.schema";

export default function useUpdateBalance() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateBalance = async (formData: UserBalanceReq) => {
        setLoading(true);
        setError(null);

        try {
            // Strict runtime schema validation & coercion
            const validated = UserBalanceReqSchema.parse(formData);
            await axios.post("/balance/update-balance", {
                amount: Math.abs(validated.amount),
                fee: Math.abs(validated.fee),
                mode: validated.mode,
                reverse: validated.reverse,
                bank_src: validated.bank_src,
                asset_type: validated.asset_type,
                note: validated.note,
                title: validated.title,
                provider: validated.provider,
                account_no: validated.account_no,
                currency: validated.currency
            });

            return true;
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                setError(err.issues.map((issue) => issue.message).join(", "));
            } else {
                setError(err.message || "Failed to update balance.");
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { updateBalance, loading, error };
}