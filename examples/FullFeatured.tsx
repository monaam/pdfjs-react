/**
 * Full Featured Example
 *
 * A complete document viewer with all features enabled,
 * including navigation, zoom, search, and document info.
 */

import { useRef, useState, useCallback } from 'react';
import {
  PDFViewer,
  PDFViewerRef,
  PDFDocumentInfo,
} from '@the-trybe/react-pdf-viewer';

interface DocumentViewerProps {
  src: string;
  title?: string;
}

export function FullFeaturedViewer({ src, title }: DocumentViewerProps) {
  const viewerRef = useRef<PDFViewerRef>(null);

  // State
  const [documentInfo, setDocumentInfo] = useState<PDFDocumentInfo | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Sidebar state
  const [showInfo, setShowInfo] = useState(false);

  // Handlers
  const handleLoadSuccess = useCallback((info: PDFDocumentInfo) => {
    setDocumentInfo(info);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleLoadError = useCallback((err: Error) => {
    setError(err);
    setIsLoading(false);
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      viewerRef.current?.find(searchQuery, {
        caseSensitive: false,
        highlightAll: true,
      });
    }
  }, [searchQuery]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          viewerRef.current?.findPrevious();
        } else {
          handleSearch();
        }
      } else if (e.key === 'Escape') {
        viewerRef.current?.clearFind();
        setSearchQuery('');
        setIsSearching(false);
      }
    },
    [handleSearch]
  );

  const totalPages = documentInfo?.numPages ?? 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#1f2937',
      }}
    >
      {/* Toolbar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          backgroundColor: '#374151',
          color: 'white',
          gap: '16px',
        }}
      >
        {/* Left: Title and Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
            {title || documentInfo?.metadata.title || 'PDF Viewer'}
          </h1>
          <button
            onClick={() => setShowInfo(!showInfo)}
            style={{
              padding: '4px 8px',
              backgroundColor: showInfo ? '#4b5563' : 'transparent',
              color: 'white',
              border: '1px solid #6b7280',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Info
          </button>
        </div>

        {/* Center: Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <button
            onClick={() => viewerRef.current?.previousPage()}
            disabled={currentPage <= 1}
            style={buttonStyle}
          >
            ◀
          </button>
          <input
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
            style={{
              width: '50px',
              padding: '4px',
              textAlign: 'center',
              borderRadius: '4px',
              border: '1px solid #6b7280',
            }}
          />
          <span style={{ color: '#9ca3af' }}>/ {totalPages}</span>
          <button
            onClick={() => viewerRef.current?.nextPage()}
            disabled={currentPage >= totalPages}
            style={buttonStyle}
          >
            ▶
          </button>
        </div>

        {/* Right: Zoom and Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => viewerRef.current?.zoomOut()}
              style={buttonStyle}
            >
              −
            </button>
            <span style={{ minWidth: '50px', textAlign: 'center' }}>
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => viewerRef.current?.zoomIn()}
              style={buttonStyle}
            >
              +
            </button>
          </div>

          {/* Rotation */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => viewerRef.current?.rotate(-90)}
              style={buttonStyle}
              title="Rotate left"
            >
              ↺
            </button>
            <button
              onClick={() => viewerRef.current?.rotate(90)}
              style={buttonStyle}
              title="Rotate right"
            >
              ↻
            </button>
          </div>

          {/* Search Toggle */}
          <button
            onClick={() => setIsSearching(!isSearching)}
            style={{
              ...buttonStyle,
              backgroundColor: isSearching ? '#4b5563' : 'transparent',
            }}
            title="Search"
          >
            🔍
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {isSearching && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#4b5563',
          }}
        >
          <input
            type="text"
            placeholder="Search in document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              flex: 1,
              maxWidth: '300px',
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
            }}
          />
          <button onClick={handleSearch} style={buttonStyle}>
            Find
          </button>
          <button
            onClick={() => viewerRef.current?.findPrevious()}
            style={buttonStyle}
          >
            ◀
          </button>
          <button
            onClick={() => viewerRef.current?.findNext()}
            style={buttonStyle}
          >
            ▶
          </button>
          <button
            onClick={() => {
              viewerRef.current?.clearFind();
              setSearchQuery('');
            }}
            style={buttonStyle}
          >
            Clear
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Info Sidebar */}
        {showInfo && documentInfo && (
          <aside
            style={{
              width: '280px',
              backgroundColor: '#374151',
              color: 'white',
              padding: '16px',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: '14px' }}>
              Document Information
            </h2>
            <dl style={{ margin: 0, fontSize: '12px' }}>
              {documentInfo.metadata.title && (
                <>
                  <dt style={{ color: '#9ca3af', marginTop: '8px' }}>Title</dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    {documentInfo.metadata.title}
                  </dd>
                </>
              )}
              {documentInfo.metadata.author && (
                <>
                  <dt style={{ color: '#9ca3af', marginTop: '8px' }}>Author</dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    {documentInfo.metadata.author}
                  </dd>
                </>
              )}
              {documentInfo.metadata.subject && (
                <>
                  <dt style={{ color: '#9ca3af', marginTop: '8px' }}>
                    Subject
                  </dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    {documentInfo.metadata.subject}
                  </dd>
                </>
              )}
              <dt style={{ color: '#9ca3af', marginTop: '8px' }}>Pages</dt>
              <dd style={{ margin: '4px 0 0' }}>{documentInfo.numPages}</dd>
              {documentInfo.metadata.creationDate && (
                <>
                  <dt style={{ color: '#9ca3af', marginTop: '8px' }}>
                    Created
                  </dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    {documentInfo.metadata.creationDate.toLocaleDateString()}
                  </dd>
                </>
              )}
              {documentInfo.metadata.producer && (
                <>
                  <dt style={{ color: '#9ca3af', marginTop: '8px' }}>
                    Producer
                  </dt>
                  <dd style={{ margin: '4px 0 0' }}>
                    {documentInfo.metadata.producer}
                  </dd>
                </>
              )}
            </dl>
          </aside>
        )}

        {/* PDF Viewer */}
        <main style={{ flex: 1, overflow: 'hidden' }}>
          <PDFViewer
            ref={viewerRef}
            src={src}
            enableZoom={true}
            enableTextSelection={true}
            enableLinks={true}
            enableAnnotations={true}
            backgroundColor="#1f2937"
            pageGap={16}
            showPageShadow={true}
            onLoadStart={() => setIsLoading(true)}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            onPageChange={setCurrentPage}
            onScaleChange={setScale}
            loading={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'white',
                }}
              >
                Loading document...
              </div>
            }
            error={(err) => (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'white',
                  gap: '16px',
                }}
              >
                <p>Failed to load document</p>
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                  {err.message}
                </p>
              </div>
            )}
          />
        </main>
      </div>

      {/* Status Bar */}
      <footer
        style={{
          padding: '4px 16px',
          backgroundColor: '#374151',
          color: '#9ca3af',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          {isLoading
            ? 'Loading...'
            : error
              ? 'Error loading document'
              : `Page ${currentPage} of ${totalPages}`}
        </span>
        <span>Zoom: {Math.round(scale * 100)}%</span>
      </footer>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  backgroundColor: 'transparent',
  color: 'white',
  border: '1px solid #6b7280',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
};

// Default export for easy use
export default function App() {
  return <FullFeaturedViewer src="/documents/sample.pdf" title="My Document" />;
}
