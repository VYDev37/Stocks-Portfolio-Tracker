"use client";

import { useState, useEffect, useMemo } from "react";
import { useTransaction } from "@/stores";

export default function useTrackerData() {
    const refetch = useTransaction((state) => state.refetch);
    const transactions = useTransaction((state) => state.transactions);
    const loading = useTransaction((state) => state.loading);
    const selectedAccount = useTransaction((state) => state.selectedAccount) || "all";
    const setSelectedAccount = useTransaction((state) => state.setSelectedAccount);
    const fetchAccounts = useTransaction((state) => state.fetchAccounts);

    const [limit, setLimit] = useState(10);
    const [isMigrationOpen, setIsMigrationOpen] = useState(false);
    const [hasAutoOpened, setHasAutoOpened] = useState(false);

    const { incomes, expenses, income, expense, net, balanceTransactions } = useMemo(() => {
        let tx = transactions;
        if (selectedAccount !== "all") {
            const acc = selectedAccount.split("-");
            if (acc.length >= 2)
                tx = tx.filter(t => t.provider === acc[0] && t.account_no === acc[1]);
        }

        const incomes = tx.filter(x => x.transaction_type === "income");
        const expenses = tx.filter(x => x.transaction_type === "expense");

        const income = incomes.reduce((acc, val) => acc + val.price, 0);
        const expense = expenses.reduce((acc, val) => acc + val.price, 0);

        const net = income - expense;

        const balanceTransactions = [...incomes, ...expenses].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

        return { incomes, expenses, income, expense, net, balanceTransactions };
    }, [transactions, selectedAccount]);

    const visibleIncomes = incomes.slice(0, limit);
    const visibleExpenses = expenses.slice(0, limit);
    const visibleBalanceTransactions = balanceTransactions.slice(0, limit);

    const legacyCashTransactions = useMemo(() => {
        return transactions.filter(
            (t) => (t.transaction_type === "income" || t.transaction_type === "expense") && (!t.provider || t.provider === "")
        );
    }, [transactions]);

    useEffect(() => {
        if (legacyCashTransactions.length > 0 && !hasAutoOpened && !loading) {
            setIsMigrationOpen(true);
            setHasAutoOpened(true);
        }
    }, [legacyCashTransactions, hasAutoOpened, loading]);

    useEffect(() => {
        refetch();
        fetchAccounts("cash_balance");
    }, [refetch, fetchAccounts]);

    return {
        transactions,
        loading,
        selectedAccount,
        setSelectedAccount,
        limit,
        setLimit,
        isMigrationOpen,
        setIsMigrationOpen,
        incomes,
        expenses,
        income,
        expense,
        net,
        balanceTransactions,
        visibleIncomes,
        visibleExpenses,
        visibleBalanceTransactions,
        legacyCashTransactions
    };
}
