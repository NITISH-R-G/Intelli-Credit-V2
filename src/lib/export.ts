import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CreditAnalysis } from '../types';
import { AppError } from '../types';

export const downloadPDF = async (
  elementId: string,
  setIsExporting: (val: boolean) => void,
  setError: (err: AppError) => void,
) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    setIsExporting(true);
    const imgData = await toPng(element, {
      cacheBust: true,
      backgroundColor: '#0a0a0a',
      pixelRatio: 2,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('credit-appraisal-memo.pdf');
  } catch (err) {
    setError({
      message: 'PDF Generation Failed',
      details:
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while creating the PDF document.',
      action: 'Try refreshing the page or using a different browser.',
      rawLogs: err instanceof Error ? err.stack || err.message : String(err),
      type: 'FILE_ERROR',
    });
  } finally {
    setIsExporting(false);
  }
};

export const downloadJSON = (
  analysis: CreditAnalysis | null,
  setError: (err: AppError) => void,
) => {
  try {
    if (!analysis) return;
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute(
      'download',
      `cam-report-${analysis.companyInfo.name.replace(/\s+/g, '-').toLowerCase()}.json`,
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  } catch (err) {
    setError({
      message: 'JSON Export Failed',
      details: err instanceof Error ? err.message : 'Failed to serialize analysis data.',
      action: 'Check if the analysis data is complete.',
      rawLogs: err instanceof Error ? err.stack || err.message : String(err),
      type: 'FILE_ERROR',
    });
  }
};
