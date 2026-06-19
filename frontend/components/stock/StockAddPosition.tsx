"use client"

import { CircleAlert } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useStockAddPositionForm } from "@/hooks";
import BrokerSelector from "./BrokerSelector";
import PriceInputSection from "./PriceInputSection";

export default function StockAddPosition() {
    const {
        opened,
        useCurrent,
        setUseCurrent,
        market,
        setMarket,
        setPricePerShare,
        setFeePercentage,
        formData,
        setFormData,
        isSubmitting,
        submissionError,
        currentPrice,
        isLoadingPrice,
        fetchPriceError,
        showAddAccountModal,
        setShowAddAccountModal,
        accountsToDisplay,
        isExecuted,
        isSellMode,
        maxLot,
        multiplier,
        activeBalance,
        handleFormChange,
        handleSubmit,
        onAddAccount,
        handleOpenChange,
        currentStock: stock
    } = useStockAddPositionForm();

    return (
        <Sheet open={opened} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button variant="gradient">+ Add Stock</Button>
            </SheetTrigger>
            <SheetContent className="bg-zinc-950 text-white border-white/10 sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className={isSellMode ? "text-red-500" : "text-green-500"}>
                        {isSellMode ? "Sell Position" : "Add Position / Buy"}
                    </SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        Input your trade details to update your performance tracker.
                    </SheetDescription>
                </SheetHeader>

                {/* Forms */}
                <div className="space-y-4 mt-6 mx-5 w-[75%]">
                    <Tabs
                        value={market}
                        onValueChange={(val) => {
                            setMarket(val as "IDX" | "US");
                            setFormData(prev => ({ ...prev, provider: "", account_no: "" }));
                        }}
                        className="w-fit"
                    >
                        <TabsList className="bg-white/5 border border-white/10 h-auto p-1">
                            <TabsTrigger
                                value="IDX"
                                disabled={!!stock}
                                className="px-3 py-1.5 text-xs font-bold rounded-md transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white"
                            >
                                IDX (Indo)
                            </TabsTrigger>
                            <TabsTrigger
                                value="US"
                                disabled={!!stock}
                                className="px-3 py-1.5 text-xs font-bold rounded-md transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white"
                            >
                                US (America)
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="space-y-3">
                        <Label htmlFor="ticker">Ticker</Label>
                        <Input
                            id="ticker"
                            type="text"
                            value={formData.ticker}
                            readOnly={isExecuted}
                            onChange={(e) => handleFormChange("ticker", e.target.value.toUpperCase())}
                        />
                    </div>

                    {/* Broker Selector Component */}
                    <BrokerSelector
                        market={market}
                        provider={formData.provider}
                        accountNo={formData.account_no}
                        accountsToDisplay={accountsToDisplay}
                        activeBalance={activeBalance}
                        showAddAccountModal={showAddAccountModal}
                        setShowAddAccountModal={setShowAddAccountModal}
                        onAddAccount={onAddAccount}
                        onSelectAccount={(provider, accountNo) => {
                            setFormData(prev => ({
                                ...prev,
                                provider,
                                account_no: accountNo
                            }));
                        }}
                    />

                    {isSellMode && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-xs text-red-400 italic">
                                Note: Selling will reduce your current lot size.
                            </p>
                        </div>
                    )}

                    {/* Price & Quantity Input Section */}
                    <PriceInputSection
                        market={market}
                        isSellMode={isSellMode}
                        qty={formData.qty}
                        inv={formData.inv}
                        useCurrent={useCurrent}
                        isLoadingPrice={isLoadingPrice}
                        currentPrice={currentPrice}
                        maxLot={maxLot}
                        multiplier={multiplier}
                        onChangeField={handleFormChange}
                        onSetUseCurrent={setUseCurrent}
                        onSetPricePerShare={setPricePerShare}
                    />

                    <div className="space-y-3">
                        <Label htmlFor="fee">Transaction Fee ({market === "US" ? "$" : "Rp"})</Label>
                        <Input
                            id="fee"
                            type="text"
                            inputMode="numeric"
                            value={formData.fee}
                            onChange={(e) => handleFormChange("fee", e.target.value)}
                        />
                    </div>

                    {/* Separator 'OR' */}
                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">OR</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    {/* Custom Fee percentage input */}
                    <div className="space-y-2">
                        <Label htmlFor="custom-fee-pct" className="text-xs text-gray-400">
                            Input fee percentage
                        </Label>
                        <div className="relative">
                            <Input
                                id="custom-fee-pct"
                                type="text"
                                inputMode="numeric"
                                className="pr-9 bg-gray-950 border-gray-700 transition-opacity opacity-100"
                                onChange={(e) => {
                                    const feePct = Number(e.target.value);
                                    setFeePercentage(feePct);
                                }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                        </div>
                    </div>

                    <Button className="mt-3" onClick={handleSubmit} disabled={isSubmitting || isLoadingPrice}>
                        {isSubmitting ? "Processing..." : isSellMode ? "Sell Stock" : "Add Position"}
                    </Button>

                    {fetchPriceError && (
                        <div className="flex items-center rounded-lg bg-destructive/10 p-3 mb-2 text-sm text-destructive border border-destructive/20 animate-in fade-in zoom-in duration-300">
                            <CircleAlert className="h-4 w-4 mr-2" />
                            {fetchPriceError}
                        </div>
                    )}

                    {submissionError && (
                        <div className="flex items-center rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 animate-in fade-in zoom-in duration-300">
                            <CircleAlert className="h-4 w-4 mr-2" /> {submissionError}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}