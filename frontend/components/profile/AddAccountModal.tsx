import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddAccountModalProps {
    onClose: () => void;
    onAdd: (provider: string, accountNo: string, currency: string, amount: number) => void;
}

export default function AddAccountModal({ onClose, onAdd }: AddAccountModalProps) {
    const [provider, setProvider] = useState("");
    const [accountNo, setAccountNo] = useState("");
    const [amount, setAmount] = useState(0);
    const [customProvider, setCustomProvider] = useState("");
    const [currency, setCurrency] = useState("IDR");

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        const selectedProvider = provider === "other" ? customProvider : provider;
        if (!selectedProvider || !accountNo) {
            alert("Please select a provider and enter an account number.");
            return;
        }
        onAdd(selectedProvider, accountNo, currency, amount);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-5 rounded-2xl animate-in fade-in duration-300">
            <div className="w-full space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white tracking-tight">Create New Account</h3>
                    <p className="text-[11px] text-slate-400">Add a new bank or wallet source for your transactions.</p>
                </div>

                <div className="space-y-3 bg-white/5 border border-white/10 p-3.5 rounded-xl">
                    <div>
                        <Label htmlFor="new_provider" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Bank / Wallet Name
                        </Label>
                        <select
                            id="new_provider"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2.5 text-xs font-bold text-white shadow-sm mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="" disabled>Select Bank / Wallet</option>
                            <option value="BCA">BCA</option>
                            <option value="SeaBank">SeaBank</option>
                            <option value="Bank Mandiri">Bank Mandiri</option>
                            <option value="BRI">BRI</option>
                            <option value="BNI">BNI</option>
                            <option value="BSI">BSI</option>
                            <option value="Bank Jago">Bank Jago</option>
                            <option value="GoPay">GoPay</option>
                            <option value="OVO">OVO</option>
                            <option value="ShopeePay">ShopeePay</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="new_currency" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Base Currency
                        </Label>
                        <select
                            id="new_currency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="flex w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2.5 text-xs font-bold text-white shadow-sm mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="IDR">IDR (Indonesian Rupiah)</option>
                            <option value="USD">USD (US Dollar)</option>
                        </select>
                    </div>

                    {provider === "other" && (
                        <div>
                            <Label htmlFor="other_src" className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                                Provider (Bank/Broker)
                            </Label>
                            <Input
                                id="new_provider2"
                                type="text"
                                placeholder="Enter provider name"
                                value={customProvider}
                                onChange={(e) => setCustomProvider(e.target.value)}
                                className="bg-transparent border-none text-xs h-11 focus-visible:ring-0 focus-visible:ring-offset-0 font-bold mt-1"
                            />
                        </div>
                    )}

                    <div>
                        <Label htmlFor="new_account_no" className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                            Account Number
                        </Label>
                        <Input
                            id="new_account_no"
                            type="text"
                            placeholder="Enter account number"
                            value={accountNo}
                            onChange={(e) => setAccountNo(e.target.value)}
                            className="bg-transparent border-none text-xs h-11 focus-visible:ring-0 focus-visible:ring-offset-0 font-bold mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="new_amount_no" className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
                            Initial Amount
                        </Label>
                        <Input id="new_amount_no" type="number" placeholder="Enter initial amount"
                            value={amount} onChange={(e) => setAmount(+e.target.value)}
                            className="bg-transparent border-none text-xs h-11 focus-visible:ring-0 focus-visible:ring-offset-0 font-bold mt-1" />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={onClose}
                        className="flex-1 border-white/10 bg-transparent text-slate-300 hover:bg-white/5 font-bold h-11 text-xs">
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleAdd}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 text-xs">
                        Add Account
                    </Button>
                </div>
            </div>
        </div>
    );
}
