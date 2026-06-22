import { describe, it, expect } from 'vitest';
import { isAllowedMimeType, MAX_FILE_COUNT, MAX_TOTAL_BYTES, MAX_TEXT_CHARS } from '../limits';

describe('limits', () => {
  describe('isAllowedMimeType', () => {
    it('accepts PDF, CSV, JSON, TXT', () => {
      expect(isAllowedMimeType('application/pdf')).toBe(true);
      expect(isAllowedMimeType('text/csv')).toBe(true);
      expect(isAllowedMimeType('application/json')).toBe(true);
      expect(isAllowedMimeType('text/plain')).toBe(true);
    });

    it('accepts any image/* type', () => {
      expect(isAllowedMimeType('image/png')).toBe(true);
      expect(isAllowedMimeType('image/jpeg')).toBe(true);
      expect(isAllowedMimeType('image/webp')).toBe(true);
    });

    it('accepts the generic octet-stream (browsers send it for unknown text)', () => {
      expect(isAllowedMimeType('application/octet-stream')).toBe(true);
    });

    it('rejects executable and other dangerous types', () => {
      expect(isAllowedMimeType('application/x-msdownload')).toBe(false);
      expect(isAllowedMimeType('application/zip')).toBe(false);
      expect(isAllowedMimeType('application/x-httpd-php')).toBe(false);
      expect(isAllowedMimeType('text/html')).toBe(false);
    });

    it('is case-insensitive on the prefix check', () => {
      // Callers normalize to lowercase, but the prefix check should be robust.
      expect(isAllowedMimeType('image/PNG')).toBe(true);
    });
  });

  it('exposes sane constant values', () => {
    expect(MAX_FILE_COUNT).toBe(20);
    expect(MAX_TOTAL_BYTES).toBe(40 * 1024 * 1024);
    expect(MAX_TEXT_CHARS).toBe(10_000);
  });
});
