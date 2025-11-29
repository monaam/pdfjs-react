import { useRef, useCallback, useImperativeHandle, type RefObject } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type {
  PDFViewerRef,
  ScaleValue,
  RotationValue,
  FindOptions,
} from '../PDFViewer.types';

/**
 * Options for the usePDFViewer hook
 */
export interface UsePDFViewerOptions {
  /** Reference to the container element */
  containerRef: RefObject<HTMLDivElement>;
  /** The PDF document */
  document: PDFDocumentProxy | null;
  /** Current page */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Current scale */
  currentScale: number;
  /** Current rotation */
  currentRotation: RotationValue;
  /** Whether zoom is enabled */
  zoomEnabled: boolean;
  /** Callback to set current page */
  setCurrentPage: (page: number) => void;
  /** Callback to set current scale */
  setCurrentScale: (scale: number) => void;
  /** Callback to set current rotation */
  setCurrentRotation: (rotation: RotationValue) => void;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Callback when scale changes */
  onScaleChange?: (scale: number) => void;
}

/**
 * Result of the usePDFViewer hook
 */
export interface UsePDFViewerResult {
  /** Go to a specific page */
  goToPage: (page: number) => void;
  /** Go to the next page */
  nextPage: () => void;
  /** Go to the previous page */
  previousPage: () => void;
  /** Zoom in */
  zoomIn: () => void;
  /** Zoom out */
  zoomOut: () => void;
  /** Set scale */
  setScale: (scale: ScaleValue) => void;
  /** Rotate by degrees */
  rotate: (degrees: 90 | -90) => void;
  /** Set rotation */
  setRotation: (degrees: RotationValue) => void;
  /** Get current page */
  getCurrentPage: () => number;
  /** Get total pages */
  getTotalPages: () => number;
  /** Get current scale */
  getCurrentScale: () => number;
  /** Find text */
  find: (query: string, options?: FindOptions) => void;
  /** Find next */
  findNext: () => void;
  /** Find previous */
  findPrevious: () => void;
  /** Clear find */
  clearFind: () => void;
}

// Zoom step factor
const ZOOM_STEP = 0.25;
const MIN_SCALE = 0.1;
const MAX_SCALE = 10;

/**
 * Hook to manage PDF viewer interactions
 */
export function usePDFViewer(options: UsePDFViewerOptions): UsePDFViewerResult {
  const {
    containerRef,
    document,
    currentPage,
    totalPages,
    currentScale,
    currentRotation,
    zoomEnabled,
    setCurrentPage,
    setCurrentScale,
    setCurrentRotation,
  } = options;

  // Search state
  const searchQueryRef = useRef<string>('');
  const searchOptionsRef = useRef<FindOptions>({});

  const goToPage = useCallback(
    (page: number) => {
      if (!document || totalPages === 0) return;

      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);

      // Scroll to the page element
      const container = containerRef.current;
      if (container) {
        const pageElement = container.querySelector(`[data-page-number="${validPage}"]`);
        if (pageElement) {
          pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    [document, totalPages, setCurrentPage, containerRef]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const zoomIn = useCallback(() => {
    if (!zoomEnabled) return;
    const newScale = Math.min(currentScale + ZOOM_STEP, MAX_SCALE);
    setCurrentScale(newScale);
  }, [zoomEnabled, currentScale, setCurrentScale]);

  const zoomOut = useCallback(() => {
    if (!zoomEnabled) return;
    const newScale = Math.max(currentScale - ZOOM_STEP, MIN_SCALE);
    setCurrentScale(newScale);
  }, [zoomEnabled, currentScale, setCurrentScale]);

  const setScale = useCallback(
    (scale: ScaleValue) => {
      if (!zoomEnabled) return;

      if (typeof scale === 'number') {
        const validScale = Math.max(MIN_SCALE, Math.min(scale, MAX_SCALE));
        setCurrentScale(validScale);
      } else {
        // Handle named scale values
        const container = containerRef.current;
        if (!container || !document) return;

        // Get the first page to calculate scale
        document.getPage(1).then((page) => {
          const viewport = page.getViewport({ scale: 1, rotation: currentRotation });
          const containerWidth = container.clientWidth - 40; // padding
          const containerHeight = container.clientHeight - 40;

          let newScale: number;

          switch (scale) {
            case 'page-width':
              newScale = containerWidth / viewport.width;
              break;
            case 'page-fit':
              newScale = Math.min(
                containerWidth / viewport.width,
                containerHeight / viewport.height
              );
              break;
            case 'page-actual':
              newScale = 1;
              break;
            case 'auto':
            default:
              newScale = Math.min(containerWidth / viewport.width, 1.5);
              break;
          }

          setCurrentScale(Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE)));
        });
      }
    },
    [zoomEnabled, containerRef, document, currentRotation, setCurrentScale]
  );

  const rotate = useCallback(
    (degrees: 90 | -90) => {
      const newRotation = ((currentRotation + degrees + 360) % 360) as RotationValue;
      setCurrentRotation(newRotation);
    },
    [currentRotation, setCurrentRotation]
  );

  const setRotation = useCallback(
    (degrees: RotationValue) => {
      setCurrentRotation(degrees);
    },
    [setCurrentRotation]
  );

  const getCurrentPage = useCallback(() => currentPage, [currentPage]);
  const getTotalPages = useCallback(() => totalPages, [totalPages]);
  const getCurrentScale = useCallback(() => currentScale, [currentScale]);

  // Search functionality
  const find = useCallback(
    (query: string, findOptions?: FindOptions) => {
      searchQueryRef.current = query;
      searchOptionsRef.current = findOptions || {};

      // For now, we'll implement basic text search using the text layer
      // Full search implementation would require more complex state management
      if (!document || !query) return;

      // Highlight matching text in the text layer
      const container = containerRef.current;
      if (!container) return;

      // Clear previous highlights
      const existingHighlights = container.querySelectorAll('.pdf-search-highlight');
      existingHighlights.forEach((el) => el.classList.remove('pdf-search-highlight'));

      // Search in text layers
      const textLayers = container.querySelectorAll('.textLayer');
      textLayers.forEach((layer) => {
        const spans = layer.querySelectorAll('span');
        spans.forEach((span) => {
          const text = span.textContent || '';
          const searchText = findOptions?.caseSensitive ? query : query.toLowerCase();
          const compareText = findOptions?.caseSensitive ? text : text.toLowerCase();

          if (compareText.includes(searchText)) {
            span.classList.add('pdf-search-highlight');
          }
        });
      });
    },
    [document, containerRef]
  );

  const findNext = useCallback(() => {
    // Scroll to next highlighted element
    const container = containerRef.current;
    if (!container) return;

    const highlights = container.querySelectorAll('.pdf-search-highlight');
    if (highlights.length === 0) return;

    const currentHighlight = container.querySelector('.pdf-search-highlight.current');
    let nextIndex = 0;

    if (currentHighlight) {
      currentHighlight.classList.remove('current');
      const currentIndex = Array.from(highlights).indexOf(currentHighlight);
      nextIndex = (currentIndex + 1) % highlights.length;
    }

    const nextHighlight = highlights[nextIndex];
    nextHighlight.classList.add('current');
    nextHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [containerRef]);

  const findPrevious = useCallback(() => {
    // Scroll to previous highlighted element
    const container = containerRef.current;
    if (!container) return;

    const highlights = container.querySelectorAll('.pdf-search-highlight');
    if (highlights.length === 0) return;

    const currentHighlight = container.querySelector('.pdf-search-highlight.current');
    let prevIndex = highlights.length - 1;

    if (currentHighlight) {
      currentHighlight.classList.remove('current');
      const currentIndex = Array.from(highlights).indexOf(currentHighlight);
      prevIndex = (currentIndex - 1 + highlights.length) % highlights.length;
    }

    const prevHighlight = highlights[prevIndex];
    prevHighlight.classList.add('current');
    prevHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [containerRef]);

  const clearFind = useCallback(() => {
    searchQueryRef.current = '';
    searchOptionsRef.current = {};

    const container = containerRef.current;
    if (!container) return;

    const highlights = container.querySelectorAll('.pdf-search-highlight');
    highlights.forEach((el) => {
      el.classList.remove('pdf-search-highlight', 'current');
    });
  }, [containerRef]);

  return {
    goToPage,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    setScale,
    rotate,
    setRotation,
    getCurrentPage,
    getTotalPages,
    getCurrentScale,
    find,
    findNext,
    findPrevious,
    clearFind,
  };
}

/**
 * Hook to expose the viewer ref API
 */
export function usePDFViewerRef(
  ref: React.ForwardedRef<PDFViewerRef>,
  viewer: UsePDFViewerResult
): void {
  useImperativeHandle(
    ref,
    () => ({
      goToPage: viewer.goToPage,
      nextPage: viewer.nextPage,
      previousPage: viewer.previousPage,
      zoomIn: viewer.zoomIn,
      zoomOut: viewer.zoomOut,
      setScale: viewer.setScale,
      rotate: viewer.rotate,
      setRotation: viewer.setRotation,
      getCurrentPage: viewer.getCurrentPage,
      getTotalPages: viewer.getTotalPages,
      getCurrentScale: viewer.getCurrentScale,
      find: viewer.find,
      findNext: viewer.findNext,
      findPrevious: viewer.findPrevious,
      clearFind: viewer.clearFind,
    }),
    [viewer]
  );
}
