"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUser, useTransaction } from "@/stores";
import type { PortfolioAddReq, UserBalanceReq } from "@/schemas/balance.schema";
import type { AvailableAccount } from "@/schemas/transaction.schema";

import useAddPosition from "./useAddPosition";
import useGetCurrentPrice from "./useGetCurrentPrice";
import useUpdateBalance from "../user/useUpdateBalance";

export default function useStockAddPositionForm() {
    const [opened, setOpened] = useState<boolean>(false);
    const [useCurrent, setUseCurrent] = useState<boolean>(false);
    const [market, setMarket] = useState<"IDX" | "US">("IDX");

    const [pricePerShare, setPricePerShare] = useState<number>(0);
    const [feePercentage, setFeePercentage] = useState<number>(0);

    const emptyData = { ticker: "", qty: 0, inv: 0, fee: 0, provider: "", account_no: "" };
    const [formData, setFormData] = useState<PortfolioAddReq>(emptyData);

    const { addPosition, loading: isSubmitting, error: submissionError } = useAddPosition();
    const { price: currentPrice, loading: isLoadingPrice, error: fetchPriceError } = useGetCurrentPrice(formData.ticker, market);
    const { updateBalance } = useUpdateBalance();

    const user = useUser((state) => state.user);
    const refetch = useTransaction((state) => state.refetch);
    const fetchAccounts = useTransaction((state) => state.fetchAccounts);
    const availableAccounts = useTransaction((state) => state.availableAccounts);

    const [showAddAccountModal, setShowAddAccountModal] = useState<boolean>(false);
    const [localNewAccounts, setLocalNewAccounts] = useState<AvailableAccount[]>([]);

    const accountsToDisplay = [
        ...(availableAccounts || []).map(acc => ({
            provider_name: acc.provider_name,
            account_no: acc.account_no,
            currency: acc.currency,
            amount: acc.amount,
            is_new: false
        })),
        ...localNewAccounts
    ].filter(acc => market === "US" ? acc.currency === "USD" : (!acc.currency || acc.currency === "IDR"));

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isExecuted = !!searchParams.get("ticker");
    const action = searchParams.get("action");
    const ticker = searchParams.get("ticker");
    const isSellMode = action === "sell";

    const currentStock = user?.positions?.items?.find(p => p.ticker === ticker);
    const selectedAccountObj = accountsToDisplay?.find(
        (acc) => acc.provider_name === formData.provider && acc.account_no === formData.account_no
    );
    const activeBalance = (selectedAccountObj?.amount ?? 0);
    const multiplier = market === "IDX" ? 100 : 1;
    const pricePerLot = (pricePerShare || currentPrice || 0) * multiplier;
    const maxLot = isSellMode
        ? ((currentStock?.total_qty || 0) / multiplier)
        : (pricePerLot > 0 ? Math.floor(activeBalance / pricePerLot) : 0);

    const onKillSheet = () => {
        setOpened(false);

        const params = new URLSearchParams(searchParams.toString());
        params.delete("action");
        params.delete("ticker");

        const queryString = params.toString();
        const updatedPath = queryString ? `${pathname}?${queryString}` : pathname;

        router.replace(updatedPath, { scroll: false });
    };

    const handleFormChange = (field: string, value: string | number) => {
        let val: string | number = value;

        if (["qty", "inv", "fee"].includes(field) && typeof value === "string") {
            const numVal = value.replace(/[^0-9]/g, "");
            val = numVal;

            if (isSellMode && field === "qty" && Number(numVal) > maxLot) {
                val = String(maxLot);
            }
        }

        if (field === "inv")
            setUseCurrent(false);
        if (field === "fee")
            setFeePercentage(0);

        setFormData({ ...formData, [field]: val });
    };

    const handleSubmit = async () => {
        const selectedNewAcc = localNewAccounts.find(
            acc => acc.provider_name === formData.provider && acc.account_no === formData.account_no
        );

        if (selectedNewAcc && selectedNewAcc.is_new) {
            const balancePayload: UserBalanceReq = {
                amount: selectedNewAcc.amount || 0,
                fee: 0,
                mode: "add",
                asset_type: "stock_balance",
                bank_src: selectedNewAcc.provider_name,
                provider: selectedNewAcc.provider_name,
                account_no: selectedNewAcc.account_no,
                currency: selectedNewAcc.currency,
                title: "Initial Balance",
                date: new Date()
            };
            
            const balSuccess = await updateBalance(balancePayload);
            if (!balSuccess) {
                return;
            }
            
            setLocalNewAccounts(prev => prev.filter(
                acc => !(acc.provider_name === selectedNewAcc.provider_name && acc.account_no === selectedNewAcc.account_no)
            ));
        }

        const payload = { ...formData };
        const positionType = market === "US" ? "stocks_us" : "stocks";
        const success = await addPosition(isSellMode ? "sell" : "buy", payload, positionType);
        if (success) {
            onKillSheet();
            setFormData(emptyData);
            await refetch(true);
        }
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
            account_no: accountNo
        }));
        setShowAddAccountModal(false);
    };

    useEffect(() => {
        if (opened) {
            fetchAccounts("stock_balance");
        }
    }, [opened, fetchAccounts]);

    useEffect(() => {
        const userHasStock = (user?.positions.items || []).some(x => x.ticker === ticker);
        if (isSellMode && !userHasStock) {
            onKillSheet();
        }
    }, [isSellMode, user?.positions.items, ticker]);

    useEffect(() => {
        if (action === "add" || isSellMode) {
            setOpened(true);
            if (ticker)
                handleFormChange("ticker", ticker);
        }
    }, [searchParams]);

    useEffect(() => {
        if (currentStock) {
            setMarket(currentStock.currency === "USD" ? "US" : "IDX");
        }
    }, [currentStock]);

    useEffect(() => {
        if (useCurrent && currentPrice > 0) {
            setPricePerShare(currentPrice);
        }
    }, [useCurrent, currentPrice]);

    useEffect(() => {
        const qty = Number(formData.qty) || 0;
        const price = Number(pricePerShare) || 0;
        const totalInv = price * qty * multiplier;

        setFormData(prev => {
            let fee = prev.fee;
            if (feePercentage > 0) {
                fee = (feePercentage / 100) * totalInv;
            }
            if (prev.inv === totalInv && prev.fee === fee)
                return prev;

            return {
                ...prev,
                inv: Math.round(totalInv),
                fee: Math.round(fee)
            };
        });
    }, [formData.qty, pricePerShare, feePercentage]);

    useEffect(() => {
        if (currentPrice > 0 && pricePerShare === 0) {
            setPricePerShare(currentPrice);
            setUseCurrent(true);
        }
    }, [currentPrice]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpened(isOpen);

        if (!isOpen) {
            onKillSheet();
        } else {
            setOpened(true);
        }
    };

    return {
        opened,
        setOpened,
        useCurrent,
        setUseCurrent,
        market,
        setMarket,
        pricePerShare,
        setPricePerShare,
        feePercentage,
        setFeePercentage,
        formData,
        setFormData,
        isSubmitting,
        submissionError,
        currentPrice,
        isLoadingPrice,
        fetchPriceError,
        showAddAccountModal,
        setShowAddAccountModal,
        localNewAccounts,
        accountsToDisplay,
        isExecuted,
        isSellMode,
        maxLot,
        multiplier,
        activeBalance,
        onKillSheet,
        handleFormChange,
        handleSubmit,
        onAddAccount,
        handleOpenChange,
        currentStock
    };
}
