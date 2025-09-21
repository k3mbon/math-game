import { useState, useMemo } from "react"

interface UsePaginationOptions {
  totalItems: number
  itemsPerPage: number
  initialPage?: number
}

export function usePagination({
  totalItems,
  itemsPerPage,
  initialPage = 1,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage]
  )

  const startIndex = useMemo(
    () => (currentPage - 1) * itemsPerPage,
    [currentPage, itemsPerPage]
  )

  const endIndex = useMemo(
    () => Math.min(startIndex + itemsPerPage - 1, totalItems - 1),
    [startIndex, itemsPerPage, totalItems]
  )

  const currentItems = useMemo(() => {
    // This hook typically works with an array of items, but we don't have it here.
    // In a real scenario, you'd pass the array and slice it.
    // For now, we'll just return the start and end index.
    return { startIndex, endIndex }
  }, [startIndex, endIndex])

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
  }

  const nextPage = () => {
    goToPage(currentPage + 1)
  }

  const prevPage = () => {
    goToPage(currentPage - 1)
  }

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
  }
}