import React from "react";

export interface Log {
    time: string;
    msg: string | React.ReactNode;
    type?: "info" | "success" | "warning" | "system";
}

interface TerminalFeedProps {
    logs?: Log[];
    ticker?: string;
    loading?: boolean;
}

export default function TerminalFeed({ logs, ticker, loading }: TerminalFeedProps) {
    const defaultLogs: Log[] = [
        { time: new Date().toLocaleTimeString('en-US', { hour12: false }), msg: <><span className="text-emerald-400 font-bold">BUY_ORDER</span> FILLED: 500 LOTS @ {ticker || "---"}</>, type: "success" },
        { time: new Date(Date.now() - 15000).toLocaleTimeString('en-US', { hour12: false }), msg: `BLOCK_TRADE DETECTED: 24,000 LOTS ${ticker || "---"} (FOREIGN_SELL)`, type: "warning" },
        { time: new Date(Date.now() - 48000).toLocaleTimeString('en-US', { hour12: false }), msg: `PRICE_ALERT: ${ticker || "---"} CROSSES 50_SMA (UPWARD)`, type: "info" },
        { time: new Date(Date.now() - 65000).toLocaleTimeString('en-US', { hour12: false }), msg: "SYSTEM: RE-CALCULATING METRICS FOR INDEX", type: "system" },
    ];

    const displayLogs = logs && logs.length > 0 ? logs : defaultLogs;

    return (
        <section className="bg-black/40 border border-white/5 p-6 rounded-2xl shadow-inner group">
            {/* Header Log */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-25" />
                </div>
                <h4 className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">
                    REALTIME_FEED_TERMINAL (MOCK)
                </h4>
                <div className="ml-auto flex gap-4 text-[10px] font-bold text-zinc-600">
                    <span>LATENCY: <span className="text-emerald-500">14ms</span></span>
                    <span className="hidden md:inline">NODE: <span className="text-white">JKT-01</span></span>
                    <span className="text-zinc-400 tracking-widest">SYS_OK</span>
                </div>
            </div>

            {/* Log Entries */}
            <div className="space-y-4 font-mono text-[11px] md:text-xs">
                {loading ? (
                    <div className="text-zinc-500 animate-pulse">CONNECTING TO FEED...</div>
                ) : !ticker ? (
                    <div className="text-zinc-500">AWAITING TICKER SELECTION...</div>
                ) : (
                    displayLogs.map((log, index) => (
                        <LogEntryItem key={index} {...log} />
                    ))
                )}
            </div>

            {/* Decoration Line (Bloomberg Style) */}
            <div className="mt-6 h-[1px] bg-gradient-to-r from-emerald-500/20 via-transparent to-transparent w-full" />
        </section>
    );
};

const LogEntryItem = ({ time, msg, type }: Log) => {
    return (
        <div className="flex gap-4 items-start group/entry">
            <span className="text-zinc-700 shrink-0 select-none">[{time}]</span>
            <div className="text-zinc-400 leading-relaxed group-hover/entry:text-zinc-200 transition-colors">
                {msg}
            </div>
        </div>
    );
};