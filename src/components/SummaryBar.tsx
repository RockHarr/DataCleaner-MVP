import React from 'react';
import { SummaryStats } from '../lib/datacleaner/types';

interface SummaryBarProps {
    stats: SummaryStats;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({ stats }) => {
    return (
        <div className="alert alert-dark border-secondary d-flex flex-wrap gap-4 align-items-center mb-4" role="alert">
            <div>
                <span className="fw-bold text-white">Resumen:</span> <span className="text-accent">{stats.uniqueRows}</span> filas únicas de {stats.totalRows}
                {stats.duplicatesRemoved > 0 && <span className="text-secondary ms-1">(removidas {stats.duplicatesRemoved} duplicadas)</span>}
            </div>
            <div className="vr text-secondary"></div>
            <div>
                <span className="text-secondary">RUT:</span>{' '}
                <span className="text-success fw-bold" title="Válidos">✓ {stats.validRut}</span> ·{' '}
                <span className="text-danger fw-bold" title="Inválidos">✗ {stats.invalidRut}</span> ·{' '}
                <span className="text-secondary" title="Sin RUT">∅ {stats.missingRut}</span>
            </div>
            <div className="vr text-secondary"></div>
            <div>
                <span className="text-secondary">Regiones:</span>{' '}
                <span className="text-warning fw-bold" title="No reconocidas">? {stats.unknownRegion}</span> ·{' '}
                <span className="text-secondary" title="Vacías">∅ {stats.emptyRegion}</span>
            </div>
        </div>
    );
};
