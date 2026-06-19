"use client"

import { useState } from "react";
import { axios } from "@/lib";
import z from "zod";

import { useUser } from "@/stores";
import { PortfolioAddReqSchema, type PortfolioAddReq } from "@/schemas/balance.schema";

export default function useAddPosition() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const refreshProfile = useUser((state) => state.refreshProfile);

    const addPosition = async (position: "buy" | "sell", formData: PortfolioAddReq, position_type: "stocks_us" | "futures" | "stocks") => {
        setLoading(true);
        setError(null);

        try {
            const validated = PortfolioAddReqSchema.parse({
                ticker: formData.ticker,
                qty: Number(formData.qty),
                inv: Number(formData.inv),
                fee: Number(formData.fee),
                provider: formData.provider,
                account_no: formData.account_no
            });

            await axios.post(`/position/add/${position}`, {
                ticker: validated.ticker.toUpperCase(),
                total_qty: validated.qty,
                invested_total: validated.inv,
                fee: validated.fee,
                position_type,
                provider: validated.provider,
                account_no: validated.account_no
            });

            await refreshProfile(true);
            return true;
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                setError(err.issues.map((issue) => issue.message).join(", "));
            } else {
                setError(err.message || "Failed to add position");
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { addPosition, loading, error };
}