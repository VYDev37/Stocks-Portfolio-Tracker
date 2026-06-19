"use client"

import { useState, useEffect } from "react";
import useSWR from "swr";
import { axios } from "@/lib";

const fetcher = (url: string) => axios.get(url).then(res => res.data.price);

export default function useGetCurrentPrice(ticker: string, market: "IDX" | "US" = "IDX") {
    const [debouncedTicker, setDebouncedTicker] = useState(ticker);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTicker(ticker);
        }, 800);

        return () => clearTimeout(handler);
    }, [ticker]);

    const shouldFetch = Boolean(debouncedTicker && debouncedTicker.length >= 1);
    const { data: price, error, isLoading, mutate } = useSWR(
        shouldFetch ? `/position/get-price/${debouncedTicker.toUpperCase()}?market=${market}` : null,
        fetcher,
        {
            refreshInterval: 15000,
            revalidateOnFocus: true,
        }
    );

    return {
        price: price || 0,
        loading: isLoading && shouldFetch,
        error: error ? (error.response?.data?.message || "Failed to get price.") : null,
        refetchPrice: mutate
    };
}