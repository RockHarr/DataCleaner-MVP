import React, { useCallback } from 'react';
import { parseCSV } from '../lib/datacleaner/parse';
import { RawRow } from '../lib/datacleaner/types';

interface UploadPanelProps {
    onDataLoaded: (data: RawRow[], meta: { delimiter: string, fields: string[] }, filename: string) => void;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onDataLoaded }) => {
    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await parseCSV(file);
            onDataLoaded(result.data, result.meta, file.name);
        } catch (error) {
            console.error("Error parsing CSV", error);
            alert("Error al leer el archivo CSV. Asegúrate de que el formato sea correcto.");
        }
    }, [onDataLoaded]);

    return (
        <div className="card text-center p-5">
            <div className="card-body">
                <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-file-earmark-arrow-up text-secondary" viewBox="0 0 16 16">
                        <path d="M8.5 11.5a.5.5 0 0 1-1 0V7.707L6.354 8.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 7.707V11.5z" />
                        <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                    </svg>
                </div>
                <h3 className="card-title mb-3">Sube tu nómina o archivo CSV</h3>
                <p className="card-text text-secondary mb-4">
                    Soporta archivos .csv con delimitadores comunes (coma, punto y coma, tab).
                </p>

                <div className="d-flex justify-content-center">
                    <label className="btn btn-primary btn-lg">
                        Seleccionar archivo
                        <input type="file" accept=".csv,.txt" hidden onChange={handleFileChange} />
                    </label>
                </div>
            </div>
        </div>
    );
};
