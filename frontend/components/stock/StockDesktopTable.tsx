import { FolderOpen } from "lucide-react";
import { Formatter } from "@/lib";
import { useUser } from "@/stores";
import { PnLReportModal } from "@/components/trades";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import type { PortfolioItem } from "@/schemas/balance.schema";

interface StockMobileCardProps {
    stocks: PortfolioItem[];
    loading: boolean;

    handleAddRedirect: (action?: string, ticker?: string) => void;
    handleTickerChange: (ticker: string) => void;
}

export default function StockDesktopTable({ stocks, loading, handleAddRedirect, handleTickerChange }: StockMobileCardProps) {
    const user = useUser((state) => state.user);
    return (
        <div className="hidden md:block overflow-x-auto">
            <Table className="mt-5">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Ticker</TableHead>
                        <TableHead>Total Qty (Lot)</TableHead>
                        <TableHead>Invested Total</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>PnL Unrealized</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        // Render 5 baris skeleton saat loading
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} className="border-zinc-800/50">
                                <TableCell><Skeleton className="h-5 w-16 bg-zinc-800" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20 bg-zinc-800" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-28 bg-zinc-800" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24 bg-zinc-800" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32 bg-zinc-800" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24 bg-zinc-800" /></TableCell>
                                <TableCell className="flex justify-end gap-2">
                                    <Skeleton className="h-9 w-16 bg-zinc-800" />
                                    <Skeleton className="h-9 w-16 bg-zinc-800" />
                                </TableCell>
                            </TableRow>
                        ))) : stocks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-zinc-500 italic">
                                    <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer" role="button" tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddRedirect()} onClick={() => handleAddRedirect()}>
                                        <FolderOpen className="h-4 w-4 text-2xl opacity-20" />
                                        <p>No stocks found. Start by adding your first position!</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : stocks.map((stock, idx) => {
                            const currentPrice = stock.current_price;
                            const isProfit = stock.pnl_percentage > 0;
                            const pnlSign = isProfit ? "+" : "";

                            return (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium cursor-pointer" role="button" tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTickerChange(stock.ticker)} onClick={() => handleTickerChange(stock.ticker)}>
                                        <div>{stock.ticker}</div>
                                    </TableCell>
                                    <TableCell>{Formatter.formatNumber(stock.total_qty / 100)}</TableCell>
                                    <TableCell>{Formatter.formatCurrency(stock.invested_total, stock.currency)}</TableCell>
                                    <TableCell>{Formatter.formatCurrency(currentPrice, stock.currency)}</TableCell>
                                    <TableCell className={isProfit ? "text-emerald-400" : "text-red-400"}>
                                        {pnlSign}{Formatter.formatNumber(stock.unrealized_pnl, true)} ({pnlSign}{Formatter.formatNumber(stock.pnl_percentage)}%)
                                    </TableCell>
                                    <TableCell>{Formatter.formatDate(stock.updated_at)}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <PnLReportModal stock={stock} username={user?.username || ""} />
                                        <Button className="bg-green-600 text-white" onClick={() => handleAddRedirect("add", stock.ticker)}>Buy</Button>
                                        <Button className="bg-red-600 text-white" onClick={() => handleAddRedirect("sell", stock.ticker)}>Sell</Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                </TableBody>
            </Table>
        </div>
    )
}