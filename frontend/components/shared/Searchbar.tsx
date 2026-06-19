"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";

interface SearchbarProps {
    label: string;
    onSearch: (value: string) => void;
    initialValue?: string;
}

export default function Searchbar({ label, onSearch, initialValue = "" }: SearchbarProps) {
    const [tempQuery, setTempQuery] = useState(initialValue);

    return (
        <div className="flex border-b border-white/10 bg-zinc-950 p-2 gap-2">
            <input
                className="flex-1 bg-zinc-900 border border-white/5 p-2 text-xs text-white outline-none focus:border-emerald-500/50 transition-colors font-mono rounded"
                placeholder={label}
                value={tempQuery}
                onChange={(e) => setTempQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(tempQuery)}
            />
            <button
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-black uppercase tracking-tighter rounded transition-all"
                onClick={() => onSearch(tempQuery)}
            >
                <SearchIcon className="w-4 h-4" />
            </button>
        </div>
    )
}