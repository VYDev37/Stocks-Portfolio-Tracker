"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { QuantitySlider } from "@/components/stock";
import CheckboxMarketPrice from "./CheckboxMarketPrice";
import CustomPriceInput from "./CustomPriceInput";

interface PriceInputSectionProps {
    market: "IDX" | "US";
    isSellMode: boolean;
    qty: number;
    inv: number;
    useCurrent: boolean;
    isLoadingPrice: boolean;
    currentPrice: number;
    maxLot: number;
    multiplier: number;
    onChangeField: (field: string, val: string | number) => void;
    onSetUseCurrent: (useCurrent: boolean) => void;
    onSetPricePerShare: (price: number) => void;
}

export default function PriceInputSection({
    market,
    isSellMode,
    qty,
    inv,
    useCurrent,
    isLoadingPrice,
    currentPrice,
    maxLot,
    multiplier,
    onChangeField,
    onSetUseCurrent,
    onSetPricePerShare
}: PriceInputSectionProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="space-y-3">
                    <Label htmlFor="qty">Quantity ({market === "US" ? "Shares" : "Lot"})</Label>
                    <Input
                        id="qty"
                        type="text"
                        inputMode="numeric"
                        value={qty}
                        onChange={(e) => onChangeField("qty", e.target.value)}
                    />
                </div>
                <QuantitySlider
                    max={maxLot}
                    current={qty}
                    onChange={(val) => onChangeField("qty", val)}
                />
            </div>
            
            <div className="space-y-3">
                <Label htmlFor="inv">
                    {isSellMode ? "Sold for" : "Invested Total"} ({market === "US" ? "$" : "Rp"})
                </Label>
                <Input
                    id="inv"
                    type="text"
                    inputMode="numeric"
                    value={inv}
                    disabled={useCurrent}
                    onChange={(e) => onChangeField("inv", e.target.value)}
                />

                <div className="space-y-4 mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                    {/* Checkbox Market Price */}
                    <CheckboxMarketPrice
                        checked={useCurrent}
                        isLoading={isLoadingPrice}
                        currentPrice={currentPrice}
                        currency={market === "US" ? "USD" : "IDR"}
                        onChange={(nextVal) => {
                            onSetUseCurrent(nextVal);
                            if (nextVal) {
                                onChangeField("inv", currentPrice * qty * multiplier);
                            }
                        }}
                    />

                    {/* Separator 'OR' */}
                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">OR</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    {/* Custom Price Input */}
                    <CustomPriceInput
                        disabled={useCurrent}
                        currentPrice={currentPrice}
                        currency={market === "US" ? "$" : "Rp"}
                        onChange={(val) => {
                            onSetPricePerShare(val);
                            onSetUseCurrent(false);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
