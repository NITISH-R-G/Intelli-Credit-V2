import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('merges basic string classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn('class1', isTrue ? 'class2' : '', isFalse ? 'class3' : '')).toBe('class1 class2');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('handles nested arrays', () => {
    expect(cn(['class1', ['class2', 'class3']])).toBe('class1 class2 class3');
  });

  it('handles falsy values (null, undefined, false, 0, empty string)', () => {
    expect(cn('class1', null, undefined, false, 0, '')).toBe('class1');
  });

  it('resolves tailwind class conflicts correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('handles a mix of different input types', () => {
    expect(
      cn(
        'base-class',
        { 'conditional-true': true, 'conditional-false': false },
        ['array-class'],
        null,
        'p-4 p-2', // tailwind-merge inside string
      ),
    ).toBe('base-class conditional-true array-class p-2');
  });
});
