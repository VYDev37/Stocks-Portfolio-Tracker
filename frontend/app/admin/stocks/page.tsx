import { Metadata } from "next";
import { MoreHorizontal } from "lucide-react";

import { StockAddPosition, StockChart, StockList } from "@/components/stock";
import { Card } from "@/components/ui/card";

interface StockParams {
    searchParams: Promise<{ symbol?: string }>
}

export async function generateMetadata({ searchParams }: StockParams): Promise<Metadata> {
    const params = await searchParams;
    const ticker = params.symbol || "COMPOSITE";
    return {
        title: `My Portfolio Detail - Stocks Portfolio Tracker`,
        description: `View what's happening with your assets and manage them.`,
    };
}

export default async function Stocks({ searchParams }: StockParams) {
    const params = await searchParams;
    const ticker = params.symbol || "COMPOSITE";

    return (
        <div className="flex flex-col w-full pt-3 pb-6 space-y-6">
            <h1 className="text-2xl font-bold">Current market</h1>

            <Card className="p-0 overflow-hidden border-white/5 aspect-video md:aspect-auto h-[300px] md:h-[450px]">
                <StockChart symbol={ticker} />
            </Card>

            <div className="my-6 md:my-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl md:text-2xl font-bold">My stocks</h1>
                    </div>
                    <StockAddPosition />
                </div>
                <StockList />
            </div>
        </div>
    );
}