"use client";

import { useJournalsClient } from "@/hooks";
import { NoteCard, NoteEmpty, NoteSheet } from "@/components/journal";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JournalsClient() {
    const {
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
    } = useJournalsClient();

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
        <div className="container px-4 w-full space-y-8">
            <div className="flex justify-between items-center space-x-3 md:text-xl">
                <h1 className="text-3xl font-bold">My Journals</h1>
                <NoteSheet onRefresh={refreshNote} isOpen={open} onOpenChange={setOpen} />
            </div>

            {notes && notes.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 items-start w-full">
                        <AnimatePresence mode="popLayout">
                            {paginatedNotes.map((note, i) => (
                                <motion.div className="h-full"
                                    key={note.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                >
                                    <NoteCard key={i} note={note} onRefresh={refreshNote} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-4">
                        <div className="text-sm text-slate-400">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, notes.length)} of {notes.length} entries
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
                </>
            ) : (
                <NoteEmpty onRefresh={refreshNote} isLoading={loading} />
            )}
        </div>
    );
}
