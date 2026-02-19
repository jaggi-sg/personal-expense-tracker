import React from 'react';

const Pagination = ({
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems
}) => {
  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
      <div className="text-purple-200 text-sm">
        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} expenses
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg transition-all ${
            currentPage === 1
              ? 'bg-white/5 text-purple-300 cursor-not-allowed'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    currentPage === pageNum
                      ? 'bg-purple-500 text-white font-semibold'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {pageNum}
                </button>
              );
            } else if (
              pageNum === currentPage - 2 ||
              pageNum === currentPage + 2
            ) {
              return (
                <span key={pageNum} className="text-purple-200 px-2">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg transition-all ${
            currentPage === totalPages
              ? 'bg-white/5 text-purple-300 cursor-not-allowed'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;