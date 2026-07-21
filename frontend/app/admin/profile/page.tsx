import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
    title: "My Portfolio Profile - Stocks Portfolio Tracker",
    description: "Manage your tracker account, view more summarized data here, and review portfolio balances.",
};

export default function Page() {
    return <ProfileClient />;
}
