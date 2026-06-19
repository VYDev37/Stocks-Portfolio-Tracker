import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DepthData {
    price: string;
    vol: string;
    percent: number;
}

interface OrderBookProps {
    bids?: DepthData[];
    asks?: DepthData[];
    loading?: boolean;
    ticker?: string;
    currentPrice?: number;
}

export default function OrderBook({ bids, asks, loading, ticker, currentPrice }: OrderBookProps) {

    // Generate some mock depth if none provided (since AssetInfo might not have depth)
    const generateMockDepth = (price: number, isBid: boolean) => {
        const result = [];
        for (let i = 1; i <= 3; i++) {
            const offset = isBid ? -i * 10 : i * 10;
            const targetPrice = price + offset;
            result.push({
                price: targetPrice > 0 ? targetPrice.toLocaleString() : "0",
                vol: `${Math.floor(Math.random() * 100 + 20)}k`,
                percent: Math.floor(Math.random() * 60 + 30)
            });
        }
        return result;
    };

    const displayBids = bids && bids.length > 0 ? bids : currentPrice ? generateMockDepth(currentPrice, true) : [];
    const displayAsks = asks && asks.length > 0 ? asks : currentPrice ? generateMockDepth(currentPrice, false) : [];

    return (
        <Card className="bg-zinc-900/40 border-white/5 shadow-2xl h-full flex flex-col">
            <CardHeader className="py-3 bg-white/5 border-b border-white/5">
                <CardTitle className="text-[10px] font-black tracking-widest text-zinc-400">MARKET_DEPTH (MOCK)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex gap-4 flex-1">
                {loading ? (
                    <div className="w-full flex items-center justify-center text-zinc-500 text-xs animate-pulse">
                        LOADING_DEPTH...
                    </div>
                ) : !ticker || (!displayBids.length && !displayAsks.length) ? (
                    <div className="w-full flex items-center justify-center text-zinc-500 text-xs">
                        NO_DEPTH_DATA
                    </div>
                ) : (
                    <>
                        {/* Bid Side */}
                        <div className="flex-1 space-y-1">
                            {displayBids.map((b, i) => (
                                <DepthRow key={i} price={b.price} vol={b.vol} type="bid" percent={b.percent} />
                            ))}
                        </div>
                        {/* Ask Side */}
                        <div className="flex-1 space-y-1">
                            {displayAsks.map((a, i) => (
                                <DepthRow key={i} price={a.price} vol={a.vol} type="ask" percent={a.percent} />
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

function DepthRow({ price, vol, type, percent }: { price: string, vol: string, type: 'bid' | 'ask', percent: number }) {
    const isBid = type === 'bid';
    return (
        <div className="relative flex justify-between py-1.5 px-2 text-[10px] font-bold z-10 overflow-hidden">
            <div
                className={`absolute inset-0 ${isBid ? 'bg-emerald-500/10' : 'bg-rose-500/10'} -z-10`}
                style={{ width: `${percent}%`, [isBid ? 'right' : 'left']: 0 }}
            />
            <span className={isBid ? 'text-emerald-400' : 'text-rose-400'}>{price}</span>
            <span className="text-zinc-500">{vol}</span>
        </div>
    );
}