import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as pdfjs from 'pdfjs-dist';
import {
  initializeWorker,
  isWorkerInitialized,
  resetWorker,
} from '../utils/worker';

describe('worker utilities', () => {
  beforeEach(() => {
    resetWorker();
    vi.clearAllMocks();
  });

  describe('initializeWorker', () => {
    it('sets worker source from CDN when no custom path provided', () => {
      initializeWorker();

      expect(pdfjs.GlobalWorkerOptions.workerSrc).toContain('unpkg.com');
      expect(pdfjs.GlobalWorkerOptions.workerSrc).toContain('pdf.worker');
    });

    it('uses custom worker path when provided', () => {
      const customPath = '/custom/path/pdf.worker.js';
      initializeWorker(customPath);

      expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe(customPath);
    });

    it('only initializes once', () => {
      initializeWorker('/first/path.js');
      initializeWorker('/second/path.js');

      expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe('/first/path.js');
    });
  });

  describe('isWorkerInitialized', () => {
    it('returns false before initialization', () => {
      expect(isWorkerInitialized()).toBe(false);
    });

    it('returns true after initialization', () => {
      initializeWorker();
      expect(isWorkerInitialized()).toBe(true);
    });
  });

  describe('resetWorker', () => {
    it('resets initialization state', () => {
      initializeWorker();
      expect(isWorkerInitialized()).toBe(true);

      resetWorker();
      expect(isWorkerInitialized()).toBe(false);
    });

    it('allows re-initialization with different path', () => {
      initializeWorker('/first/path.js');
      resetWorker();
      initializeWorker('/second/path.js');

      expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe('/second/path.js');
    });
  });
});
