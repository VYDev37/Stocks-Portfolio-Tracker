import React from "react";
import type { TransactionInfo } from "@/schemas/transaction.schema";

import { Formatter } from "@/lib";

import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface TranCardProps {
    transactions: TransactionInfo[];
    loading: boolean;
}

export default React.memo(function TransactionCard({ transactions, loading }: TranCardProps) {
    return loading ? (
        Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full bg-slate-800/50 rounded-xl" />
        ))
    ) : transactions.length > 0 ? (
        transactions.map((transaction) => {
            const sign = transaction.realized_pnl > 0 ? "+" : "-";
            const color = transaction.realized_pnl === 0 ? "text-slate-400" : sign === "+" ? "text-emerald-500" : "text-red-500";
            const rPnlPercentage = (transaction.realized_pnl / transaction.base_price) * 100;

            const isCashflow = transaction.transaction_type === "cashflow";
            const isSell = transaction.transaction_type.toLowerCase() === "sell";
            return (
                <Sheet key={transaction.id}>
                    <SheetTrigger asChild>
                        <Card className="border-slate-800 bg-slate-950/50 cursor-pointer hover:bg-slate-900/50 transition-colors shadow-sm">
                            <CardContent className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded text-xs tracking-wide">
                                            {transaction.ticker}
                                        </span>
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${transaction.transaction_type.toLowerCase() === 'buy'
                                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}
                                        >
                                            {transaction.transaction_type}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-white">
                                        {Formatter.formatCurrency(isCashflow ? transaction.base_price
                                            : isSell ? transaction.sell_price_unit : transaction.entry_price_unit, transaction.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-400">
                                    <span>{Formatter.formatDate(transaction.created_at)}</span>
                                    {!isCashflow && (<span>{Formatter.formatNumber(transaction.quantity / 100)} lot</span>)}
                                </div>
                            </CardContent>
                        </Card>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] bg-slate-950 border-slate-800 text-slate-300 rounded-t-xl sm:max-w-md mx-auto w-[92%] overflow-y-auto">
                        <SheetHeader className="text-left">
                            <SheetTitle className="text-white text-xl">Transaction Details</SheetTitle>
                            <SheetDescription className="hidden">Transaction Details</SheetDescription>
                            <div className="flex items-center gap-2 mt-3 mb-1">
                                <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded text-sm tracking-wide">
                                    {transaction.ticker}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${transaction.transaction_type.toLowerCase() === 'buy'
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                    }`}
                                >
                                    {transaction.transaction_type}
                                </span>
                            </div>
                        </SheetHeader>

                        <div className="mt-6 space-y-2 pb-6">
                            <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                                <span className="text-slate-400 text-sm">Date</span>
                                <span className="font-medium text-white text-sm text-right">{Formatter.formatDate(transaction.created_at)}</span>
                            </div>
                            {!isCashflow && (
                                <>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                                        <span className="text-slate-400 text-sm">Quantity</span>
                                        <span className="font-medium text-white text-sm">{Formatter.formatNumber(transaction.quantity / 100)} lot</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                                        <span className="text-slate-400 text-sm">Price per unit</span>
                                        <span className="font-medium text-white text-sm">{Formatter.formatCurrency(isSell ? transaction.sell_price_unit : transaction.entry_price_unit, transaction.currency)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                                        <span className="text-slate-400 text-sm">Fee</span>
                                        <span className="font-medium text-white text-sm">{Formatter.formatCurrency(transaction.transaction_fee, transaction.currency)}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                                <span className="text-slate-400 text-sm">Base Price</span>
                                <span className="font-medium text-white text-sm">{transaction.base_price <= 0 ? "-" : Formatter.formatCurrency(transaction.base_price, transaction.currency)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                                <span className="text-slate-400 text-sm">Total Value</span>
                                <span className="font-medium text-white text-sm">{Formatter.formatCurrency(transaction.price, transaction.currency)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                {isCashflow ? (
                                    <>
                                        <span className="text-slate-400 text-sm">Notes</span>
                                        <div className={`font-medium text-sm text-right whitespace-pre-wrap ${color}`}>
                                            {!transaction.notes ? "-" : transaction.notes}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-slate-400 text-sm">Realized PnL</span>
                                        <div className={`font-medium text-sm text-right ${color}`}>
                                            {transaction.realized_pnl === 0 ? "-" :
                                                `${sign}${Formatter.formatCurrency(Math.abs(transaction.realized_pnl), transaction.currency)} 
                                                            (${sign}${Formatter.formatNumber(Math.abs(rPnlPercentage))}%)`}
                                        </div>
                                    </>
                                )}
                                <div>
                                    <span className="text-slate-400 text-sm">Provider - Account</span>
                                    <div className={`font-medium text-sm text-right whitespace-pre-wrap ${color}`}>
                                        {`${transaction.provider} - ${transaction.account_no}`}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </SheetContent>
                </Sheet>
            )
        })
    ) : (
        <div className="text-center text-slate-400 py-12 bg-slate-950/50 backdrop-blur-sm rounded-lg border border-slate-800 shadow-xl">
            No transactions found.
        </div>
    )
});