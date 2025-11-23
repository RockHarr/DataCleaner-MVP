import { RawRow, RutOptions, SummaryStats } from './types';

export function validateRut(rut: string): boolean {
    if (!rut) return false;

    // Clean: remove dots, hyphens
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length < 2) return false;

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();

    if (!/^\d+$/.test(body)) return false;

    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const mod = 11 - (sum % 11);
    let expectedDv = 'K';
    if (mod === 11) expectedDv = '0';
    else if (mod !== 10) expectedDv = mod.toString();

    return dv === expectedDv;
}

export function formatRut(rut: string): string {
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length < 2) return rut; // Return original if too short to format

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();

    // Add dots
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formattedBody}-${dv}`;
}

export function processRuts(
    rows: RawRow[],
    rutColumn: string,
    options: RutOptions
): { rows: RawRow[], stats: Partial<SummaryStats>, duplicates: RawRow[] } {

    const stats = {
        validRut: 0,
        invalidRut: 0,
        missingRut: 0,
        duplicatesRemoved: 0,
    };

    const seen = new Set<string>();
    const uniqueRows: RawRow[] = [];
    const duplicateRows: RawRow[] = [];

    for (const row of rows) {
        const rawRut = row[rutColumn];

        // 1. Check existence
        if (!rawRut || !rawRut.trim()) {
            stats.missingRut++;
            // If missing RUT, we usually keep it unless we are strictly deduplicating by RUT and treat empty as same?
            // For MVP, let's keep rows with missing RUTs in the unique set (they are not duplicates of each other in this logic, or maybe they are?)
            // Let's assume empty RUTs are distinct entries for now, or just pass them through.
            uniqueRows.push(row);
            continue;
        }

        // 2. Validate
        const isValid = validateRut(rawRut);
        if (isValid) {
            stats.validRut++;
        } else {
            stats.invalidRut++;
        }

        if (options.excludeInvalid && !isValid) {
            continue; // Skip this row
        }

        // 3. Deduplicate
        if (options.dedupe) {
            // Normalize for dedupe check: remove dots, hyphens, uppercase
            const normalized = rawRut.replace(/[^0-9kK]/g, '').toUpperCase();

            if (seen.has(normalized)) {
                stats.duplicatesRemoved++;
                duplicateRows.push(row);
            } else {
                seen.add(normalized);
                uniqueRows.push(row);
            }
        } else {
            uniqueRows.push(row);
        }
    }

    if (options.exportDuplicatesOnly) {
        return { rows: duplicateRows, stats, duplicates: duplicateRows };
    }

    return { rows: uniqueRows, stats, duplicates: duplicateRows };
}
