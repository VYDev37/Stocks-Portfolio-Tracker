"use client";

import { useState, useEffect } from "react";
import { useTransaction } from "@/stores";
import axios from "axios";

export default function useDashboard() {
    const [selectedBroker, setSelectedBroker] = useState<string>("all");
    const [globalCurrency, setGlobalCurrency] = useState<"IDR" | "USD">("IDR");
    const [usdToIdrRate, setUsdToIdrRate] = useState<number>(15000);

    const availableAccounts = useTransaction((state) => state.availableAccounts);
    const fetchAccounts = useTransaction((state) => state.fetchAccounts);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
                const rates = res.data.rates;
                if (rates && rates.IDR) {
                    setUsdToIdrRate(rates.IDR);
                }
            } catch (err) {
                console.error("Failed to fetch exchange rate", err);
            }
        };

        fetchRate();
    }, []);

    useEffect(() => {
        fetchAccounts("stock_balance");
    }, [fetchAccounts]);

    return {
        selectedBroker,
        setSelectedBroker,
        globalCurrency,
        setGlobalCurrency,
        usdToIdrRate,
        availableAccounts
    };
}
