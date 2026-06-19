"use client"

import { StockMobileCard, StockDesktopTable } from "@/components/stock";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useStockList } from "@/hooks";

export default function StockList() {
    const {
        isLoading,
        currentPage,
        setCurrentPage,
        selectedFilter,
        setSelectedFilter,
        uniqueAccounts,
        filteredStocks,
        paginatedStocks,
        totalPages,
        pages,
        handleTickerChange,
        handleAddRedirect,
        itemsPerPage
    } = useStockList();

    const renderPaginationDots = () => {
        return pages.map((page, index) => {
            if (page === '...') {
                return <span key={`ellipsis-${index}`} className="px-2 text-slate-500">...</span>;
            }
            return (
                <Button
                    key={`page-${page}`}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page as number)}
                    className={`w-8 h-8 p-0 ${currentPage === page
                        ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                        : "border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300"}`}
                >
                    {page}
                </Button>
            );
        });
    };

    return (
        <div className="space-y-4">
            {/* Filter Dropdown */}
            {uniqueAccounts.length > 0 && !isLoading && (
                <div className="flex flex-col sm:flex-row items-center justify-start gap-2 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter by Broker:</span>
                    <Select value={selectedFilter} onValueChange={(val) => {
                        setSelectedFilter(val);
                        setCurrentPage(1);
                    }} defaultValue={uniqueAccounts.length > 0 ? `${uniqueAccounts[0].provider_name}-${uniqueAccounts[0].account_no}` : ""}>
                        <SelectTrigger className="w-full sm:w-64 bg-slate-900 border-white/10 text-xs font-bold text-white h-10 rounded-md focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder="All Brokers" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 text-white border-white/10">
                            <SelectItem value="all" className="text-xs font-semibold">All Brokers</SelectItem>
                            {uniqueAccounts.map((acc, index) => {
                                const val = `${acc.provider_name}-${acc.account_no}`;
                                return (
                                    <SelectItem key={val + index} value={val} className="text-xs font-semibold">
                                        {acc.provider_name} ({acc.account_no})
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Mobile */}
            <StockMobileCard stocks={paginatedStocks} loading={isLoading} handleAddRedirect={handleAddRedirect} handleTickerChange={handleTickerChange} />

            {/* Desktop */}
            <StockDesktopTable stocks={paginatedStocks} loading={isLoading} handleAddRedirect={handleAddRedirect} handleTickerChange={handleTickerChange} />

            {filteredStocks.length > 0 && !isLoading && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-4">
                    <div className="text-sm text-slate-400">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStocks.length)} of {filteredStocks.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 h-8"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Previous</span>
                        </Button>
                        <div className="flex items-center gap-1">
                            {renderPaginationDots()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 h-8"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}