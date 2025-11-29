import type { CSSProperties, ReactNode } from 'react';

/**
 * PDF source type - can be a URL, Base64 data URI, or binary data
 */
export type PDFSource = string | Uint8Array | ArrayBuffer;

/**
 * Scale options for the PDF viewer
 */
export type ScaleValue = number | 'page-width' | 'page-fit' | 'page-actual' | 'auto';

/**
 * Rotation options for the PDF viewer (in degrees)
 */
export type RotationValue = 0 | 90 | 180 | 270;

/**
 * Options for the find/search functionality
 */
export interface FindOptions {
  /** Match case when searching */
  caseSensitive?: boolean;
  /** Highlight all matches on the page */
  highlightAll?: boolean;
  /** Only match whole words */
  wholeWord?: boolean;
}

/**
 * PDF document metadata information
 */
export interface PDFDocumentInfo {
  /** Total number of pages in the document */
  numPages: number;
  /** Document fingerprints for identification */
  fingerprints: string[];
  /** Document metadata */
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creationDate?: Date;
    modificationDate?: Date;
    creator?: string;
    producer?: string;
  };
}

/**
 * Imperative handle methods exposed via ref
 */
export interface PDFViewerRef {
  // Navigation
  /** Navigate to a specific page */
  goToPage(page: number): void;
  /** Navigate to the next page */
  nextPage(): void;
  /** Navigate to the previous page */
  previousPage(): void;

  // Zoom (only works if enableZoom={true})
  /** Zoom in by a step */
  zoomIn(): void;
  /** Zoom out by a step */
  zoomOut(): void;
  /** Set a specific scale value */
  setScale(scale: ScaleValue): void;

  // Rotation
  /** Rotate the document by 90 or -90 degrees */
  rotate(degrees: 90 | -90): void;
  /** Set an absolute rotation value */
  setRotation(degrees: RotationValue): void;

  // Info
  /** Get the current page number (1-indexed) */
  getCurrentPage(): number;
  /** Get the total number of pages */
  getTotalPages(): number;
  /** Get the current scale value */
  getCurrentScale(): number;

  // Search
  /** Start a find operation */
  find(query: string, options?: FindOptions): void;
  /** Find the next occurrence */
  findNext(): void;
  /** Find the previous occurrence */
  findPrevious(): void;
  /** Clear the find highlights */
  clearFind(): void;
}

/**
 * Props for the PDFViewer component
 */
export interface PDFViewerProps {
  /** PDF source: URL, Base64 data URI, or binary data */
  src: PDFSource;

  /** HTTP headers for authenticated requests */
  httpHeaders?: Record<string, string>;

  /** Include cookies in cross-origin requests */
  withCredentials?: boolean;

  /** Initial scale/zoom level */
  scale?: ScaleValue;

  /** Initial page to display (1-indexed) */
  page?: number;

  /** Page rotation in degrees */
  rotation?: RotationValue;

  /** Allow user zoom (pinch, Ctrl+scroll) */
  enableZoom?: boolean;

  /** Allow text selection */
  enableTextSelection?: boolean;

  /** Enable hyperlinks within PDF */
  enableLinks?: boolean;

  /** Render PDF annotations */
  enableAnnotations?: boolean;

  /** Container background color */
  backgroundColor?: string;

  /** Gap between pages in pixels */
  pageGap?: number;

  /** Show shadow around pages */
  showPageShadow?: boolean;

  /** Additional CSS class for container */
  className?: string;

  /** Inline styles for container */
  style?: CSSProperties;

  /** Path to PDF.js worker file */
  workerSrc?: string;

  /** Path to CMap files for CJK fonts */
  cMapUrl?: string;

  /** Password for protected PDFs */
  password?: string;

  /** Loading placeholder */
  loading?: ReactNode;

  /** Error placeholder */
  error?: ReactNode | ((error: Error) => ReactNode);

  /** Called when PDF loading begins */
  onLoadStart?: () => void;

  /** Called when PDF loads successfully */
  onLoadSuccess?: (pdf: PDFDocumentInfo) => void;

  /** Called when PDF fails to load */
  onLoadError?: (error: Error) => void;

  /** Called when visible page changes */
  onPageChange?: (page: number) => void;

  /** Called when scale changes (if zoom enabled) */
  onScaleChange?: (scale: number) => void;

  /** Called when a password is required */
  onPasswordRequired?: () => void;
}

/**
 * Component state for the PDF viewer
 */
export type PDFViewerState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Internal context value for the PDF viewer
 */
export interface PDFViewerContextValue {
  /** Current document state */
  state: PDFViewerState;
  /** Current error, if any */
  error: Error | null;
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Current scale value */
  currentScale: number;
  /** Current rotation value */
  currentRotation: RotationValue;
  /** Whether zoom is enabled */
  zoomEnabled: boolean;
  /** Set the current page */
  setCurrentPage: (page: number) => void;
  /** Set the current scale */
  setCurrentScale: (scale: number) => void;
  /** Set the current rotation */
  setCurrentRotation: (rotation: RotationValue) => void;
}
