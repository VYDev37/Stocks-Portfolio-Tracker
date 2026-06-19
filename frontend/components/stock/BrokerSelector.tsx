"use client";

import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Formatter } from "@/lib";
import { AddAccountModal } from "@/components/profile";
import type { AvailableAccount } from "@/schemas/transaction.schema";

interface BrokerSelectorProps {
    market: "IDX" | "US";
    provider: string;
    accountNo: string;
    accountsToDisplay: AvailableAccount[];
    activeBalance: number;
    showAddAccountModal: boolean;
    setShowAddAccountModal: (show: boolean) => void;
    onAddAccount: (provider: string, accountNo: string, currency: string, amount: number) => void;
    onSelectAccount: (provider: string, accountNo: string) => void;
}

export default function BrokerSelector({
    market,
    provider,
    accountNo,
    accountsToDisplay,
    activeBalance,
    showAddAccountModal,
    setShowAddAccountModal,
    onAddAccount,
    onSelectAccount
}: BrokerSelectorProps) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Select Broker Account
                </Label>
                <button
                    type="button"
                    onClick={() => setShowAddAccountModal(true)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                    <Plus className="w-3 h-3" /> Add New
                </button>
            </div>
            <div className="relative mt-1">
                <Select
                    value={provider && accountNo ? `${provider}-${accountNo}` : ""}
                    onValueChange={(val) => {
                        const [prov, accNo] = val.split("-");
                        onSelectAccount(prov, accNo);
                    }}
                >
                    <SelectTrigger className="w-full bg-slate-900 border-white/10 text-xs font-bold text-white h-12 rounded-md focus:ring-1 focus:ring-blue-500">
                        <SelectValue placeholder="Select Broker Account" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 text-white border-white/10">
                        <SelectGroup>
                            {accountsToDisplay.map((acc, index) => {
                                const val = `${acc.provider_name}-${acc.account_no}`;
                                return (
                                    <SelectItem key={val + index} value={val} className="text-xs font-semibold">
                                        {acc.provider_name} - {acc.account_no}
                                    </SelectItem>
                                );
                            })}
                            {accountsToDisplay.length === 0 && (
                                <div className="p-4 text-xs text-slate-500 text-center font-bold">
                                    No existing accounts. Please click 'Add New'.
                                </div>
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            {provider && accountNo && (
                <div className="flex justify-between items-center text-[11px] lg:text-xs font-semibold text-slate-400 mt-1.5 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span>Available Balance:</span>
                    <span className="text-emerald-400 font-bold">
                        {market === "US" ? `$${Formatter.formatNumber(activeBalance, true)}` : Formatter.formatCurrency(activeBalance)}
                    </span>
                </div>
            )}

            {/* Inline Overlay Sub-Modal for adding new accounts */}
            {showAddAccountModal && (
                <AddAccountModal
                    onClose={() => setShowAddAccountModal(false)}
                    onAdd={onAddAccount}
                />
            )}
        </div>
    );
}
