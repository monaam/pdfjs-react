/**
 * Binary Data Examples
 *
 * Load PDFs from various binary sources:
 * - Base64 strings
 * - Uint8Array
 * - ArrayBuffer
 * - Fetch response
 */

import { useState, useEffect } from 'react';
import { PDFViewer } from '@the-trybe/react-pdf-viewer';

/**
 * Load PDF from Base64 string
 */
export function Base64PDF({ base64Data }: { base64Data: string }) {
  // Base64 data can be provided with or without the data URI prefix
  const src = base64Data.startsWith('data:')
    ? base64Data
    : `data:application/pdf;base64,${base64Data}`;

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer src={src} />
    </div>
  );
}

/**
 * Load PDF from Uint8Array
 */
export function Uint8ArrayPDF({ data }: { data: Uint8Array }) {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer src={data} />
    </div>
  );
}

/**
 * Load PDF from ArrayBuffer
 */
export function ArrayBufferPDF({ buffer }: { buffer: ArrayBuffer }) {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer src={buffer} />
    </div>
  );
}

/**
 * Load PDF from fetch response
 */
export function FetchedPDF({ documentUrl }: { documentUrl: string }) {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPDF() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(documentUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (!cancelled) {
          setPdfData(new Uint8Array(arrayBuffer));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPDF();

    return () => {
      cancelled = true;
    };
  }, [documentUrl]);

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'red',
        }}
      >
        Error: {error.message}
      </div>
    );
  }

  if (!pdfData) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer src={pdfData} />
    </div>
  );
}

/**
 * Load PDF from file input
 */
export function FileInputPDF() {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const arrayBuffer = await file.arrayBuffer();
    setPdfData(new Uint8Array(arrayBuffer));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* File Input */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f9fafb',
        }}
      >
        <label
          htmlFor="pdf-input"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Choose PDF File
        </label>
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {fileName && (
          <span style={{ marginLeft: '16px', color: '#666' }}>{fileName}</span>
        )}
      </div>

      {/* Viewer */}
      <div style={{ flex: 1 }}>
        {pdfData ? (
          <PDFViewer src={pdfData} />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
            }}
          >
            Select a PDF file to view
          </div>
        )}
      </div>
    </div>
  );
}
