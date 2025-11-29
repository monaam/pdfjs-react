import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  PDFViewerContextValue,
  PDFViewerState,
  RotationValue,
} from '../PDFViewer.types';

/**
 * Default context value
 */
const defaultContextValue: PDFViewerContextValue = {
  state: 'idle',
  error: null,
  currentPage: 1,
  totalPages: 0,
  currentScale: 1,
  currentRotation: 0,
  zoomEnabled: false,
  setCurrentPage: () => {},
  setCurrentScale: () => {},
  setCurrentRotation: () => {},
};

/**
 * PDF Viewer Context
 */
export const PDFViewerContext = createContext<PDFViewerContextValue>(defaultContextValue);

/**
 * Hook to access the PDF viewer context
 */
export function usePDFViewerContext(): PDFViewerContextValue {
  const context = useContext(PDFViewerContext);
  if (!context) {
    throw new Error('usePDFViewerContext must be used within a PDFViewerProvider');
  }
  return context;
}

/**
 * Props for the PDF Viewer Provider
 */
export interface PDFViewerProviderProps {
  children: ReactNode;
  initialState?: PDFViewerState;
  initialPage?: number;
  initialScale?: number;
  initialRotation?: RotationValue;
  zoomEnabled?: boolean;
  onPageChange?: (page: number) => void;
  onScaleChange?: (scale: number) => void;
}

/**
 * PDF Viewer Provider Component
 */
export function PDFViewerProvider({
  children,
  initialState = 'idle',
  initialPage = 1,
  initialScale = 1,
  initialRotation = 0,
  zoomEnabled = false,
  onPageChange,
  onScaleChange,
}: PDFViewerProviderProps): JSX.Element {
  const [state, setState] = useState<PDFViewerState>(initialState);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPageState] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [currentScale, setCurrentScaleState] = useState(initialScale);
  const [currentRotation, setCurrentRotationState] = useState<RotationValue>(initialRotation);

  const setCurrentPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages || 1));
      setCurrentPageState(validPage);
      onPageChange?.(validPage);
    },
    [totalPages, onPageChange]
  );

  const setCurrentScale = useCallback(
    (scale: number) => {
      if (!zoomEnabled) return;
      const validScale = Math.max(0.1, Math.min(scale, 10));
      setCurrentScaleState(validScale);
      onScaleChange?.(validScale);
    },
    [zoomEnabled, onScaleChange]
  );

  const setCurrentRotation = useCallback((rotation: RotationValue) => {
    setCurrentRotationState(rotation);
  }, []);

  const contextValue = useMemo<PDFViewerContextValue>(
    () => ({
      state,
      error,
      currentPage,
      totalPages,
      currentScale,
      currentRotation,
      zoomEnabled,
      setCurrentPage,
      setCurrentScale,
      setCurrentRotation,
    }),
    [
      state,
      error,
      currentPage,
      totalPages,
      currentScale,
      currentRotation,
      zoomEnabled,
      setCurrentPage,
      setCurrentScale,
      setCurrentRotation,
    ]
  );

  return (
    <PDFViewerContext.Provider value={contextValue}>
      {children}
    </PDFViewerContext.Provider>
  );
}

/**
 * Internal hook to update context state (for use by hooks)
 */
export interface PDFViewerInternalState {
  setState: (state: PDFViewerState) => void;
  setError: (error: Error | null) => void;
  setTotalPages: (pages: number) => void;
  setCurrentPage: (page: number) => void;
  setCurrentScale: (scale: number) => void;
  setCurrentRotation: (rotation: RotationValue) => void;
}

const InternalStateContext = createContext<PDFViewerInternalState | null>(null);

export function useInternalState(): PDFViewerInternalState {
  const context = useContext(InternalStateContext);
  if (!context) {
    throw new Error('useInternalState must be used within a PDFViewerInternalProvider');
  }
  return context;
}

export interface PDFViewerInternalProviderProps {
  children: ReactNode;
  onPageChange?: (page: number) => void;
  onScaleChange?: (scale: number) => void;
  zoomEnabled?: boolean;
  initialPage?: number;
  initialScale?: number;
  initialRotation?: RotationValue;
}

export function PDFViewerInternalProvider({
  children,
  onPageChange,
  onScaleChange,
  zoomEnabled = false,
  initialPage = 1,
  initialScale = 1,
  initialRotation = 0,
}: PDFViewerInternalProviderProps): JSX.Element {
  const [state, setStateInternal] = useState<PDFViewerState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPageInternal] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [currentScale, setCurrentScaleInternal] = useState(initialScale);
  const [currentRotation, setCurrentRotation] = useState<RotationValue>(initialRotation);

  const setState = useCallback((newState: PDFViewerState) => {
    setStateInternal(newState);
  }, []);

  const setCurrentPage = useCallback(
    (page: number) => {
      setCurrentPageInternal(page);
      onPageChange?.(page);
    },
    [onPageChange]
  );

  const setCurrentScale = useCallback(
    (scale: number) => {
      if (!zoomEnabled) return;
      const validScale = Math.max(0.1, Math.min(scale, 10));
      setCurrentScaleInternal(validScale);
      onScaleChange?.(validScale);
    },
    [zoomEnabled, onScaleChange]
  );

  const publicContextValue = useMemo<PDFViewerContextValue>(
    () => ({
      state,
      error,
      currentPage,
      totalPages,
      currentScale,
      currentRotation,
      zoomEnabled,
      setCurrentPage,
      setCurrentScale,
      setCurrentRotation,
    }),
    [
      state,
      error,
      currentPage,
      totalPages,
      currentScale,
      currentRotation,
      zoomEnabled,
      setCurrentPage,
      setCurrentScale,
      setCurrentRotation,
    ]
  );

  const internalContextValue = useMemo<PDFViewerInternalState>(
    () => ({
      setState,
      setError,
      setTotalPages,
      setCurrentPage,
      setCurrentScale,
      setCurrentRotation,
    }),
    [setState, setCurrentPage, setCurrentScale]
  );

  return (
    <PDFViewerContext.Provider value={publicContextValue}>
      <InternalStateContext.Provider value={internalContextValue}>
        {children}
      </InternalStateContext.Provider>
    </PDFViewerContext.Provider>
  );
}
