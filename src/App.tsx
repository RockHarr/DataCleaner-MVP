import { useState, useEffect } from 'react';
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
