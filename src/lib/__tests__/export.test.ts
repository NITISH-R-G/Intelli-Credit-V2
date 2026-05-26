import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { downloadPDF } from '../export';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

// Mock the modules
vi.mock('html-to-image', () => ({
  toPng: vi.fn(),
}));

vi.mock('jspdf', () => {
  const mockJsPDF = vi.fn();
  mockJsPDF.prototype.internal = {
    pageSize: {
      getWidth: vi.fn().mockReturnValue(210),
      getHeight: vi.fn().mockReturnValue(297),
    },
  };
  mockJsPDF.prototype.addImage = vi.fn();
  mockJsPDF.prototype.addPage = vi.fn();
  mockJsPDF.prototype.save = vi.fn();
  return { jsPDF: mockJsPDF };
});

describe('downloadPDF', () => {
  let mockSetIsExporting: Mock;
  let mockSetError: Mock;
  let originalGetElementById: typeof document.getElementById;

  beforeEach(() => {
    mockSetIsExporting = vi.fn();
    mockSetError = vi.fn();
    originalGetElementById = document.getElementById;
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.getElementById = originalGetElementById;
  });

  it('returns early if the element is not found', async () => {
    document.getElementById = vi.fn().mockReturnValue(null);
    await downloadPDF('test-id', mockSetIsExporting, mockSetError);

    expect(document.getElementById).toHaveBeenCalledWith('test-id');
    expect(mockSetIsExporting).not.toHaveBeenCalled();
    expect(toPng).not.toHaveBeenCalled();
  });

  it('generates a single-page PDF successfully', async () => {
    const mockElement = {
      offsetWidth: 1000,
      offsetHeight: 1000,
    } as HTMLElement;
    document.getElementById = vi.fn().mockReturnValue(mockElement);
    (toPng as Mock).mockResolvedValue('mock-img-data');

    await downloadPDF('test-id', mockSetIsExporting, mockSetError);

    expect(mockSetIsExporting).toHaveBeenCalledWith(true);
    expect(toPng).toHaveBeenCalledWith(mockElement, expect.any(Object));

    const pdfInstance = new jsPDF();
    expect(pdfInstance.addImage).toHaveBeenCalledWith('mock-img-data', 'PNG', 0, 0, 210, 210);
    expect(pdfInstance.addPage).not.toHaveBeenCalled();
    expect(pdfInstance.save).toHaveBeenCalledWith('credit-appraisal-memo.pdf');

    expect(mockSetIsExporting).toHaveBeenCalledWith(false);
    expect(mockSetError).not.toHaveBeenCalled();
  });

  it('generates a multi-page PDF successfully', async () => {
    const mockElement = {
      offsetWidth: 1000,
      offsetHeight: 3000,
    } as HTMLElement;
    document.getElementById = vi.fn().mockReturnValue(mockElement);
    (toPng as Mock).mockResolvedValue('mock-img-data');

    await downloadPDF('test-id', mockSetIsExporting, mockSetError);

    const pdfInstance = new jsPDF();
    expect(pdfInstance.addImage).toHaveBeenCalledTimes(3);
    expect(pdfInstance.addPage).toHaveBeenCalledTimes(2);
    expect(pdfInstance.save).toHaveBeenCalledWith('credit-appraisal-memo.pdf');
  });

  it('handles errors during PDF generation and calls setError', async () => {
    const mockElement = { offsetWidth: 1000, offsetHeight: 1000 } as HTMLElement;
    document.getElementById = vi.fn().mockReturnValue(mockElement);

    const mockError = new Error('toPng failed');
    (toPng as Mock).mockRejectedValue(mockError);

    await downloadPDF('test-id', mockSetIsExporting, mockSetError);

    expect(mockSetError).toHaveBeenCalledWith({
      message: 'PDF Generation Failed',
      details: 'toPng failed',
      action: 'Try refreshing the page or using a different browser.',
      rawLogs: expect.any(String),
      type: 'FILE_ERROR'
    });

    expect(mockSetIsExporting).toHaveBeenCalledWith(false);
  });
});
