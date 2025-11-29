# @the-trybe/react-pdf-viewer

A React wrapper component for PDF.js that provides a simple, configurable API for embedding PDFs in React applications. Designed primarily for read-only document viewing (invoices, receipts, contracts) with optional interactivity controls.

## Features

- Zero-configuration default experience for displaying PDFs
- Support for multiple PDF sources (URL, Base64, Uint8Array, ArrayBuffer)
- Authenticated PDF loading with HTTP headers and credentials
- Configurable zoom, rotation, and navigation controls
- Text selection and annotation support
- Keyboard navigation and accessibility features
- Virtualized rendering for optimal performance
- Full TypeScript support
- Search/find functionality via ref API

## Installation

```bash
npm install @the-trybe/react-pdf-viewer pdfjs-dist
```

or

```bash
yarn add @the-trybe/react-pdf-viewer pdfjs-dist
```

or

```bash
pnpm add @the-trybe/react-pdf-viewer pdfjs-dist
```

## Quick Start

```tsx
import { PDFViewer } from '@the-trybe/react-pdf-viewer';

function App() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer src="/documents/sample.pdf" />
    </div>
  );
}
```

## Usage Examples

### Basic Usage

```tsx
import { PDFViewer } from '@the-trybe/react-pdf-viewer';

// Simple URL
<PDFViewer src="/documents/invoice.pdf" />

// With initial settings
<PDFViewer
  src="/documents/contract.pdf"
  page={2}
  scale="page-fit"
  rotation={0}
/>
```

### Read-Only Viewer (No Zoom)

```tsx
<PDFViewer
  src="/documents/invoice.pdf"
  enableZoom={false}
  enableTextSelection={false}
  scale="page-fit"
  backgroundColor="#ffffff"
  showPageShadow={false}
/>
```

### Authenticated PDF

```tsx
<PDFViewer
  src="/api/documents/confidential.pdf"
  httpHeaders={{
    Authorization: `Bearer ${authToken}`,
  }}
  withCredentials
/>
```

### With Loading and Error States

```tsx
<PDFViewer
  src={documentUrl}
  loading={<Spinner />}
  error={(err) => (
    <ErrorCard
      title="Failed to load document"
      message={err.message}
      onRetry={() => refetch()}
    />
  )}
  onLoadError={(err) => trackError(err)}
/>
```

### Controlled with External Navigation

```tsx
import { useRef, useState } from 'react';
import { PDFViewer, PDFViewerRef, PDFDocumentInfo } from '@the-trybe/react-pdf-viewer';

function DocumentViewer() {
  const viewerRef = useRef<PDFViewerRef>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  return (
    <div>
      <header>
        <button onClick={() => viewerRef.current?.previousPage()}>
          Previous
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={() => viewerRef.current?.nextPage()}>
          Next
        </button>
      </header>

      <PDFViewer
        ref={viewerRef}
        src="/document.pdf"
        onPageChange={setCurrentPage}
        onLoadSuccess={(info) => setTotalPages(info.numPages)}
      />
    </div>
  );
}
```

### Base64 Data

```tsx
<PDFViewer src={`data:application/pdf;base64,${base64Data}`} />
```

### Binary Data from Fetch

```tsx
import { useState, useEffect } from 'react';
import { PDFViewer } from '@the-trybe/react-pdf-viewer';

function DocumentViewer({ documentId }) {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

  useEffect(() => {
    fetch(`/api/documents/${documentId}`)
      .then(res => res.arrayBuffer())
      .then(buffer => setPdfData(new Uint8Array(buffer)));
  }, [documentId]);

  if (!pdfData) return <Spinner />;

  return <PDFViewer src={pdfData} />;
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string \| Uint8Array \| ArrayBuffer` | required | PDF source: URL, Base64 data URI, or binary data |
| `httpHeaders` | `Record<string, string>` | `undefined` | HTTP headers for authenticated requests |
| `withCredentials` | `boolean` | `false` | Include cookies in cross-origin requests |
| `scale` | `number \| 'page-width' \| 'page-fit' \| 'page-actual' \| 'auto'` | `'page-width'` | Initial scale/zoom level |
| `page` | `number` | `1` | Initial page to display |
| `rotation` | `0 \| 90 \| 180 \| 270` | `0` | Page rotation in degrees |
| `enableZoom` | `boolean` | `false` | Allow user zoom (pinch, Ctrl+scroll) |
| `enableTextSelection` | `boolean` | `true` | Allow text selection |
| `enableLinks` | `boolean` | `true` | Enable hyperlinks within PDF |
| `enableAnnotations` | `boolean` | `true` | Render PDF annotations |
| `backgroundColor` | `string` | `'#f5f5f5'` | Container background color |
| `pageGap` | `number` | `10` | Gap between pages in pixels |
| `showPageShadow` | `boolean` | `true` | Show shadow around pages |
| `className` | `string` | `undefined` | Additional CSS class for container |
| `style` | `CSSProperties` | `undefined` | Inline styles for container |
| `workerSrc` | `string` | auto-detected | Path to PDF.js worker file |
| `cMapUrl` | `string` | `undefined` | Path to CMap files for CJK fonts |
| `password` | `string` | `undefined` | Password for protected PDFs |
| `loading` | `ReactNode` | default spinner | Loading placeholder |
| `error` | `ReactNode \| ((error: Error) => ReactNode)` | default message | Error placeholder |
| `onLoadStart` | `() => void` | `undefined` | Called when PDF loading begins |
| `onLoadSuccess` | `(pdf: PDFDocumentInfo) => void` | `undefined` | Called when PDF loads successfully |
| `onLoadError` | `(error: Error) => void` | `undefined` | Called when PDF fails to load |
| `onPageChange` | `(page: number) => void` | `undefined` | Called when visible page changes |
| `onScaleChange` | `(scale: number) => void` | `undefined` | Called when scale changes (if zoom enabled) |
| `onPasswordRequired` | `() => void` | `undefined` | Called when a password is required |

### Ref API (Imperative Handle)

Access these methods via a ref:

```tsx
const viewerRef = useRef<PDFViewerRef>(null);

// Navigation
viewerRef.current?.goToPage(5);
viewerRef.current?.nextPage();
viewerRef.current?.previousPage();

// Zoom (only works if enableZoom={true})
viewerRef.current?.zoomIn();
viewerRef.current?.zoomOut();
viewerRef.current?.setScale(1.5);
viewerRef.current?.setScale('page-fit');

// Rotation
viewerRef.current?.rotate(90);
viewerRef.current?.rotate(-90);
viewerRef.current?.setRotation(180);

// Info
viewerRef.current?.getCurrentPage(); // number
viewerRef.current?.getTotalPages(); // number
viewerRef.current?.getCurrentScale(); // number

// Search
viewerRef.current?.find('search term', { caseSensitive: false, highlightAll: true });
viewerRef.current?.findNext();
viewerRef.current?.findPrevious();
viewerRef.current?.clearFind();
```

### Types

```typescript
interface PDFViewerRef {
  // Navigation
  goToPage(page: number): void;
  nextPage(): void;
  previousPage(): void;

  // Zoom
  zoomIn(): void;
  zoomOut(): void;
  setScale(scale: number | 'page-width' | 'page-fit'): void;

  // Rotation
  rotate(degrees: 90 | -90): void;
  setRotation(degrees: 0 | 90 | 180 | 270): void;

  // Info
  getCurrentPage(): number;
  getTotalPages(): number;
  getCurrentScale(): number;

  // Search
  find(query: string, options?: FindOptions): void;
  findNext(): void;
  findPrevious(): void;
  clearFind(): void;
}

interface FindOptions {
  caseSensitive?: boolean;
  highlightAll?: boolean;
  wholeWord?: boolean;
}

interface PDFDocumentInfo {
  numPages: number;
  fingerprints: string[];
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creationDate?: Date;
    modificationDate?: Date;
    creator?: string;
    producer?: string;
  };
}
```

## Keyboard Navigation

When the viewer is focused, the following keyboard shortcuts are available:

| Key | Action |
|-----|--------|
| `Page Down` / `Arrow Down` | Next page |
| `Page Up` / `Arrow Up` | Previous page |
| `Home` | First page |
| `End` | Last page |

## Accessibility

The component includes the following accessibility features:

- ARIA labels for the document container
- Keyboard navigation support
- Screen reader compatible text layer
- Focus management
- Respects `prefers-reduced-motion` for animations

## Browser Support

- Chrome 92+
- Firefox 90+
- Safari 15+
- Edge 92+

## Performance

The component uses several techniques to ensure optimal performance:

- **Virtualized rendering**: Only visible pages are rendered to the DOM
- **Lazy worker loading**: PDF.js worker is loaded on demand
- **Resource cleanup**: Proper cleanup on unmount and source changes
- **Abort pending loads**: Previous loads are cancelled when source changes

## Advanced Usage

### Custom Worker Path

If you're bundling the PDF.js worker yourself:

```tsx
<PDFViewer
  src="/document.pdf"
  workerSrc="/static/pdf.worker.min.js"
/>
```

### CJK Font Support

For documents with Chinese, Japanese, or Korean text:

```tsx
<PDFViewer
  src="/document.pdf"
  cMapUrl="/cmaps/"
/>
```

### Using Hooks Directly

For advanced use cases, you can use the hooks directly:

```tsx
import { usePDFDocument, usePDFViewer } from '@the-trybe/react-pdf-viewer';

function CustomViewer({ src }) {
  const { state, document, info, error } = usePDFDocument(src);
  // Build your own UI...
}
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.
