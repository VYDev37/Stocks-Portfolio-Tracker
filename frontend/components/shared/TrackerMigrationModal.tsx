"use client";

import { useState } from "react";
import { useTrackerMigration } from "@/hooks";
import { Formatter } from "@/lib";
import { ArrowRightLeft, ShieldAlert, Sparkles, RefreshCw, Plus, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AddAccountModal from "../profile/AddAccountModal";

interface TrackerMigrationModalProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function TrackerMigrationModal({ isOpen: controlledIsOpen, onOpenChange: controlledOnOpenChange }: TrackerMigrationModalProps) {
    const [localIsOpen, setLocalIsOpen] = useState(false);
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;

    const setIsOpen = (open: boolean) => {
        if (controlledOnOpenChange) {
            controlledOnOpenChange(open);
        } else {
            setLocalIsOpen(open);
        }
    };

    const {
        user,
        availableAccounts,
        selectedProvider,
        setSelectedProvider,
        selectedAccountNo,
        setSelectedAccountNo,
        showAddAccountModal,
        setShowAddAccountModal,
        loading,
        error,
        selectedIds,
        isConfirmed,
        setIsConfirmed,
        legacyCashTransactions,
        accountsToDisplay,
        isAllSelected,
        toggleSelectAll,
        toggleSelectTransaction,
        handleMigrate,
        onAddAccount
    } = useTrackerMigration({
        isOpen,
        setIsOpen
    });

    if (!isOpen || !user)
        return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className="w-[92%] sm:max-w-md rounded-3xl border border-white/10 p-5 sm:p-6 space-y-4 shadow-2xl overflow-hidden text-white"
                style={{ backgroundColor: "#0c111d" }}
                showCloseButton={true}
            >
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col items-center text-center space-y-2 relative z-10">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 text-blue-400 rounded-full border border-blue-500/30 animate-pulse">
                        <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="space-y-0.5">
                        <DialogTitle className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 justify-center">
                            Cash Ledger Migration <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400/20" />
                        </DialogTitle>
                        <DialogDescription className="text-[10px] sm:text-[11px] md:text-xs text-zinc-400 max-w-sm">
                            We detected legacy cash transactions in your ledger without assigned bank accounts. Let's organize and move them into your accounts.
                        </DialogDescription>
                    </div>
                </div>

                {/* Migration Warning Card */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5 relative z-10">
                    <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-[9px] sm:text-[10px] md:text-[11px] text-blue-300 font-medium leading-relaxed">
                        Moving these ledger entries will dynamically shift their total sum into the chosen target bank balance, adjusting your vault records seamlessly.
                    </div>
                </div>

                {availableAccounts.length === 0 && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 relative z-10 animate-pulse">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-[9px] sm:text-[10px] md:text-[11px] text-amber-300 font-medium leading-relaxed">
                            We noticed you haven't created a bank/wallet account yet. Please use the <strong className="text-amber-200">"+ Add New Account"</strong> link above to create one first, then select it to migrate your legacy transactions.
                        </div>
                    </div>
                )}

                {/* Account Selection */}
                <div className="space-y-2 relative z-10">
                    <div className="flex justify-between items-center">
                        <Label className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Select Target Bank / Wallet Account
                        </Label>
                        <button
                            type="button"
                            onClick={() => setShowAddAccountModal(true)}
                            className="text-[8px] sm:text-[9px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Add New Account
                        </button>
                    </div>

                    <div className="relative mt-0.5">
                        <Select
                            value={selectedProvider && selectedAccountNo ? `${selectedProvider}-${selectedAccountNo}` : ""}
                            onValueChange={(val) => {
                                const [provider, account_no] = val.split("-");
                                setSelectedProvider(provider);
                                setSelectedAccountNo(account_no);
                            }}
                        >
                            <SelectTrigger className="w-full border-white/10 text-[10px] sm:text-xs font-semibold text-white h-11 rounded-xl focus:ring-1 focus:ring-blue-500" style={{ backgroundColor: "#030712" }}>
                                <SelectValue placeholder="Choose target bank or e-wallet account" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 text-white border-white/10">
                                <SelectGroup>
                                    {accountsToDisplay.map((acc, index) => {
                                        const val = `${acc.provider_name}-${acc.account_no}`;
                                        return (
                                            <SelectItem key={val + index} value={val} className="text-[10px] sm:text-[11px] font-semibold">
                                                {acc.provider_name} - {acc.account_no}
                                            </SelectItem>
                                        );
                                    })}
                                    {accountsToDisplay.length === 0 && (
                                        <div className="p-3 text-[10px] sm:text-[11px] text-zinc-500 text-center font-bold">
                                            No existing accounts. Please click 'Add New Account'.
                                        </div>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Transaction Options Selector with ScrollArea */}
                <div className="space-y-2 relative z-10">
                    <div className="flex justify-between items-center px-1">
                        <Label className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Select Transactions to Move ({selectedIds.length} / {legacyCashTransactions.length})
                        </Label>
                        <div
                            onClick={toggleSelectAll}
                            className="flex items-center gap-1.5 cursor-pointer select-none text-[8px] sm:text-[9px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition-colors"
                        >
                            <span className="text-[7px] sm:text-[8px]">All Transactions</span>
                            <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-md border flex items-center justify-center transition-all ${isAllSelected
                                ? "bg-blue-600 border-blue-500 text-white"
                                : "border-zinc-700 bg-transparent"
                                }`}>
                                {isAllSelected && <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" strokeWidth={3} />}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable list of ledger items */}
                    <div className="max-h-[130px] overflow-y-auto rounded-xl border border-white/5 bg-zinc-950/40 p-1.5 space-y-1.5">
                        {legacyCashTransactions.map((tx) => {
                            const isSelected = selectedIds.includes(tx.id);
                            const isIncome = tx.transaction_type === "income";

                            return (
                                <div
                                    key={tx.id}
                                    onClick={() => toggleSelectTransaction(tx.id)}
                                    className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none ${isSelected
                                        ? "bg-blue-500/10 border-blue-500/30 text-white"
                                        : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10"
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border flex items-center justify-center transition-all ${isSelected
                                            ? "bg-blue-600 border-blue-500"
                                            : "border-zinc-700 bg-transparent"
                                            }`}>
                                            {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <div>
                                            <div className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-200">{tx.title || "Cashflow Log"}</div>
                                            <div className="text-[7px] sm:text-[8px] text-zinc-500 font-medium">
                                                {Formatter.formatDate(tx.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-[9px] sm:text-[10px] md:text-[11px] font-extrabold ${isIncome ? "text-emerald-400" : "text-red-400"}`}>
                                        {isIncome ? "+" : "-"}{Formatter.formatCurrency(tx.price)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] sm:text-[10px] md:text-[11px] text-center font-semibold animate-shake relative z-10">
                        {error}
                    </div>
                )}

                {/* Confirmation Checkbox */}
                <div
                    onClick={() => setIsConfirmed(!isConfirmed)}
                    className="flex items-start gap-2.5 px-1 relative z-10 cursor-pointer select-none py-1 animate-in fade-in duration-300"
                >
                    <div className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded border flex items-center justify-center shrink-0 transition-all ${isConfirmed
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "border-zinc-700 bg-transparent"
                        }`}>
                        {isConfirmed && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-[9px] sm:text-[10px] md:text-[11px] text-zinc-300 font-medium">
                        I confirm and agree to move the selected transactions to the target bank account.
                    </span>
                </div>

                {/* Confirm Action Button */}
                <div className="flex gap-3 pt-1 relative z-10">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 border-white/10 bg-transparent text-slate-300 hover:bg-white/5 font-bold h-11 rounded-xl text-[10px] sm:text-xs"
                    >
                        Skip for Now
                    </Button>
                    <Button
                        onClick={handleMigrate}
                        className="flex-[2] bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-[10px] sm:text-xs font-extrabold h-11 rounded-xl shadow-xl transition-all active:scale-[0.98]"
                        disabled={loading || selectedIds.length === 0 || !isConfirmed || !selectedProvider || !selectedAccountNo}
                    >
                        {loading ? (
                            <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                            `Migrate ${selectedIds.length} Rows`
                        )}
                    </Button>
                </div>

                {/* Absolute overlay sub-modal inside card */}
                {showAddAccountModal && (
                    <AddAccountModal
                        onClose={() => setShowAddAccountModal(false)}
                        onAdd={onAddAccount}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
