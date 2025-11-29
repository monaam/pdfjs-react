import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePDFDocument } from '../hooks/usePDFDocument';

describe('usePDFDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns idle state when no source provided', () => {
      const { result } = renderHook(() => usePDFDocument(undefined));

      expect(result.current.state).toBe('idle');
      expect(result.current.document).toBeNull();
      expect(result.current.info).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('returns loading state when source is provided', () => {
      const { result } = renderHook(() => usePDFDocument('/test.pdf'));

      expect(result.current.state).toBe('loading');
    });
  });

  describe('callbacks', () => {
    it('calls onLoadStart callback when loading begins', async () => {
      const onLoadStart = vi.fn();
      renderHook(() => usePDFDocument('/test.pdf', { onLoadStart }));

      // onLoadStart is called synchronously when loading starts
      await waitFor(() => {
        expect(onLoadStart).toHaveBeenCalled();
      });
    });
  });

  describe('reload functionality', () => {
    it('exposes reload function', () => {
      const { result } = renderHook(() => usePDFDocument('/test.pdf'));

      expect(typeof result.current.reload).toBe('function');
    });

    it('sets loading state when reload is called', async () => {
      const { result } = renderHook(() => usePDFDocument('/test.pdf'));

      // Initially loading
      expect(result.current.state).toBe('loading');

      // Reload should keep it in loading state
      result.current.reload();
      expect(result.current.state).toBe('loading');
    });
  });

  describe('source changes', () => {
    it('sets loading state when source changes', async () => {
      const { result, rerender } = renderHook(
        ({ src }) => usePDFDocument(src),
        { initialProps: { src: '/test1.pdf' } }
      );

      expect(result.current.state).toBe('loading');

      rerender({ src: '/test2.pdf' });

      expect(result.current.state).toBe('loading');
    });

    it('resets to idle when source is cleared', () => {
      const { result, rerender } = renderHook(
        ({ src }) => usePDFDocument(src),
        { initialProps: { src: '/test.pdf' as string | undefined } }
      );

      expect(result.current.state).toBe('loading');

      rerender({ src: undefined });

      expect(result.current.state).toBe('idle');
      expect(result.current.document).toBeNull();
      expect(result.current.info).toBeNull();
    });
  });

  describe('options handling', () => {
    it('accepts httpHeaders option', () => {
      const { result } = renderHook(() =>
        usePDFDocument('/test.pdf', {
          httpHeaders: { Authorization: 'Bearer token' },
        })
      );

      expect(result.current.state).toBe('loading');
    });

    it('accepts withCredentials option', () => {
      const { result } = renderHook(() =>
        usePDFDocument('/test.pdf', {
          withCredentials: true,
        })
      );

      expect(result.current.state).toBe('loading');
    });

    it('accepts password option', () => {
      const { result } = renderHook(() =>
        usePDFDocument('/test.pdf', {
          password: 'secret',
        })
      );

      expect(result.current.state).toBe('loading');
    });

    it('accepts cMapUrl option', () => {
      const { result } = renderHook(() =>
        usePDFDocument('/test.pdf', {
          cMapUrl: '/cmaps/',
        })
      );

      expect(result.current.state).toBe('loading');
    });

    it('accepts workerSrc option', () => {
      const { result } = renderHook(() =>
        usePDFDocument('/test.pdf', {
          workerSrc: '/pdf.worker.js',
        })
      );

      expect(result.current.state).toBe('loading');
    });
  });

  describe('error handling', () => {
    it('provides error in result', () => {
      const { result } = renderHook(() => usePDFDocument('/test.pdf'));

      // Initially no error
      expect(result.current.error).toBeNull();
    });

    it('accepts onLoadError callback', () => {
      const onLoadError = vi.fn();
      const { result } = renderHook(() =>
        usePDFDocument('/test.pdf', { onLoadError })
      );

      expect(result.current.state).toBe('loading');
    });

    it('accepts onPasswordRequired callback', () => {
      const onPasswordRequired = vi.fn();
      const { result } = renderHook(() =>
        usePDFDocument('/test.pdf', { onPasswordRequired })
      );

      expect(result.current.state).toBe('loading');
    });
  });
});
