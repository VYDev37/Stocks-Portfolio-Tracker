import { cn } from "@/lib/utils";
import { Formatter } from "@/lib";

import type { TransactionInfo } from "@/schemas/transaction.schema";
import type { PortfolioItem } from "@/schemas/balance.schema";

interface PnLReportProps {
    transaction?: TransactionInfo;
    stock?: PortfolioItem;
    userNickname: string;
    mode: string;
    cardRef?: React.RefObject<HTMLDivElement | null>;
}

export default function PnLReport({ transaction, stock, userNickname, mode, cardRef }: PnLReportProps) {
    const isStock = !!stock;
    const ticker = isStock ? stock.ticker : transaction?.ticker;

    const pnl = isStock ? stock.unrealized_pnl : transaction?.realized_pnl || 0;
    const isProfit = pnl > 0;
    const roiPercentage = isStock ? stock.pnl_percentage : ((transaction?.realized_pnl || 0) / (transaction?.base_price || 1)) * 100;

    const date = isStock ? new Date(stock.updated_at) : new Date(transaction?.created_at || new Date());

    return (
        <div ref={cardRef} className="w-[500px] aspect-square p-10 bg-zinc-950 text-white relative flex flex-col justify-between border border-white/10 select-none">
            <div className={cn("absolute -top-20 -right-20 w-72 h-72 rounded-full blur-[100px] opacity-25",
                isProfit ? "bg-emerald-600" : "bg-red-600")} />

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <div className="text-sky-500 font-black tracking-tighter text-3xl leading-none">
                        <span className="text-white">{isStock ? "PORTFOLIO" : "TRADE"}</span>
                    </div>
                    <p className="text-zinc-500 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold">
                        {isStock ? "Unrealized" : transaction?.transaction_type} Report • {userNickname}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Date</p>
                    <p className="text-xs font-medium text-zinc-300">
                        {date.toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Main Stats: The "Profit/Loss" Highlight */}
            <div className="relative z-10 flex flex-col items-center py-6">
                <div className="flex items-center gap-3 mb-1">
                    <span className="h-px w-8 bg-zinc-800"></span>
                    <h2 className="text-2xl font-bold tracking-[0.3em] text-zinc-400">IDX: {ticker}</h2>
                    <span className="h-px w-8 bg-zinc-800"></span>
                </div>

                <div className={cn(
                    "text-6xl font-black tracking-tighter leading-none my-2",
                    isProfit ? "text-emerald-400" : "text-red-400"
                )}>
                    {isProfit ? "+" : ""}{mode !== "pnl" ? `${roiPercentage.toFixed(2)}%` : `${Formatter.formatCurrency(pnl, stock?.currency)}`}
                </div>

                {(mode === "pnl_roi") && (<div className={cn(
                    "px-6 py-2 rounded-full font-black text-xl flex items-center gap-2",
                    isProfit ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                )}>
                    {Formatter.formatCurrency(pnl, stock?.currency)}
                </div>)}
            </div>

            {/* Transaction Details Footer */}
            <div className="relative z-10 grid grid-cols-2 gap-y-6 pt-10 border-t border-white/5">
                <div>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">
                        {isStock ? "Avg Price" : "Entry Avg Price"}
                    </p>
                    <p className="text-xl font-bold font-mono">
                        {isStock ? Formatter.formatNumber((stock.invested_total / (stock.total_qty || 1))) : Formatter.formatNumber(transaction?.entry_price_unit || 0)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">
                        {isStock ? "Current Price" : "Sell Avg Price"}
                    </p>
                    <p className="text-xl font-bold font-mono">
                        {isStock ? Formatter.formatNumber((stock.current_price || 0) / stock.total_qty) : Formatter.formatNumber(transaction?.sell_price_unit || 0)}
                    </p>
                </div>
                <div>
                    {!isStock && (
                        <>
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">
                                Fee
                            </p>
                            <p className="text-sm font-bold text-zinc-400">
                                {Formatter.formatCurrency(transaction?.transaction_fee || 0, transaction?.currency)}
                            </p>
                        </>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">
                        {isStock ? "Total Lot" : "Sell Lot"}
                    </p>
                    <p className="text-sm font-bold text-zinc-400">
                        {isStock ? Formatter.formatNumber((stock.total_qty || 0) / 100) : Formatter.formatNumber((transaction?.quantity || 0) / 100)}
                    </p>
                </div>
            </div>
        </div>
    );
};