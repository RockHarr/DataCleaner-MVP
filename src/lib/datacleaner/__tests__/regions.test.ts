import { describe, it, expect } from 'vitest';
import { normalizeRegion } from '../regions';

describe('Region Logic', () => {
    it('normalizes exact matches', () => {
        expect(normalizeRegion('Antofagasta')).toBe('Antofagasta');
    });

    it('normalizes case insensitive', () => {
        expect(normalizeRegion('antofagasta')).toBe('Antofagasta');
    });

    it('normalizes common variations', () => {
        expect(normalizeRegion('RM')).toBe('Metropolitana de Santiago');
        expect(normalizeRegion('V Region')).toBe('Valparaíso');
        expect(normalizeRegion('Bio Bio')).toBe('Biobío');
    });

    it('returns null for unknown', () => {
        expect(normalizeRegion('Texas')).toBe(null);
    });
});
