/**
 * Authenticated PDF Example
 *
 * Load PDFs that require authentication using HTTP headers
 * or cookies with credentials.
 */

import { PDFViewer } from '@the-trybe/react-pdf-viewer';

interface AuthenticatedPDFProps {
  documentId: string;
  authToken: string;
}

/**
 * Using Bearer token authentication
 */
export function BearerTokenAuth({ documentId, authToken }: AuthenticatedPDFProps) {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer
        src={`/api/documents/${documentId}/pdf`}
        httpHeaders={{
          Authorization: `Bearer ${authToken}`,
        }}
        onLoadError={(error) => {
          if (error.message.includes('401')) {
            console.error('Authentication failed. Token may be expired.');
          }
        }}
      />
    </div>
  );
}

/**
 * Using API key authentication
 */
export function ApiKeyAuth({ documentId }: { documentId: string; apiKey: string }) {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer
        src={`/api/documents/${documentId}`}
        httpHeaders={{
          'X-API-Key': 'your-api-key-here',
          Accept: 'application/pdf',
        }}
      />
    </div>
  );
}

/**
 * Using cookies with credentials
 */
export function CookieAuth({ documentUrl }: { documentUrl: string }) {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer
        src={documentUrl}
        withCredentials={true}
        onLoadError={(error) => {
          console.error('Failed to load PDF:', error.message);
        }}
      />
    </div>
  );
}

/**
 * Password-protected PDF
 */
export function PasswordProtectedPDF({
  src,
  password,
}: {
  src: string;
  password: string;
}) {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PDFViewer
        src={src}
        password={password}
        onPasswordRequired={() => {
          console.log('Password is required for this document');
        }}
        onLoadError={(error) => {
          if (error.message.includes('password')) {
            console.error('Incorrect password');
          }
        }}
      />
    </div>
  );
}
