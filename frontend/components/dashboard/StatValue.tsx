"use client";

import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/stores";
import { useTransaction } from "@/stores";

import { Formatter } from "@/lib";

interface UserStatValueProps {
    field: "balance" | "total_equity" | "positions_count" |
    "top_gain" | "top_loss" | "loss_amount" |
    "gain_amount" | "loss_gain_sum" | "winning_positions" |
    "losing_positions" | "temp_win_rate";
    subfield?: "stock_balance" | "cash_balance";
    isCurrency?: boolean;
    useDynamicColor?: boolean;
    selectedBroker?: string;
    globalCurrency?: "IDR" | "USD";
    usdToIdrRate?: number;
}

export default function UserStatValue({ field, subfield, isCurrency, useDynamicColor, selectedBroker = "all", globalCurrency = "IDR", usdToIdrRate = 15000 }: UserStatValueProps) {
    const user = useUser((state) => state.user);
    const isLoadingUser = useUser((state) => state.isLoading);
    const transactions = useTransaction((state) => state.transactions);
    const loading = useTransaction((state) => state.loading);
    const availableAccounts = useTransaction((state) => state.availableAccounts);

    const convertValue = (val: number, fromCurrency: string = "IDR", toCurrency: string = "IDR") => {
        if (fromCurrency === toCurrency) return val;
        if (fromCurrency === "USD" && toCurrency === "IDR") return val * usdToIdrRate;
        if (fromCurrency === "IDR" && toCurrency === "USD") return val / usdToIdrRate;
        return val;
    };

    const getAccountCurrency = (provider?: string | null, account_no?: string | null) => {
        if (!provider || !account_no) return "IDR";
        const acc = availableAccounts.find(a => a.provider_name === provider && a.account_no === account_no);
        return acc?.currency || "IDR";
    };

    const filteredTransactions = useMemo(() => {
        let list = transactions;
        if (selectedBroker && selectedBroker !== "all") {
            const [prov, accNo] = selectedBroker.split("-");
            list = transactions.filter(t => t.provider === prov && t.account_no === accNo);
        }
        return list;
    }, [transactions, selectedBroker]);

    const stats = useMemo(() => {
        const transaction = filteredTransactions.filter(pos => pos.transaction_type === "sell");

        // Convert PnL to target currency before sorting/summing
        const mappedTransactions = transaction.map(t => {
            const tCurr = getAccountCurrency(t.provider, t.account_no);
            const convertedPnl = convertValue(t.realized_pnl || 0, tCurr, globalCurrency);
            return { ...t, convertedPnl };
        });

        const gainPositions = mappedTransactions
            .filter(pos => pos.convertedPnl >= 0)
            .toSorted((a, b) => b.convertedPnl - a.convertedPnl);

        const lossPositions = mappedTransactions
            .filter(pos => pos.convertedPnl < 0)
            .toSorted((a, b) => a.convertedPnl - b.convertedPnl);

        const totalGain = gainPositions.reduce((acc, curr) => acc + curr.convertedPnl, 0);
        const totalLoss = lossPositions.reduce((acc, curr) => acc + curr.convertedPnl, 0);

        return {
            gainPositions,
            lossPositions,
            totalGain,
            totalLoss,
            totalCount: transaction.length
        };
    }, [filteredTransactions, availableAccounts, globalCurrency, usdToIdrRate]);

    let value: number | string;
    if (isLoadingUser || loading)
        return <span className="animate-pulse bg-white/10 rounded w-16 h-4 inline-block" />;

    switch (field) {
        case "top_gain":
            value = stats.gainPositions[0]?.ticker || "No data available.";
            break;
        case "top_loss":
            value = stats.lossPositions[0]?.ticker || "No data available.";
            break;
        case "gain_amount":
            value = stats.totalGain;
            break;
        case "loss_amount":
            value = stats.totalLoss;
            break;
        case "loss_gain_sum":
            value = stats.totalGain + stats.totalLoss;
            break;
        case "winning_positions":
            value = stats.gainPositions.length;
            break;
        case "losing_positions":
            value = stats.lossPositions.length;
            break;
        case "temp_win_rate":
            value = stats.totalCount > 0 ? (stats.gainPositions.length / stats.totalCount) * 100 : 0;
            break;
        case "positions_count":
            value = user?.positions.items.length || 0;
            break;
        case "balance":
            if (selectedBroker && selectedBroker !== "all") {
                const target = availableAccounts?.find(
                    acc => `${acc.provider_name}-${acc.account_no}` === selectedBroker
                );
                value = target ? convertValue(target.amount || 0, target.currency, globalCurrency) : 0;
            } else {
                let total = 0;
                availableAccounts.forEach(acc => {
                    total += convertValue(acc.amount || 0, acc.currency, globalCurrency);
                });
                value = total;
            }
            break;
        case "total_equity":
            if (selectedBroker && selectedBroker !== "all") {
                const items = (user?.positions.items || []).filter(
                    p => `${p.provider}-${p.account_no}` === selectedBroker
                );
                let total = 0;
                items.forEach(item => {
                    const iCurr = getAccountCurrency(item.provider, item.account_no);
                    total += convertValue(item.current_price || 0, iCurr, globalCurrency);
                });
                value = total;
            } else {
                const eqIDR = user?.positions.total_equity_idr || 0;
                const eqUSD = user?.positions.total_equity_usd || 0;
                value = convertValue(eqIDR, "IDR", globalCurrency) + convertValue(eqUSD, "USD", globalCurrency);
            }
            break;
        default:
            value = (user as any)?.[field] || 0;
    }

    let colorClass = "";
    if (useDynamicColor && typeof value === "number")
        colorClass = value >= 0 ? "text-green-500" : "text-red-500";

    const hasSign = typeof value === "number" && !["total_equity", "balance", "positions_count", "winning_positions", "losing_positions", "temp_win_rate"].includes(field);
    const sign = hasSign && (value as number) > 0 ? "+" : "";

    return (isLoadingUser || loading) ? (
        <Skeleton className="h-8 w-1/3 bg-slate-800 mb-6" />
    ) : (
        <span className={`font-bold ${colorClass}`}>
            {sign}
            {typeof value === "string" ? value
                : field === "temp_win_rate" ? `${Formatter.formatNumber(value, true)}%`
                    : isCurrency ? (globalCurrency === "USD" ? `$${Formatter.formatNumber(value, true)}` : Formatter.formatCurrency(value)) : Formatter.formatNumber(value, true)}
        </span>
    );
}