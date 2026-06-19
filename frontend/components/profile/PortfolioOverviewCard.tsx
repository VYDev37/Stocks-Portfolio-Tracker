import type { PortfolioItem } from "@/schemas/balance.schema";
import { Formatter } from "@/lib";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

import { PieChart, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PortfolioOverviewCardProps {
    portfolio?: PortfolioItem[];
}

export default function PortfolioOverviewCard({ portfolio }: PortfolioOverviewCardProps) {
    const topPerformers = useMemo(() => {
        return portfolio
            ? [...portfolio].sort((a, b) => b.unrealized_pnl - a.unrealized_pnl).slice(0, 5)
            : [];
    }, [portfolio]);

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl flex flex-col">
            <CardHeader className="pb-4 border-b border-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-row items-center gap-3">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2 text-white">
                            <PieChart className="h-5 w-5 text-blue-500 shrink-0" />
                            <span className="truncate">Portfolio Overview</span>
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1 sm:mt-3 line-clamp-2 sm:line-clamp-none">Top five performing assets in your portfolio</CardDescription>
                    </div>
                </div>
                <Link href="/admin/stocks" className={`w-full sm:w-auto text-center ${buttonVariants({ variant: "gradient" })}`}>
                    More details
                </Link>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-4 sm:pt-6">
                {!portfolio || portfolio.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-8">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                            <TrendingUp className="h-8 w-8 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Portfolio is Empty</h3>
                        <p className="text-slate-400 mb-6 max-w-sm text-sm sm:text-base">
                            Start trading to build your portfolio and track your performance here!
                        </p>
                        <Link href="/admin/stocks" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors w-full sm:w-auto">
                            Start Trading <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {topPerformers.map((item, index) => {
                            const isPositive = item.unrealized_pnl >= 0;
                            const colorClass = isPositive ? "text-emerald-500" : "text-red-500";
                            const Icon = isPositive ? TrendingUp : TrendingDown;
                            const sign = isPositive ? "+" : "";

                            return (
                                <div key={`${item.ticker}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/20 border border-slate-800/30 hover:bg-slate-800/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-md ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                            <Icon className={`h-4 w-4 ${colorClass}`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white tracking-wide">{item.ticker}</p>
                                            <p className="text-xs text-slate-400 mt-1">{Formatter.formatNumber(item.total_qty / 100)} lot</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-medium ${colorClass}`}>
                                            {sign}{Formatter.formatCurrency(item.unrealized_pnl)}
                                        </p>
                                        <p className={`text-xs ${colorClass}`}>
                                            {sign}{Formatter.formatNumber(item.pnl_percentage)}%
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
