import { useState, useEffect, useRef, useCallback } from 'react';
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from 'pdfjs-dist';
import type { PDFSource, PDFDocumentInfo, PDFViewerState } from '../PDFViewer.types';
import { loadDocument, abortLoadingTask, type LoadDocumentOptions } from '../utils/loadDocument';

/**
 * Result of the usePDFDocument hook
 */
export interface UsePDFDocumentResult {
  /** Current loading state */
  state: PDFViewerState;
  /** The loaded PDF document, if available */
  document: PDFDocumentProxy | null;
  /** Document info, if available */
  info: PDFDocumentInfo | null;
  /** Error, if any */
  error: Error | null;
  /** Reload the document */
  reload: () => void;
}

/**
 * Options for the usePDFDocument hook
 */
export interface UsePDFDocumentOptions extends LoadDocumentOptions {
  /** Callback when loading starts */
  onLoadStart?: () => void;
  /** Callback when loading succeeds */
  onLoadSuccess?: (info: PDFDocumentInfo) => void;
  /** Callback when loading fails */
  onLoadError?: (error: Error) => void;
  /** Callback when password is required */
  onPasswordRequired?: () => void;
}

/**
 * Hook to load and manage a PDF document
 */
export function usePDFDocument(
  src: PDFSource | undefined,
  options: UsePDFDocumentOptions = {}
): UsePDFDocumentResult {
  const [state, setState] = useState<PDFViewerState>('idle');
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [info, setInfo] = useState<PDFDocumentInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Keep track of the loading task for cleanup
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);

  // Track version to handle rapid source changes
  const versionRef = useRef(0);

  const {
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    onPasswordRequired,
    ...loadOptions
  } = options;

  const load = useCallback(() => {
    if (!src) {
      setState('idle');
      setDocument(null);
      setInfo(null);
      setError(null);
      return;
    }

    // Increment version
    const version = ++versionRef.current;

    // Cleanup previous task
    abortLoadingTask(loadingTaskRef.current);
    loadingTaskRef.current = null;

    // Cleanup previous document
    if (documentRef.current) {
      documentRef.current.destroy().catch(() => {});
      documentRef.current = null;
    }

    // Start loading
    setState('loading');
    setError(null);
    onLoadStart?.();

    try {
      const { task, promise } = loadDocument(src, loadOptions);
      loadingTaskRef.current = task;

      promise
        .then(({ document: doc, info: docInfo }) => {
          // Check if this load is still relevant
          if (version !== versionRef.current) {
            doc.destroy().catch(() => {});
            return;
          }

          documentRef.current = doc;
          setDocument(doc);
          setInfo(docInfo);
          setState('ready');
          onLoadSuccess?.(docInfo);
        })
        .catch((err: Error) => {
          // Check if this load is still relevant
          if (version !== versionRef.current) {
            return;
          }

          // Check for password error
          if (err.name === 'PasswordException') {
            onPasswordRequired?.();
          }

          setError(err);
          setState('error');
          onLoadError?.(err);
        });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setState('error');
      onLoadError?.(error);
    }
  }, [src, loadOptions, onLoadStart, onLoadSuccess, onLoadError, onPasswordRequired]);

  // Load document when source changes
  useEffect(() => {
    load();

    // Cleanup on unmount or source change
    return () => {
      abortLoadingTask(loadingTaskRef.current);
      loadingTaskRef.current = null;

      if (documentRef.current) {
        documentRef.current.destroy().catch(() => {});
        documentRef.current = null;
      }
    };
  }, [load]);

  const reload = useCallback(() => {
    load();
  }, [load]);

  return {
    state,
    document,
    info,
    error,
    reload,
  };
}
