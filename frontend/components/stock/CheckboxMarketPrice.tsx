import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Formatter } from "@/lib";
import { useId } from "react";

interface CheckboxMarketPriceProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    isLoading: boolean;
    currentPrice: number;
    currency: string;
}

export default function CheckboxMarketPrice({ checked, onChange, isLoading, currentPrice, currency }: CheckboxMarketPriceProps) {
    const checkboxId = useId();
    return (
        <div className="flex flex-row items-center gap-2">
            <input
                id={checkboxId}
                type="checkbox"
                checked={checked}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
                onChange={(e) => onChange(e.target.checked)}
            />
            <Label htmlFor={checkboxId} className="text-sm cursor-pointer select-none">
                Use current market price
                {isLoading ? " (loading...)" : currentPrice > 0 ? ` (${Formatter.formatCurrency(currentPrice, currency)}/share)` : ""}
            </Label>
        </div>
    );
}
