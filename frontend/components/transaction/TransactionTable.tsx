import React from "react";
import type { TransactionInfo } from "@/schemas/transaction.schema";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

import { CustomDialog } from "@/components/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Formatter } from "@/lib";
import { PnLReportModal } from "@/components/trades";

import { ArrowUpDown, Info } from "lucide-react";

interface TranTableProps {
    transactions: TransactionInfo[];
    loading: boolean;
    username: string;
    toggleSort: () => void;
}

export default React.memo(function TransactionTable({ transactions, loading, username, toggleSort }: TranTableProps) {
    return (
        <Card className="hidden md:block border-slate-800 bg-slate-950/50 backdrop-blur-sm shadow-xl">
            <CardContent className="p-0">
                <div className="rounded-md border border-slate-800">
                    <Table>
                        <TableHeader className="bg-slate-900">
                            <TableRow className="hover:bg-slate-900/50 border-slate-800">
                                <TableHead className="w-[180px] cursor-pointer hover:text-white transition-colors" onClick={toggleSort}>
                                    <div className="flex items-center gap-2">
                                        Date
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead>Ticker</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Quantity (Lot)</TableHead>
                                <TableHead className="text-right">Price per unit</TableHead>
                                <TableHead className="text-right">Base Price</TableHead>
                                <TableHead className="text-right">Fee</TableHead>
                                <TableHead className="text-right">Total Value</TableHead>
                                <TableHead className="text-right">Realized PnL</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                // Loading Skeletons
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-slate-800">
                                        <TableCell><Skeleton className="h-4 w-32 bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12 bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 bg-slate-800 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20 bg-slate-800 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24 bg-slate-800 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 bg-slate-800 ml-auto" /></TableCell>
                                        <TableCell>
                                            <div className="flex flex-col items-end gap-1">
                                                <Skeleton className="h-4 w-20 bg-slate-800" />
                                                <Skeleton className="h-3 w-12 bg-slate-800" />
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-4 w-24 bg-slate-800 ml-auto" /></TableCell>
                                        <TableCell className="text-center">
                                            <Skeleton className="h-8 w-8 bg-slate-800 mx-auto rounded-md" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (transactions && transactions.length > 0) ? (
                                transactions.map((transaction) => {
                                    const sign = transaction.realized_pnl > 0 ? "+" : "-";
                                    const color = transaction.realized_pnl === 0 ? "" : sign === "+" ? "text-emerald-500" : "text-red-500";
                                    const rPnlPercentage = (transaction.realized_pnl / transaction.base_price) * 100;

                                    const isSell = transaction.transaction_type.toLowerCase() === "sell";
                                    return (
                                        <TableRow key={transaction.id} className="border-slate-800 hover:bg-slate-900/30 transition-colors">
                                            <TableCell className="font-medium text-slate-300">
                                                {Formatter.formatDate(transaction.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded text-xs tracking-wide">
                                                    {transaction.ticker}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${transaction.transaction_type.toLowerCase() === 'buy'
                                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                    }`}
                                                >
                                                    {transaction.transaction_type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-slate-300">
                                                {Formatter.formatNumber(transaction.quantity / 100)}
                                            </TableCell>
                                            <TableCell className="text-right text-slate-300">
                                                {Formatter.formatCurrency(isSell ? transaction.sell_price_unit : transaction.entry_price_unit, transaction.currency)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-white">
                                                {Formatter.formatCurrency(transaction.base_price, transaction.currency)}
                                            </TableCell>
                                            <TableCell className="text-right text-slate-400 text-xs">
                                                {Formatter.formatCurrency(transaction.transaction_fee, transaction.currency)}
                                            </TableCell>
                                            <TableCell className="text-right text-slate-400 text-xs">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-mono">{Formatter.formatCurrency(transaction.price, transaction.currency)}</span>
                                                    {transaction.provider && (
                                                        <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded mt-1 uppercase tracking-wider font-sans">
                                                            {transaction.provider}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className={`text-right text-slate-400 text-xs ${color}`}>
                                                {transaction.realized_pnl === 0 ? "-" :
                                                    `${sign}${Formatter.formatCurrency(Math.abs(transaction.realized_pnl), transaction.currency)} 
                                                                (${sign}${Formatter.formatNumber(Math.abs(rPnlPercentage))}%)`}
                                            </TableCell>
                                            <TableCell className="text-center text-slate-400 text-xs">
                                                {transaction.transaction_type.toLowerCase() === 'sell' && (
                                                    <PnLReportModal transaction={transaction} username={username} />
                                                )}

                                                {transaction.notes && (
                                                    <CustomDialog
                                                        trigger={
                                                            <Button variant="ghost">
                                                                <Info className="h-2 w-2" />
                                                            </Button>
                                                        }
                                                        title="Transaction Notes"
                                                        contentClassName="sm:max-w-md"
                                                    >
                                                        <div className="text-slate-300 text-sm mt-4 break-words whitespace-pre-wrap">
                                                            {transaction.notes || "No notes available for this transaction."}
                                                        </div>
                                                    </CustomDialog>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-32 text-center text-slate-400">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
});