"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/stores";
import type { AvailableAccount } from "@/schemas/transaction.schema";

export default function useStockList() {
    const router = useRouter();

    const user = useUser((state) => state.user);
    const isLoadingUser = useUser((state) => state.isLoading);
    const isLoading = isLoadingUser || !user;

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState<string>("all");
    const itemsPerPage = 10;

    const uniqueAccounts = useMemo(() => {
        const accs: AvailableAccount[] = [];
        const seen = new Set<string>();

        (user?.positions.items || []).forEach(item => {
            if (item.provider && item.account_no) {
                const key = `${item.provider}-${item.account_no}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    accs.push({ provider_name: item.provider, account_no: item.account_no });
                }
            }
        });
        return accs;
    }, [user]);

    const filteredStocks = useMemo(() => {
        let items = [...(user?.positions.items || [])];
        if (selectedFilter !== "all") {
            const [prov, accNo] = selectedFilter.split("-");
            const target = uniqueAccounts.find(x => `${x.provider_name}-${x.account_no}` === selectedFilter);
            if (target) {
                items = items.filter(p => p.provider === target.provider_name && p.account_no === target.account_no);
            }
        }
        return items.sort((a, b) => a.ticker.localeCompare(b.ticker));
    }, [user?.positions.items, selectedFilter, uniqueAccounts]);

    const paginatedStocks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStocks.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStocks, currentPage]);

    const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

    const pages = useMemo(() => {
        let list: (number | string)[] = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                list.push(i);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                list.push('...');
            }
        }
        return list.filter((item, index) => item !== '...' || list[index - 1] !== '...');
    }, [totalPages, currentPage]);

    const handleTickerChange = (ticker: string) => {
        router.push(`/admin/stocks?symbol=${ticker}`, { scroll: false });
    };

    const handleAddRedirect = (action: string = "add", ticker: string = "") => {
        router.push(`?action=${action}&ticker=${ticker}`, { scroll: false });
    };

    return {
        isLoading,
        currentPage,
        setCurrentPage,
        selectedFilter,
        setSelectedFilter,
        uniqueAccounts,
        filteredStocks,
        paginatedStocks,
        totalPages,
        pages,
        handleTickerChange,
        handleAddRedirect,
        itemsPerPage
    };
}
