import { Metadata } from "next";
import TrackerClient from "./TrackerClient";

export const metadata: Metadata = {
    title: "Stocks Portfolio Tracker - Cash Manager",
    description: "Manage your cash, track incomes and expenses.",
};

export default function Page() {
    return <TrackerClient />;
}