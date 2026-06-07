import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
  it('merges basic string classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
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
        'p-4 p-2' // tailwind-merge inside string
      )
    ).toBe('base-class conditional-true array-class p-2');
  });

  it('handles complex objects correctly', () => {
    expect(cn({ 'class1': true, 'class2': false, 'class3': true })).toBe('class1 class3');
  });

  it('handles arrays containing objects correctly', () => {
    expect(cn(['class1', { 'class2': true, 'class3': false }])).toBe('class1 class2');
  });

  it('handles duplicate classes using tailwind-merge', () => {
    expect(cn('flex', 'flex', 'items-center', 'items-start')).toBe('flex items-start');
  });

  it('merges multiple conditional classes properly', () => {
    const isError = true;
    const isSuccess = false;
    expect(
      cn(
        'base-input',
        isError && 'border-red-500',
        isSuccess && 'border-green-500',
        { 'opacity-50': false }
      )
    ).toBe('base-input border-red-500');
  });
});
