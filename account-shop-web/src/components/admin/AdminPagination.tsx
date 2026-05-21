import React from 'react';

interface AdminPaginationProps {
  currentPage: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function AdminPagination({
  currentPage,
  hasMore,
  onPrev,
  onNext
}: AdminPaginationProps) {
  return (
    <div className="admin-pagination">
      <div className="admin-pagination-info">
        Trang <strong>{currentPage}</strong>
      </div>
      <div className="admin-pagination-buttons">
        <button
          className="btn-pagination-arrow"
          onClick={onPrev}
          disabled={currentPage === 1}
          type="button"
        >
          &larr; Trước
        </button>

        <span className="btn-pagination-page active">
          {currentPage}
        </span>

        <button
          className="btn-pagination-arrow"
          onClick={onNext}
          disabled={!hasMore}
          type="button"
        >
          Sau &rarr;
        </button>
      </div>
    </div>
  );
}
