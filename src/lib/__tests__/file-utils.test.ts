import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fileToBase64, fileToText, hashFile } from '../file-utils';

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

describe('hashFile', () => {
  beforeEach(() => {
    // Mock the File API
    class MockFile {
      name: string;
      type: string;
      arrayBuffer: ReturnType<typeof vi.fn>;

      constructor(bits: any[], name: string, options?: any) {
        this.name = name;
        this.type = options?.type || '';
        this.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));
      }
    }
    vi.stubGlobal('File', MockFile);

    // Mock crypto.subtle
    const mockCrypto = {
      subtle: {
        digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)), // SHA-256 generates a 32-byte array
      },
    };
    vi.stubGlobal('crypto', mockCrypto);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should generate a correct SHA-256 hash for a given file', async () => {
    const fileContent = 'Hello, world!';
    const file = new File([fileContent], 'hello.txt', { type: 'text/plain' });
    const hash = await hashFile(file);

    // Since we mocked arrayBuffer and digest, it should return a hash consisting of 32 zeros
    const expectedHash = '00'.repeat(32);
    expect(hash).toBe(expectedHash);

    expect(crypto.subtle.digest).toHaveBeenCalledWith('SHA-256', expect.any(ArrayBuffer));
    expect((file as any).arrayBuffer).toHaveBeenCalled();
  });
});
