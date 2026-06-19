import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomPriceInputProps {
    disabled: boolean;
    currentPrice: number;
    currency: string;
    onChange: (price: number) => void;
}

export default function CustomPriceInput({ disabled, currentPrice, currency, onChange }: CustomPriceInputProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="custom-price" className={`text-xs ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>
                Set custom price per share
            </Label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{currency}</span>
                <Input
                    id="custom-price"
                    type="text"
                    inputMode="numeric"
                    disabled={disabled}
                    placeholder={currentPrice.toString()}
                    className={`pl-10 bg-gray-950 border-gray-700 transition-opacity ${disabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                    onChange={(e) => {
                        const val = Number(e.target.value.replace(/[^0-9]/g, ""));
                        onChange(val);
                    }}
                />
            </div>
        </div>
    );
}
