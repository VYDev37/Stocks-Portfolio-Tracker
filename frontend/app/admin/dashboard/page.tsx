import { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
    title: "Admin Dashboard - Stocks Portfolio Tracker",
    description: "Analyze your trading performance, track winning ratios, monitor balances, and manage multi-broker portfolios in one centralized terminal.",
};

export default function Page() {
    return <DashboardClient />;
}