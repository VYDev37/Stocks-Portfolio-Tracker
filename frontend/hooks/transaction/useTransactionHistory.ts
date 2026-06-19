"use client";

import { useState, useMemo } from "react";
import { useUser, useTransaction } from "@/stores";
import { useAdminTable } from "@/hooks/table/useAdminTable";
import type { AvailableAccount, TransactionInfo } from "@/schemas/transaction.schema";

export default function useTransactionHistory() {
    const error = useTransaction((state) => state.error);
    const transactions = useTransaction((state) => state.transactions);
    const loading = useTransaction((state) => state.loading);

    const [filterType, setFilterType] = useState("all");
    const [filterProvider, setFilterProvider] = useState("all");

    const user = useUser((state) => state.user);

    const uniqueAccounts = useMemo(() => {
        const accs: AvailableAccount[] = [];
        const seen = new Set<string>();

        (transactions || []).forEach(item => {
            if (item.provider && item.account_no) {
                const key = `${item.provider}-${item.account_no}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    accs.push({ provider_name: item.provider, account_no: item.account_no });
                }
            }
        });
        return accs;
    }, [user, transactions]);

    const tableConfig = useMemo(() => ({
        itemsPerPage: 15,
        searchField: (item: any, term: string) => item.ticker.toLowerCase().includes(term),
        sortField: (a: any, b: any, dir: "asc" | "desc") => {
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return dir === "asc" ? timeA - timeB : timeB - timeA;
        },
        filterFn: (t: TransactionInfo) => {
            if (t.transaction_type === "income" || t.transaction_type === "expense") {
                return false;
            }
            // Type filter
            if (filterType !== "all") {
                const isCashflow = t.transaction_type === "cashflow";
                if (filterType === "stocks") {
                    if (isCashflow) return false;
                } else if (t.transaction_type !== filterType) {
                    return false;
                }
            }
            // Provider filter
            if (filterProvider !== "all") {
                const [provider, account_no] = filterProvider.split("-");
                return provider === t.provider && account_no === t.account_no;
            }
            return true;
        }
    }), [filterType, filterProvider]);

    const {
        searchTerm,
        setSearchTerm,
        sortDirection,
        currentPage,
        setCurrentPage,
        filteredItems,
        paginatedItems,
        totalPages,
        toggleSort
    } = useAdminTable(transactions, tableConfig);

    return {
        error,
        transactions,
        loading,
        filterType,
        setFilterType,
        filterProvider,
        setFilterProvider,
        user,
        uniqueAccounts,
        searchTerm,
        setSearchTerm,
        sortDirection,
        currentPage,
        setCurrentPage,
        filteredItems,
        paginatedItems,
        totalPages,
        toggleSort
    };
}
