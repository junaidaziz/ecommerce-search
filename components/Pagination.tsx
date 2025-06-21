import type { FC } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 3);
  if (end - start < 3) {
    start = Math.max(1, end - 3);
  }
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return (
    <div className="flex justify-center my-4">
      <div className="join">
        <button
          type="button"
          className="btn btn-sm join-item"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`btn btn-sm join-item ${p === currentPage ? 'btn-active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-sm join-item"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
