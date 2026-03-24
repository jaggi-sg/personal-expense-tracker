// src/components/expenses/Pagination.jsx

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, setCurrentPage, totalPages, startIndex, endIndex, totalItems }) => {
  if (totalPages <= 1) return null;

  const btnBase = 'flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-all';
  const btnActive = btnBase + ' bg-purple-500 text-white';
  const btnInactive = btnBase + ' text-purple-400 hover:bg-white/10 hover:text-white';
  const btnDisabled = btnBase + ' text-purple-600 cursor-not-allowed';

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
      <p className="text-purple-400 text-xs">
        {(startIndex + 1) + '-' + endIndex + ' of ' + totalItems + ' expenses'}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
          className={currentPage === 1 ? btnDisabled : btnInactive}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === '...'
            ? <span key={'ellipsis-' + i} className="text-purple-600 text-sm px-1">...</span>
            : <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={p === currentPage ? btnActive : btnInactive}
              >
                {p}
              </button>
        )}

        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === totalPages}
          className={currentPage === totalPages ? btnDisabled : btnInactive}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;