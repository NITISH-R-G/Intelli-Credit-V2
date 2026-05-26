import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { hashFile } from './file-utils';

describe('file-utils', () => {
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

  describe('hashFile', () => {
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
});
