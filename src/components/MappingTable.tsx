import React from 'react';
import { ColumnMapping, STANDARD_COLUMNS } from '../lib/datacleaner/types';

interface MappingTableProps {
    mappings: ColumnMapping[];
    onUpdateMapping: (index: number, updates: Partial<ColumnMapping>) => void;
    onConfirm: () => void;
}

export const MappingTable: React.FC<MappingTableProps> = ({ mappings, onUpdateMapping, onConfirm }) => {
    return (
        <div className="card">
            <div className="card-header bg-transparent border-secondary">
                <h5 className="mb-0">Mapeo de Columnas</h5>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0 align-middle">
                        <thead>
                            <tr>
                                <th scope="col" className="ps-4">Columna Original</th>
                                <th scope="col">Columna Destino</th>
                                <th scope="col" className="text-center">Incluir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mappings.map((map, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 text-secondary">{map.originalName}</td>
                                    <td>
                                        <select
                                            className="form-select form-select-sm"
                                            value={map.targetName}
                                            onChange={(e) => onUpdateMapping(idx, { targetName: e.target.value })}
                                            disabled={!map.include}
                                        >
                                            <option value={map.originalName}>-- Usar nombre original --</option>
                                            {STANDARD_COLUMNS.map(col => (
                                                <option key={col} value={col}>{col}</option>
                                            ))}
                                            <option value="Otro">Otro (Personalizado)</option>
                                        </select>
                                    </td>
                                    <td className="text-center">
                                        <div className="form-check d-flex justify-content-center">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={map.include}
                                                onChange={(e) => onUpdateMapping(idx, { include: e.target.checked })}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="card-footer bg-transparent border-secondary d-flex justify-content-end p-3">
                <button className="btn btn-primary" onClick={onConfirm}>
                    Confirmar y Continuar
                </button>
            </div>
        </div>
    );
};
