import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  // If there's only one page, don't show pagination
  if (totalPages <= 1) {
    return null;
  }

  // Function to generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push('...');
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Always show last page if more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex justify-center mt-8">
      <ul className="flex items-center space-x-1">
        {/* Previous page button */}
        {currentPage > 1 && (
          <li>
            <Link
              href={`${baseUrl}/${currentPage - 1}`}
              className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              aria-label="Página anterior"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          </li>
        )}

        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <Link
                href={page === 1 ? baseUrl : `${baseUrl}/${page}`}
                className={`px-3 py-2 rounded-md ${
                  currentPage === page
                    ? 'bg-red-700 text-white font-medium'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </Link>
            )}
          </li>
        ))}

        {/* Next page button */}
        {currentPage < totalPages && (
          <li>
            <Link
              href={`${baseUrl}/${currentPage + 1}`}
              className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              aria-label="Página siguiente"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
