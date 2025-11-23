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
