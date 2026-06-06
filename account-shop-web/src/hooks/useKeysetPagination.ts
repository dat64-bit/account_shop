import { useState, useRef, useEffect, useCallback } from 'react';

export function useKeysetPagination<T>(
  fetchData: (lastId: number | null, page: number) => void,
  getIdFromItem: (item: T) => number
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cursors, setCursors] = useState<(number | null)[]>([null]);

  // Keep a ref to the latest fetchData to avoid infinite effect loops
  const fetchRef = useRef(fetchData);
  useEffect(() => {
    fetchRef.current = fetchData;
  }, [fetchData]);

  const handlePrev = useCallback(() => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const prevLastId = cursors[prevPage - 1];
      fetchRef.current(prevLastId, prevPage);
    }
  }, [currentPage, cursors]);

  const handleNext = useCallback((items: T[]) => {
    if (hasMore && items.length > 0) {
      const nextPage = currentPage + 1;
      const currentLastId = getIdFromItem(items[items.length - 1]);
      setCursors(prev => {
        const nextCursors = [...prev];
        nextCursors[nextPage - 1] = currentLastId;
        return nextCursors;
      });
      fetchRef.current(currentLastId, nextPage);
    }
  }, [currentPage, hasMore, getIdFromItem]);

  const resetPagination = useCallback(() => {
    setCursors([null]);
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    setCurrentPage,
    hasMore,
    setHasMore,
    cursors,
    setCursors,
    handlePrev,
    handleNext,
    resetPagination
  };
}
