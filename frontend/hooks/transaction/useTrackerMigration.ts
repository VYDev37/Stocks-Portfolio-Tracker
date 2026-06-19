"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser, useTransaction } from "@/stores";
import { axios } from "@/lib";
import type { AvailableAccount } from "@/schemas/transaction.schema";

interface UseTrackerMigrationProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function useTrackerMigration({ isOpen, setIsOpen }: UseTrackerMigrationProps) {
    const user = useUser((state) => state.user);
    const refreshProfile = useUser((state) => state.refreshProfile);

    const availableAccounts = useTransaction((state) => state.availableAccounts);
    const fetchAccounts = useTransaction((state) => state.fetchAccounts);
    const transactions = useTransaction((state) => state.transactions);
    const refetchTransactions = useTransaction((state) => state.refetch);

    const [selectedProvider, setSelectedProvider] = useState("");
    const [selectedAccountNo, setSelectedAccountNo] = useState("");
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [localNewAccounts, setLocalNewAccounts] = useState<AvailableAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const legacyCashTransactions = useMemo(() => {
        return transactions.filter(
            (t) => (t.transaction_type === "income" || t.transaction_type === "expense") && (!t.provider || t.provider === "")
        );
    }, [transactions]);

    useEffect(() => {
        if (isOpen) {
            fetchAccounts("cash_balance");
        }
    }, [isOpen, fetchAccounts]);

    useEffect(() => {
        if (legacyCashTransactions.length > 0) {
            setSelectedIds(legacyCashTransactions.map((t) => t.id));
        }
    }, [legacyCashTransactions]);

    const accountsToDisplay = [
        ...(availableAccounts || []).map(acc => ({
            provider_name: acc.provider_name,
            account_no: acc.account_no,
            is_new: false
        })),
        ...localNewAccounts
    ];

    const isAllSelected = selectedIds.length === legacyCashTransactions.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(legacyCashTransactions.map((t) => t.id));
        }
    };

    const toggleSelectTransaction = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(x => x !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const handleMigrate = async () => {
        if (!selectedProvider || !selectedAccountNo) {
            setError("Please select or create a bank / wallet account for migration.");
            return;
        }

        if (selectedIds.length === 0) {
            setError("Please select at least one transaction to migrate.");
            return;
        }

        if (!isConfirmed) {
            setError("Please check the confirmation checkbox to agree to move the transactions.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.post("/transactions/migrate", {
                provider: selectedProvider,
                account_no: selectedAccountNo,
                transaction_ids: selectedIds
            });

            await refreshProfile(true);
            await refetchTransactions(true);
            setIsOpen(false);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Migration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const onAddAccount = (selectedProv: string, accNo: string) => {
        const newAccount: AvailableAccount = { provider_name: selectedProv, account_no: accNo, is_new: true };
        setLocalNewAccounts(prev => [...prev, newAccount]);
        setSelectedProvider(selectedProv);
        setSelectedAccountNo(accNo);
        setShowAddAccountModal(false);
    };

    return {
        user,
        availableAccounts,
        selectedProvider,
        setSelectedProvider,
        selectedAccountNo,
        setSelectedAccountNo,
        showAddAccountModal,
        setShowAddAccountModal,
        loading,
        error,
        selectedIds,
        isConfirmed,
        setIsConfirmed,
        legacyCashTransactions,
        accountsToDisplay,
        isAllSelected,
        toggleSelectAll,
        toggleSelectTransaction,
        handleMigrate,
        onAddAccount
    };
}
