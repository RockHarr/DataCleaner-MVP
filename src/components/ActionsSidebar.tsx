import React from 'react';
import { CleaningOptions } from '../lib/datacleaner/types';

interface ActionsSidebarProps {
    options: CleaningOptions;
    onChange: (newOptions: CleaningOptions) => void;
    onProcess: () => void;
}

export const ActionsSidebar: React.FC<ActionsSidebarProps> = ({ options, onChange, onProcess }) => {

    const updateOption = (section: keyof CleaningOptions, key: string, value: any) => {
        if (section === 'rut' || section === 'region' || section === 'export') {
            onChange({
                ...options,
                [section]: {
                    ...options[section],
                    [key]: value
                }
            });
        } else {
            onChange({
                ...options,
                [key]: value
            });
        }
    };

    return (
        <div className="card h-100">
            <div className="card-header">
                <h5 className="mb-0">Opciones de Limpieza</h5>
            </div>
            <div className="card-body overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>

                {/* Text Cleaning */}
                <div className="mb-4">
                    <h6 className="text-accent text-uppercase small fw-bold mb-3">Texto General</h6>
                    <div className="form-check mb-2">
                        <input
                            className="form-check-input" type="checkbox" id="opt-trim"
                            checked={options.trim}
                            onChange={(e) => updateOption('trim', 'trim', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="opt-trim">Quitar espacios extremos</label>
                    </div>
                    <div className="form-check mb-2">
                        <input
                            className="form-check-input" type="checkbox" id="opt-collapse"
                            checked={options.collapseSpaces}
                            onChange={(e) => updateOption('collapseSpaces', 'collapseSpaces', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="opt-collapse">Colapsar espacios dobles</label>
                    </div>
                    <div className="form-check mb-2">
                        <input
                            className="form-check-input" type="checkbox" id="opt-norm-names"
                            checked={options.normalizeNames}
                            onChange={(e) => updateOption('normalizeNames', 'normalizeNames', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="opt-norm-names">Normalizar Nombres (Title Case)</label>
                    </div>
                    <div className="form-check mb-2">
                        <input
                            className="form-check-input" type="checkbox" id="opt-punct"
                            checked={options.removeHangingPunctuation}
                            onChange={(e) => updateOption('removeHangingPunctuation', 'removeHangingPunctuation', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="opt-punct">Quitar puntuación final</label>
                    </div>
                </div>

                <hr className="border-secondary" />

                {/* RUT */}
                <div className="mb-4">
                    <h6 className="text-accent text-uppercase small fw-bold mb-3">RUT (Chile)</h6>
                    <div className="form-check mb-2">
                        <input
                            className="form-check-input" type="checkbox" id="opt-rut-val"
                            checked={options.rut.validate}
                            onChange={(e) => updateOption('rut', 'validate', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="opt-rut-val">Validar RUT</label>
                    </div>
                    <div className="form-check mb-2">
                        <input
                            className="form-check-input" type="checkbox" id="opt-rut-dedupe"
                            checked={options.rut.dedupe}
                            onChange={(e) => updateOption('rut', 'dedupe', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="opt-rut-dedupe">Quitar duplicados por RUT</label>
                    </div>
                    <div className="form-check mb-2 ms-3">
                        <input
                            className="form-check-input" type="checkbox" id="opt-rut-exclude"
                            checked={options.rut.excludeInvalid}
                            disabled={!options.rut.validate}
                            onChange={(e) => updateOption('rut', 'excludeInvalid', e.target.checked)}
                        />
                        <label className="form-check-label text-secondary" htmlFor="opt-rut-exclude">Excluir inválidos</label>
                    </div>
                </div>

                <hr className="border-secondary" />

                {/* Regions */}
                <div className="mb-4">
                    <h6 className="text-accent text-uppercase small fw-bold mb-3">Regiones</h6>
                    <div className="form-check mb-2">
                        <input
                            className="form-check-input" type="checkbox" id="opt-reg-norm"
                            checked={options.region.normalize}
                            onChange={(e) => updateOption('region', 'normalize', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="opt-reg-norm">Normalizar nombres</label>
                    </div>
                </div>

                <hr className="border-secondary" />

                {/* Export */}
                <div className="mb-4">
                    <h6 className="text-accent text-uppercase small fw-bold mb-3">Exportación</h6>
                    <div className="mb-3">
                        <label className="form-label small">Delimitador</label>
                        <select
                            className="form-select form-select-sm"
                            value={options.export.delimiter}
                            onChange={(e) => updateOption('export', 'delimiter', e.target.value)}
                        >
                            <option value=";">Punto y coma (;)</option>
                            <option value=",">Coma (,)</option>
                            <option value={"\t"}>Tabulador</option>
                        </select>
                    </div>
                    <div className="form-check mb-2">
                        <input
                            className="form-check-input" type="checkbox" id="opt-excel"
                            checked={options.export.excelCompat}
                            onChange={(e) => updateOption('export', 'excelCompat', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="opt-excel">Compatibilidad Excel (BOM)</label>
                    </div>
                </div>

            </div>
            <div className="card-footer p-3">
                <button className="btn btn-primary w-100 py-2" onClick={onProcess}>
                    Exportar CSV Limpio
                </button>
            </div>
        </div>
    );
};
