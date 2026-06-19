"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from 'lucide-react';

import { TrackerHeader, TrackerSummary, TrackerTransactionColumn, TrackerCombinedColumn, MigrationBanner } from '@/components/tracker';
import { TrackerMigrationModal } from '@/components/shared';
import { useTrackerData } from '@/hooks';

export default function TrackerClient() {
    const {
        selectedAccount,
        setSelectedAccount,
        limit,
        setLimit,
        isMigrationOpen,
        setIsMigrationOpen,
        incomes,
        expenses,
        income,
        expense,
        net,
        balanceTransactions,
        visibleIncomes,
        visibleExpenses,
        visibleBalanceTransactions,
        legacyCashTransactions
    } = useTrackerData();

    return (
        <div className="flex flex-col w-full pt-3 pb-6 space-y-6 md:space-y-8 text-slate-300 font-sans antialiased">
            <TrackerMigrationModal isOpen={isMigrationOpen} onOpenChange={setIsMigrationOpen} />
            <motion.div
                key="tracker-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 md:space-y-8"
            >
                {/* Migration Action Banner */}
                {legacyCashTransactions.length > 0 && (
                    <MigrationBanner
                        legacyCount={legacyCashTransactions.length}
                        onMigrateClick={() => setIsMigrationOpen(true)}
                    />
                )}

                <TrackerHeader net={net} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />
                <TrackerSummary income={income} expense={expense} />

                <AnimatePresence mode="popLayout">
                    {/* Mobile Combined View */}
                    <motion.div key="mobile-tracker" className="block md:hidden" layout>
                        <TrackerCombinedColumn
                            title="Recent Activity"
                            items={visibleBalanceTransactions}
                            totalCount={balanceTransactions.length}
                            onViewAll={() => setLimit(balanceTransactions.length)}
                        />
                    </motion.div>

                    {/* Desktop Separated View */}
                    <motion.div key="desktop-tracker" className="hidden md:grid md:grid-cols-2 gap-6 md:gap-8" layout>
                        <TrackerTransactionColumn
                            title="Inflow Details"
                            type="inflow"
                            items={visibleIncomes}
                            onViewAll={() => setLimit(Math.max(incomes.length, expenses.length))}
                        />

                        <TrackerTransactionColumn
                            title="Outflow Details"
                            type="outflow"
                            items={visibleExpenses}
                            onViewAll={() => setLimit(Math.max(incomes.length, expenses.length))}
                        />
                    </motion.div>

                    <footer className="pt-6 md:pt-8 text-center min-h-[4rem]">
                        {(incomes.length > limit || expenses.length > limit || balanceTransactions.length > limit) && (
                            <button
                                onClick={() => setLimit(prev => prev + 10)}
                                className="text-[11px] text-slate-500 hover:text-white transition-colors flex items-center gap-2 mx-auto bg-slate-900/50 hover:bg-slate-800 py-2 px-4 rounded-full border border-slate-800">
                                View more <ArrowDown className="w-3 h-3" />
                            </button>
                        )}
                    </footer>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
