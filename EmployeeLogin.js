import React, { useState } from 'react';

function EmployeeLogin({ onNavigate }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Login failed');
                setLoading(false);
                return;
            }

            // Save token and user info to localStorage
            // We can use generic keys or specific ones. Using 'adminToken' for both is fine if we check the role.
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.admin));

            onNavigate('dashboard');
        } catch (err) {
            setError('Error connecting to server');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2>Employee Login</h2>
            <div className="card" style={{ marginTop: '2rem' }}>
                {error && <div style={{ color: '#e74c3c', marginBottom: '1rem', padding: '1rem', backgroundColor: '#fadbd8', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            disabled={loading}
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            disabled={loading}
                            autoComplete="off"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-success"
                        style={{ width: '100%', backgroundColor: '#3498db' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    First time? <button onClick={() => onNavigate('employee-register')} style={{ background: 'none', border: 'none', color: '#3498db', textDecoration: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>Register here</button>
                </p>
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    Admin? <button onClick={() => onNavigate('admin-login')} style={{ background: 'none', border: 'none', color: '#3498db', textDecoration: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>Login here</button>
                </p>
            </div>
        </div>
    );
}

export default EmployeeLogin;
