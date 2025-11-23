import { CleaningOptions } from './types';

export function cleanText(value: string, options: CleaningOptions): string {
    if (!value) return '';

    let cleaned = value;

    if (options.trim) {
        cleaned = cleaned.trim();
    }

    if (options.collapseSpaces) {
        cleaned = cleaned.replace(/\s+/g, ' ');
    }

    if (options.removeHangingPunctuation) {
        // Remove trailing dots, commas, etc if they are at the very end
        cleaned = cleaned.replace(/[.,;:]+$/, '');
    }

    if (options.normalizeNames) {
        // Basic Title Case: "jOSÉ lUIS" -> "José Luis"
        // We assume this is applied to Name fields, but the caller decides when to call it.
        // However, if this is a generic cleanText, we might need a flag or separate function.
        // For MVP, we'll expose a separate normalizeName function and let the caller use it for name columns.
        // But if 'normalizeNames' is in options, we might apply it? 
        // Actually, it's safer to apply name normalization ONLY to columns mapped as names.
        // So this function might just do general text cleanup.
    }

    return cleaned;
}

export function normalizeName(value: string): string {
    if (!value) return '';

    // Split by space, lowercase everything, then capitalize first letter
    return value
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
