import React from 'react';

function LoginSelection({ onNavigate }) {
    return (
        <div className="page" style={{ textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
            <h2 style={{ marginBottom: '2rem' }}>Please select your login type</h2>
            <div className="card-grid">
                <div
                    className="card"
                    onClick={() => onNavigate('employee-login')}
                    style={{
                        cursor: 'pointer',
                        borderTop: '4px solid #3498db',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '2rem'
                    }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                    <h3>Employee Login</h3>
                    <p>Access volunteer lists and update project progress.</p>
                </div>

                <div
                    className="card"
                    onClick={() => onNavigate('admin-login')}
                    style={{
                        cursor: 'pointer',
                        borderTop: '4px solid #2ecc71',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '2rem'
                    }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>
                    <h3>Admin Login</h3>
                    <p>Full access to manage events, volunteers, and users.</p>
                </div>
            </div>
            <button
                className="btn-primary"
                onClick={() => onNavigate('home')}
                style={{ marginTop: '2rem', backgroundColor: '#95a5a6' }}
            >
                Back to Home
            </button>
        </div>
    );
}

export default LoginSelection;
