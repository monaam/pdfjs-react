import type { PDFSource } from '../PDFViewer.types';

/**
 * Type of PDF source
 */
export type SourceType = 'url' | 'base64' | 'binary';

/**
 * Parsed source information
 */
export interface ParsedSource {
  type: SourceType;
  data: string | Uint8Array | ArrayBuffer;
}

/**
 * Check if a string is a Base64 data URI
 */
function isBase64DataUri(str: string): boolean {
  return str.startsWith('data:application/pdf;base64,') ||
    str.startsWith('data:application/octet-stream;base64,');
}

/**
 * Check if a string is a URL
 */
function isUrl(str: string): boolean {
  // Check for common URL patterns
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')) {
    return true;
  }

  // Check for relative URLs
  try {
    new URL(str, window.location.href);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert a Base64 data URI to a Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  // Remove the data URI prefix if present
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

  // Decode Base64
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Parse the PDF source and determine its type
 */
export function parseSource(src: PDFSource): ParsedSource {
  // Binary data (Uint8Array or ArrayBuffer)
  if (src instanceof Uint8Array) {
    return { type: 'binary', data: src };
  }

  if (src instanceof ArrayBuffer) {
    return { type: 'binary', data: new Uint8Array(src) };
  }

  // String sources
  if (typeof src === 'string') {
    // Check for Base64 data URI
    if (isBase64DataUri(src)) {
      return { type: 'base64', data: src };
    }

    // Assume it's a URL
    if (isUrl(src)) {
      return { type: 'url', data: src };
    }

    // Fallback: treat as URL
    return { type: 'url', data: src };
  }

  throw new Error('Invalid PDF source type');
}
