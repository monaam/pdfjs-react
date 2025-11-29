import { describe, it, expectTypeOf } from 'vitest';
import type {
  PDFSource,
  ScaleValue,
  RotationValue,
  FindOptions,
  PDFDocumentInfo,
  PDFViewerRef,
  PDFViewerProps,
  PDFViewerState,
} from '../PDFViewer.types';

describe('Type definitions', () => {
  describe('PDFSource', () => {
    it('accepts string', () => {
      const source: PDFSource = '/test.pdf';
      expectTypeOf(source).toMatchTypeOf<PDFSource>();
    });

    it('accepts Uint8Array', () => {
      const source: PDFSource = new Uint8Array([1, 2, 3]);
      expectTypeOf(source).toMatchTypeOf<PDFSource>();
    });

    it('accepts ArrayBuffer', () => {
      const source: PDFSource = new ArrayBuffer(10);
      expectTypeOf(source).toMatchTypeOf<PDFSource>();
    });
  });

  describe('ScaleValue', () => {
    it('accepts number', () => {
      const scale: ScaleValue = 1.5;
      expectTypeOf(scale).toMatchTypeOf<ScaleValue>();
    });

    it('accepts page-width', () => {
      const scale: ScaleValue = 'page-width';
      expectTypeOf(scale).toMatchTypeOf<ScaleValue>();
    });

    it('accepts page-fit', () => {
      const scale: ScaleValue = 'page-fit';
      expectTypeOf(scale).toMatchTypeOf<ScaleValue>();
    });

    it('accepts page-actual', () => {
      const scale: ScaleValue = 'page-actual';
      expectTypeOf(scale).toMatchTypeOf<ScaleValue>();
    });

    it('accepts auto', () => {
      const scale: ScaleValue = 'auto';
      expectTypeOf(scale).toMatchTypeOf<ScaleValue>();
    });
  });

  describe('RotationValue', () => {
    it('accepts 0', () => {
      const rotation: RotationValue = 0;
      expectTypeOf(rotation).toMatchTypeOf<RotationValue>();
    });

    it('accepts 90', () => {
      const rotation: RotationValue = 90;
      expectTypeOf(rotation).toMatchTypeOf<RotationValue>();
    });

    it('accepts 180', () => {
      const rotation: RotationValue = 180;
      expectTypeOf(rotation).toMatchTypeOf<RotationValue>();
    });

    it('accepts 270', () => {
      const rotation: RotationValue = 270;
      expectTypeOf(rotation).toMatchTypeOf<RotationValue>();
    });
  });

  describe('FindOptions', () => {
    it('has correct shape', () => {
      const options: FindOptions = {
        caseSensitive: true,
        highlightAll: true,
        wholeWord: true,
      };
      expectTypeOf(options).toMatchTypeOf<FindOptions>();
    });

    it('allows partial options', () => {
      const options: FindOptions = { caseSensitive: true };
      expectTypeOf(options).toMatchTypeOf<FindOptions>();
    });
  });

  describe('PDFDocumentInfo', () => {
    it('has required properties', () => {
      const info: PDFDocumentInfo = {
        numPages: 10,
        fingerprints: ['abc123'],
        metadata: {},
      };
      expectTypeOf(info).toMatchTypeOf<PDFDocumentInfo>();
    });

    it('allows optional metadata fields', () => {
      const info: PDFDocumentInfo = {
        numPages: 10,
        fingerprints: ['abc123'],
        metadata: {
          title: 'Test',
          author: 'Author',
          creationDate: new Date(),
        },
      };
      expectTypeOf(info).toMatchTypeOf<PDFDocumentInfo>();
    });
  });

  describe('PDFViewerRef', () => {
    it('has navigation methods', () => {
      expectTypeOf<PDFViewerRef>().toHaveProperty('goToPage');
      expectTypeOf<PDFViewerRef>().toHaveProperty('nextPage');
      expectTypeOf<PDFViewerRef>().toHaveProperty('previousPage');
    });

    it('has zoom methods', () => {
      expectTypeOf<PDFViewerRef>().toHaveProperty('zoomIn');
      expectTypeOf<PDFViewerRef>().toHaveProperty('zoomOut');
      expectTypeOf<PDFViewerRef>().toHaveProperty('setScale');
    });

    it('has rotation methods', () => {
      expectTypeOf<PDFViewerRef>().toHaveProperty('rotate');
      expectTypeOf<PDFViewerRef>().toHaveProperty('setRotation');
    });

    it('has info methods', () => {
      expectTypeOf<PDFViewerRef>().toHaveProperty('getCurrentPage');
      expectTypeOf<PDFViewerRef>().toHaveProperty('getTotalPages');
      expectTypeOf<PDFViewerRef>().toHaveProperty('getCurrentScale');
    });

    it('has search methods', () => {
      expectTypeOf<PDFViewerRef>().toHaveProperty('find');
      expectTypeOf<PDFViewerRef>().toHaveProperty('findNext');
      expectTypeOf<PDFViewerRef>().toHaveProperty('findPrevious');
      expectTypeOf<PDFViewerRef>().toHaveProperty('clearFind');
    });
  });

  describe('PDFViewerProps', () => {
    it('requires src prop', () => {
      expectTypeOf<PDFViewerProps>().toHaveProperty('src');
    });

    it('has optional props', () => {
      expectTypeOf<PDFViewerProps>().toHaveProperty('page');
      expectTypeOf<PDFViewerProps>().toHaveProperty('scale');
      expectTypeOf<PDFViewerProps>().toHaveProperty('rotation');
      expectTypeOf<PDFViewerProps>().toHaveProperty('enableZoom');
      expectTypeOf<PDFViewerProps>().toHaveProperty('enableTextSelection');
    });
  });

  describe('PDFViewerState', () => {
    it('accepts valid states', () => {
      const states: PDFViewerState[] = ['idle', 'loading', 'ready', 'error'];
      expectTypeOf(states[0]).toMatchTypeOf<PDFViewerState>();
    });
  });
});
