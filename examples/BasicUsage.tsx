/**
 * Basic Usage Example
 *
 * The simplest way to display a PDF document.
 * Just provide the src prop with a URL to your PDF.
 */

import { PDFViewer } from '@the-trybe/react-pdf-viewer';

export function BasicUsage() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer src="/documents/sample.pdf" />
    </div>
  );
}

/**
 * With initial page and scale
 */
export function WithInitialSettings() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer
        src="/documents/sample.pdf"
        page={2}
        scale="page-fit"
        rotation={0}
      />
    </div>
  );
}

/**
 * Read-only invoice viewer (no zoom, no text selection)
 */
export function ReadOnlyViewer() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer
        src="/documents/invoice.pdf"
        enableZoom={false}
        enableTextSelection={false}
        scale="page-fit"
        backgroundColor="#ffffff"
        showPageShadow={false}
      />
    </div>
  );
}
