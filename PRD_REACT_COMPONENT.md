# PRD: React PDF Viewer Component

## Overview

A React wrapper component for PDF.js that provides a simple, configurable API for embedding PDFs in React applications. Designed primarily for read-only document viewing (invoices, receipts, contracts) with optional interactivity controls.

## Problem Statement

Integrating PDF.js into React applications requires significant boilerplate:
- Manual lifecycle management
- Event listener setup and cleanup
- Zoom/interaction control implementation
- Styling configuration
- Error handling

Developers need a drop-in component that handles these concerns while exposing a clean, React-idiomatic API.

## Goals

1. Provide a zero-configuration default experience for displaying PDFs
2. Allow granular control over viewer behavior via props
3. Handle all PDF.js lifecycle management internally
4. Support common PDF loading patterns (URL, Base64, Blob, authenticated requests)
5. Expose events for integration with parent application state
6. Maintain accessibility standards

## Non-Goals

1. PDF editing or annotation creation
2. Form filling functionality
3. Print functionality
4. Thumbnail navigation UI
5. Search/find UI (expose API only)

---

## Component API

### Component Name

```jsx
<PDFViewer />
```

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
| `loading` | `ReactNode` | `null` | Loading placeholder |
| `error` | `ReactNode \| ((error: Error) => ReactNode)` | default message | Error placeholder |
| `onLoadStart` | `() => void` | `undefined` | Called when PDF loading begins |
| `onLoadSuccess` | `(pdf: PDFDocumentInfo) => void` | `undefined` | Called when PDF loads successfully |
| `onLoadError` | `(error: Error) => void` | `undefined` | Called when PDF fails to load |
| `onPageChange` | `(page: number) => void` | `undefined` | Called when visible page changes |
| `onScaleChange` | `(scale: number) => void` | `undefined` | Called when scale changes (if zoom enabled) |

### Ref API (Imperative Handle)

```typescript
interface PDFViewerRef {
  // Navigation
  goToPage(page: number): void;
  nextPage(): void;
  previousPage(): void;

  // Zoom (only works if enableZoom={true})
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

---

## Usage Examples

### Basic Usage

```jsx
import { PDFViewer } from '@company/react-pdf-viewer';

function InvoicePage({ invoiceId }) {
  return (
    <PDFViewer
      src={`/api/invoices/${invoiceId}/pdf`}
      scale="page-width"
    />
  );
}
```

### Read-Only Invoice Viewer (No Zoom)

```jsx
<PDFViewer
  src={invoiceUrl}
  enableZoom={false}
  enableTextSelection={false}
  scale="page-fit"
  backgroundColor="#ffffff"
  showPageShadow={false}
/>
```

### Authenticated PDF

```jsx
<PDFViewer
  src="/api/documents/confidential.pdf"
  httpHeaders={{
    'Authorization': `Bearer ${authToken}`,
  }}
  withCredentials
/>
```

### With Loading and Error States

```jsx
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

```jsx
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
        page={currentPage}
        onPageChange={setCurrentPage}
        onLoadSuccess={(info) => setTotalPages(info.numPages)}
      />
    </div>
  );
}
```

### Base64 Data

```jsx
<PDFViewer
  src={`data:application/pdf;base64,${base64Data}`}
/>
```

### Binary Data from Fetch

```jsx
function DocumentViewer({ documentId }) {
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    fetch(`/api/documents/${documentId}`)
      .then(res => res.arrayBuffer())
      .then(buffer => setPdfData(new Uint8Array(buffer)));
  }, [documentId]);

  if (!pdfData) return <Spinner />;

  return <PDFViewer src={pdfData} />;
}
```

---

## Technical Requirements

### Dependencies

- `pdfjs-dist` (peer dependency)
- React 18+

### Bundle Size

- Target: < 15KB gzipped (excluding pdfjs-dist)
- Tree-shakeable exports

### Performance

- Lazy load PDF.js worker
- Virtualized page rendering (only render visible pages)
- Cleanup resources on unmount
- Abort pending loads on src change

### Browser Support

- Chrome 92+
- Firefox 90+
- Safari 15+
- Edge 92+

### Accessibility

- Keyboard navigation (Page Up/Down, Arrow keys)
- Screen reader support via text layer
- ARIA labels for interactive elements
- Focus management
- Respects `prefers-reduced-motion`

### TypeScript

- Full TypeScript support
- Exported types for all props, refs, and callback parameters

---

## Component States

```
┌─────────────┐
│   IDLE      │ (no src provided)
└──────┬──────┘
       │ src provided
       ▼
┌─────────────┐
│  LOADING    │ → shows `loading` prop content
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌──────┐ ┌─────────┐
│READY │ │  ERROR  │ → shows `error` prop content
└──────┘ └─────────┘
```

---

## File Structure

```
src/
├── PDFViewer.tsx           # Main component
├── PDFViewer.types.ts      # TypeScript interfaces
├── PDFViewer.module.css    # Component styles
├── hooks/
│   ├── usePDFDocument.ts   # PDF loading logic
│   ├── usePDFViewer.ts     # Viewer instance management
│   ├── useZoomPrevention.ts # Zoom blocking logic
│   └── usePageTracking.ts  # Scroll-based page detection
├── utils/
│   ├── loadDocument.ts     # PDF loading utilities
│   ├── parseSource.ts      # Source type detection
│   └── worker.ts           # Worker initialization
├── context/
│   └── PDFViewerContext.tsx # Internal context
└── index.ts                # Public exports
```

---

## Acceptance Criteria

### Core Functionality

- [ ] Renders PDF from URL
- [ ] Renders PDF from Base64 string
- [ ] Renders PDF from Uint8Array/ArrayBuffer
- [ ] Supports authenticated requests via httpHeaders
- [ ] Handles password-protected PDFs (prompts or accepts password prop)
- [ ] Displays loading state while PDF loads
- [ ] Displays error state on load failure
- [ ] Cleans up resources on unmount
- [ ] Aborts pending load when src changes

### Zoom Control

- [ ] Zoom disabled by default
- [ ] When `enableZoom={false}`: blocks pinch, Ctrl+scroll, and API zoom
- [ ] When `enableZoom={true}`: allows all zoom interactions
- [ ] Respects min/max zoom bounds (0.1x - 10x)

### Navigation

- [ ] Scrolls to correct page via `page` prop
- [ ] `onPageChange` fires when visible page changes
- [ ] Imperative `goToPage()`, `nextPage()`, `previousPage()` work correctly

### Text & Annotations

- [ ] Text layer renders and is selectable by default
- [ ] `enableTextSelection={false}` disables selection
- [ ] Annotations render by default
- [ ] `enableAnnotations={false}` hides annotations
- [ ] Links are clickable by default
- [ ] `enableLinks={false}` disables link clicking

### Styling

- [ ] `backgroundColor` applies to container
- [ ] `className` and `style` props apply correctly
- [ ] `pageGap` controls spacing between pages
- [ ] `showPageShadow` toggles page shadow

### Accessibility

- [ ] Keyboard navigation works (arrow keys, Page Up/Down)
- [ ] Text is accessible to screen readers
- [ ] Focus is managed correctly

### Performance

- [ ] Only visible pages are rendered
- [ ] Memory is released when pages scroll out of view
- [ ] No memory leaks on repeated src changes

---

## Open Questions

1. **Password-protected PDFs**: Should we add an `onPasswordRequired` callback and `password` prop, or show a built-in dialog?

2. **Multi-document support**: Should the component handle switching between documents, or should consumers unmount/remount?

3. **Print support**: Is print functionality needed? If so, should it be a ref method or a separate component?

4. **Mobile gestures**: Beyond zoom blocking, should we support any mobile-specific gestures (swipe between pages)?

5. **SSR**: Should the component support server-side rendering, or is client-only acceptable?

---

## Future Considerations

- Thumbnail sidebar component (`<PDFThumbnails />`)
- Outline/bookmarks component (`<PDFOutline />`)
- Search UI component (`<PDFSearchBar />`)
- Split view for comparing documents
- Annotation viewing with comment threads
- Download button component

---

## Success Metrics

- Integration time < 30 minutes for basic use case
- Zero runtime errors in production from component internals
- Bundle size increase < 20KB (excluding pdfjs-dist)
- Lighthouse accessibility score > 90
