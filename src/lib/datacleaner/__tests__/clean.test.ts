import { describe, it, expect } from 'vitest';
import { cleanText, normalizeName } from '../clean';

describe('Cleaning Logic', () => {
    it('trims whitespace', () => {
        expect(cleanText('  hello  ', { trim: true, collapseSpaces: false, normalizeNames: false, removeHangingPunctuation: false, rut: {} as any, region: {} as any, export: {} as any })).toBe('hello');
    });

    it('collapses spaces', () => {
        expect(cleanText('hello   world', { trim: false, collapseSpaces: true, normalizeNames: false, removeHangingPunctuation: false, rut: {} as any, region: {} as any, export: {} as any })).toBe('hello world');
    });

    it('removes hanging punctuation', () => {
        expect(cleanText('hello.', { trim: false, collapseSpaces: false, normalizeNames: false, removeHangingPunctuation: true, rut: {} as any, region: {} as any, export: {} as any })).toBe('hello');
        expect(cleanText('hello..', { trim: false, collapseSpaces: false, normalizeNames: false, removeHangingPunctuation: true, rut: {} as any, region: {} as any, export: {} as any })).toBe('hello');
    });

    it('normalizes names', () => {
        expect(normalizeName('jOSÉ lUIS')).toBe('José Luis');
        expect(normalizeName('MARÍA  DE LOS ÁNGELES')).toBe('María De Los Ángeles');
    });
});
