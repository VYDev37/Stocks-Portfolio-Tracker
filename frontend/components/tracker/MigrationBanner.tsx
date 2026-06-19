"use client";

import { ArrowRightLeft, Sparkles } from 'lucide-react';

interface MigrationBannerProps {
    legacyCount: number;
    onMigrateClick: () => void;
}

export default function MigrationBanner({ legacyCount, onMigrateClick }: MigrationBannerProps) {
    return (
        <div className="bg-gradient-to-r from-blue-900/40 to-emerald-900/40 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg backdrop-blur-md relative overflow-hidden">
            {/* Decorative inner glow */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-start gap-3 relative z-10">
                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 shrink-0">
                    <ArrowRightLeft className="w-5 h-5 text-blue-400 animate-pulse" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        Unassigned Cash Transactions <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    </h4>
                    <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                        You have {legacyCount} legacy transactions without an assigned bank or wallet account. Migrate them to organize your cash ledger properly.
                    </p>
                </div>
            </div>

            <button
                onClick={onMigrateClick}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-[0.98] shrink-0 relative z-10"
            >
                Migrate Now
            </button>
        </div>
    );
}
