import { Metadata } from "next";
import { cookies } from "next/headers";
import CompositeClient from "./CompositeClient";
import { MarketType } from "@/hooks/asset/useAssets";

interface PageProps {
    params: Promise<{ id?: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const ticker = resolvedParams.id?.[0] || "BBCA";
    return {
        title: `Market Terminal - ${ticker}`,
        description: `Real-time stock details, charts, and core fundamentals for ticker ${ticker} on the Market Terminal.`,
    };
}

export default async function Page({ params }: PageProps) {
    const resolvedParams = await params;

    const cookieStore = await cookies();
    const marketCookie = cookieStore.get("terminal_market")?.value;
    const initialMarket: MarketType = (marketCookie === "US" || marketCookie === "IDX") ? marketCookie : "IDX";

    return <CompositeClient initialId={resolvedParams.id} initialMarket={initialMarket} />;
}
