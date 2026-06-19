"use client";

import { useState, useEffect } from "react";
import { useUser, useTransaction } from "@/stores";
import { axios } from "@/lib";

export interface AvailableAccount {
    provider_name: string;
    account_no: string;
    is_new: boolean;
}

export default function useMigrationModal() {
    const user = useUser((state) => state.user);
    const refreshProfile = useUser((state) => state.refreshProfile);

    const availableAccounts = useTransaction((state) => state.availableAccounts);
    const fetchAccounts = useTransaction((state) => state.fetchAccounts);
    const refetchTransactions = useTransaction((state) => state.refetch);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState("");
    const [selectedAccountNo, setSelectedAccountNo] = useState("");
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [localNewAccounts, setLocalNewAccounts] = useState<AvailableAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user has legacy positions (provider is empty string)
    const hasLegacyData = user?.positions?.items?.some((item) => !item.provider || item.provider === "") || false;

    useEffect(() => {
        if (hasLegacyData) {
            setIsOpen(true);
            fetchAccounts("stock_balance");
        } else {
            setIsOpen(false);
        }
    }, [hasLegacyData, fetchAccounts]);

    const accountsToDisplay = [
        ...(availableAccounts || []).map(acc => ({
            provider_name: acc.provider_name,
            account_no: acc.account_no,
            is_new: false
        })),
        ...localNewAccounts
    ];

    const handleMigrate = async () => {
        if (!selectedProvider || !selectedAccountNo) {
            setError("Please select or create a broker account for migration.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.post("/position/migrate", {
                provider: selectedProvider,
                account_no: selectedAccountNo
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
        isOpen,
        setIsOpen,
        selectedProvider,
        setSelectedProvider,
        selectedAccountNo,
        setSelectedAccountNo,
        showAddAccountModal,
        setShowAddAccountModal,
        loading,
        error,
        accountsToDisplay,
        handleMigrate,
        onAddAccount
    };
}
