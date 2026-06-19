import { ChartLine } from "lucide-react";
import { useUser } from "@/stores";
import { PnLReportModal } from "@/components/trades";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { Formatter } from "@/lib";
import type { PortfolioItem } from "@/schemas/balance.schema";

interface StockMobileCardProps {
    stocks: PortfolioItem[];
    loading: boolean;

    handleAddRedirect: (action?: string, ticker?: string) => void;
    handleTickerChange: (ticker: string) => void;
}

export default function StockMobileCard({ stocks, loading, handleAddRedirect, handleTickerChange }: StockMobileCardProps) {
    const user = useUser((state) => state.user);
    return (
        <div className="grid grid-cols-1 gap-4 md:hidden">
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="bg-zinc-900/50 border-white/10 p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-10 bg-zinc-800" />
                                <Skeleton className="h-6 w-20 bg-zinc-800" />
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                                <Skeleton className="h-3 w-20 bg-zinc-800" />
                                <Skeleton className="h-5 w-24 bg-zinc-800" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-16 bg-zinc-800" />
                                <Skeleton className="h-4 w-24 bg-zinc-800" />
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                                <Skeleton className="h-3 w-16 bg-zinc-800" />
                                <Skeleton className="h-4 w-12 bg-zinc-800" />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Skeleton className="h-10 flex-1 bg-zinc-800 rounded-md" />
                            <Skeleton className="h-10 flex-1 bg-zinc-800 rounded-md" />
                        </div>
                    </Card>
                ))
            ) : stocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 mt-4 border-2 border-dashed border-white/5 rounded-2xl bg-zinc-900/20 text-center">
                    <div className="h-16 w-16 bg-sky-500/10 rounded-full flex items-center justify-center mb-4">
                        <ChartLine className="h-8 w-8 text-sky-500 opacity-50" />
                    </div>

                    <h3 className="text-lg font-semibold text-white">Your portfolio is empty</h3>
                    <p className="text-sm text-zinc-500 mt-1 mb-6 max-w-[200px]">
                        Ready to start your investment journey? Add your first stock now.
                    </p>

                    <Button variant="gradient" onClick={() => handleAddRedirect()}>
                        + Start Investing
                    </Button>
                </div>
            ) : stocks.map((stock, idx) => {
                const currentPrice = stock.current_price;
                const isProfit = stock.pnl_percentage > 0;
                const pnlSign = isProfit ? "+" : "";

                return (
                    <Card key={idx} className="bg-zinc-900/50 border-white/10 p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-xs text-zinc-400 uppercase tracking-wider">Ticker</div>
                                <div className="text-lg font-bold text-sky-400" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleTickerChange(stock.ticker)}
                                    onClick={() => handleTickerChange(stock.ticker)}>{stock.ticker}</div>

                            </div>
                            <div className="text-right">
                                <div className="text-xs text-zinc-400 uppercase tracking-wider">Market Value</div>
                                <div className={cn("text-sm font-bold", isProfit ? "text-emerald-400" : "text-red-400")}>
                                    {stock.pnl_percentage === 0 ? "" : isProfit ? "▲" : "▼"} {Formatter.formatNumber(currentPrice / stock.total_qty)} ({pnlSign}{Formatter.formatNumber(stock.pnl_percentage)}%)
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5">
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase">Invested Total</div>
                                <div className="text-sm font-medium">{Formatter.formatCurrency(stock.invested_total, stock.currency)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-zinc-500 uppercase">Total Qty</div>
                                <div className="text-sm font-medium">{Formatter.formatNumber(stock.total_qty / 100)} Lot</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/5">
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase">Current Price</div>
                                <div className="text-sm font-medium">{Formatter.formatCurrency(currentPrice, stock.currency)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">PnL Unrealized</div>
                                <div className={cn("text-sm font-bold", isProfit ? "text-emerald-400" : "text-red-400")}>
                                    {isProfit ? "▲" : "▼"} {Formatter.formatNumber(stock.unrealized_pnl, true)} ({pnlSign}{Formatter.formatNumber(stock.pnl_percentage, true)}%)
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <PnLReportModal stock={stock} username={user?.username || ""} />
                            <Button className="flex-1 bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600 hover:text-white transition-all"
                                onClick={() => handleAddRedirect("add", stock.ticker)}>Buy</Button>
                            <Button className="flex-1 bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600 hover:text-white transition-all"
                                onClick={() => handleAddRedirect("sell", stock.ticker)}>Sell</Button>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}