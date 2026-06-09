import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { DataIngestion } from '../DataIngestion';

describe('DataIngestion', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    apiMode: false,
    setApiMode: vi.fn(),
    bureauApiKey: '',
    setBureauApiKey: vi.fn(),
    geminiApiKey: '',
    setGeminiApiKey: vi.fn(),
    getRootProps: vi.fn().mockReturnValue({}),
    getInputProps: vi.fn().mockReturnValue({}),
    isDragActive: false,
    loading: false,
    files: [],
    handleAnalyze: vi.fn(),
  };

  it('renders correctly in default state', () => {
    render(<DataIngestion {...defaultProps} />);
    expect(screen.getByText('Initialize Data Ingestion')).toBeInTheDocument();
    expect(screen.getByText('API Keys & Integrations')).toBeInTheDocument();
    expect(screen.getByText('Gemini API Key')).toBeInTheDocument();
    expect(screen.getByText('External Bureau API Key')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop files here, or click to select')).toBeInTheDocument();
  });

  it('renders correctly when loading', () => {
    render(<DataIngestion {...defaultProps} loading={true} />);
    expect(screen.getByText('Processing & Verifying Data...')).toBeInTheDocument();
  });

  it('renders uploaded files list', () => {
    const mockFile = new File([''], 'test-document.pdf', { type: 'application/pdf' });
    render(<DataIngestion {...defaultProps} files={[mockFile]} />);
    expect(screen.getByText('Uploaded Documents:')).toBeInTheDocument();
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('Execute Analysis')).toBeInTheDocument();
  });

  it('calls handleAnalyze when execute button is clicked', () => {
    const mockFile = new File([''], 'test-document.pdf', { type: 'application/pdf' });
    const handleAnalyze = vi.fn();
    render(<DataIngestion {...defaultProps} files={[mockFile]} handleAnalyze={handleAnalyze} />);

    const analyzeButton = screen.getByText('Execute Analysis');
    fireEvent.click(analyzeButton);
    expect(handleAnalyze).toHaveBeenCalled();
  });

  it('toggles API mode', () => {
    const setApiMode = vi.fn();
    render(<DataIngestion {...defaultProps} setApiMode={setApiMode} />);

    // Find the toggle button - it's the one next to the span with "Real API"
    // Using closest since the button doesn't have text
    const realApiText = screen.getByText('Real API');
    const button = realApiText.previousElementSibling;

    if (button) {
      fireEvent.click(button);
      expect(setApiMode).toHaveBeenCalledWith(true);
    }
  });

  it('updates API key input', () => {
    const setBureauApiKey = vi.fn();
    render(<DataIngestion {...defaultProps} setBureauApiKey={setBureauApiKey} />);

    const input = screen.getByPlaceholderText('Enter your API key for real-time bureau checks...');
    fireEvent.change(input, { target: { value: 'new-key' } });
    expect(setBureauApiKey).toHaveBeenCalledWith('new-key');

    const geminiInput = screen.getByPlaceholderText('Enter your Gemini API key...');
    fireEvent.change(geminiInput, { target: { value: 'new-gemini-key' } });
    expect(defaultProps.setGeminiApiKey).toHaveBeenCalledWith('new-gemini-key');
  });
});
