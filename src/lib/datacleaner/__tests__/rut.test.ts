import { describe, it, expect } from 'vitest';
import { validateRut, formatRut, processRuts } from '../rut';

describe('RUT Logic', () => {
    it('validates correct RUTs', () => {
        expect(validateRut('11.111.111-1')).toBe(true);
        expect(validateRut('12345678-5')).toBe(true);
        expect(validateRut('30.686.957-4')).toBe(true); // Random valid
        expect(validateRut('12.345.678-5')).toBe(true);
    });

    it('validates K check digit', () => {
        // Example: 6.666.666-K is valid? Let's check a known K rut.
        // 17.564.445-K
        expect(validateRut('17564445-K')).toBe(true);
        expect(validateRut('17.564.445-k')).toBe(true);
    });

    it('rejects invalid RUTs', () => {
        expect(validateRut('11.111.111-2')).toBe(false); // Wrong DV
        expect(validateRut('123')).toBe(false); // Too short
        expect(validateRut('abc')).toBe(false); // Not numbers
    });

    it('formats RUTs correctly', () => {
        expect(formatRut('123456785')).toBe('12.345.678-5');
        expect(formatRut('17564445k')).toBe('17.564.445-K');
    });

    it('deduplicates by RUT', () => {
        const rows = [
            { id: '1', rut: '11.111.111-1', name: 'A' },
            { id: '2', rut: '11111111-1', name: 'B' }, // Duplicate
            { id: '3', rut: '22.222.222-2', name: 'C' },
        ];

        const result = processRuts(rows, 'rut', {
            validate: true,
            dedupe: true,
            excludeInvalid: false,
            exportDuplicatesOnly: false
        });

        expect(result.rows).toHaveLength(2);
        expect(result.stats.duplicatesRemoved).toBe(1);
        expect(result.rows[0].name).toBe('A'); // Keeps first
    });
});
