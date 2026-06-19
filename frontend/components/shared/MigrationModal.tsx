"use client";

import { useMigrationModal } from "@/hooks";
import { ArrowRightLeft, ShieldAlert, Sparkles, RefreshCw, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddAccountModal } from "@/components/profile";

export default function MigrationModal() {
    const {
        user,
        isOpen,
        setIsOpen,
        selectedProvider,
        setSelectedProvider,
        selectedAccountNo,
        setSelectedAccountNo,
        showAddAccountModal,
        setShowAddAccountModal,
        loading,
        error,
        accountsToDisplay,
        handleMigrate,
        onAddAccount
    } = useMigrationModal();

    if (!isOpen || !user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className="w-full max-w-lg rounded-3xl border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl overflow-hidden text-white"
                style={{ backgroundColor: "#0c111d" }}
                showCloseButton={false}
            >
                {/* Decorative Premium Glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header Icon & Title */}
                <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                    <div className="p-4 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 text-blue-400 rounded-full border border-blue-500/30 animate-pulse">
                        <ArrowRightLeft className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5 justify-center">
                            Portfolio Migration <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                        </DialogTitle>
                        <DialogDescription className="text-sm text-zinc-400 max-w-md">
                            We detected legacy assets in your account without assigned brokers. Please assign them to a broker account to organize your multi-broker portfolio.
                        </DialogDescription>
                    </div>
                </div>

                {/* Migration Warning Card */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 relative z-10">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-400 font-medium">
                        This action will update all your unassigned positions, balances, and history to belong to the selected broker. Your performance metrics will adjust automatically.
                    </div>
                </div>

                {/* Form Selection */}
                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            Select Broker Account
                        </Label>
                        <button
                            type="button"
                            onClick={() => setShowAddAccountModal(true)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add New Broker
                        </button>
                    </div>

                    <div className="relative mt-1">
                        <Select
                            value={selectedProvider && selectedAccountNo ? `${selectedProvider}-${selectedAccountNo}` : ""}
                            onValueChange={(val) => {
                                const [provider, account_no] = val.split("-");
                                setSelectedProvider(provider);
                                setSelectedAccountNo(account_no);
                            }}
                        >
                            <SelectTrigger className="w-full border-white/10 text-sm font-semibold text-white h-14 rounded-2xl focus:ring-1 focus:ring-blue-500" style={{ backgroundColor: "#030712" }}>
                                <SelectValue placeholder="Choose your target broker account" />
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
                                        <div className="p-4 text-xs text-zinc-500 text-center font-bold">
                                            No existing accounts. Please click 'Add New Broker'.
                                        </div>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-semibold animate-shake relative z-10">
                        {error}
                    </div>
                )}

                {/* Confirm Action Button */}
                <div className="pt-2 relative z-10">
                    <Button
                        onClick={handleMigrate}
                        className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-sm font-extrabold h-14 rounded-2xl shadow-xl transition-all active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? (
                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            "Migrate Legacy Assets"
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
