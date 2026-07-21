import { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
    title: "Sign In - Stocks Portfolio Tracker",
    description: "Access your personalized Stocks Portfolio Tracker dashboard to monitor, audit, and analyze your past trades, transactions, and current portfolios in real time.",
};

export default function LoginPage() {
    return <LoginClient />;
}