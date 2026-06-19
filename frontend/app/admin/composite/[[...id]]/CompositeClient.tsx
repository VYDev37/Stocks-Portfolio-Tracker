"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCompositeClient } from "@/hooks";
import { type MarketType } from "@/hooks/asset/useAssets";
import {
    LogEntry, OrderBook, TickerList, HeaderSummary,
    TechnicalChart, FundamentalsGrid, FinancialTables
} from "@/components/terminal";
import { Searchbar } from "@/components/shared";

export default function CompositeClient({
    initialId,
    initialMarket = "IDX"
}: {
    initialId?: string[],
    initialMarket?: MarketType
}) {
    const {
        market,
        searchQuery,
        selectedTicker,
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
    } = useCompositeClient({ initialId, initialMarket });

    /** Tombol switch market: IDX | US */
    const MarketSwitcher = () => (
        <div className="flex gap-1 p-1 bg-zinc-800/60 rounded border border-white/5">
            {(["IDX", "US"] as MarketType[]).map((m) => (
                <button
                    key={m}
                    onClick={() => handleMarketSwitch(m)}
                    className={`px-3 py-1 text-[10px] font-black tracking-widest rounded transition-all duration-150 ${market === m
                        ? "bg-emerald-500 text-black"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                        }`}
                >
                    {m}
                </button>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col h-full py-4 md:py-6 font-mono relative">

            {/* Mobile Header / Drawer Trigger */}
            <div className="lg:hidden flex items-center justify-between px-4 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-white">{marketLabel} Terminal</span>
                    <MarketSwitcher />
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-zinc-900 border-white/10 text-white hover:bg-zinc-800">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] max-w-sm bg-[#0a0a0a] border-r border-white/10 p-0 flex flex-col font-mono">
                        <SheetHeader className="p-4 border-b border-white/10 text-left">
                            <SheetTitle className="text-xs font-bold text-zinc-400 tracking-wider">{marketLabel}_ACTIVE_LIST</SheetTitle>
                        </SheetHeader>
                        <Searchbar onSearch={handleSearch} label="Search ticker..." initialValue={searchQuery} />
                        <TickerList
                            items={filteredItems}
                            itemsLoading={itemsLoading}
                            selectedTicker={selectedTicker || ""}
                            onSelect={handleSelectTicker}
                        />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Container */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden gap-4 md:gap-6 px-4 lg:px-0">
                {/* Column 1: Desktop Ticker List */}
                <div className="hidden lg:flex w-80 flex-col border border-white/10 bg-zinc-900/50 rounded-lg overflow-hidden shrink-0 shadow-xl">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="text-xs font-bold text-zinc-400 tracking-wider mb-3">{marketLabel}_ACTIVE_LIST</h3>
                        <div className="flex items-center gap-2">
                            <MarketSwitcher />
                            <span className="bg-zinc-800 px-2 py-1 text-[10px] font-bold border border-white/10 rounded">ALL_MARKET</span>
                        </div>
                    </div>
                    <Searchbar
                        label="Search ticker..."
                        onSearch={handleSearch}
                        initialValue={searchQuery}
                    />
                    <TickerList
                        items={filteredItems}
                        itemsLoading={itemsLoading}
                        selectedTicker={selectedTicker || ""}
                        onSelect={handleSelectTicker}
                    />
                </div>

                {/* Main Content Area (Right Side) */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pb-24 lg:pb-6 pr-1 lg:pr-2">
                    <HeaderSummary
                        high24h={chartData?.daily_high || detailData?.price || 0}
                        chartLastPrice={chartData?.last_price}
                        detailData={detailData || null}
                        detailLoading={detailLoading}
                        selectedTicker={selectedTicker || ""}
                        market={market}
                    />

                    <TechnicalChart
                        chartData={chartData || null}
                        chartLoading={chartLoading}
                        detailData={detailData || null}
                        timeframe={timeframe}
                        setTimeframe={setTimeframe}
                    />

                    <FundamentalsGrid detailData={detailData || null} />

                    {/* Data Visualizers & Order Book */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 shrink-0">
                        <FinancialTables detailData={detailData || null} />
                        <OrderBook loading={detailLoading} ticker={selectedTicker || undefined} currentPrice={detailData?.price} />
                    </div>

                    {/* Terminal Log Area (Desktop Only) */}
                    <div className="hidden md:block shrink-0">
                        <LogEntry loading={detailLoading} ticker={selectedTicker || undefined} />
                    </div>
                </div>
            </div>

            {/* Terminal Log Footer (Mobile Only) */}
            <footer className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/5 px-4 py-3 flex items-center gap-2 font-mono text-[10px] text-zinc-400 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <span className="text-emerald-500 text-[8px] animate-pulse">●</span>
                <span className="tracking-widest font-bold">{feedLabel}: {detailLoading ? "LOADING..." : "CONNECTED [14ms]"}</span>
                <span className="ml-auto font-bold text-zinc-600">SYS_OK</span>
            </footer>
        </div>
    );
}
