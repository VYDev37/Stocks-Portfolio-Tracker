"use client";

import type { UserProfile } from "@/schemas/auth.schema";
import { axios, Formatter } from "@/lib";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants, Button } from "@/components/ui/button";

import { ManageBalanceSheet } from "@/components/profile";

import Link from "next/link";
import { Wallet, Landmark, UserCircle, PlusCircleIcon, DownloadIcon, InfoIcon } from "lucide-react";

interface AccountSummaryCardProps {
    user: UserProfile;
}

export default function AccountSummaryCard({ user }: AccountSummaryCardProps) {
    const downloadExcel = async () => {
        try {
            const response = await axios.get('/report/get', { responseType: 'blob' });
            const url = window.URL.createObjectURL(response.data);

            const a = document.createElement('a');
            a.href = url;
            a.download = "report.xlsx";
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error when trying to download: ", error);
        }
    };
    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4 border-b border-slate-800/50">
                <CardTitle className="text-xl flex flex-col sm:flex-row text-white justify-between gap-4 sm:items-center">
                    <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Left section: User Info */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="relative">
                                <UserCircle className="h-10 w-10 shrink-0 text-blue-500" />
                                <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold tracking-tight text-white truncate text-base md:text-lg">
                                    @{user.username}
                                </div>
                                <div className="text-xs md:text-sm font-normal text-slate-400 truncate">
                                    {user.name}
                                </div>
                            </div>
                        </div>

                        {/* Right section: buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                            {/* Add Cash - Secondary Style */}
                            <ManageBalanceSheet mode="stock">
                                <Button
                                    variant="secondary"
                                    className="w-full sm:w-auto gap-2 h-9 text-xs sm:text-sm shadow-sm active:scale-95 transition-transform"
                                >
                                    <PlusCircleIcon className="w-4 h-4" />
                                    <span>Add Cash</span>
                                </Button>
                            </ManageBalanceSheet>

                            {/* More Info - Ghost/Outline Style */}
                            <Link href="/admin/dashboard" className={`w-full sm:w-auto h-9 gap-2 ${buttonVariants({ variant: "outline" })} border-slate-700 bg-slate-800/40 text-xs sm:text-sm hover:bg-slate-800`}>
                                <InfoIcon className="w-4 h-4" />
                                <span>More info</span>
                            </Link>

                            {/* Download - Gradient Style (Call to Action) */}
                            <Button
                                variant="gradient"
                                className="w-full sm:w-auto h-9 gap-2 text-xs sm:text-sm shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                onClick={downloadExcel}
                            >
                                <DownloadIcon className="w-4 h-4" />
                                <span>Download</span>
                            </Button>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 md:pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Cash Balance */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-800/50 transition-colors hover:bg-slate-800/50">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 shrink-0">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-400 mb-1 truncate">Stock Liquid Balance</p>
                            <p className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">
                                {Formatter.formatCurrency(user.balance.stock_balance)}
                            </p>
                        </div>
                    </div>

                    {/* Total Equity */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-800/50 transition-colors hover:bg-slate-800/50">
                        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 shrink-0">
                            <Landmark className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-400 mb-1 truncate">Total Equity</p>
                            <div className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">
                                {user.positions?.total_equity_idr > 0 && user.positions?.total_equity_usd > 0 ? (
                                    <div className="flex flex-col">
                                        <span>{Formatter.formatCurrency(user.positions.total_equity_idr, "IDR")}</span>
                                        <span className="text-xs md:text-sm font-medium text-slate-400">
                                            {Formatter.formatCurrency(user.positions.total_equity_usd, "USD")}
                                        </span>
                                    </div>
                                ) : user.positions?.total_equity_usd > 0 ? (
                                    Formatter.formatCurrency(user.positions.total_equity_usd, "USD")
                                ) : (
                                    Formatter.formatCurrency(user.positions?.total_equity_idr || 0, "IDR")
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
