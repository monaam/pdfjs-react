/**
 * Examples Index
 *
 * Export all example components for easy importing.
 */

// Basic usage examples
export { BasicUsage, WithInitialSettings, ReadOnlyViewer } from './BasicUsage';

// Authentication examples
export {
  BearerTokenAuth,
  ApiKeyAuth,
  CookieAuth,
  PasswordProtectedPDF,
} from './AuthenticatedPDF';

// Controlled viewer examples
export { ControlledViewer, ViewerWithSearch } from './ControlledViewer';

// Custom loading/error examples
export {
  CustomLoadingErrorStates,
  WithLoadingCallbacks,
} from './CustomLoadingError';

// Binary data examples
export {
  Base64PDF,
  Uint8ArrayPDF,
  ArrayBufferPDF,
  FetchedPDF,
  FileInputPDF,
} from './BinaryData';

// Full featured example
export { FullFeaturedViewer } from './FullFeatured';
