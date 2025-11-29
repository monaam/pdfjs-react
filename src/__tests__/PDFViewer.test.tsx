import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { PDFViewer } from '../PDFViewer';
import type { PDFViewerRef } from '../PDFViewer.types';

describe('PDFViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<PDFViewer src="/test.pdf" />);
      expect(screen.getByRole('document')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      render(<PDFViewer src="/test.pdf" />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders custom loading component', () => {
      render(
        <PDFViewer src="/test.pdf" loading={<div>Custom Loading...</div>} />
      );
      expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<PDFViewer src="/test.pdf" className="custom-class" />);
      const container = screen.getByRole('document');
      expect(container).toHaveClass('custom-class');
    });

    it('applies custom style', () => {
      render(
        <PDFViewer src="/test.pdf" style={{ border: '1px solid red' }} />
      );
      const container = screen.getByRole('document');
      expect(container).toHaveStyle({ border: '1px solid red' });
    });

    it('applies custom backgroundColor', () => {
      render(<PDFViewer src="/test.pdf" backgroundColor="#ffffff" />);
      const container = screen.getByRole('document');
      expect(container).toHaveStyle({ backgroundColor: '#ffffff' });
    });
  });

  describe('loading states', () => {
    it('shows loading state when src is provided', async () => {
      render(<PDFViewer src="/test.pdf" />);
      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });

    it('shows idle state when no src is provided', () => {
      render(<PDFViewer src={undefined as unknown as string} />);
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    it('calls onLoadStart when loading begins', async () => {
      const onLoadStart = vi.fn();
      render(<PDFViewer src="/test.pdf" onLoadStart={onLoadStart} />);

      await waitFor(() => {
        expect(onLoadStart).toHaveBeenCalled();
      });
    });
  });

  describe('props', () => {
    it('disables text selection when enableTextSelection is false', async () => {
      render(<PDFViewer src="/test.pdf" enableTextSelection={false} />);
      const container = screen.getByRole('document');

      await waitFor(() => {
        expect(container.className).toContain('noTextSelection');
      });
    });

    it('accepts page prop', () => {
      render(<PDFViewer src="/test.pdf" page={2} />);
      expect(screen.getByRole('document')).toBeInTheDocument();
    });

    it('accepts rotation prop', () => {
      render(<PDFViewer src="/test.pdf" rotation={90} />);
      expect(screen.getByRole('document')).toBeInTheDocument();
    });

    it('accepts scale prop as number', () => {
      render(<PDFViewer src="/test.pdf" scale={1.5} />);
      expect(screen.getByRole('document')).toBeInTheDocument();
    });

    it('accepts scale prop as string', () => {
      render(<PDFViewer src="/test.pdf" scale="page-width" />);
      expect(screen.getByRole('document')).toBeInTheDocument();
    });
  });

  describe('ref API', () => {
    it('exposes goToPage method', async () => {
      const ref = createRef<PDFViewerRef>();
      render(<PDFViewer ref={ref} src="/test.pdf" />);

      await waitFor(() => {
        expect(ref.current).not.toBeNull();
      });

      expect(typeof ref.current?.goToPage).toBe('function');
    });

    it('exposes nextPage method', async () => {
      const ref = createRef<PDFViewerRef>();
      render(<PDFViewer ref={ref} src="/test.pdf" />);

      await waitFor(() => {
        expect(ref.current).not.toBeNull();
      });

      expect(typeof ref.current?.nextPage).toBe('function');
    });

    it('exposes previousPage method', async () => {
      const ref = createRef<PDFViewerRef>();
      render(<PDFViewer ref={ref} src="/test.pdf" />);

      await waitFor(() => {
        expect(ref.current).not.toBeNull();
      });

      expect(typeof ref.current?.previousPage).toBe('function');
    });

    it('exposes zoom methods', async () => {
      const ref = createRef<PDFViewerRef>();
      render(<PDFViewer ref={ref} src="/test.pdf" enableZoom={true} />);

      await waitFor(() => {
        expect(ref.current).not.toBeNull();
      });

      expect(typeof ref.current?.zoomIn).toBe('function');
      expect(typeof ref.current?.zoomOut).toBe('function');
      expect(typeof ref.current?.setScale).toBe('function');
    });

    it('exposes rotation methods', async () => {
      const ref = createRef<PDFViewerRef>();
      render(<PDFViewer ref={ref} src="/test.pdf" />);

      await waitFor(() => {
        expect(ref.current).not.toBeNull();
      });

      expect(typeof ref.current?.rotate).toBe('function');
      expect(typeof ref.current?.setRotation).toBe('function');
    });

    it('exposes info methods', async () => {
      const ref = createRef<PDFViewerRef>();
      render(<PDFViewer ref={ref} src="/test.pdf" />);

      await waitFor(() => {
        expect(ref.current).not.toBeNull();
      });

      expect(typeof ref.current?.getCurrentPage).toBe('function');
      expect(typeof ref.current?.getTotalPages).toBe('function');
      expect(typeof ref.current?.getCurrentScale).toBe('function');
    });

    it('exposes search methods', async () => {
      const ref = createRef<PDFViewerRef>();
      render(<PDFViewer ref={ref} src="/test.pdf" />);

      await waitFor(() => {
        expect(ref.current).not.toBeNull();
      });

      expect(typeof ref.current?.find).toBe('function');
      expect(typeof ref.current?.findNext).toBe('function');
      expect(typeof ref.current?.findPrevious).toBe('function');
      expect(typeof ref.current?.clearFind).toBe('function');
    });
  });

  describe('accessibility', () => {
    it('has document role', () => {
      render(<PDFViewer src="/test.pdf" />);
      expect(screen.getByRole('document')).toBeInTheDocument();
    });

    it('has aria-busy when loading', () => {
      render(<PDFViewer src="/test.pdf" />);
      expect(screen.getByRole('document')).toHaveAttribute('aria-busy', 'true');
    });

    it('has aria-label describing the document', () => {
      render(<PDFViewer src="/test.pdf" />);
      const container = screen.getByRole('document');
      expect(container).toHaveAttribute('aria-label');
    });
  });

  describe('error handling', () => {
    it('renders custom error component as ReactNode', () => {
      render(
        <PDFViewer
          src="/test.pdf"
          error={<div>Custom Error Message</div>}
        />
      );
      // Component starts in loading state
      expect(screen.getByRole('document')).toBeInTheDocument();
    });

    it('accepts error prop as function', () => {
      const errorFn = vi.fn((err: Error) => <div>{err.message}</div>);
      render(<PDFViewer src="/test.pdf" error={errorFn} />);
      expect(screen.getByRole('document')).toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('accepts onPageChange callback', () => {
      const onPageChange = vi.fn();
      render(<PDFViewer src="/test.pdf" onPageChange={onPageChange} />);
      expect(screen.getByRole('document')).toBeInTheDocument();
    });

    it('accepts onScaleChange callback', () => {
      const onScaleChange = vi.fn();
      render(
        <PDFViewer
          src="/test.pdf"
          enableZoom={true}
          onScaleChange={onScaleChange}
        />
      );
      expect(screen.getByRole('document')).toBeInTheDocument();
    });

    it('accepts onLoadError callback', () => {
      const onLoadError = vi.fn();
      render(<PDFViewer src="/test.pdf" onLoadError={onLoadError} />);
      expect(screen.getByRole('document')).toBeInTheDocument();
    });
  });
});
