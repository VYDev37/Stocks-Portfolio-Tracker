import z from "zod";

// --- Base Sub-Types ---
export const PercentSchema = z.number().nullable().optional().transform(val => val ?? undefined);
export type Percent = number;

export const RatioSchema = z.number().nullable().optional().transform(val => val ?? undefined);
export type Ratio = number;

export const MoneySchema = z.number().nullable().optional().transform(val => val ?? undefined);
export type Money = number;

export const RawNumSchema = z.number().nullable().optional().transform(val => val ?? undefined);
export type RawNum = number;

export const EpochSchema = z.number().nullable().optional().transform(val => val ?? undefined);
export type Epoch = number;

export const MSchema = z.record(z.string(), z.any());
export type M = z.infer<typeof MSchema>;

export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface AssetChartResponse {
    ticker: string;
    last_price: number;
    daily_open: number;
    daily_high: number;
    daily_low: number;
    last_vol: number;
    chart: Candle[];
}

export const AssetOverviewSchema = z.object({
    change: z.number(),
    name: z.string(),
    price: z.number(),
    ticker: z.string(),
});

export const AssetInfoSchema = z.object({
    /**
     * --- 1. Overview & Base Identity ---
     */
    ticker: z.string(), // Ticker symbol (e.g., "BBCA")
    sector: z.string().nullish(), // Sector classification (e.g., "Finance")
    market: z.string(), // Exchange market (e.g., "indonesia")
    fundamental_currency_code: z.string(), // The currency code (e.g., "IDR")
    description: z.string(), // Company name
    price: MoneySchema, // Current close price
    change: RawNumSchema, // Price change value
    volume: RawNumSchema, // Trading volume
    relative_volume_10d: RatioSchema, // Relative volume compared to 10-day average
    market_cap: MoneySchema, // Basic market capitalization
    free_float_qty: RawNumSchema, // Free Float (in qty)
    free_float_percentage: PercentSchema, // Free Float percentage

    /**
     * --- 2. Valuation ---
     */
    pe_ratio: RatioSchema, // Price to Earnings (TTM)
    peg_ratio: RatioSchema, // PEG Ratio (TTM) - PEG < 1 means undervalued
    ps_ratio: RatioSchema, // Price to Sales (Current)
    pbv: RatioSchema, // Price to Book Value (FQ)
    price_to_cash: RatioSchema, // Price to Cash Ratio
    price_to_fcf: RatioSchema, // Price to Free Cash Flow (TTM)
    enterprise_value: MoneySchema, // Enterprise Value (Current)
    ev_ebitda: RatioSchema, // Enterprise Value / EBITDA (TTM)
    ev_to_revenue: RatioSchema, // Enterprise Value to Revenue (TTM)
    ev_to_ebit: RatioSchema, // Enterprise Value to EBIT (TTM)

    /**
     * --- 3. Profitability ---
     */
    gross_margin: PercentSchema, // Gross Margin (TTM)
    operating_margin: PercentSchema, // Operating Margin (TTM)
    pre_tax_margin: PercentSchema, // Pre-Tax Margin (TTM)
    net_margin: PercentSchema, // Net Margin (TTM)
    fcf_margin: PercentSchema, // Free Cash Flow Margin (TTM)
    roa: PercentSchema, // Return on Assets (FQ)
    roe: PercentSchema, // Return on Equity (FQ)
    roic: PercentSchema, // Return on Invested Capital (FQ)

    /**
     * --- 4. Income Statement ---
     */
    total_revenue: MoneySchema, // Total Revenue (TTM)
    revenue_growth: PercentSchema, // Total Revenue YoY Growth (TTM)
    gross_profit: MoneySchema, // Gross Profit (TTM)
    operating_income: MoneySchema, // Operating Income (TTM)
    net_income: MoneySchema, // Net Income (TTM)
    ebitda: MoneySchema, // EBITDA (TTM)
    eps: MoneySchema, // Earnings Per Share Diluted (TTM)
    eps_growth: PercentSchema, // EPS Diluted YoY Growth (TTM)
    fiscal_period: z.string().nullish(), // Example: "2026-Q1"
    fiscal_period_end: EpochSchema, // Fiscal end date (unix timestamp)

    /**
     * --- 5. Balance Sheet ---
     */
    total_assets: MoneySchema, // Total Assets (FQ)
    total_current_assets: MoneySchema, // Total Current Assets (FQ)
    cash_and_short_term_invest: MoneySchema, // Cash & Short Term Investments (FQ)
    total_liabilities: MoneySchema, // Total Liabilities (FQ)
    total_debt: MoneySchema, // Total Debt (FQ)
    net_debt: MoneySchema, // Net Debt (FQ)
    total_equity: MoneySchema, // Total Equity (FQ)
    current_ratio: RatioSchema, // Current Ratio (FQ) - Current Assets vs Current Debt
    quick_ratio: RatioSchema, // Quick Ratio (FQ) - Strict liquidity metric
    de_ratio: RatioSchema, // Debt to Equity Ratio (FQ)
    cash_to_total_debt: RatioSchema, // Cash to Total Debt Ratio (FQ)

    /**
     * --- 6. Cashflow ---
     */
    operating_cashflow: MoneySchema, // Cash from Operating Activities (TTM)
    investing_cashflow: MoneySchema, // Cash from Investing Activities (TTM)
    financing_cashflow: MoneySchema, // Cash from Financing Activities (TTM)
    free_cashflow: MoneySchema, // Free Cash Flow (TTM)
    capital_expenditures: MoneySchema, // Capital Expenditures (TTM)

    /**
     * --- 7. Dividends ---
     */
    current_dividend_yield: PercentSchema, // Current Dividend Yield
    dividend_payout_ratio: PercentSchema, // Dividend Payout Ratio (TTM)
    dps: MoneySchema, // Dividends Per Share (FY)
    dps_yoy_growth: PercentSchema, // Dividends Per Share YoY Growth (FY)

    /**
     * --- 8. Technicals & Momentum ---
     */
    rsi: RawNumSchema, // Relative Strength Index (14)
    momentum: RawNumSchema, // Momentum indicator
    awesome_oscillator: RawNumSchema, // Awesome Oscillator
    cci20: RawNumSchema, // Commodity Channel Index (20)
    stoch_k: RawNumSchema, // Stochastic %K
    stoch_d: RawNumSchema, // Stochastic %D
    tech_rating_1d: z.string(), // AI Tech Rating 1D (-1 Strong Sell to 1 Strong Buy)
});

export const ChartFormSchema = z.enum(["line", "candle"]);
export type ChartForm = z.infer<typeof ChartFormSchema>;
export type AssetOverview = z.infer<typeof AssetOverviewSchema>;
export type AssetInfo = z.infer<typeof AssetInfoSchema>;