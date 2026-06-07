import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fileToBase64, fileToText, hashFile } from '../file-utils';

describe('hashFile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should resolve with the correct hash hex string on success', async () => {
    const file = new File(['test data'], 'test.txt', { type: 'text/plain' });

    // Create a dummy digest buffer to return from our mock
    // 32 bytes for SHA-256
    const dummyHashArray = new Uint8Array(32);
    dummyHashArray.fill(10); // 0a in hex
    const dummyHashBuffer = dummyHashArray.buffer;

    const mockDigest = vi.fn().mockResolvedValue(dummyHashBuffer);
    vi.stubGlobal('crypto', {
      subtle: {
        digest: mockDigest,
      },
    });

    const result = await hashFile(file);

    expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(ArrayBuffer));
    // Each byte is 10, which is '0a' in hex. 32 bytes = 64 characters of '0a'
    const expectedHash = '0a'.repeat(32);
    expect(result).toBe(expectedHash);
  });

  it('should reject if crypto.subtle.digest throws an error', async () => {
    const file = new File(['test data'], 'test.txt', { type: 'text/plain' });

    const mockDigest = vi.fn().mockRejectedValue(new Error('Mock crypto error'));
    vi.stubGlobal('crypto', {
      subtle: {
        digest: mockDigest,
      },
    });

    await expect(hashFile(file)).rejects.toThrow('Mock crypto error');
  });
});

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

  it('should handle empty file correctly', async () => {
    const file = new File([], 'empty.txt', { type: 'text/plain' });
    const result = await fileToBase64(file);
    expect(result).toBe('');
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
