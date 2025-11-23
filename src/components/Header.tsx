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
