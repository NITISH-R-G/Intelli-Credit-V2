import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fileToText, fileToBase64, hashFile } from './file-utils';

describe('file-utils', () => {
  describe('hashFile', () => {
    it('should correctly hash a file', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const fakeDigest = new Uint8Array([10, 20, 255]); // 0a14ff
      const digestMock = vi.fn().mockResolvedValue(fakeDigest.buffer);

      const originalCrypto = global.crypto;
      Object.defineProperty(global, 'crypto', {
        value: {
          subtle: {
            digest: digestMock,
          },
        },
        configurable: true
      });

      const hash = await hashFile(file);
      expect(hash).toBe('0a14ff');
      expect(digestMock).toHaveBeenCalledWith('SHA-256', expect.any(ArrayBuffer));

      Object.defineProperty(global, 'crypto', {
        value: originalCrypto,
        configurable: true
      });
    });
  });

  describe('FileReader utils', () => {
    let OriginalFileReader: typeof FileReader;

    beforeEach(() => {
      OriginalFileReader = global.FileReader;
    });

    afterEach(() => {
      global.FileReader = OriginalFileReader;
    });

    describe('fileToBase64', () => {
      it('should resolve with base64 string on success', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });

        const mockFileReader = {
          readAsDataURL: vi.fn(),
          onload: null as any,
          onerror: null as any,
          result: 'data:text/plain;base64,dGVzdA==',
        };

        class MockFileReader {
          readAsDataURL = mockFileReader.readAsDataURL;
          onload = mockFileReader.onload;
          onerror = mockFileReader.onerror;
          get result() { return mockFileReader.result; }
          set onload(val) { mockFileReader.onload = val; }
          set onerror(val) { mockFileReader.onerror = val; }
        }
        global.FileReader = MockFileReader as any;

        const promise = fileToBase64(file);

        // Trigger onload
        mockFileReader.onload();

        const result = await promise;
        expect(result).toBe('dGVzdA==');
        expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
      });

      it('should reject when result is not a string', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });

        const mockFileReader = {
          readAsDataURL: vi.fn(),
          onload: null as any,
          onerror: null as any,
          result: new ArrayBuffer(0), // not a string
        };

        class MockFileReader {
          readAsDataURL = mockFileReader.readAsDataURL;
          onload = mockFileReader.onload;
          onerror = mockFileReader.onerror;
          get result() { return mockFileReader.result; }
          set onload(val) { mockFileReader.onload = val; }
          set onerror(val) { mockFileReader.onerror = val; }
        }
        global.FileReader = MockFileReader as any;

        const promise = fileToBase64(file);

        // Trigger onload
        mockFileReader.onload();

        await expect(promise).rejects.toThrow('FILE_ERROR: Failed to convert test.txt to base64 format.');
      });

      it('should reject on onerror', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });

        const mockFileReader = {
          readAsDataURL: vi.fn(),
          onload: null as any,
          onerror: null as any,
          result: null,
        };

        class MockFileReader {
          readAsDataURL = mockFileReader.readAsDataURL;
          onload = mockFileReader.onload;
          onerror = mockFileReader.onerror;
          get result() { return mockFileReader.result; }
          set onload(val) { mockFileReader.onload = val; }
          set onerror(val) { mockFileReader.onerror = val; }
        }
        global.FileReader = MockFileReader as any;

        const promise = fileToBase64(file);

        // Trigger onerror
        mockFileReader.onerror();

        await expect(promise).rejects.toThrow('FILE_ERROR: Error reading test.txt. The file might be corrupted.');
      });
    });

    describe('fileToText', () => {
      it('should resolve with text on success', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });

        const mockFileReader = {
          readAsText: vi.fn(),
          onload: null as any,
          onerror: null as any,
          result: 'test string content',
        };

        class MockFileReader {
          readAsText = mockFileReader.readAsText;
          onload = mockFileReader.onload;
          onerror = mockFileReader.onerror;
          get result() { return mockFileReader.result; }
          set onload(val) { mockFileReader.onload = val; }
          set onerror(val) { mockFileReader.onerror = val; }
        }
        global.FileReader = MockFileReader as any;

        const promise = fileToText(file);

        // Trigger onload
        mockFileReader.onload();

        const result = await promise;
        expect(result).toBe('test string content');
        expect(mockFileReader.readAsText).toHaveBeenCalledWith(file);
      });

      it('should reject when result is not a string', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });

        const mockFileReader = {
          readAsText: vi.fn(),
          onload: null as any,
          onerror: null as any,
          result: new ArrayBuffer(0), // not a string
        };

        class MockFileReader {
          readAsText = mockFileReader.readAsText;
          onload = mockFileReader.onload;
          onerror = mockFileReader.onerror;
          get result() { return mockFileReader.result; }
          set onload(val) { mockFileReader.onload = val; }
          set onerror(val) { mockFileReader.onerror = val; }
        }
        global.FileReader = MockFileReader as any;

        const promise = fileToText(file);

        // Trigger onload
        mockFileReader.onload();

        await expect(promise).rejects.toThrow('FILE_ERROR: Failed to extract text from test.txt.');
      });

      it('should reject on onerror', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });

        const mockFileReader = {
          readAsText: vi.fn(),
          onload: null as any,
          onerror: null as any,
          result: null,
        };

        class MockFileReader {
          readAsText = mockFileReader.readAsText;
          onload = mockFileReader.onload;
          onerror = mockFileReader.onerror;
          get result() { return mockFileReader.result; }
          set onload(val) { mockFileReader.onload = val; }
          set onerror(val) { mockFileReader.onerror = val; }
        }
        global.FileReader = MockFileReader as any;

        const promise = fileToText(file);

        // Trigger onerror
        mockFileReader.onerror();

        await expect(promise).rejects.toThrow('FILE_ERROR: Error reading test.txt. The file might be corrupted.');
      });
    });
  });
});
