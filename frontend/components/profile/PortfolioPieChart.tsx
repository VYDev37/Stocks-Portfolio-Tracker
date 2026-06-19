"use client";

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { PortfolioItem } from '@/schemas/balance.schema';
import { Formatter } from '@/lib';

export interface PortfolioPieChartProps {
    positions?: PortfolioItem[];
    isCapital?: boolean;
}

const COLORS = [
    '#3b82f6', // Neon Blue
    '#10b981', // Emerald
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#f43f5e', // Rose
    '#64748b'  // Slate (Others)
];

type ChartDataItem = {
    ticker: string;
    value: number;
    percentage: number;
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as ChartDataItem;
        return (
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-3 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <p className="text-white font-medium mb-1">{data.ticker}</p>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-300">
                        Value: <span className="text-white font-medium ml-1">{Formatter.formatCurrency(data.value)}</span>
                    </span>
                    <span className="text-xs text-slate-300">
                        Allocation: <span className="text-white font-medium ml-1">{data.percentage.toFixed(2)}%</span>
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export default function PortfolioPieChart({ positions, isCapital }: PortfolioPieChartProps) {
    const { chartData, sumValue } = useMemo(() => {
        if (!positions || positions.length === 0)
            return { chartData: [], sumValue: 0 };

        const mapped = positions.map(p => ({
            ticker: p.ticker,
            value: isCapital ? (p.invested_total) : (p.current_price || 0)
        }));

        mapped.sort((a, b) => b.value - a.value);

        const total = mapped.reduce((sum, item) => sum + item.value, 0);
        if (total === 0)
            return { chartData: [], sumValue: 0 };

        const top5 = mapped.slice(0, 5);
        const others = mapped.slice(5);

        const othersValue = others.reduce((sum, item) => sum + item.value, 0);

        const finalData = [...top5];
        if (othersValue > 0) {
            finalData.push({
                ticker: 'Others',
                value: othersValue
            });
        }

        return {
            chartData: finalData.map(item => ({
                ...item,
                percentage: (item.value / total) * 100
            })),
            sumValue: total
        };
    }, [positions, isCapital]);

    if (!chartData || chartData.length === 0) {
        return (
            <div className="w-full h-[350px] bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg relative">
                <h3 className="text-white font-semibold self-start absolute top-4 left-6">Portfolio Allocation ({isCapital ? "by capital" : "by market value"})</h3>
                <p className="text-slate-400 text-sm">No portfolio data available to display.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[350px] bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
            {/* Decorative gradient blur in background (Antigravity Concept) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none transition-opacity duration-700 group-hover:bg-blue-500/20" />

            <h3 className="text-white font-semibold self-start absolute top-4 left-6 z-10 w-full">Portfolio Allocation ({isCapital ? "by capital" : "by market value"})</h3>

            <div className="w-full mt-6 h-[220px] relative z-10">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-700">
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">Total Value</span>
                    <span className="text-white text-xs font-bold mt-1">
                        {Formatter.formatCurrency(sumValue)}
                    </span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius="75%" outerRadius="95%" paddingAngle={2}
                            dataKey="value" nameKey="ticker" stroke="rgba(255,255,255,0.05)" strokeWidth={1}>
                            {chartData.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    className="transition-all duration-300 hover:opacity-80 drop-shadow-md"
                                    style={{ outline: 'none' }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 w-full z-10">
                {chartData.map((item, index) => (
                    <div key={`${item.ticker}-${index}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-default">
                        <div
                            className="w-2.5 h-2.5 rounded-full shadow-sm"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs text-slate-300 font-medium">
                            {item.ticker} <span className="text-slate-500 ml-0.5">{item.percentage.toFixed(1)}%</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
