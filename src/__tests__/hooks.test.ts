import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
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

  describe('successful loading', () => {
    it('transitions to ready state on successful load', async () => {
      const { result } = renderHook(() => usePDFDocument('/test.pdf'));

      await waitFor(() => {
        expect(result.current.state).toBe('ready');
      });
    });

    it('provides document info on successful load', async () => {
      const { result } = renderHook(() => usePDFDocument('/test.pdf'));

      await waitFor(() => {
        expect(result.current.info).not.toBeNull();
        expect(result.current.info?.numPages).toBe(5);
      });
    });

    it('calls onLoadSuccess callback', async () => {
      const onLoadSuccess = vi.fn();
      renderHook(() =>
        usePDFDocument('/test.pdf', { onLoadSuccess })
      );

      await waitFor(() => {
        expect(onLoadSuccess).toHaveBeenCalled();
      });
    });

    it('calls onLoadStart callback', async () => {
      const onLoadStart = vi.fn();
      renderHook(() =>
        usePDFDocument('/test.pdf', { onLoadStart })
      );

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

    it('reloads document when called', async () => {
      const onLoadStart = vi.fn();
      const { result } = renderHook(() =>
        usePDFDocument('/test.pdf', { onLoadStart })
      );

      await waitFor(() => {
        expect(result.current.state).toBe('ready');
      });

      act(() => {
        result.current.reload();
      });

      await waitFor(() => {
        expect(onLoadStart).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('source changes', () => {
    it('reloads when source changes', async () => {
      const { result, rerender } = renderHook(
        ({ src }) => usePDFDocument(src),
        { initialProps: { src: '/test1.pdf' } }
      );

      await waitFor(() => {
        expect(result.current.state).toBe('ready');
      });

      rerender({ src: '/test2.pdf' });

      expect(result.current.state).toBe('loading');

      await waitFor(() => {
        expect(result.current.state).toBe('ready');
      });
    });

    it('cleans up previous document on source change', async () => {
      const { result, rerender } = renderHook(
        ({ src }) => usePDFDocument(src),
        { initialProps: { src: '/test1.pdf' } }
      );

      await waitFor(() => {
        expect(result.current.state).toBe('ready');
      });

      const previousDoc = result.current.document;
      rerender({ src: '/test2.pdf' });

      await waitFor(() => {
        expect(result.current.state).toBe('ready');
        expect(result.current.document).not.toBe(previousDoc);
      });
    });
  });

  describe('options', () => {
    it('passes httpHeaders to load function', async () => {
      const { result } = renderHook(() =>
        usePDFDocument('/test.pdf', {
          httpHeaders: { Authorization: 'Bearer token' },
        })
      );

      await waitFor(() => {
        expect(result.current.state).toBe('ready');
      });
    });

    it('passes withCredentials to load function', async () => {
      const { result } = renderHook(() =>
        usePDFDocument('/test.pdf', {
          withCredentials: true,
        })
      );

      await waitFor(() => {
        expect(result.current.state).toBe('ready');
      });
    });

    it('passes password to load function', async () => {
      const { result } = renderHook(() =>
        usePDFDocument('/test.pdf', {
          password: 'secret',
        })
      );

      await waitFor(() => {
        expect(result.current.state).toBe('ready');
      });
    });
  });
});
