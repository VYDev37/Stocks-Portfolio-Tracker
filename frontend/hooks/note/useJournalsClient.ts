"use client";

import { useState, useMemo } from "react";
import useGetNotes from "./useGetNotes";

export default function useJournalsClient() {
    const [open, setOpen] = useState(false);
    const { notes, refreshNote, loading } = useGetNotes();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const paginatedNotes = useMemo(() => {
        if (!notes)
            return [];
        const startIndex = (currentPage - 1) * itemsPerPage;
        return notes.slice(startIndex, startIndex + itemsPerPage);
    }, [notes, currentPage]);

    const totalPages = Math.ceil((notes?.length || 0) / itemsPerPage);

    const pages = useMemo(() => {
        let list: (number | string)[] = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                list.push(i);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                list.push('...');
            }
        }
        return list.filter((item, index) => item !== '...' || list[index - 1] !== '...');
    }, [totalPages, currentPage]);

    return {
        open,
        setOpen,
        notes,
        refreshNote,
        loading,
        currentPage,
        setCurrentPage,
        paginatedNotes,
        totalPages,
        pages,
        itemsPerPage
    };
}