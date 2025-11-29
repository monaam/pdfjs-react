import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type CSSProperties,
} from 'react';
import * as pdfjs from 'pdfjs-dist';
import type { PDFPageProxy, RenderTask } from 'pdfjs-dist';
import type {
  PDFViewerProps,
  PDFViewerRef,
  ScaleValue,
  RotationValue,
} from './PDFViewer.types';
import { usePDFDocument } from './hooks/usePDFDocument';
import { usePDFViewer, usePDFViewerRef } from './hooks/usePDFViewer';
import { useZoomPrevention } from './hooks/useZoomPrevention';
import { usePageTracking } from './hooks/usePageTracking';
import styles from './PDFViewer.module.css';

/**
 * Default error component
 */
function DefaultError({ message }: { message: string }) {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>!</div>
      <div className={styles.errorMessage}>{message}</div>
    </div>
  );
}

/**
 * Default loading component
 */
function DefaultLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner} />
      <div className={styles.loadingText}>Loading PDF...</div>
    </div>
  );
}

/**
 * Individual page component
 */
interface PDFPageProps {
  page: PDFPageProxy;
  pageNumber: number;
  scale: number;
  rotation: RotationValue;
  enableTextSelection: boolean;
  enableAnnotations: boolean;
  enableLinks: boolean;
  showPageShadow: boolean;
  onRenderComplete?: () => void;
}

function PDFPage({
  page,
  pageNumber,
  scale,
  rotation,
  enableTextSelection,
  enableAnnotations,
  enableLinks,
  showPageShadow,
  onRenderComplete,
}: PDFPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const annotationLayerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const textLayer = textLayerRef.current;
    const annotationLayer = annotationLayerRef.current;

    if (!canvas) return;

    // Cancel previous render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    const viewport = page.getViewport({ scale, rotation });
    const pixelRatio = window.devicePixelRatio || 1;

    // Set canvas dimensions
    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    setDimensions({ width: viewport.width, height: viewport.height });

    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(pixelRatio, pixelRatio);

    // Render the page
    const renderContext = {
      canvasContext: context,
      viewport,
    };

    const renderTask = page.render(renderContext);
    renderTaskRef.current = renderTask;

    renderTask.promise
      .then(() => {
        onRenderComplete?.();

        // Render text layer
        if (textLayer && enableTextSelection) {
          textLayer.innerHTML = '';
          textLayer.style.width = `${viewport.width}px`;
          textLayer.style.height = `${viewport.height}px`;

          page.getTextContent().then((textContent) => {
            pdfjs.renderTextLayer({
              textContentSource: textContent,
              container: textLayer,
              viewport,
              textDivs: [],
            });
          });
        }

        // Render annotation layer
        if (annotationLayer && enableAnnotations) {
          annotationLayer.innerHTML = '';
          annotationLayer.style.width = `${viewport.width}px`;
          annotationLayer.style.height = `${viewport.height}px`;

          page.getAnnotations().then((annotations) => {
            if (annotations.length === 0) return;

            pdfjs.AnnotationLayer.render({
              viewport: viewport.clone({ dontFlip: true }),
              div: annotationLayer,
              annotations,
              page,
              linkService: enableLinks
                ? {
                    getDestinationHash: (dest: unknown) => `#${dest}`,
                    getAnchorUrl: (hash: string) => hash,
                    navigateTo: () => {},
                    goToDestination: () => {},
                    goToPage: () => {},
                    addLinkAttributes: (link: HTMLAnchorElement, url: string, newWindow: boolean) => {
                      link.href = url;
                      if (newWindow) {
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                      }
                    },
                  }
                : undefined,
              downloadManager: undefined,
              renderForms: false,
            });
          });
        }
      })
      .catch((error: Error) => {
        if (error.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', error);
        }
      });

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [page, scale, rotation, enableTextSelection, enableAnnotations, enableLinks, onRenderComplete]);

  const pageClasses = [styles.page];
  if (showPageShadow) {
    pageClasses.push(styles.pageShadow);
  }

  return (
    <div
      className={pageClasses.join(' ')}
      data-page-number={pageNumber}
      style={{
        width: dimensions.width || 'auto',
        height: dimensions.height || 'auto',
      }}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      {enableTextSelection && (
        <div
          ref={textLayerRef}
          className={`${styles.textLayer} textLayer`}
        />
      )}
      {enableAnnotations && (
        <div
          ref={annotationLayerRef}
          className={`${styles.annotationLayer} annotationLayer`}
        />
      )}
    </div>
  );
}

/**
 * Virtualized pages container
 */
interface PDFPagesProps {
  document: pdfjs.PDFDocumentProxy;
  scale: number;
  rotation: RotationValue;
  enableTextSelection: boolean;
  enableAnnotations: boolean;
  enableLinks: boolean;
  showPageShadow: boolean;
  pageGap: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

function PDFPages({
  document,
  scale,
  rotation,
  enableTextSelection,
  enableAnnotations,
  enableLinks,
  showPageShadow,
  pageGap,
  containerRef,
}: PDFPagesProps) {
  const [pages, setPages] = useState<PDFPageProxy[]>([]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 5 });

  // Load all pages (for virtual rendering, we load page proxies)
  useEffect(() => {
    const loadPages = async () => {
      const loadedPages: PDFPageProxy[] = [];
      for (let i = 1; i <= document.numPages; i++) {
        const page = await document.getPage(i);
        loadedPages.push(page);
      }
      setPages(loadedPages);
    };

    loadPages();

    return () => {
      // Pages are cleaned up when document is destroyed
    };
  }, [document]);

  // Track visible pages for virtualization
  useEffect(() => {
    const container = containerRef.current;
    if (!container || pages.length === 0) return;

    const updateVisibleRange = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const pageElements = container.querySelectorAll('[data-page-number]');

      let startIndex = 0;
      let endIndex = pages.length - 1;

      pageElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const elementTop = rect.top - containerRect.top;
        const elementBottom = rect.bottom - containerRect.top;

        // Buffer of 2 pages before and after
        if (elementBottom < -containerHeight) {
          startIndex = Math.max(0, index - 2);
        }
        if (elementTop > containerHeight * 2) {
          endIndex = Math.min(pages.length - 1, index + 2);
        }
      });

      // Ensure we always render at least 5 pages around current position
      const visibleStart = Math.max(0, startIndex - 2);
      const visibleEnd = Math.min(pages.length - 1, endIndex + 2);

      setVisibleRange({ start: visibleStart, end: visibleEnd });
    };

    // Initial calculation
    updateVisibleRange();

    // Listen for scroll
    container.addEventListener('scroll', updateVisibleRange, { passive: true });

    return () => {
      container.removeEventListener('scroll', updateVisibleRange);
    };
  }, [containerRef, pages]);

  return (
    <div className={styles.pagesContainer} style={{ gap: pageGap }}>
      {pages.map((page, index) => {
        const pageNumber = index + 1;
        const isVisible = index >= visibleRange.start && index <= visibleRange.end;

        if (!isVisible) {
          // Render placeholder for non-visible pages
          const viewport = page.getViewport({ scale, rotation });
          return (
            <div
              key={pageNumber}
              className={styles.pagePlaceholder}
              data-page-number={pageNumber}
              style={{
                width: viewport.width,
                height: viewport.height,
              }}
            />
          );
        }

        return (
          <PDFPage
            key={pageNumber}
            page={page}
            pageNumber={pageNumber}
            scale={scale}
            rotation={rotation}
            enableTextSelection={enableTextSelection}
            enableAnnotations={enableAnnotations}
            enableLinks={enableLinks}
            showPageShadow={showPageShadow}
          />
        );
      })}
    </div>
  );
}

/**
 * Calculate initial scale based on scale prop
 */
function calculateInitialScale(
  scaleValue: ScaleValue,
  containerWidth: number,
  containerHeight: number,
  pageWidth: number,
  pageHeight: number
): number {
  if (typeof scaleValue === 'number') {
    return scaleValue;
  }

  const availableWidth = containerWidth - 40; // padding
  const availableHeight = containerHeight - 40;

  switch (scaleValue) {
    case 'page-width':
      return availableWidth / pageWidth;
    case 'page-fit':
      return Math.min(availableWidth / pageWidth, availableHeight / pageHeight);
    case 'page-actual':
      return 1;
    case 'auto':
    default:
      return Math.min(availableWidth / pageWidth, 1.5);
  }
}

/**
 * Main PDFViewer component
 */
export const PDFViewer = forwardRef<PDFViewerRef, PDFViewerProps>(function PDFViewer(
  {
    src,
    httpHeaders,
    withCredentials = false,
    scale: scaleProp = 'page-width',
    page: pageProp = 1,
    rotation: rotationProp = 0,
    enableZoom = false,
    enableTextSelection = true,
    enableLinks = true,
    enableAnnotations = true,
    backgroundColor = '#f5f5f5',
    pageGap = 10,
    showPageShadow = true,
    className,
    style,
    workerSrc,
    cMapUrl,
    password,
    loading,
    error: errorProp,
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    onPageChange,
    onScaleChange,
    onPasswordRequired,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [currentPage, setCurrentPage] = useState(pageProp);
  const [currentScale, setCurrentScale] = useState(1);
  const [currentRotation, setCurrentRotation] = useState<RotationValue>(rotationProp);
  const [initialScaleCalculated, setInitialScaleCalculated] = useState(false);

  // Load the PDF document
  const { state, document, info, error } = usePDFDocument(src, {
    httpHeaders,
    withCredentials,
    cMapUrl,
    password,
    workerSrc,
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    onPasswordRequired,
  });

  const totalPages = info?.numPages ?? 0;

  // Calculate initial scale when document loads
  useEffect(() => {
    if (!document || !containerRef.current || initialScaleCalculated) return;

    document.getPage(1).then((page) => {
      const viewport = page.getViewport({ scale: 1, rotation: rotationProp });
      const container = containerRef.current;
      if (!container) return;

      const calculatedScale = calculateInitialScale(
        scaleProp,
        container.clientWidth,
        container.clientHeight,
        viewport.width,
        viewport.height
      );

      setCurrentScale(calculatedScale);
      setInitialScaleCalculated(true);
    });
  }, [document, scaleProp, rotationProp, initialScaleCalculated]);

  // Reset initial scale calculation when src changes
  useEffect(() => {
    setInitialScaleCalculated(false);
  }, [src]);

  // Update page from prop
  useEffect(() => {
    if (pageProp !== currentPage && pageProp >= 1 && pageProp <= totalPages) {
      setCurrentPage(pageProp);
    }
  }, [pageProp, currentPage, totalPages]);

  // Update rotation from prop
  useEffect(() => {
    if (rotationProp !== currentRotation) {
      setCurrentRotation(rotationProp);
    }
  }, [rotationProp, currentRotation]);

  // Page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      onPageChange?.(page);
    },
    [onPageChange]
  );

  // Scale change handler
  const handleScaleChange = useCallback(
    (scale: number) => {
      if (!enableZoom) return;
      setCurrentScale(scale);
      onScaleChange?.(scale);
    },
    [enableZoom, onScaleChange]
  );

  // Rotation change handler
  const handleRotationChange = useCallback((rotation: RotationValue) => {
    setCurrentRotation(rotation);
  }, []);

  // Setup viewer methods
  const viewer = usePDFViewer({
    containerRef,
    document,
    currentPage,
    totalPages,
    currentScale,
    currentRotation,
    zoomEnabled: enableZoom,
    setCurrentPage: handlePageChange,
    setCurrentScale: handleScaleChange,
    setCurrentRotation: handleRotationChange,
    onPageChange,
    onScaleChange,
  });

  // Expose ref API
  usePDFViewerRef(ref, viewer);

  // Zoom prevention
  useZoomPrevention({
    containerRef,
    enabled: enableZoom,
  });

  // Page tracking
  usePageTracking({
    containerRef,
    totalPages,
    onPageChange: handlePageChange,
  });

  // Keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if focus is within the container
      if (!container.contains(document.activeElement) && document.activeElement !== container) {
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
        case 'PageDown':
          event.preventDefault();
          viewer.nextPage();
          break;
        case 'ArrowUp':
        case 'PageUp':
          event.preventDefault();
          viewer.previousPage();
          break;
        case 'Home':
          event.preventDefault();
          viewer.goToPage(1);
          break;
        case 'End':
          event.preventDefault();
          viewer.goToPage(totalPages);
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewer, totalPages]);

  // Container styles
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      backgroundColor,
      ...style,
    }),
    [backgroundColor, style]
  );

  const containerClasses = [styles.container];
  if (className) {
    containerClasses.push(className);
  }
  if (!enableTextSelection) {
    containerClasses.push(styles.noTextSelection);
  }

  // Render based on state
  if (state === 'loading') {
    return (
      <div
        ref={containerRef}
        className={containerClasses.join(' ')}
        style={containerStyle}
        role="document"
        aria-busy="true"
        aria-label="Loading PDF document"
      >
        {loading ?? <DefaultLoading />}
      </div>
    );
  }

  if (state === 'error' && error) {
    const errorContent =
      typeof errorProp === 'function'
        ? errorProp(error)
        : errorProp ?? <DefaultError message={error.message} />;

    return (
      <div
        ref={containerRef}
        className={containerClasses.join(' ')}
        style={containerStyle}
        role="alert"
        aria-label="Error loading PDF document"
      >
        {errorContent}
      </div>
    );
  }

  if (state === 'idle' || !document) {
    return (
      <div
        ref={containerRef}
        className={containerClasses.join(' ')}
        style={containerStyle}
        role="document"
        aria-label="PDF viewer"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={containerClasses.join(' ')}
      style={containerStyle}
      role="document"
      aria-label={`PDF document with ${totalPages} pages`}
      tabIndex={0}
    >
      <PDFPages
        document={document}
        scale={currentScale}
        rotation={currentRotation}
        enableTextSelection={enableTextSelection}
        enableAnnotations={enableAnnotations}
        enableLinks={enableLinks}
        showPageShadow={showPageShadow}
        pageGap={pageGap}
        containerRef={containerRef}
      />
    </div>
  );
});

PDFViewer.displayName = 'PDFViewer';
