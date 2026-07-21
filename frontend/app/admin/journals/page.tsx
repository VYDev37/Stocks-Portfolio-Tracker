import { Metadata } from "next";
import JournalsClient from "./JournalsClient";

export const metadata: Metadata = {
    title: "My Trading Journals - Stocks Portfolio Tracker",
    description: "Write notes, document trading observations, review logs, and journal your psychological triggers inside your dedicated trading logs manager.",
};

export default function Page() {
    return <JournalsClient />;
}