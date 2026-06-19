"use client"

import { useState } from "react";
import useSWR from "swr";
import { axios } from "@/lib";
import { AssetInfo, AssetOverview, AssetChartResponse } from "@/schemas/asset.schema";

/** Market yang didukung sistem. */
export type MarketType = "IDX" | "US";

const fetcher = (url: string) => axios.get(url).then(res => res.data.data);

/** Memetakan MarketType ke string yang dipahami backend. */
function toBackendMarket(market: MarketType): string {
    return market === "US" ? "america" : "indonesia";
}

/**
 * useAssets — fully-controlled hook.
 *
 * selectedTicker is owned by the PARENT (CompositeClient) and passed in
 * directly. This avoids all useState-vs-prop sync races that caused the
 * "market switches back to Indonesian" bug.
 */
export default function useAssets(
    selectedTicker: string | null,
    market: MarketType = "IDX"
) {
    const [timeframe, setTimeframe] = useState<string>("1M");

    // Endpoint berbeda per market. Market is part of the SWR key so each
    // market has its own isolated cache entry — prevents stale IDX data
    // from showing briefly when switching to US.
    const itemsEndpoint = market === "US" ? "/asset/get-items-us" : "/asset/get-items";

    const { data: items, error: itemsError, isLoading: itemsLoading } = useSWR<AssetOverview[]>(
        [itemsEndpoint, market],
        ([url]) => fetcher(url),
        { refreshInterval: 15000, revalidateOnFocus: true }
    );

    const backendMarket = toBackendMarket(market);

    const { data: detailData, error: detailError, isLoading: detailLoading } = useSWR<AssetInfo | null>(
        selectedTicker ? `/asset/get-item/${selectedTicker}?market=${backendMarket}` : null,
        fetcher,
        { refreshInterval: 10000, revalidateOnFocus: true, keepPreviousData: true }
    );

    const { data: chartData, error: chartError, isLoading: chartLoading } = useSWR<AssetChartResponse | null>(
        selectedTicker ? `/asset/get-chart/${selectedTicker}?timeframe=${timeframe}&market=${backendMarket}` : null,
        fetcher,
        { refreshInterval: 10000, revalidateOnFocus: true, keepPreviousData: true }
    );

    return {
        items: items || [],
        itemsLoading,
        itemsError,

        detailData,
        detailLoading,
        detailError,

        chartData,
        chartLoading,
        chartError,

        timeframe,
        setTimeframe,
    };
}
