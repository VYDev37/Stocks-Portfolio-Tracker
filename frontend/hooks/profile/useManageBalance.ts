"use client";

import { useState, useEffect } from "react";
import { useUser, useTransaction } from "@/stores";
import useUpdateBalance from "../user/useUpdateBalance";
import type { UserBalanceReq } from "@/schemas/balance.schema";
import type { AvailableAccount } from "@/schemas/transaction.schema";

interface UseManageBalanceProps {
    mode: 'stock' | 'cash';
}

export default function useManageBalance({ mode }: UseManageBalanceProps) {
    const defaultData: UserBalanceReq = {
        amount: 0,
        mode: "add",
        title: "",
        note: "",
        fee: 0,
        date: new Date(),
        bank_src: "",
        asset_type: mode === 'stock' ? "stock_balance" : "cash_balance",
        provider: "",
        account_no: ""
    };

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<UserBalanceReq>(defaultData);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [localNewAccounts, setLocalNewAccounts] = useState<AvailableAccount[]>([]);

    const refetch = useTransaction((state) => state.refetch);
    const fetchAccounts = useTransaction((state) => state.fetchAccounts);
    const availableAccounts = useTransaction((state) => state.availableAccounts);
    const { updateBalance, loading, error } = useUpdateBalance();

    const refreshProfile = useUser((state) => state.refreshProfile);

    useEffect(() => {
        if (open) {
            fetchAccounts(mode === "stock" ? "stock_balance" : "cash_balance");
        }
    }, [open, mode, fetchAccounts]);

    const maxBalance = availableAccounts.find(
        x => x.account_no === formData.account_no && x.provider_name === formData.provider
    )?.amount || 0;

    const accountsToDisplay: AvailableAccount[] = [
        ...(availableAccounts || []).map(acc => ({
            provider_name: acc.provider_name,
            account_no: acc.account_no,
            currency: acc.currency,
            is_new: false
        })),
        ...localNewAccounts
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const totalOut = formData.amount + formData.fee;
        if (formData.mode === "rem" && totalOut > maxBalance) {
            alert("Insufficient balance.");
            return;
        }

        const success = await updateBalance(formData);
        if (success) {
            setOpen(false);

            await refreshProfile(true);
            await refetch(true);
            await fetchAccounts(mode === "stock" ? "stock_balance" : "cash_balance");

            setFormData(defaultData);
        }
    };

    const handleFormChange = (field: keyof UserBalanceReq, value: string) => {
        let val: string | number | Date = value;
        if (["fee", "amount"].includes(field)) {
            const numVal = Number(value.replace(/[^0-9]/g, ""));
            val = numVal;

            if (formData.mode === "rem" && field === "amount" && Number(numVal) > maxBalance) {
                val = maxBalance;
            }
        } else if (field === "date") {
            val = new Date(value);
        }

        setFormData({ ...formData, [field]: val });
    };

    const onAddAccount = (selectedProvider: string, accountNo: string, currency: string, amount: number) => {
        const newAccount: AvailableAccount = {
            provider_name: selectedProvider,
            account_no: accountNo,
            currency,
            is_new: true,
            amount
        };
        setLocalNewAccounts(prev => [...prev, newAccount]);
        setFormData(prev => ({
            ...prev,
            provider: selectedProvider,
            bank_src: selectedProvider,
            account_no: accountNo,
            currency: currency,
            mode: prev.mode === "rem" ? "add" : prev.mode
        }));
        setShowAddAccountModal(false);
    };

    return {
        open,
        setOpen,
        formData,
        setFormData,
        showAddAccountModal,
        setShowAddAccountModal,
        accountsToDisplay,
        maxBalance,
        loading,
        error,
        handleSubmit,
        handleFormChange,
        onAddAccount,
        defaultData
    };
}
