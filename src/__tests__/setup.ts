import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock PDF.js
vi.mock('pdfjs-dist', () => ({
  version: '4.0.379',
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 5,
      fingerprints: ['abc123'],
      getPage: vi.fn((pageNum: number) =>
        Promise.resolve({
          pageNumber: pageNum,
          getViewport: vi.fn(({ scale, rotation }) => ({
            width: 612 * scale,
            height: 792 * scale,
            scale,
            rotation: rotation || 0,
          })),
          render: vi.fn(() => ({
            promise: Promise.resolve(),
            cancel: vi.fn(),
          })),
          getTextContent: vi.fn(() =>
            Promise.resolve({
              items: [{ str: 'Sample text', transform: [1, 0, 0, 1, 0, 0] }],
            })
          ),
          getAnnotations: vi.fn(() => Promise.resolve([])),
        })
      ),
      getMetadata: vi.fn(() =>
        Promise.resolve({
          info: {
            Title: 'Test Document',
            Author: 'Test Author',
            Subject: 'Test Subject',
            Keywords: 'test, pdf',
            CreationDate: 'D:20231215120000',
            ModDate: 'D:20231216120000',
            Creator: 'Test Creator',
            Producer: 'Test Producer',
          },
          metadata: null,
        })
      ),
      destroy: vi.fn(() => Promise.resolve()),
    }),
    destroy: vi.fn(() => Promise.resolve()),
  })),
  renderTextLayer: vi.fn(() => ({
    promise: Promise.resolve(),
    cancel: vi.fn(),
  })),
  AnnotationLayer: {
    render: vi.fn(),
  },
}));

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  scale: vi.fn(),
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock window.devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  value: 1,
  writable: true,
});
