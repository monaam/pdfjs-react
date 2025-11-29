import { useEffect, useCallback, useRef, type RefObject } from 'react';

/**
 * Options for the usePageTracking hook
 */
export interface UsePageTrackingOptions {
  /** Reference to the container element */
  containerRef: RefObject<HTMLElement>;
  /** Total number of pages */
  totalPages: number;
  /** Callback when the visible page changes */
  onPageChange: (page: number) => void;
  /** Threshold for considering a page visible (0-1) */
  threshold?: number;
  /** Debounce time in milliseconds */
  debounceMs?: number;
}

/**
 * Hook to track the currently visible page based on scroll position
 */
export function usePageTracking(options: UsePageTrackingOptions): void {
  const {
    containerRef,
    totalPages,
    onPageChange,
    threshold = 0.5,
    debounceMs = 100,
  } = options;

  // Track the last reported page to avoid duplicate calls
  const lastPageRef = useRef<number>(1);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const calculateVisiblePage = useCallback(() => {
    const container = containerRef.current;
    if (!container || totalPages === 0) return;

    const containerRect = container.getBoundingClientRect();
    const containerTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const containerCenter = containerTop + containerHeight / 2;

    let mostVisiblePage = 1;
    let maxVisibility = 0;

    // Find all page elements
    const pageElements = container.querySelectorAll('[data-page-number]');

    pageElements.forEach((element) => {
      const pageNumber = parseInt(element.getAttribute('data-page-number') || '1', 10);
      const rect = element.getBoundingClientRect();

      // Calculate the element's position relative to the container
      const elementTop = rect.top - containerRect.top + containerTop;
      const elementBottom = elementTop + rect.height;

      // Calculate visibility
      const visibleTop = Math.max(elementTop, containerTop);
      const visibleBottom = Math.min(elementBottom, containerTop + containerHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibility = visibleHeight / rect.height;

      // Check if this page is the most visible
      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        mostVisiblePage = pageNumber;
      }

      // Also check if the page contains the center of the viewport
      if (elementTop <= containerCenter && elementBottom >= containerCenter) {
        mostVisiblePage = pageNumber;
        maxVisibility = 1; // Highest priority
      }
    });

    // Only report if the page changed and meets threshold
    if (maxVisibility >= threshold && mostVisiblePage !== lastPageRef.current) {
      lastPageRef.current = mostVisiblePage;
      onPageChange(mostVisiblePage);
    }
  }, [containerRef, totalPages, onPageChange, threshold]);

  const handleScroll = useCallback(() => {
    // Debounce the page calculation
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      calculateVisiblePage();
    }, debounceMs);
  }, [calculateVisiblePage, debounceMs]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use passive listener for better scroll performance
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Calculate initial page
    calculateVisiblePage();

    return () => {
      container.removeEventListener('scroll', handleScroll);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [containerRef, handleScroll, calculateVisiblePage]);

  // Recalculate when total pages changes
  useEffect(() => {
    calculateVisiblePage();
  }, [totalPages, calculateVisiblePage]);
}
