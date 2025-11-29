import { useEffect, useCallback, type RefObject } from 'react';

/**
 * Options for the useZoomPrevention hook
 */
export interface UseZoomPreventionOptions {
  /** Reference to the container element */
  containerRef: RefObject<HTMLElement>;
  /** Whether zoom is enabled */
  enabled: boolean;
  /** Callback when zoom is attempted (and blocked) */
  onZoomAttempt?: (type: 'pinch' | 'wheel' | 'keyboard') => void;
}

/**
 * Hook to prevent zoom interactions when zoom is disabled
 */
export function useZoomPrevention(options: UseZoomPreventionOptions): void {
  const { containerRef, enabled, onZoomAttempt } = options;

  // Handle wheel events (Ctrl+scroll)
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (enabled) return; // Zoom is allowed

      // Check if Ctrl/Cmd is pressed (zoom gesture)
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        onZoomAttempt?.('wheel');
      }
    },
    [enabled, onZoomAttempt]
  );

  // Handle touch events (pinch zoom)
  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (enabled) return; // Zoom is allowed

      // Check for multi-touch (pinch gesture)
      if (event.touches.length > 1) {
        event.preventDefault();
        event.stopPropagation();
        onZoomAttempt?.('pinch');
      }
    },
    [enabled, onZoomAttempt]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (enabled) return; // Zoom is allowed

      // Check for multi-touch (pinch gesture)
      if (event.touches.length > 1) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [enabled]
  );

  // Handle keyboard events (Ctrl/Cmd + +/-)
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (enabled) return; // Zoom is allowed

      // Check for zoom keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        if (event.key === '+' || event.key === '=' || event.key === '-' || event.key === '0') {
          event.preventDefault();
          event.stopPropagation();
          onZoomAttempt?.('keyboard');
        }
      }
    },
    [enabled, onZoomAttempt]
  );

  // Handle gesture events (Safari pinch)
  const handleGestureStart = useCallback(
    (event: Event) => {
      if (enabled) return; // Zoom is allowed

      event.preventDefault();
      event.stopPropagation();
      onZoomAttempt?.('pinch');
    },
    [enabled, onZoomAttempt]
  );

  const handleGestureChange = useCallback(
    (event: Event) => {
      if (enabled) return; // Zoom is allowed

      event.preventDefault();
      event.stopPropagation();
    },
    [enabled]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add passive: false to allow preventDefault
    const wheelOptions: AddEventListenerOptions = { passive: false };
    const touchOptions: AddEventListenerOptions = { passive: false };

    container.addEventListener('wheel', handleWheel, wheelOptions);
    container.addEventListener('touchstart', handleTouchStart, touchOptions);
    container.addEventListener('touchmove', handleTouchMove, touchOptions);
    container.addEventListener('keydown', handleKeyDown);

    // Safari gesture events
    container.addEventListener('gesturestart', handleGestureStart);
    container.addEventListener('gesturechange', handleGestureChange);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('gesturestart', handleGestureStart);
      container.removeEventListener('gesturechange', handleGestureChange);
    };
  }, [
    containerRef,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleKeyDown,
    handleGestureStart,
    handleGestureChange,
  ]);
}
