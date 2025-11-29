/**
 * Custom Loading and Error States Example
 *
 * Customize the loading spinner and error messages
 * to match your application's design.
 */

import { useState } from 'react';
import { PDFViewer } from '@the-trybe/react-pdf-viewer';

/**
 * Custom Spinner Component
 */
function CustomSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e0e0e0',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <p style={{ color: '#666', fontSize: '14px' }}>
        Loading your document...
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Custom Error Component
 */
function CustomError({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '16px',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
        }}
      >
        ⚠️
      </div>
      <h3 style={{ margin: 0, color: '#991b1b' }}>Failed to load document</h3>
      <p
        style={{
          margin: 0,
          color: '#666',
          textAlign: 'center',
          maxWidth: '300px',
        }}
      >
        {error.message}
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Try Again
      </button>
    </div>
  );
}

export function CustomLoadingErrorStates() {
  const [key, setKey] = useState(0);

  const handleRetry = () => {
    // Force re-mount by changing key
    setKey((k) => k + 1);
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer
        key={key}
        src="/documents/sample.pdf"
        loading={<CustomSpinner />}
        error={(err) => <CustomError error={err} onRetry={handleRetry} />}
        onLoadStart={() => console.log('Loading started')}
        onLoadSuccess={(info) =>
          console.log(`Loaded ${info.numPages} pages`)
        }
        onLoadError={(err) => console.error('Load failed:', err)}
      />
    </div>
  );
}

/**
 * With Loading Progress Indicator
 */
export function WithLoadingCallbacks() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
      {/* Status Bar */}
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: isLoading ? '#fef3c7' : error ? '#fef2f2' : '#f0fdf4',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        {isLoading && 'Loading document...'}
        {error && `Error: ${error.message}`}
        {!isLoading && !error && `Viewing: ${documentTitle || 'Document'}`}
      </div>

      {/* Viewer */}
      <div style={{ flex: 1 }}>
        <PDFViewer
          src="/documents/sample.pdf"
          onLoadStart={() => {
            setIsLoading(true);
            setError(null);
          }}
          onLoadSuccess={(info) => {
            setIsLoading(false);
            setDocumentTitle(info.metadata.title || 'Untitled');
          }}
          onLoadError={(err) => {
            setIsLoading(false);
            setError(err);
          }}
        />
      </div>
    </div>
  );
}
