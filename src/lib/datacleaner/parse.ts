import Papa from 'papaparse';
import { RawRow } from './types';

export interface ParseResult {
    data: RawRow[];
    meta: {
        delimiter: string;
        fields: string[];
    };
    errors: Papa.ParseError[];
}

export function parseCSV(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            preview: 0, // parse all
            complete: (results) => {
                resolve({
                    data: results.data as RawRow[],
                    meta: {
                        delimiter: results.meta.delimiter || ';',
                        fields: results.meta.fields || []
                    },
                    errors: results.errors
                });
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}
