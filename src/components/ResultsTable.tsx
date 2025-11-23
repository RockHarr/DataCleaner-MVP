import React from 'react';
import { RawRow, ColumnMapping } from '../lib/datacleaner/types';

interface ResultsTableProps {
    data: RawRow[];
    mappings: ColumnMapping[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data, mappings }) => {
    // Filter columns to show based on mapping 'include'
    const activeMappings = mappings.filter(m => m.include);

    // Limit preview to 100 rows for performance
    const previewData = data.slice(0, 100);

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Vista Previa (Primeras 100 filas)</h5>
                <span className="badge bg-secondary">{data.length} filas total</span>
            </div>
            <div className="table-responsive">
                <table className="table table-dark table-striped table-hover mb-0 table-sm small">
                    <thead>
                        <tr>
                            {activeMappings.map((map, idx) => (
                                <th key={idx} scope="col" className="text-nowrap">{map.targetName}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {previewData.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                {activeMappings.map((map, colIdx) => (
                                    <td key={colIdx} className="text-nowrap">{row[map.originalName]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.length > 100 && (
                <div className="card-footer text-center text-secondary small">
                    ... y {data.length - 100} filas más
                </div>
            )}
        </div>
    );
};
