/**
 * Controlled Viewer Example
 *
 * Use the ref API to control the viewer programmatically
 * with external navigation controls.
 */

import { useRef, useState } from 'react';
import { PDFViewer, PDFViewerRef, PDFDocumentInfo } from '@the-trybe/react-pdf-viewer';

export function ControlledViewer() {
  const viewerRef = useRef<PDFViewerRef>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);

  const handleLoadSuccess = (info: PDFDocumentInfo) => {
    setTotalPages(info.numPages);
    console.log('Document loaded:', info.metadata.title || 'Untitled');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Navigation Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 16px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fff',
        }}
      >
        {/* Page Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => viewerRef.current?.previousPage()}
            disabled={currentPage <= 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => viewerRef.current?.nextPage()}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>

        {/* Page Jump */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="page-input">Go to:</label>
          <input
            id="page-input"
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value, 10);
              if (page >= 1 && page <= totalPages) {
                viewerRef.current?.goToPage(page);
              }
            }}
            style={{ width: '60px' }}
          />
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => viewerRef.current?.zoomOut()}>-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => viewerRef.current?.zoomIn()}>+</button>
          <select
            value=""
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'page-width' || value === 'page-fit') {
                viewerRef.current?.setScale(value);
              } else {
                viewerRef.current?.setScale(parseFloat(value));
              }
            }}
          >
            <option value="" disabled>
              Zoom
            </option>
            <option value="0.5">50%</option>
            <option value="0.75">75%</option>
            <option value="1">100%</option>
            <option value="1.25">125%</option>
            <option value="1.5">150%</option>
            <option value="2">200%</option>
            <option value="page-width">Page Width</option>
            <option value="page-fit">Page Fit</option>
          </select>
        </div>

        {/* Rotation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => viewerRef.current?.rotate(-90)}>
            Rotate Left
          </button>
          <button onClick={() => viewerRef.current?.rotate(90)}>
            Rotate Right
          </button>
        </div>
      </header>

      {/* PDF Viewer */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PDFViewer
          ref={viewerRef}
          src="/documents/sample.pdf"
          enableZoom={true}
          onLoadSuccess={handleLoadSuccess}
          onPageChange={setCurrentPage}
          onScaleChange={setScale}
        />
      </div>
    </div>
  );
}

/**
 * With Search Functionality
 */
export function ViewerWithSearch() {
  const viewerRef = useRef<PDFViewerRef>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery) {
      viewerRef.current?.find(searchQuery, {
        caseSensitive: false,
        highlightAll: true,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Search Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <input
          type="text"
          placeholder="Search in document..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          style={{ width: '200px', padding: '8px' }}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={() => viewerRef.current?.findPrevious()}>
          Previous
        </button>
        <button onClick={() => viewerRef.current?.findNext()}>Next</button>
        <button
          onClick={() => {
            viewerRef.current?.clearFind();
            setSearchQuery('');
          }}
        >
          Clear
        </button>
      </header>

      {/* PDF Viewer */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PDFViewer ref={viewerRef} src="/documents/sample.pdf" />
      </div>
    </div>
  );
}
