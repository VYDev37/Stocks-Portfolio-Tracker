import { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
    title: "Sign Up - Stocks Portfolio Tracker",
    description: "Join the Stocks Portfolio Tracker platform today to record, filter, and audit your stock transaction logs, cashflow logs, and order histories.",
};

export default function RegisterPage() {
    return <RegisterClient />;
}