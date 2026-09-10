import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export const ITEMS_PER_PAGE = 10;

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  scrollToTop = false,
}) {
  const handlePageClick = (page) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
      if (scrollToTop) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }
    return pages;
  };

  const formatPage = (p) => (p < 10 && typeof p === 'number' ? `0${p}` : p);

  return (
    <div className="flex items-center gap-2">
      <button
        className="p-1 text-[var(--text-gray)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handlePageClick(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft size={18} />
      </button>
      <button
        className="p-1 text-[var(--text-gray)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-1 mx-2">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm text-[var(--text-gray)]"
              style={{ cursor: "default" }}
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-colors ${currentPage === page
                ? "border border-[var(--border-secondary)] text-white bg-white/5"
                : "text-[var(--text-gray)] hover:text-white"
                }`}
              onClick={() => handlePageClick(page)}
            >
              {formatPage(page)}
            </button>
          )
        )}
      </div>

      <button
        className="p-1 text-[var(--text-gray)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={18} />
      </button>
      <button
        className="p-1 text-[var(--text-gray)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => handlePageClick(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight size={18} />
      </button>
    </div>
  );
}
