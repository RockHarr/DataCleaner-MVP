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
