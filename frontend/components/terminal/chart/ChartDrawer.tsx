import ChartLegend from './ChartLegend';

import { useTradingChart } from "@/hooks";
import type { AssetChartResponse, ChartForm } from "@/schemas/asset.schema";

interface ITradingChartProps {
    data: AssetChartResponse | null;
    isLoading: boolean;
    chartForm: ChartForm;
    extraData?: {
        volume: number;
    }
}

export default function TradingChart({ data, isLoading, chartForm, extraData }: ITradingChartProps) {
    const { chartContainerRef, legendData, displayData } = useTradingChart({
        data,
        chartForm,
        extraVolume: extraData?.volume
    });

    return (
        <div className="relative w-full min-h-[500px] bg-[#131722] rounded-xl overflow-hidden border border-white/5">
            {!isLoading && (
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <ChartLegend symbol={data?.ticker!} data={legendData || displayData} />
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#131722]/80 backdrop-blur-sm">
                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-medium animate-pulse">Fetching market data...</p>
                </div>
            )}

            {/* Canvas Container */}
            <div ref={chartContainerRef} className="w-full h-[500px]" />
        </div>
    );
}
