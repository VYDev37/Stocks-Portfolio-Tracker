"use client";

import { useDashboard } from "@/hooks";
import { UserStatValue } from "@/components/dashboard";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import Link from "next/link";
import {
    Package, Wallet, Landmark, TrendingUp, TrendingDown,
    BarChart3, CircleCheckBig, CircleX, Target, Zap, Flame,
    LucideIcon
} from "lucide-react";

interface DashboardInfo {
    title: string;
    icon: LucideIcon;
    color: "green" | "yellow" | "red";
    field: "balance" | "total_equity" | "positions_count" |
    "top_gain" | "top_loss" | "loss_amount" |
    "gain_amount" | "loss_gain_sum" | "winning_positions" |
    "losing_positions" | "temp_win_rate";
    subfield?: "stock_balance" | "cash_balance";
    isCurrency?: boolean;
    useDynamicColor?: boolean;
    textColor?: "text_green" | "text_red";
}

export default function DashboardClient() {
    const {
        selectedBroker,
        setSelectedBroker,
        globalCurrency,
        setGlobalCurrency,
        usdToIdrRate,
        availableAccounts
    } = useDashboard();

    const colors: Record<string, string> = {
        green: "bg-green-600 shadow-green-900/20",
        yellow: "bg-yellow-600 shadow-yellow-900/20",
        red: "bg-red-600 shadow-red-900/20",
        text_red: "text-red-600",
        text_green: "text-green-600"
    };

    const infos: DashboardInfo[] = [
        { title: "Stock count", icon: Package, color: "green", field: "positions_count" },
        { title: "Balance", icon: Wallet, color: "green", field: "balance", subfield: "stock_balance", isCurrency: true },
        { title: "Total Equity", icon: Landmark, color: "yellow", field: "total_equity", isCurrency: true },
        { title: "Gain Total", icon: TrendingUp, color: "green", field: "gain_amount", isCurrency: true, textColor: "text_green" },
        { title: "Loss Total", icon: TrendingDown, color: "red", field: "loss_amount", isCurrency: true, textColor: "text_red" },
        { title: "Realized PnL Total", icon: BarChart3, color: "yellow", field: "loss_gain_sum", isCurrency: true, useDynamicColor: true },
        { title: "Winning Positions", icon: CircleCheckBig, color: "green", field: "winning_positions" },
        { title: "Losing positions", icon: CircleX, color: "red", field: "losing_positions" },
        { title: "Current Win Rate", icon: Target, color: "green", field: "temp_win_rate" },
        { title: "Top Gainer Ticker", icon: Zap, color: "green", field: "top_gain" },
        { title: "Top Loser Ticker", icon: Flame, color: "red", field: "top_loss" }
    ];

    return (
        <div className="w-full mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                {availableAccounts.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Broker:</span>
                        <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                            <SelectTrigger className="w-full sm:w-64 bg-slate-900 border-white/10 text-xs font-bold text-white h-10 rounded-md focus:ring-1 focus:ring-blue-500">
                                <SelectValue placeholder="All Brokers" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 text-white border-white/10">
                                <SelectItem value="all" className="text-xs font-semibold">
                                    All Brokers
                                </SelectItem>
                                {availableAccounts.map((acc, index) => {
                                    const val = `${acc.provider_name}-${acc.account_no}`;
                                    return (
                                        <SelectItem key={val + index} value={val} className="text-xs font-semibold">
                                            {acc.provider_name} ({acc.account_no})
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Currency:</span>
                    <div className="flex gap-1 p-1 bg-white/5 rounded-md border border-white/10">
                        <button
                            type="button"
                            onClick={() => setGlobalCurrency("IDR")}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${globalCurrency === "IDR" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                        >
                            IDR
                        </button>
                        <button
                            type="button"
                            onClick={() => setGlobalCurrency("USD")}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${globalCurrency === "USD" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                        >
                            USD
                        </button>
                    </div>
                </div>
            </div>

            <Card className="flex flex-col w-full mt-5 mb-10 border-white/5 bg-zinc-950/50">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <p className="text-lg">Summary of current account</p>
                        <Link href="/admin/profile" className={buttonVariants({ variant: "gradient" })}>
                            View more
                        </Link>
                    </CardTitle>
                </CardHeader>
                <div className="h-[1px] bg-white/10 w-full" />
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {infos.map((info, idx) => {
                        const Icon = info.icon;
                        return (
                            <Card key={idx} className="bg-zinc-900/40 border-white/5">
                                <CardContent className="flex items-center p-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors[info.color]} text-black shadow-lg`}>
                                        <Icon className="h-6 w-6" strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col ml-5">
                                        <div className="text-sm text-zinc-400">{info.title}</div>
                                        <div className={`text-lg ${info.textColor ? colors[info.textColor] : "text-white"}`}>
                                            <UserStatValue
                                                field={info.field as any}
                                                subfield={info.subfield}
                                                isCurrency={info.isCurrency}
                                                useDynamicColor={info.useDynamicColor}
                                                selectedBroker={selectedBroker}
                                                globalCurrency={globalCurrency}
                                                usdToIdrRate={usdToIdrRate}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
