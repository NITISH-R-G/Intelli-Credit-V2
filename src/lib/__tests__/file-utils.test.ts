import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fileToBase64, fileToText } from '../file-utils';

describe('fileToBase64', () => {
  const originalFileReader = global.FileReader;

  beforeEach(() => {
    // Reset any mocks
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.FileReader = originalFileReader;
  });

  it('should resolve with base64 string on success', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const result = await fileToBase64(file);
    // 'test' in base64 is 'dGVzdA=='
    expect(result).toBe('dGVzdA==');
  });

  it('should reject when result is not a string', async () => {
    class MockFileReader {
      onload: any;
      onerror: any;
      result: any = new ArrayBuffer(0); // Not a string
      readAsDataURL() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    }

    global.FileReader = MockFileReader as any;

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    await expect(fileToBase64(file)).rejects.toThrow('FILE_ERROR: Failed to convert test.txt to base64 format.');
  });

  it('should reject on file reader error', async () => {
    class MockFileReader {
      onload: any;
      onerror: any;
      readAsDataURL() {
        setTimeout(() => {
          if (this.onerror) this.onerror(new Error('Mock error'));
        }, 0);
      }
    }

    global.FileReader = MockFileReader as any;

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    await expect(fileToBase64(file)).rejects.toThrow('FILE_ERROR: Error reading test.txt. The file might be corrupted.');
  });
});

describe('fileToText', () => {
  const originalFileReader = global.FileReader;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.FileReader = originalFileReader;
  });

  it('should resolve with text string on success', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const result = await fileToText(file);
    expect(result).toBe('test content');
  });

  it('should reject when result is not a string', async () => {
    class MockFileReader {
      onload: any;
      onerror: any;
      result: any = new ArrayBuffer(0); // Not a string
      readAsText() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    }

    global.FileReader = MockFileReader as any;

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    await expect(fileToText(file)).rejects.toThrow('FILE_ERROR: Failed to extract text from test.txt.');
  });

  it('should reject on file reader error', async () => {
    class MockFileReader {
      onload: any;
      onerror: any;
      readAsText() {
        setTimeout(() => {
          if (this.onerror) this.onerror(new Error('Mock error'));
        }, 0);
      }
    }

    global.FileReader = MockFileReader as any;

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    await expect(fileToText(file)).rejects.toThrow('FILE_ERROR: Error reading test.txt. The file might be corrupted.');
  });
});
