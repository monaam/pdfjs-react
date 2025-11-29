import * as pdfjs from 'pdfjs-dist';

let workerInitialized = false;

/**
 * Initialize the PDF.js worker
 * This must be called before loading any PDF documents
 */
export function initializeWorker(workerSrc?: string): void {
  if (workerInitialized) {
    return;
  }

  if (workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  } else {
    // Try to auto-detect the worker path
    // In production, the worker is typically bundled or served from a CDN
    const version = pdfjs.version;

    // Try common CDN paths
    const cdnPaths = [
      `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`,
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`,
      `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`,
    ];

    // Use the first CDN path by default
    pdfjs.GlobalWorkerOptions.workerSrc = cdnPaths[0];
  }

  workerInitialized = true;
}

/**
 * Check if the worker has been initialized
 */
export function isWorkerInitialized(): boolean {
  return workerInitialized;
}

/**
 * Reset the worker initialization state
 * Useful for testing or when changing worker sources
 */
export function resetWorker(): void {
  workerInitialized = false;
}
