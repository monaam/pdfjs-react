import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from 'pdfjs-dist';
import type { PDFSource, PDFDocumentInfo } from '../PDFViewer.types';
import { parseSource, base64ToUint8Array } from './parseSource';
import { initializeWorker } from './worker';

/**
 * Options for loading a PDF document
 */
export interface LoadDocumentOptions {
  /** HTTP headers for authenticated requests */
  httpHeaders?: Record<string, string>;
  /** Include cookies in cross-origin requests */
  withCredentials?: boolean;
  /** Path to CMap files for CJK fonts */
  cMapUrl?: string;
  /** Password for protected PDFs */
  password?: string;
  /** Path to PDF.js worker file */
  workerSrc?: string;
}

/**
 * Result of loading a PDF document
 */
export interface LoadDocumentResult {
  document: PDFDocumentProxy;
  info: PDFDocumentInfo;
}

/**
 * Parse metadata date string to Date object
 */
function parseMetadataDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;

  // PDF date format: D:YYYYMMDDHHmmSSOHH'mm'
  // e.g., D:20231215120000+00'00'
  const match = dateStr.match(/D:(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
  if (!match) return undefined;

  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(minute, 10),
    parseInt(second, 10)
  );
}

/**
 * Extract document info from a loaded PDF
 */
async function extractDocumentInfo(document: PDFDocumentProxy): Promise<PDFDocumentInfo> {
  const metadata = await document.getMetadata();

  const info = metadata.info as Record<string, unknown> || {};

  return {
    numPages: document.numPages,
    fingerprints: document.fingerprints.filter((f): f is string => f !== null),
    metadata: {
      title: info.Title as string | undefined,
      author: info.Author as string | undefined,
      subject: info.Subject as string | undefined,
      keywords: info.Keywords as string | undefined,
      creationDate: parseMetadataDate(info.CreationDate as string | undefined),
      modificationDate: parseMetadataDate(info.ModDate as string | undefined),
      creator: info.Creator as string | undefined,
      producer: info.Producer as string | undefined,
    },
  };
}

/**
 * Load a PDF document from the given source
 */
export function loadDocument(
  src: PDFSource,
  options: LoadDocumentOptions = {}
): { task: PDFDocumentLoadingTask; promise: Promise<LoadDocumentResult> } {
  // Initialize the worker
  initializeWorker(options.workerSrc);

  // Parse the source
  const parsed = parseSource(src);

  // Build the document init params
  type DocumentInitParameters = Parameters<typeof pdfjs.getDocument>[0];
  const params: DocumentInitParameters = {};

  switch (parsed.type) {
    case 'url':
      params.url = parsed.data as string;
      break;
    case 'base64':
      params.data = base64ToUint8Array(parsed.data as string);
      break;
    case 'binary':
      params.data = parsed.data as Uint8Array;
      break;
  }

  // Add optional parameters
  if (options.httpHeaders) {
    params.httpHeaders = options.httpHeaders;
  }

  if (options.withCredentials) {
    params.withCredentials = options.withCredentials;
  }

  if (options.cMapUrl) {
    params.cMapUrl = options.cMapUrl;
    params.cMapPacked = true;
  }

  if (options.password) {
    params.password = options.password;
  }

  // Disable range requests for simplicity
  params.disableRange = false;
  params.disableStream = false;

  // Create the loading task
  const task = pdfjs.getDocument(params);

  // Create the promise that resolves with document and info
  const promise = task.promise.then(async (document) => {
    const info = await extractDocumentInfo(document);
    return { document, info };
  });

  return { task, promise };
}

/**
 * Abort a loading task safely
 */
export function abortLoadingTask(task: PDFDocumentLoadingTask | null): void {
  if (task) {
    task.destroy().catch(() => {
      // Ignore errors during abort
    });
  }
}
