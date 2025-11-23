# DataCleaner2-MVP - Project Dump

Este documento contiene todo el código fuente y documentación del proyecto.

## Estructura de Archivos

- package.json
- vite.config.ts
- tsconfig.json
- index.html
- src/main.tsx
- src/App.tsx
- src/components/Header.tsx
- src/components/Footer.tsx
- src/components/StepsBar.tsx
- src/components/UploadPanel.tsx
- src/components/MappingTable.tsx
- src/components/ActionsSidebar.tsx
- src/components/SummaryBar.tsx
- src/components/ResultsTable.tsx
- src/lib/datacleaner/types.ts
- src/lib/datacleaner/clean.ts
- src/lib/datacleaner/rut.ts
- src/lib/datacleaner/regions.ts
- src/lib/datacleaner/parse.ts
- src/styles/global.css
- README.md
- ARCHITECTURE.md
- CLEANING_RULES.md
- USER_GUIDE.md
- CONTRIBUTING.md
- ACCESSIBILITY.md
- ROADMAP.md
- TECH_STACK.md
- SAMPLE_DATA.md
- QA_CHECKLIST.md
- .github/workflows/deploy.yml

### package.json

```json
{
  "name": "datacleaner2-mvp",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "bootstrap": "^5.3.2",
    "file-saver": "^2.0.5",
    "papaparse": "^5.4.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7",
    "@types/node": "^20.10.0",
    "@types/papaparse": "^5.3.14",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}

```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './', // Ensure relative paths for GitHub Pages
})

```

### tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": [
            "ES2020",
            "DOM",
            "DOM.Iterable"
        ],
        "module": "ESNext",
        "skipLibCheck": true,
        /* Bundler mode */
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
        /* Linting */
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true
    },
    "include": [
        "src"
    ],
    "references": [
        {
            "path": "./tsconfig.node.json"
        }
    ]
}
```

### index.html

```html
<!doctype html>
<html lang="es" data-bs-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DataCleaner MVP - RockCode</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

### src/main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

```

### src/App.tsx

```typescript
import { useState, useMemo } from 'react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StepsBar } from './components/StepsBar';
import { UploadPanel } from './components/UploadPanel';
import { MappingTable } from './components/MappingTable';
import { ActionsSidebar } from './components/ActionsSidebar';
import { SummaryBar } from './components/SummaryBar';
import { ResultsTable } from './components/ResultsTable';

import { RawRow, ColumnMapping, CleaningOptions, DEFAULT_CLEANING_OPTIONS, SummaryStats } from './lib/datacleaner/types';
import { cleanText, normalizeName } from './lib/datacleaner/clean';
import { processRuts, formatRut } from './lib/datacleaner/rut';
import { processRegions } from './lib/datacleaner/regions';

function App() {
    const [step, setStep] = useState(1);
    const [rawData, setRawData] = useState<RawRow[]>([]);
    const [filename, setFilename] = useState('');
    const [mappings, setMappings] = useState<ColumnMapping[]>([]);
    const [options, setOptions] = useState<CleaningOptions>(DEFAULT_CLEANING_OPTIONS);

    // Processed state
    const [processedData, setProcessedData] = useState<RawRow[]>([]);
    const [stats, setStats] = useState<SummaryStats | null>(null);

    const handleDataLoaded = (data: RawRow[], meta: { fields: string[] }, name: string) => {
        setRawData(data);
        setFilename(name);

        // Initial mapping guess
        const initialMappings: ColumnMapping[] = meta.fields.map(field => ({
            originalName: field,
            targetName: field, // Could add heuristic guessing here
            include: true
        }));
        setMappings(initialMappings);
        setStep(2);
    };

    const handleUpdateMapping = (index: number, updates: Partial<ColumnMapping>) => {
        const newMappings = [...mappings];
        newMappings[index] = { ...newMappings[index], ...updates };
        setMappings(newMappings);
    };

    const handleConfirmMapping = () => {
        // Initial dry run or just move to step 3
        runCleaning(options); // Run once to show initial results
        setStep(3);
    };

    const runCleaning = (currentOptions: CleaningOptions) => {
        if (!rawData.length) return;

        let currentRows = [...rawData];

        // 1. Identify key columns from mapping
        const rutMapping = mappings.find(m => m.targetName === 'RUT' && m.include);
        const regionMapping = mappings.find(m => m.targetName === 'Región' && m.include);

        // 2. General Text Cleaning & Name Normalization
        // We iterate over all rows and all INCLUDED columns
        currentRows = currentRows.map(row => {
            const newRow: RawRow = {};

            mappings.forEach(map => {
                if (!map.include) return;

                let val = row[map.originalName] || '';

                // General Clean
                val = cleanText(val, currentOptions);

                // Name Normalization (heuristic: if targetName contains "Nombre" or "Apellido")
                if (currentOptions.normalizeNames) {
                    const lowerTarget = map.targetName.toLowerCase();
                    if (lowerTarget.includes('nombre') || lowerTarget.includes('apellido')) {
                        val = normalizeName(val);
                    }
                }

                newRow[map.originalName] = val; // Keep original key for now, we remap at export/display time? 
                // Actually, for the pipeline, it's easier to keep original keys until the very end, 
                // OR remap them now. Let's keep original keys to avoid collisions if multiple cols map to same target (unlikely but possible).
            });

            // Preserve unmapped columns if needed? No, we only care about included ones.
            // But for the logic below (RUT/Region), we need to know which key holds the value.
            // So we must ensure we are updating the keys that correspond to the original names.
            return { ...row, ...newRow };
        });

        // 3. RUT Processing
        let rutStats: Partial<SummaryStats> = {};
        if (rutMapping) {
            const res = processRuts(currentRows, rutMapping.originalName, currentOptions.rut);
            currentRows = res.rows;
            rutStats = res.stats;

            // Format RUTs in the final output if valid?
            // The requirement says "Validar" and "Deduplicar". Formatting is nice to have.
            // Let's format them if they are valid.
            currentRows = currentRows.map(row => {
                const r = row[rutMapping.originalName];
                if (r && currentOptions.rut.validate) { // Only format if we are validating, usually implies we want standard format
                    row[rutMapping.originalName] = formatRut(r);
                }
                return row;
            });
        }

        // 4. Region Processing
        let regionStats: Partial<SummaryStats> = {};
        if (regionMapping) {
            const res = processRegions(currentRows, regionMapping.originalName, currentOptions.region);
            currentRows = res.rows;
            regionStats = res.stats;
        }

        // 5. Final Stats Calculation
        const totalRows = rawData.length;
        const uniqueRows = currentRows.length;

        setStats({
            totalRows,
            uniqueRows,
            duplicatesRemoved: rutStats.duplicatesRemoved || 0,
            validRut: rutStats.validRut || 0,
            invalidRut: rutStats.invalidRut || 0,
            missingRut: rutStats.missingRut || 0,
            unknownRegion: regionStats.unknownRegion || 0,
            emptyRegion: regionStats.emptyRegion || 0
        });

        setProcessedData(currentRows);
    };

    const handleExport = () => {
        if (!processedData.length) return;

        // 1. Remap keys to Target Names
        const exportData = processedData.map(row => {
            const newRow: Record<string, string> = {};
            mappings.forEach(map => {
                if (map.include) {
                    newRow[map.targetName] = row[map.originalName];
                }
            });
            return newRow;
        });

        // 2. Generate CSV
        const csv = Papa.unparse(exportData, {
            delimiter: options.export.delimiter,
            quotes: true // safer
        });

        // 3. Add BOM if Excel Compat
        const blobParts = options.export.excelCompat ? ['\uFEFF', csv] : [csv];
        const blob = new Blob(blobParts, { type: 'text/csv;charset=utf-8;' });

        saveAs(blob, `clean_${filename}`);
    };

    // Re-run cleaning when options change (debounced or immediate? Immediate is fine for MVP size)
    // But we only want to do this if we are in step 3.
    const handleOptionsChange = (newOptions: CleaningOptions) => {
        setOptions(newOptions);
        if (step === 3) {
            // We need to pass newOptions to runCleaning, but runCleaning uses 'options' from state closure if not passed.
            // So we passed it as arg.
            runCleaning(newOptions);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />

            <main className="container flex-grow-1">
                <StepsBar currentStep={step} />

                {step === 1 && (
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <UploadPanel onDataLoaded={handleDataLoaded} />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <MappingTable
                                mappings={mappings}
                                onUpdateMapping={handleUpdateMapping}
                                onConfirm={handleConfirmMapping}
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="row">
                        <div className="col-md-3 mb-4">
                            <ActionsSidebar
                                options={options}
                                onChange={handleOptionsChange}
                                onProcess={handleExport}
                            />
                        </div>
                        <div className="col-md-9">
                            {stats && <SummaryBar stats={stats} />}
                            <ResultsTable data={processedData} mappings={mappings} />
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default App;

```

### src/components/Header.tsx

```typescript
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="py-3 border-bottom border-secondary mb-4">
            <div className="container d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                        <span className="text-dark fw-bold">RC</span>
                    </div>
                    <div>
                        <h1 className="h5 mb-0 fw-bold">DataCleaner <span className="badge bg-primary text-dark ms-2" style={{ fontSize: '0.6em' }}>MVP</span></h1>
                        <small className="text-secondary">by RockCode</small>
                    </div>
                </div>
                <div>
                    <a href="#" className="text-secondary text-decoration-none small">Ayuda</a>
                </div>
            </div>
        </header>
    );
};

```

### src/components/Footer.tsx

```typescript
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="py-4 mt-5 border-top border-secondary text-center">
            <div className="container">
                <p className="text-secondary small mb-0">
                    Hecho con cariño por <span className="text-accent fw-bold">RockCode</span> · DataCleaner MVP
                </p>
            </div>
        </footer>
    );
};

```

### src/components/StepsBar.tsx

```typescript
import React from 'react';

interface StepsBarProps {
    currentStep: number;
}

export const StepsBar: React.FC<StepsBarProps> = ({ currentStep }) => {
    const steps = [
        { id: 1, label: '1. Cargar Datos' },
        { id: 2, label: '2. Mapear Columnas' },
        { id: 3, label: '3. Limpiar y Exportar' },
    ];

    return (
        <div className="steps-bar container mb-5">
            <div className="d-flex justify-content-center gap-4">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`step d-flex align-items-center gap-2 ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'text-success' : ''}`}
                    >
                        <div
                            className={`rounded-circle d-flex align-items-center justify-content-center border ${currentStep === step.id ? 'border-primary bg-primary-subtle text-primary' : 'border-secondary'}`}
                            style={{ width: 32, height: 32 }}
                        >
                            {currentStep > step.id ? '✓' : step.id}
                        </div>
                        <span>{step.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

```

### src/components/UploadPanel.tsx

```typescript
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

```

### src/components/MappingTable.tsx

```typescript
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

```

### src/components/ActionsSidebar.tsx

```typescript
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

```

### src/components/SummaryBar.tsx

```typescript
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

```

### src/components/ResultsTable.tsx

```typescript
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

```

### src/lib/datacleaner/types.ts

```typescript
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

```

### src/lib/datacleaner/clean.ts

```typescript
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

```

### src/lib/datacleaner/rut.ts

```typescript
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

```

### src/lib/datacleaner/regions.ts

```typescript
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

```

### src/lib/datacleaner/parse.ts

```typescript
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

```

### src/styles/global.css

```css
/* Global Styles for DataCleaner MVP */
:root {
  --rc-bg-dark: #020617;
  --rc-text-main: #e5e7eb;
  --rc-accent: #38bdf8;
  --rc-accent-hover: #0ea5e9;
}

body {
  background-color: var(--rc-bg-dark);
  color: var(--rc-text-main);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Bootstrap Overrides for Dark Theme */
.card {
  background-color: #1e293b; /* Slate 800 */
  border: 1px solid #334155;
  color: #f8fafc;
}

.form-control, .form-select {
  background-color: #0f172a; /* Slate 900 */
  border-color: #334155;
  color: #f1f5f9;
}

.form-control:focus, .form-select:focus {
  background-color: #0f172a;
  border-color: var(--rc-accent);
  color: #f1f5f9;
  box-shadow: 0 0 0 0.25rem rgba(56, 189, 248, 0.25);
}

.btn-primary {
  background-color: var(--rc-accent);
  border-color: var(--rc-accent);
  color: #0f172a;
  font-weight: 600;
}

.btn-primary:hover, .btn-primary:focus {
  background-color: var(--rc-accent-hover);
  border-color: var(--rc-accent-hover);
  color: #0f172a;
}

/* Utilities */
.text-accent {
  color: var(--rc-accent) !important;
}

.bg-accent-subtle {
  background-color: rgba(56, 189, 248, 0.1);
}

/* Steps Bar */
.steps-bar .step {
  opacity: 0.5;
  transition: opacity 0.3s;
}
.steps-bar .step.active {
  opacity: 1;
  font-weight: bold;
  color: var(--rc-accent);
}

/* Accessibility Focus */
:focus-visible {
  outline: 2px solid var(--rc-accent);
  outline-offset: 2px;
}

```

### README.md

```markdown
# DataCleaner2-MVP – RockCode

**Limpia nóminas en segundos: CSV/Excel, RUT, regiones y duplicados.**

Una herramienta web diseñada para transformar archivos CSV "sucios" en datos limpios y estandarizados, lista para usar en procesos de nómina y gestión.

## ¿Para quién es esto?
Ideal para equipos de RRHH, contabilidad y administración que pierden horas arreglando manualmente Excels con RUTs inválidos, nombres en mayúsculas/minúsculas mezcladas y regiones mal escritas.

## Características Principales (MVP)
- **Carga Flexible**: Soporta CSV con `;`, `,` o tabuladores.
- **Mapeo Inteligente**: Selecciona qué columnas importar y renómbralas fácilmente.
- **Limpieza de Texto**: Normalización de nombres (Title Case), eliminación de espacios extra y puntuación.
- **Validación de RUT**: Verifica dígito verificador, formatea con puntos y guión, y elimina duplicados.
- **Normalización de Regiones**: Estandariza nombres de regiones chilenas (ej. "RM" -> "Metropolitana de Santiago").
- **Privacidad Total**: Todo el procesamiento ocurre en tu navegador. Los datos nunca salen de tu equipo.

## Instalación y Uso

### Prerrequisitos
- Node.js (v18 o superior)
- npm

### Pasos
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/rockcode/datacleaner2-mvp.git
   cd datacleaner2-mvp
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador (usualmente `http://localhost:5173`).

### Build para Producción
```bash
npm run build
```
Los archivos generados estarán en `dist/`.

## Datos de Ejemplo
En la carpeta `samples/` encontrarás `ejemplo_nomina.csv` para probar todas las funcionalidades de limpieza.

---
**Hecho con cariño por RockCode**
*Colaboración técnica con IA*

```

### ARCHITECTURE.md

```markdown
# Arquitectura del Proyecto

DataCleaner2-MVP es una aplicación Single Page Application (SPA) construida con React y TypeScript, enfocada en el procesamiento de datos en el cliente (browser-side).

## Estructura de Carpetas

```
/
├── public/              # Assets estáticos
├── samples/             # Datos de prueba
├── src/
│   ├── components/      # Componentes React de UI (Presentacionales y Contenedores)
│   ├── lib/
│   │   └── datacleaner/ # Lógica de negocio pura (Core Domain)
│   │       ├── clean.ts    # Reglas de texto
│   │       ├── rut.ts      # Validación RUT
│   │       ├── regions.ts  # Catálogo regiones
│   │       ├── parse.ts    # Wrapper PapaParse
│   │       └── types.ts    # Definiciones de tipos
│   ├── styles/          # CSS global y overrides
│   ├── App.tsx          # Orquestador principal (State Management)
│   └── main.tsx         # Punto de entrada
└── ...config files
```

## Flujo de Datos

1. **Carga (UploadPanel)**: 
   - El usuario selecciona un archivo.
   - `parse.ts` usa PapaParse para convertir CSV a JSON (`RawRow[]`).
   - Se detectan metadatos (delimitador, columnas).

2. **Mapeo (MappingTable)**:
   - El usuario asocia columnas del CSV original a columnas canónicas del sistema ("RUT", "Nombre", etc.).
   - Se define qué columnas se incluyen en la salida.

3. **Configuración (ActionsSidebar)**:
   - El usuario selecciona reglas de limpieza (Trim, RUT dedupe, Normalización Región).
   - Estado gestionado en `App.tsx`.

4. **Procesamiento (App.tsx -> lib/datacleaner)**:
   - Al cambiar opciones o confirmar, se ejecuta el pipeline de limpieza:
     1. `cleanText`: Limpieza básica por celda.
     2. `normalizeName`: Si aplica a la columna.
     3. `processRuts`: Validación y deduplicación global.
     4. `processRegions`: Normalización contra catálogo.
   - Se calculan estadísticas (`SummaryStats`).

5. **Exportación**:
   - Se genera un nuevo CSV con las filas procesadas.
   - Se usa `FileSaver` para descargar el archivo.

## Decisiones Técnicas
- **Lógica separada de UI**: Toda la lógica compleja de limpieza está en `src/lib/datacleaner` y es testeable independientemente de React.
- **Procesamiento Síncrono**: Para el MVP, procesamos todo en el hilo principal. Para archivos muy grandes (>100k filas), se consideraría usar Web Workers en el futuro.

```

### CLEANING_RULES.md

```markdown
# Reglas de Limpieza

Este documento define formalmente las transformaciones aplicadas a los datos.

## 1. Limpieza General de Texto

### Trimming
- **Regla**: Eliminar espacios en blanco al inicio y final de la cadena.
- **Entrada**: `"  Juan Pérez  "` -> **Salida**: `"Juan Pérez"`

### Colapsar Espacios
- **Regla**: Reemplazar secuencias de múltiples espacios por un solo espacio.
- **Entrada**: `"Juan    Pérez"` -> **Salida**: `"Juan Pérez"`

### Puntuación Colgante
- **Regla**: Eliminar puntos, comas o punto y coma al final del texto.
- **Entrada**: `"Gerente."` -> **Salida**: `"Gerente"`

### Normalización de Nombres
- **Regla**: Convertir a "Title Case" (primera mayúscula, resto minúscula).
- **Entrada**: `"JOSÉ LUIS"` -> **Salida**: `"José Luis"`

## 2. RUT (Chile)

### Validación
- **Formato**: Debe contener cuerpo numérico y dígito verificador (0-9, K).
- **Algoritmo**: Módulo 11.
- **Entrada**: `"11.111.111-1"` -> **Válido**
- **Entrada**: `"11.111.111-2"` -> **Inválido**

### Formato de Salida
- **Regla**: Agregar puntos y guión.
- **Entrada**: `"123456785"` -> **Salida**: `"12.345.678-5"`

### Deduplicación
- **Criterio**: Se mantiene la **primera aparición** del RUT en el archivo.
- **Normalización para comparación**: Se comparan los RUTs sin puntos, sin guión y con K mayúscula.

## 3. Regiones

### Normalización
- **Regla**: Mapear variaciones comunes al nombre oficial de la región (SUBDERE).
- **Catálogo**:
  - "RM", "Metropolitana", "Santiago" -> "Metropolitana de Santiago"
  - "V Region", "Valpo" -> "Valparaíso"
  - (Ver `src/lib/datacleaner/regions.ts` para lista completa).
- **Caso No Reconocido**: Si no coincide con ninguna regla, se mantiene el valor original (y se contabiliza como desconocido).

```

### USER_GUIDE.md

```markdown
# Guía de Usuario

Bienvenido a DataCleaner. Sigue estos pasos para limpiar tu nómina.

## Paso 1: Cargar Datos
1. Haz clic en el botón **"Seleccionar archivo"**.
2. Elige tu archivo `.csv` o `.txt` desde tu computador.
3. La aplicación detectará automáticamente el separador (coma, punto y coma, etc.).

## Paso 2: Mapear Columnas
Verás una tabla con las columnas de tu archivo.
1. Para cada columna importante (RUT, Nombre, Región), selecciona el tipo correspondiente en el menú desplegable.
2. Si hay columnas que no necesitas en el archivo final, desmarca la casilla "Incluir".
3. Haz clic en **"Confirmar y Continuar"**.

## Paso 3: Limpiar y Exportar
Verás una vista previa de tus datos y un panel de opciones a la izquierda.

### Opciones Disponibles
- **Texto General**: Activa "Normalizar Nombres" para arreglar mayúsculas/minúsculas.
- **RUT**:
  - "Validar RUT": Verifica que los RUT sean reales.
  - "Quitar duplicados": Si un RUT aparece dos veces, borra la segunda fila.
- **Regiones**: "Normalizar nombres" corregirá "RM" a "Metropolitana de Santiago", etc.

### Revisar Resumen
En la barra superior verás cuántas filas quedaron, cuántos RUTs inválidos se encontraron y si hay regiones desconocidas.

### Exportar
1. Elige el delimitador para el nuevo archivo (Excel prefiere "Punto y coma").
2. Haz clic en **"Exportar CSV Limpio"**.
3. El archivo se descargará a tu carpeta de Descargas.

## Problemas Frecuentes
- **El archivo se ve todo en una columna**: Probablemente el delimitador no se detectó bien. Intenta guardar tu CSV usando `;` o `,` estándar.
- **Caracteres extraños (Ã±)**: Asegúrate de guardar tu CSV original con codificación **UTF-8**. DataCleaner exporta siempre en UTF-8 con BOM para máxima compatibilidad.

```

### CONTRIBUTING.md

```markdown
# Guía de Contribución

¡Gracias por querer mejorar DataCleaner!

## Setup de Desarrollo
1. Haz un fork del repositorio.
2. Instala dependencias: `npm install`.
3. Crea una rama para tu feature: `git checkout -b feature/nueva-regla`.

## Estándares de Código
- **TypeScript**: Usamos modo estricto. Evita `any` siempre que sea posible.
- **Estilos**: Bootstrap 5 para estructura, CSS custom en `global.css` para tema oscuro.
- **Componentes**: Funcionales con Hooks.

## Agregar Reglas de Limpieza
Si quieres agregar una nueva regla (ej. normalizar emails):
1. Crea la función en `src/lib/datacleaner/clean.ts`.
2. Agrega tests unitarios en `src/lib/datacleaner/__tests__/clean.test.ts`.
3. Agrega la opción en `types.ts` (`CleaningOptions`).
4. Conecta la opción en el UI (`ActionsSidebar.tsx`) y en la lógica (`App.tsx`).

## Tests
Ejecuta `npm test` antes de enviar tu PR. Asegúrate de que todos los tests pasen.

## Pull Requests
Envía tu PR describiendo qué problema soluciona y cómo probarlo.

```

### ACCESSIBILITY.md

```markdown
# Accesibilidad (A11y)

DataCleaner se esfuerza por cumplir con **WCAG 2.1 Nivel AA**.

## Decisiones de Diseño
- **Contraste**: El tema oscuro utiliza un fondo `#020617` con texto `#e5e7eb`, garantizando un ratio de contraste suficiente para lectura prolongada.
- **Color de Acento**: El azul `#38bdf8` se usa para acciones principales y estados de foco, con suficiente luminosidad contra el fondo oscuro.

## Navegación
- **Teclado**: Toda la interfaz es navegable vía `Tab`.
- **Foco Visible**: Se ha implementado un anillo de foco (`outline`) personalizado y visible en todos los elementos interactivos.
- **Formularios**: Todos los inputs tienen etiquetas (`label`) asociadas explícita o implícitamente.

## Semántica
- Uso correcto de hitos HTML5 (`header`, `main`, `footer`, `nav`).
- Tablas de datos con `th scope="col"`.
- Mensajes de estado (alertas) con roles apropiados.

## Checklist de Cumplimiento
- [x] Contraste de texto > 4.5:1.
- [x] Sin trampas de teclado.
- [x] Feedback visual al hacer hover/focus.
- [x] Estructura de encabezados lógica (h1, h2, h3).

```

### ROADMAP.md

```markdown
# Roadmap

## v0.1.0 (MVP Actual)
- Carga de CSV.
- Mapeo de columnas básico.
- Limpieza de RUT y Texto.
- Exportación simple.

## v0.2.0 (Próxima)
- **Plantillas de Mapeo**: Guardar configuraciones de columnas para uso recurrente ("Nómina Enero", "Nómina Febrero").
- **Más Reglas**: Validación de correos electrónicos, formato de teléfonos (+569...).
- **Edición Manual**: Permitir editar celdas individuales directamente en la tabla de resultados.

## v0.3.0
- **Multi-archivo**: Cargar y unir múltiples CSVs en uno solo.
- **Historial**: Log de cambios realizados ("Se eliminaron 5 filas duplicadas").
- **Exportación XLSX**: Generar archivos Excel nativos con formato.

## Futuro
- API REST para automatización server-side.
- Integración directa con software de RRHH.

```

### TECH_STACK.md

```markdown
# Tech Stack

## Core
- **React 18**: Librería de UI estándar de la industria. Componentes funcionales y Hooks.
- **TypeScript 5**: Tipado estático para robustez y mantenibilidad, crítico al manipular estructuras de datos variables.
- **Vite 5**: Build tool de próxima generación. Arranque instantáneo y HMR veloz.

## Datos & Lógica
- **PapaParse 5**: El estándar de oro para parsing CSV en JavaScript. Rápido y confiable.
- **FileSaver.js**: Para garantizar descargas de archivos compatibles en todos los navegadores.

## Estilos
- **Bootstrap 5**: Framework CSS sólido para el sistema de grillas y componentes base.
- **CSS Modules / Global**: Personalización ligera sin overhead de frameworks CSS-in-JS pesados.

## Testing
- **Vitest**: Runner de tests compatible con Vite. Rápido y con API compatible con Jest.

## Infraestructura
- **GitHub Actions**: CI/CD automatizado.
- **GitHub Pages**: Hosting estático gratuito y rápido para el MVP.

## ¿Por qué este stack?
Elegimos este stack para RockCode porque equilibra **velocidad de desarrollo** con **calidad de ingeniería**. React+TS nos da seguridad a largo plazo, mientras que Vite y Bootstrap nos permitieron iterar el MVP en tiempo récord.

```

### SAMPLE_DATA.md

```markdown
# Datos de Ejemplo

El archivo `samples/ejemplo_nomina.csv` está diseñado para probar los casos borde de DataCleaner.

## Contenido

| RUT | Nombre | Región | Notas |
|-----|--------|--------|-------|
| `11.111.111-1` | `JUAN PEREZ` | `RM` | Caso estándar, nombre mayúsculas, región abreviada. |
| `11111111-1` | `juan perez` | `Metropolitana` | **Duplicado** del anterior (mismo RUT limpio). Nombre minúsculas. |
| `22.222.222-K` | `Maria  Soto.` | `V Region` | RUT con K. Nombre con doble espacio y punto final. Región variante. |
| `123` | `Pedro Error` | `Texas` | **RUT Inválido** (muy corto). Región desconocida. |
| (vacío) | `Sin Rut` | (vacío) | Fila sin RUT y sin región. |

## Resultados Esperados

Al procesar este archivo con las opciones por defecto:
1. **Filas**: Deberían quedar 4 filas (se elimina el duplicado de Juan Perez).
2. **RUTs**: Se detectará 1 inválido (`123`).
3. **Regiones**: `RM` y `V Region` se normalizarán. `Texas` quedará como desconocida.
4. **Nombres**: `JUAN PEREZ` -> `Juan Perez`. `Maria Soto.` -> `Maria Soto`.

```

### QA_CHECKLIST.md

```markdown
# QA Checklist

Lista de verificación para pruebas manuales antes de liberar una versión.

## Carga de Archivos
- [ ] Subir un CSV válido con `;`.
- [ ] Subir un CSV válido con `,`.
- [ ] Intentar subir un archivo no CSV (ej. `.jpg`) -> Debe mostrar error o no permitirlo.

## Mapeo
- [ ] Mapear columna "RUT" y "Nombre".
- [ ] Desmarcar una columna -> Verificar que no aparece en el resultado final.
- [ ] Cambiar el nombre de una columna destino a "Otro" -> Escribir nombre personalizado.

## Limpieza
- [ ] **RUT**: Probar con RUTs duplicados -> Verificar contador de "removidas".
- [ ] **Texto**: Verificar que "  Nombre  " salga como "Nombre".
- [ ] **Regiones**: Verificar que "RM" cambie a "Metropolitana de Santiago".

## Exportación
- [ ] Exportar y abrir en Excel -> Verificar que los acentos (ñ) se vean bien (BOM correcto).
- [ ] Verificar que las columnas estén en el orden esperado.

## UI/UX
- [ ] Probar en móvil (responsive básico).
- [ ] Navegar todo el flujo usando solo el teclado (Tab / Enter).
- [ ] Verificar contraste en modo oscuro.

```

### .github/workflows/deploy.yml

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

```

