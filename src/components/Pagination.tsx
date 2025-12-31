'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // ページ番号の配列を生成（最大5ページ表示）
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    // 表示ページ数を調整
    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(5, totalPages);
      } else if (end === totalPages) {
        start = Math.max(1, totalPages - 4);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className="text-sm text-gray-600">
        {totalCount > 0 ? `全${totalCount}件` : '0件'}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-600">
        {totalCount}件中 {startItem}〜{endItem}件を表示
      </div>
      <div className="flex items-center gap-1">
        <button
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          ≪
        </button>
        <button
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ＜
        </button>
        
        {getPageNumbers().map((page) => (
          <button
            key={page}
            className={`px-3 py-1 text-sm border rounded ${
              page === currentPage
                ? 'bg-blue-500 text-white border-blue-500'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ＞
        </button>
        <button
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          ≫
        </button>
      </div>
    </div>
  );
}





