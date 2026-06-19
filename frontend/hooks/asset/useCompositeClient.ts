"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useAssets, { type MarketType } from "./useAssets";

const DEFAULT_TICKERS: Record<MarketType, string> = {
    IDX: "BBCA",
    US: "AAPL",
};

interface UseCompositeClientProps {
    initialId?: string[];
    initialMarket?: MarketType;
}

export default function useCompositeClient({
    initialId,
    initialMarket = "IDX"
}: UseCompositeClientProps = {}) {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlTicker = initialId || params.id;

    const [market, setMarket] = useState<MarketType>(initialMarket);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

    const [selectedTicker, setSelectedTicker] = useState<string | null>(
        urlTicker ? urlTicker[0] : null
    );

    const {
        items, itemsLoading,
        detailData, detailLoading,
        chartData, chartLoading,
        timeframe, setTimeframe
    } = useAssets(selectedTicker, market);

    useEffect(() => {
        const fromUrl = urlTicker ? urlTicker[0] : null;
        if (fromUrl && fromUrl !== selectedTicker) {
            setSelectedTicker(fromUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlTicker?.[0]]);

    useEffect(() => {
        if (!urlTicker) {
            const qStr = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
            router.replace(`/admin/composite/${DEFAULT_TICKERS[market]}${qStr}`, { scroll: false });
        }
    }, [urlTicker, market, router, searchQuery]);

    useEffect(() => {
        if (!selectedTicker && items && items.length > 0 && !itemsLoading) {
            const first = items[0].ticker;
            setSelectedTicker(first);
            const qStr = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
            router.replace(`/admin/composite/${first}${qStr}`, { scroll: false });
        }
    }, [items, itemsLoading, selectedTicker, router, searchQuery]);

    const handleMarketSwitch = useCallback((newMarket: MarketType) => {
        if (newMarket === market)
            return;
        setMarket(newMarket);
        Cookies.set("terminal_market", newMarket, { expires: 365, path: "/" });
        setSelectedTicker(null);
        setSearchQuery("");
        router.replace(`/admin/composite/${DEFAULT_TICKERS[newMarket]}`, { scroll: false });
    }, [market, router]);

    const filteredItems = useMemo(() => {
        if (!items)
            return [];
        if (!searchQuery.trim())
            return items;

        const q = searchQuery.toUpperCase();
        return items.filter(item =>
            item.ticker.toUpperCase().includes(q)
        );
    }, [items, searchQuery]);

    const handleSearch = useCallback((finalQuery: string) => {
        setSearchQuery(finalQuery);
        const qStr = finalQuery ? `?q=${encodeURIComponent(finalQuery)}` : "";
        router.replace(`/admin/composite/${selectedTicker || DEFAULT_TICKERS[market]}${qStr}`, { scroll: false });
    }, [router, selectedTicker, market]);

    const handleSelectTicker = useCallback((symbol: string) => {
        setSelectedTicker(symbol);
        const qStr = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
        router.push(`/admin/composite/${symbol}${qStr}`, { scroll: false });
    }, [router, searchQuery]);

    const marketLabel = market === "IDX" ? "IDX" : "US";
    const feedLabel = market === "IDX" ? "IDX_FEED" : "US_FEED";

    return {
        market,
        searchQuery,
        selectedTicker,
        items,
        itemsLoading,
        detailData,
        detailLoading,
        chartData,
        chartLoading,
        timeframe,
        setTimeframe,
        handleMarketSwitch,
        filteredItems,
        handleSearch,
        handleSelectTicker,
        marketLabel,
        feedLabel
    };
}
