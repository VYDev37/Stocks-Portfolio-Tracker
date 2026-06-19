"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, CrosshairMode, LineStyle, AreaSeries } from 'lightweight-charts';
import type { ISeriesApi, IChartApi, UTCTimestamp, CandlestickData, HistogramData, AreaData } from 'lightweight-charts';
import type { AssetChartResponse, Candle, ChartForm } from "@/schemas/asset.schema";

interface UseTradingChartProps {
    data: AssetChartResponse | null;
    chartForm: ChartForm;
    extraVolume?: number;
}

export default function useTradingChart({ data, chartForm, extraVolume }: UseTradingChartProps) {
    const [legendData, setLegendData] = useState<Candle | null>(null);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<IChartApi | null>(null);

    const mainSeriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Area"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    const chartData = data?.chart;
    const displayData = legendData || {
        time: 0,
        open: data?.daily_open || 0,
        high: data?.daily_high || 0,
        low: data?.daily_low || 0,
        close: data?.last_price || 0,
        volume: data?.last_vol || extraVolume || 0
    };

    useEffect(() => {
        if (!chartContainerRef.current)
            return;

        const chart = createChart(chartContainerRef.current, {
            layout: { background: { type: ColorType.Solid, color: '#020618' }, textColor: '#d1d4dc' },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { width: 1, color: '#FFFFFF33', style: LineStyle.Solid, labelBackgroundColor: '#1F2937' },
                horzLine: { color: '#FFFFFF33', labelBackgroundColor: '#1F2937' },
            },
            localization: {
                locale: "id-ID",
                timeFormatter: (timestamp: number) => {
                    const date = new Date(timestamp * 1000);
                    return new Intl.DateTimeFormat('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    }).format(date);
                },
            }
        });

        if (chartForm === 'line') {
            mainSeriesRef.current = chart.addSeries(AreaSeries, {
                lineColor: '#0D47A1', lineWidth: 2, bottomColor: 'rgba(13, 71, 161, 0.1)',
                priceFormat: { type: 'price' },
            });
        } else {
            mainSeriesRef.current = chart.addSeries(CandlestickSeries, {
                upColor: '#10b981', downColor: '#f43f5e', borderVisible: false,
                wickUpColor: '#10b981', wickDownColor: '#f43f5e',
            });
        }

        volumeSeriesRef.current = chart.addSeries(HistogramSeries, {
            priceFormat: { type: 'volume' },
            priceScaleId: ''
        });

        chart.priceScale('').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

        chart.subscribeCrosshairMove((param) => {
            if (param.time && mainSeriesRef.current) {
                const sData = param.seriesData.get(mainSeriesRef.current);
                const vData = param.seriesData.get(volumeSeriesRef.current!) as HistogramData;

                if (sData) {
                    const candle = sData as CandlestickData;
                    setLegendData({
                        time: candle.time as number,
                        open: candle.open ?? 0,
                        high: candle.high ?? 0,
                        low: candle.low ?? 0,
                        close: candle.close ?? (sData as AreaData).value,
                        volume: vData?.value || 0
                    });
                }
            } else {
                setLegendData(null);
            }
        });

        chartInstanceRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartInstanceRef.current = null;
        };
    }, [chartForm]);

    useEffect(() => {
        if (!mainSeriesRef.current || !volumeSeriesRef.current || !chartData)
            return;

        if (chartForm === 'line') {
            const lineData: AreaData[] = chartData.map(d => ({
                time: d.time as UTCTimestamp,
                value: d.close
            }));
            (mainSeriesRef.current as ISeriesApi<"Area">).setData(lineData);
        } else {
            const candleData: CandlestickData[] = chartData.map(d => ({
                time: d.time as UTCTimestamp,
                open: d.open, high: d.high, low: d.low, close: d.close
            }));
            (mainSeriesRef.current as ISeriesApi<"Candlestick">).setData(candleData);
        }

        const volumeData: HistogramData[] = chartData.map(d => ({
            time: d.time as UTCTimestamp,
            value: d.volume,
            color: d.close >= d.open ? '#10b98144' : '#f43f5e44'
        }));
        volumeSeriesRef.current.setData(volumeData);

        if (chartInstanceRef.current) {
            const len = chartData.length;
            chartInstanceRef.current.timeScale().setVisibleLogicalRange({
                from: len >= 60 ? len - 60 : 0,
                to: len
            });
        }
    }, [chartData, chartForm]);

    return {
        chartContainerRef,
        legendData,
        displayData
    };
}
