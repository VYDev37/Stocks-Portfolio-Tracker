const Formatter = {
    formatNumber(num: number | any, keepDisplaying: boolean = false): string {
        if (typeof num !== "number")
            return "-";

        return (num === 0 && !keepDisplaying) ? "-" : num.toLocaleString("id-ID", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
    },

    formatCurrency(num: number | any, currency: string = "IDR"): string {
        if (typeof num !== "number")
            return "Rp0";

        if (num === 0)
            return "-";

        return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(num).replace(/\s/g, "");
    },
    formatDate(date: Date): string {
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toLocaleString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta", timeStyle: "short", hour12: false });
    },

    formatLargeNumber(num?: number) {
        if (num === undefined || num === null)
            return "0";

        const absNum = Math.abs(num);
        if (absNum >= 1e12)
            return (num / 1e12).toFixed(2) + "T";
        if (absNum >= 1e9)
            return (num / 1e9).toFixed(2) + "B";
        if (absNum >= 1e6)
            return (num / 1e6).toFixed(2) + "M";
        if (absNum >= 1e3)
            return (num / 1e3).toFixed(2) + "K";

        return num.toLocaleString();
    },
    formatPercent(num?: number) {
        if (num === undefined || num === null)
            return "0.00%";
        const sign = num > 0 ? "+" : "";
        return `${sign}${num.toFixed(2)}%`;
    }
}

export default Formatter;