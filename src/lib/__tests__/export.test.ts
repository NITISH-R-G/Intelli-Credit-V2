import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { downloadPDF, downloadJSON } from '../export';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CreditAnalysis } from '../../types';

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

  it('handles non-Error objects thrown during PDF generation and calls setError', async () => {
    const mockElement = { offsetWidth: 1000, offsetHeight: 1000 } as HTMLElement;
    document.getElementById = vi.fn().mockReturnValue(mockElement);

    (toPng as Mock).mockRejectedValue('String error');

    await downloadPDF('test-id', mockSetIsExporting, mockSetError);

    expect(mockSetError).toHaveBeenCalledWith({
      message: 'PDF Generation Failed',
      details: 'An unexpected error occurred while creating the PDF document.',
      action: 'Try refreshing the page or using a different browser.',
      rawLogs: 'String error',
      type: 'FILE_ERROR'
    });

    expect(mockSetIsExporting).toHaveBeenCalledWith(false);
  });

  it('handles Error objects without a stack property thrown during PDF generation', async () => {
    const mockElement = { offsetWidth: 1000, offsetHeight: 1000 } as HTMLElement;
    document.getElementById = vi.fn().mockReturnValue(mockElement);

    const errorWithoutStack = new Error('Error without stack');
    delete errorWithoutStack.stack;
    (toPng as Mock).mockRejectedValue(errorWithoutStack);

    await downloadPDF('test-id', mockSetIsExporting, mockSetError);

    expect(mockSetError).toHaveBeenCalledWith({
      message: 'PDF Generation Failed',
      details: 'Error without stack',
      action: 'Try refreshing the page or using a different browser.',
      rawLogs: 'Error without stack',
      type: 'FILE_ERROR'
    });

    expect(mockSetIsExporting).toHaveBeenCalledWith(false);
  });
});

describe('downloadJSON', () => {
  let mockSetError: Mock;
  let originalCreateElement: typeof document.createElement;
  let originalAppendChild: typeof document.body.appendChild;

  const mockAnalysis: CreditAnalysis = {
    companyInfo: {
      name: 'Test Co Ltd',
      establishedYear: 2010,
      industry: 'Manufacturing',
      registrationNumber: '123',
      employees: '50',
    },
    structuredData: {
      revenue: [],
      debt: [],
      cashflow: [],
      profit: [],
      assets: [],
      liabilities: [],
    },
    suggestedInterestRate: '10%',
    suggestedLoanAmount: '500000',
    decisionConfidence: 80,
    fraudDetection: [],
    fraudFlags: [],
    ratios: {
      debtToIncome: 0.2,
      profitMargin: 0.1,
      currentRatio: 2.0,
      dscr: 1.5,
      icr: 2.0,
    },
    riskScore: 30,
    riskLevel: 'Low',
    riskGrade: 'AAA',
    recommendation: 'Approve',
    unstructuredInsights: {
      boardMeetingNotes: [],
      ratingAgencyReports: '',
      shareholdingPattern: '',
    },
    externalIntelligence: {
      mcaStatus: 'Active',
      legalDisputes: [],
      newsSectorTrends: [],
    },
    primaryInsights: {
      siteVisitObservations: [],
      managementInterviews: [],
    },
    verificationLayer: [],
    fiveCs: {
      character: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      capacity: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      capital: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      collateral: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
      conditions: { score: 80, insights: [], redFlags: [], positiveSignals: [] },
    },
    camMarkdown: '',
    riskAnalysisDetails: {
      financialRisk: '',
      legalRisk: '',
      behavioralRisk: '',
      industryRisk: '',
      managementRisk: '',
    },
    explanation: '',
    missingData: [],
    requiredDocs: [],
  };

  beforeEach(() => {
    mockSetError = vi.fn();
    originalCreateElement = document.createElement.bind(document);
    originalAppendChild = document.body.appendChild.bind(document.body);
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    vi.restoreAllMocks();
  });

  it('returns early if analysis is null', () => {
    downloadJSON(null, mockSetError);
    // Since it returns early, no DOM methods should be called
    expect(mockSetError).not.toHaveBeenCalled();
  });

  it('triggers a JSON download when analysis is provided', () => {
    const mockAnchorNode = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      remove: vi.fn()
    };
    document.createElement = vi.fn().mockReturnValue(mockAnchorNode);
    document.body.appendChild = vi.fn();

    downloadJSON(mockAnalysis, mockSetError);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchorNode.setAttribute).toHaveBeenCalledWith(
      'href',
      expect.stringContaining('data:text/json;charset=utf-8,')
    );
    expect(mockAnchorNode.setAttribute).toHaveBeenCalledWith(
      'download',
      'cam-report-test-co-ltd.json'
    );
    expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchorNode);
    expect(mockAnchorNode.click).toHaveBeenCalled();
    expect(mockAnchorNode.remove).toHaveBeenCalled();
    expect(mockSetError).not.toHaveBeenCalled();
  });

  it('handles errors and calls setError with AppError format', () => {
    // Force an error by making JSON.stringify throw
    const originalStringify = JSON.stringify;
    JSON.stringify = vi.fn().mockImplementation(() => {
      throw new Error('Serialization failed');
    });

    downloadJSON(mockAnalysis, mockSetError);

    expect(mockSetError).toHaveBeenCalledWith({
      message: 'JSON Export Failed',
      details: 'Serialization failed',
      action: 'Check if the analysis data is complete.',
      rawLogs: expect.any(String),
      type: 'FILE_ERROR'
    });

    JSON.stringify = originalStringify;
  });

  it('handles non-Error objects thrown and calls setError with AppError format', () => {
    const originalStringify = JSON.stringify;
    JSON.stringify = vi.fn().mockImplementation(() => {
      throw 'Serialization string error';
    });

    downloadJSON(mockAnalysis, mockSetError);

    expect(mockSetError).toHaveBeenCalledWith({
      message: 'JSON Export Failed',
      details: 'Failed to serialize analysis data.',
      action: 'Check if the analysis data is complete.',
      rawLogs: 'Serialization string error',
      type: 'FILE_ERROR'
    });

    JSON.stringify = originalStringify;
  });

  it('handles Error objects without a stack property thrown and calls setError with AppError format', () => {
    const originalStringify = JSON.stringify;
    JSON.stringify = vi.fn().mockImplementation(() => {
      const errorWithoutStack = new Error('Error without stack');
      delete errorWithoutStack.stack;
      throw errorWithoutStack;
    });

    downloadJSON(mockAnalysis, mockSetError);

    expect(mockSetError).toHaveBeenCalledWith({
      message: 'JSON Export Failed',
      details: 'Error without stack',
      action: 'Check if the analysis data is complete.',
      rawLogs: 'Error without stack',
      type: 'FILE_ERROR'
    });

    JSON.stringify = originalStringify;
  });
});
