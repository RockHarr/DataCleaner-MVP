import { RawRow, RegionOptions, SummaryStats } from './types';

// Official Chilean Regions (short list for MVP)
export const CHILE_REGIONS = [
    "Arica y Parinacota",
    "Tarapacá",
    "Antofagasta",
    "Atacama",
    "Coquimbo",
    "Valparaíso",
    "Metropolitana de Santiago",
    "Libertador General Bernardo O'Higgins",
    "Maule",
    "Ñuble",
    "Biobío",
    "La Araucanía",
    "Los Ríos",
    "Los Lagos",
    "Aysén del General Carlos Ibáñez del Campo",
    "Magallanes y de la Antártica Chilena"
];

// Map for normalization (common variations -> official name)
const REGION_MAP: Record<string, string> = {
    "arica": "Arica y Parinacota",
    "tarapaca": "Tarapacá",
    "antofagasta": "Antofagasta",
    "atacama": "Atacama",
    "coquimbo": "Coquimbo",
    "valparaiso": "Valparaíso",
    "v region": "Valparaíso",
    "metropolitana": "Metropolitana de Santiago",
    "rm": "Metropolitana de Santiago",
    "santiago": "Metropolitana de Santiago",
    "ohiggins": "Libertador General Bernardo O'Higgins",
    "o'higgins": "Libertador General Bernardo O'Higgins",
    "vi region": "Libertador General Bernardo O'Higgins",
    "maule": "Maule",
    "nuble": "Ñuble",
    "biobio": "Biobío",
    "bio bio": "Biobío",
    "araucania": "La Araucanía",
    "los rios": "Los Ríos",
    "los lagos": "Los Lagos",
    "aysen": "Aysén del General Carlos Ibáñez del Campo",
    "magallanes": "Magallanes y de la Antártica Chilena"
};

export function normalizeRegion(value: string): string | null {
    if (!value) return null;

    const lower = value.trim().toLowerCase()
        .replace(/\./g, '') // remove dots
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents for matching

    // Direct match in map
    for (const key in REGION_MAP) {
        if (lower.includes(key)) { // simple heuristic: if it contains the key
            return REGION_MAP[key];
        }
    }

    // Check against official list (fuzzy match?)
    // For MVP, let's keep it simple. If no match found, return original or null?
    // If we return null, it means "Unknown".

    return null;
}

export function processRegions(
    rows: RawRow[],
    regionColumn: string,
    options: RegionOptions
): { rows: RawRow[], stats: Partial<SummaryStats> } {

    const stats = {
        unknownRegion: 0,
        emptyRegion: 0
    };

    const processedRows = rows.map(row => {
        const rawRegion = row[regionColumn];

        if (!rawRegion || !rawRegion.trim()) {
            stats.emptyRegion++;
            return row;
        }

        const normalized = normalizeRegion(rawRegion);

        if (normalized) {
            if (options.normalize) {
                return { ...row, [regionColumn]: normalized };
            }
        } else {
            stats.unknownRegion++;
            if (options.flagUnknown) {
                // We could mark it, but RawRow is string->string. 
                // Maybe prepend "[UNKNOWN] "? For MVP let's just count them.
            }
        }

        return row;
    });

    return { rows: processedRows, stats };
}
