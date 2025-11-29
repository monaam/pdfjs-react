import { describe, it, expect } from 'vitest';
import { parseSource, base64ToUint8Array } from '../utils/parseSource';

describe('parseSource', () => {
  describe('URL detection', () => {
    it('detects absolute HTTP URL', () => {
      const result = parseSource('http://example.com/test.pdf');
      expect(result.type).toBe('url');
      expect(result.data).toBe('http://example.com/test.pdf');
    });

    it('detects absolute HTTPS URL', () => {
      const result = parseSource('https://example.com/test.pdf');
      expect(result.type).toBe('url');
      expect(result.data).toBe('https://example.com/test.pdf');
    });

    it('detects absolute path', () => {
      const result = parseSource('/documents/test.pdf');
      expect(result.type).toBe('url');
      expect(result.data).toBe('/documents/test.pdf');
    });

    it('treats relative path as URL', () => {
      const result = parseSource('documents/test.pdf');
      expect(result.type).toBe('url');
      expect(result.data).toBe('documents/test.pdf');
    });
  });

  describe('Base64 detection', () => {
    it('detects Base64 data URI with application/pdf MIME type', () => {
      const base64 = 'data:application/pdf;base64,JVBERi0xLjQKJ';
      const result = parseSource(base64);
      expect(result.type).toBe('base64');
      expect(result.data).toBe(base64);
    });

    it('detects Base64 data URI with octet-stream MIME type', () => {
      const base64 = 'data:application/octet-stream;base64,JVBERi0xLjQKJ';
      const result = parseSource(base64);
      expect(result.type).toBe('base64');
      expect(result.data).toBe(base64);
    });
  });

  describe('binary data detection', () => {
    it('detects Uint8Array', () => {
      const data = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
      const result = parseSource(data);
      expect(result.type).toBe('binary');
      expect(result.data).toBe(data);
    });

    it('converts ArrayBuffer to Uint8Array', () => {
      const buffer = new ArrayBuffer(4);
      const view = new Uint8Array(buffer);
      view.set([0x25, 0x50, 0x44, 0x46]);

      const result = parseSource(buffer);
      expect(result.type).toBe('binary');
      expect(result.data).toBeInstanceOf(Uint8Array);
    });
  });

  describe('invalid input', () => {
    it('throws error for invalid type', () => {
      expect(() => parseSource(123 as unknown as string)).toThrow(
        'Invalid PDF source type'
      );
    });

    it('throws error for null', () => {
      expect(() => parseSource(null as unknown as string)).toThrow();
    });

    it('throws error for undefined', () => {
      expect(() => parseSource(undefined as unknown as string)).toThrow();
    });
  });
});

describe('base64ToUint8Array', () => {
  it('converts Base64 string to Uint8Array', () => {
    // "Hello" in Base64
    const base64 = 'SGVsbG8=';
    const result = base64ToUint8Array(base64);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([72, 101, 108, 108, 111]);
  });

  it('handles data URI prefix', () => {
    const base64 = 'data:application/pdf;base64,SGVsbG8=';
    const result = base64ToUint8Array(base64);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([72, 101, 108, 108, 111]);
  });

  it('handles empty string', () => {
    const result = base64ToUint8Array('');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
  });
});
