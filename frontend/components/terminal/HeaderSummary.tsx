"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Formatter } from "@/lib";
import { AssetInfo } from "@/schemas/asset.schema";
import { useRouter } from "next/navigation";
import { MarketType } from "@/hooks/asset/useAssets";

interface HeaderSummaryProps {
    detailData: AssetInfo | null;
    high24h: number;
    chartLastPrice?: number;
    detailLoading: boolean;
    selectedTicker: string;
    market?: MarketType;
}

export default function HeaderSummary({ detailData, high24h, chartLastPrice, detailLoading, selectedTicker, market = "IDX" }: HeaderSummaryProps) {
    // chartLastPrice (from chart endpoint) takes priority over detailData.price
    // because chart data refreshes in sync with the candle movement
    const displayPrice = chartLastPrice || detailData?.price;
    const router = useRouter();

    // Format harga sesuai market: US = desimal USD, IDX = integer IDR
    const formatPrice = (price?: number) => {
        if (price === undefined || price === null) return "---";
        if (market === "US") {
            return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return Formatter.formatNumber(price);
    };

    // Format perubahan harga dalam nominal
    const formatPriceChange = (change?: number, basePrice?: number) => {
        if (!change || !basePrice) return "---";
        const delta = ((change / 100) * basePrice);
        const sign = delta > 0 ? "+" : "-";
        if (market === "US") {
            return `${sign}$${Math.abs(delta).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return `${sign}${Formatter.formatNumber(Math.abs(delta), true)}`;
    };

    const handleRedirect = (ticker: string, mode: "sell" | "buy") => {
        router.push(`/admin/stocks/?action=${mode === "buy" ? "add" : mode}&ticker=${ticker}`, { scroll: false });
    };

    return (
        <Card className="border-white/5 bg-zinc-950/50 shadow-2xl relative overflow-hidden shrink-0">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0"></div>

            <CardContent className="p-4 lg:p-6 relative z-10">
                {detailLoading && !detailData ? (
                    <div className="h-24 flex items-center justify-center text-zinc-500 text-sm animate-pulse">FETCHING_ASSET_DATA...</div>
                ) : !selectedTicker ? (
                    <div className="h-24 flex items-center justify-center text-zinc-500 text-sm">SELECT_A_TICKER_FROM_SIDEBAR</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* TOP SECTION: Ticker (Left) and Day Change (Right) */}
                        <div className="flex justify-between items-start w-full">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter font-sans">
                                        {detailData?.ticker || selectedTicker || "---"}
                                    </h1>
                                    <span className="hidden lg:inline-block text-[10px] text-emerald-400 bg-emerald-900/30 px-2 py-0.5 border border-emerald-500/20 rounded font-bold tracking-wider">LIVE_TRACKING</span>
                                </div>
                                <p className="text-[10px] md:text-xs font-bold text-zinc-400 tracking-widest uppercase truncate max-w-[200px] lg:max-w-none">
                                    {detailData?.description || "---"}
                                </p>
                            </div>

                            {/* Day Change Section - Forced to Right */}
                            <div className={`flex flex-col items-end ${(detailData?.change! >= 0) ? 'text-emerald-500' : 'text-rose-500'}`}>
                                <span className="text-[10px] text-zinc-500 font-bold mb-1 hidden lg:block tracking-wider">DAY_CHANGE</span>
                                <div className="flex flex-col items-end lg:flex-row lg:items-baseline lg:gap-2">
                                    <span className="text-xl lg:text-3xl font-mono font-bold">
                                        {formatPriceChange(detailData?.change, high24h)}
                                    </span>
                                    <span className="text-xs lg:text-xl font-mono font-bold opacity-80">
                                        ({Formatter.formatPercent(detailData?.change)})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM SECTION: Last Price and Buttons */}
                        <div className="flex justify-between items-end w-full mt-2 gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 font-bold mb-1 hidden lg:block tracking-wider">LAST_PRICE</span>
                                <span className="text-4xl lg:text-5xl text-white font-mono tracking-tight font-black leading-none">
                                    {formatPrice(displayPrice)}
                                </span>
                            </div>

                            {/* Buttons (hidden on mobile) */}
                            <div className="flex gap-2 lg:gap-3 mb-1 shrink-0">
                                <Button onClick={() => handleRedirect(detailData?.ticker || "", "buy")}
                                    className="h-10 w-16 lg:w-28 bg-transparent border border-emerald-500/50 text-emerald-400 text-[10px] lg:text-xs font-black tracking-widest hover:bg-emerald-500 hover:text-black transition-all" disabled={detailLoading}>BUY</Button>
                                <Button onClick={() => handleRedirect(detailData?.ticker || "", "sell")}
                                    className="h-10 w-16 lg:w-28 bg-transparent border border-rose-500/50 text-rose-400 text-[10px] lg:text-xs font-black tracking-widest hover:bg-rose-500 hover:text-black transition-all" disabled={detailLoading}>SELL</Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
