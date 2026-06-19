"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCw, Plus } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Formatter } from "@/lib";
import { useManageBalance } from "@/hooks";
import { AddAccountModal } from ".";

interface ManageBalanceSheetProps {
    children?: React.ReactNode;
    mode: 'stock' | 'cash';
    currency?: string;
}

export default function ManageBalanceSheet({ children, mode, currency }: ManageBalanceSheetProps) {
    const {
        open,
        setOpen,
        formData,
        setFormData,
        showAddAccountModal,
        setShowAddAccountModal,
        accountsToDisplay,
        maxBalance,
        loading,
        error,
        handleSubmit,
        handleFormChange,
        onAddAccount
    } = useManageBalance({ mode });

    const renderForm = (modeLabel: string, colorClass: string) => (
        <form onSubmit={handleSubmit} className="space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ">
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                {mode === "cash" && (
                    <>
                        <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Title (e.g. Investment)
                        </Label>
                        <div className="relative">
                            <Input id="title" type="text" placeholder="Title" value={formData.title} onChange={(e) => handleFormChange("title", e.target.value)}
                                className="bg-transparent border-none text-xs h-14 focus-visible:ring-0 focus-visible:ring-offset-0 font-bold"
                                required />
                        </div>
                    </>
                )}

                <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {formData.asset_type === "stock_balance" ? `Amount to ${modeLabel.toLowerCase()}`
                        : "Amount"}
                </Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{currency === "USD" ? "$" : "Rp"}</span>
                    <Input id="amount" type="text" inputMode="numeric" placeholder="0.00" value={formData.amount}
                        onChange={(e) => handleFormChange("amount", e.target.value)} className="pl-10 bg-transparent border-none text-md h-14 focus-visible:ring-0 focus-visible:ring-offset-0 font-bold"
                        required />
                </div>
                {formData.provider && formData.account_no && (
                    <div className="flex justify-between items-center text-[11px] lg:text-xs font-semibold text-slate-400 mt-1.5 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        <span>Available Balance:</span>
                        <span className="text-emerald-400 font-bold">{Formatter.formatCurrency(maxBalance)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center mt-4">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Select Account
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
                        value={formData.provider && formData.account_no ? `${formData.provider}-${formData.account_no}` : ""}
                        onValueChange={(val) => {
                            const [provider, account_no] = val.split("-");
                            setFormData({
                                ...formData,
                                provider,
                                bank_src: provider,
                                account_no
                            });
                        }}
                    >
                        <SelectTrigger className="w-full bg-slate-900 border-white/10 text-xs font-bold text-white h-14 rounded-md focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder="Select Bank / E-Wallet Account" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 text-white border-white/10">
                            <SelectGroup>
                                {accountsToDisplay.map((acc, index) => {
                                    const val = `${acc.provider_name}-${acc.account_no}`;
                                    return (
                                        <SelectItem key={val + index} value={val} className="text-xs font-semibold">
                                            {acc.provider_name} - {acc.account_no} {acc.currency ? `(${acc.currency})` : ''}
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

                {/* Inline Overlay Sub-Modal for adding new accounts */}
                {showAddAccountModal && (
                    <AddAccountModal
                        onClose={() => setShowAddAccountModal(false)}
                        onAdd={onAddAccount}
                    />
                )}
                {formData.asset_type === "cash_balance" && (
                    <>
                        <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Transaction Date
                        </Label>
                        <div className="relative">
                            <Input id="date" type="date" value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : ""} onChange={(e) => handleFormChange("date", e.target.value)}
                                className="bg-transparent border-none text-xs h-14 focus-visible:ring-0 focus-visible:ring-offset-0 font-bold"
                                required />
                        </div>
                    </>
                )}
                {modeLabel.toLowerCase() !== "adjust" && formData.asset_type !== "cash_balance" && (
                    <>
                        <Label htmlFor="fee" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Transaction Fee
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{currency === "USD" ? "$" : "Rp"}</span>
                            <Input id="fee" type="text" inputMode="numeric" placeholder="0.00" value={formData.fee} min={0}
                                onChange={(e) => handleFormChange("fee", e.target.value)} className="pl-10 bg-transparent border-none text-md h-14 focus-visible:ring-0 focus-visible:ring-offset-0 font-bold" />
                        </div>
                    </>
                )}
                <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Note (Optional)
                </Label>
                <div className="relative">
                    <Textarea id="notes" placeholder="Your notes here..." value={formData.note} onChange={(e) => handleFormChange("note", e.target.value)}
                        className="bg-transparent border-none text-sm min-h-[80px] focus-visible:ring-0 focus-visible:ring-offset-0 font-bold" />
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                    {error}
                </div>
            )}

            <Button type="submit" className={`w-50 p-4 text-white text-md font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${colorClass}`}
                disabled={loading}>
                {loading ? (
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                ) : (mode === "stock" ? (
                    `${modeLabel} Balance`
                ) : (
                    `Add to ${modeLabel === "Withdraw" ? "expense" : "income"}`
                ))}
            </Button>
        </form>
    );

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children || <Button variant="outline">Manage Balance</Button>}
            </SheetTrigger>
            <SheetContent className="border-l border-white/10 bg-slate-950/80 backdrop-blur-2xl sm:max-w-md overflow-y-auto">
                <SheetHeader className="pb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <Wallet size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400/80">Vault System</span>
                    </div>
                    <SheetTitle className="text-3xl font-extrabold tracking-tight">Financial Hub</SheetTitle>
                    <SheetDescription className="text-slate-400">
                        Securely manage your capital allocation and account liquidity.
                    </SheetDescription>
                </SheetHeader>

                <Tabs value={formData.mode} onValueChange={(v) => handleFormChange("mode", v as any)} className="w-[90%] ms-5">
                    <TabsList className={`grid w-full ${mode === "stock" ? "grid-cols-3" : "grid-cols-2"} h-12 bg-white/5 p-1 rounded-xl border border-white/5`}>
                        <TabsTrigger value="add" className="rounded-lg data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                            <ArrowUpCircle className="w-4 h-4 mr-1" /> {mode !== "stock" ? "Income" : "Add"}
                        </TabsTrigger>
                        <TabsTrigger value="rem" disabled={accountsToDisplay.some(acc =>
                            acc.provider_name === formData.provider &&
                            acc.account_no === formData.account_no &&
                            acc.is_new
                        )} className="rounded-lg data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                            <ArrowDownCircle className="w-4 h-4 mr-1" /> {mode !== "stock" ? "Expense" : "Remove"}
                        </TabsTrigger>
                        {mode === "stock" && (<TabsTrigger value="mod" className="rounded-lg data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                            <RefreshCw className="w-4 h-4 mr-1" /> Mod
                        </TabsTrigger>)}
                    </TabsList>

                    <TabsContent value="add">{renderForm("Deposit", "bg-green-600 hover:bg-green-500 shadow-green-900/20")}</TabsContent>
                    <TabsContent value="rem">{renderForm("Withdraw", "bg-red-600 hover:bg-red-500 shadow-red-900/20")}</TabsContent>
                    {mode === "stock" && (<TabsContent value="mod">{renderForm("Adjust", "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20")}</TabsContent>)}
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}