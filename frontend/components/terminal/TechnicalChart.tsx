"use client";

import { useState } from "react";
import { Activity, CandlestickChart } from "lucide-react";
import { Formatter } from "@/lib";
import { AssetInfo, AssetChartResponse, ChartForm } from "@/schemas/asset.schema";
import { TradingChart } from "./chart";

interface TechnicalChartProps {
    chartData: AssetChartResponse | null;
    chartLoading: boolean;
    detailData: AssetInfo | null;
    timeframe: string;
    setTimeframe: (tf: string) => void;
}

export default function TechnicalChart({ chartData, chartLoading, detailData, timeframe, setTimeframe }: TechnicalChartProps) {
    const [chartForm, setChartForm] = useState<ChartForm>("candle");
    const handleChange = (newForm: ChartForm) => {
        if (newForm !== chartForm)
            setChartForm(newForm);
    }

    return (
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden min-h-[300px] lg:min-h-[400px] shadow-2xl relative shrink-0">
            <div className="flex justify-between items-center p-0 lg:p-2 border-b border-white/5 bg-zinc-900/60 overflow-x-auto">
                <div className="flex flex-1 lg:flex-none">
                    {["1D", "5D", "1M", "3M", "6M", "1Y", "2Y", "5Y", "10Y", "YTD", "MAX"].map((tf) => {
                        const isActive = timeframe === tf;
                        return (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`flex-1 lg:flex-none px-4 py-3 lg:py-1.5 text-[10px] md:text-xs transition-colors ${isActive
                                    ? "font-black bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500 lg:rounded-t"
                                    : "font-bold text-zinc-500 hover:text-white"
                                    }`}
                            >
                                {tf}
                            </button>
                        );
                    })}
                </div>
                <div className="hidden lg:flex gap-4 text-zinc-500 pr-4">
                    <button onClick={() => setChartForm("candle")} type="button"
                        className={`p-2 rounded-md transition-all duration-200 ${chartForm === "candle"
                            ? "bg-zinc-800 text-emerald-400 shadow-inner"
                            : "hover:bg-zinc-800/50 hover:text-zinc-300"
                            }`}><CandlestickChart className="w-4 h-4 cursor-pointer hover:text-emerald-400 transition-colors" /></button>
                    <button onClick={() => handleChange("line")} type="button"
                        className={`p-2 rounded-md transition-all duration-200 ${chartForm === "line"
                            ? "bg-zinc-800 text-emerald-400 shadow-inner"
                            : "hover:bg-zinc-800/50 hover:text-zinc-300"
                            }`}><Activity className="w-4 h-4 cursor-pointer hover:text-emerald-400 transition-colors" /></button>

                </div>
            </div>

            {/* <div className="flex-1 relative bg-[#0a0a0a] p-2 lg:p-4 flex flex-col min-h-[250px] overflow-hidden">
                <div className="absolute top-4 left-4 flex flex-col gap-1 z-10 font-mono text-xs font-bold">
                    <span className="text-emerald-500">O: {formatNum(chartData?.daily_open)}</span>
                    <span className="text-emerald-500">H: {formatNum(chartData?.daily_high)}</span>
                    <span className="text-rose-500">L: {formatNum(chartData?.daily_low)}</span>
                    <span className="text-emerald-500">C: {formatNum(chartData?.last_price)}</span>
                </div>

                <div className="hidden lg:flex absolute inset-0 items-center justify-center text-zinc-800 text-xs tracking-widest font-black z-0 font-mono">
                    {chartLoading ? "LOADING_CHART_DATA..." : "[ TECHNICAL_CHART_RENDER_AREA ]"}
                </div>

                <div className="absolute inset-x-0 top-[20%] border-b border-white/5 border-dashed pointer-events-none"></div>
                <div className="absolute inset-x-0 top-[50%] border-b border-white/5 border-dashed pointer-events-none"></div>
                <div className="absolute inset-x-0 top-[80%] border-b border-white/5 border-dashed pointer-events-none"></div>

                <div className="absolute inset-x-0 bottom-0 h-[80%] flex items-end justify-around gap-1 px-4 lg:px-8 z-10 opacity-60">
                    {[
                        { h: 40, c: "rose" }, { h: 55, c: "emerald" }, { h: 50, c: "rose" },
                        { h: 65, c: "emerald" }, { h: 75, c: "emerald" }, { h: 70, c: "rose" },
                        { h: 85, c: "emerald" }, { h: 95, c: "emerald" }
                    ].map((candle, i) => (
                        <div key={i} className={`w-full max-w-[8px] md:max-w-[12px] lg:max-w-[24px] ${candle.c === 'rose' ? 'bg-rose-500/20 border-t-2 border-rose-500' : 'bg-emerald-500/20 border-t-2 border-emerald-500'} relative`} style={{ height: `${candle.h}%` }}>
                            <div className={`absolute left-1/2 -top-2 lg:-top-6 -bottom-2 lg:-bottom-6 w-[1px] lg:w-[2px] ${candle.c === 'rose' ? 'bg-rose-500/40' : 'bg-emerald-500/40'} -translate-x-1/2`}></div>
                        </div>
                    ))}
                </div>
            </div> */}
            <TradingChart data={chartData!} isLoading={chartLoading} chartForm={chartForm}
                extraData={{ volume: detailData?.volume || 0 }} />

            {/* Indicators Strip */}
            <div className="flex gap-4 p-3 bg-zinc-900/60 border-t border-white/5 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <span className="text-[10px] font-black text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded border border-emerald-500/20 tracking-wider">RSI: {Formatter.formatNumber(detailData?.rsi) || "---"}</span>
                <span className="text-[10px] font-bold text-zinc-400 px-3 py-1 border border-white/5 rounded tracking-wider">MACD: {Formatter.formatNumber(detailData?.momentum) || "---"}</span>
                <span className="text-[10px] font-bold text-zinc-400 px-3 py-1 border border-white/5 rounded tracking-wider">VOL: {Formatter.formatLargeNumber(detailData?.volume) || "---"}</span>
                <span className="text-[10px] font-bold text-zinc-400 px-3 py-1 border border-white/5 rounded tracking-wider">
                    AI Signal: {detailData?.tech_rating_1d}
                </span>
            </div>
        </div >
    );
}
