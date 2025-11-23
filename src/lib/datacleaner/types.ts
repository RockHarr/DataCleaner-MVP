export type RawRow = Record<string, string>;

export interface ColumnMapping {
    originalName: string;
    targetName: string; // "RUT", "Nombre", "Region", etc. or custom
    include: boolean;
}

export interface CleaningOptions {
    trim: boolean;
    collapseSpaces: boolean;
    normalizeNames: boolean;
    removeHangingPunctuation: boolean;
    rut: RutOptions;
    region: RegionOptions;
    export: ExportOptions;
}

export interface RutOptions {
    validate: boolean;
    dedupe: boolean;
    excludeInvalid: boolean;
    exportDuplicatesOnly: boolean; // Diagnostic mode
}

export interface RegionOptions {
    normalize: boolean;
    flagUnknown: boolean;
}

export interface ExportOptions {
    delimiter: ';' | ',' | '\t';
    excelCompat: boolean; // BOM + CRLF
}

export interface SummaryStats {
    totalRows: number;
    uniqueRows: number;
    duplicatesRemoved: number;
    validRut: number;
    invalidRut: number;
    missingRut: number;
    unknownRegion: number;
    emptyRegion: number;
}

export const DEFAULT_CLEANING_OPTIONS: CleaningOptions = {
    trim: true,
    collapseSpaces: true,
    normalizeNames: true,
    removeHangingPunctuation: true,
    rut: {
        validate: true,
        dedupe: true,
        excludeInvalid: false,
        exportDuplicatesOnly: false,
    },
    region: {
        normalize: true,
        flagUnknown: false,
    },
    export: {
        delimiter: ';',
        excelCompat: true,
    },
};

export const STANDARD_COLUMNS = [
    "RUT",
    "Nombre completo",
    "Nombres",
    "Apellidos",
    "Región",
    "Comuna",
    "Dirección",
    "Correo",
    "Teléfono",
    "Cargo",
    "Fecha Ingreso",
    "Sueldo Base"
];
