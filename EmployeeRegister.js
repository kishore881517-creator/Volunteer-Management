import React, { useState } from 'react';

function EmployeeRegister({ onNavigate }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/admin/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, email, role: 'employee' }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Registration failed');
                setLoading(false);
                return;
            }

            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.admin));

            setMessage('Employee registration successful! Redirecting...');
            setTimeout(() => {
                onNavigate('dashboard');
            }, 2000);
        } catch (err) {
            setError('Error connecting to server');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2>Employee Register</h2>
            <div className="card" style={{ marginTop: '2rem' }}>
                {error && <div style={{ color: '#e74c3c', marginBottom: '1rem', padding: '1rem', backgroundColor: '#fadbd8', borderRadius: '4px' }}>{error}</div>}
                {message && <div style={{ color: '#27ae60', marginBottom: '1rem', padding: '1rem', backgroundColor: '#d5f4e6', borderRadius: '4px' }}>{message}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            disabled={loading}
                            required
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            disabled={loading}
                            required
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
                            required
                            autoComplete="off"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-success"
                        style={{ width: '100%', backgroundColor: '#3498db' }}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    Already have account? <button onClick={() => onNavigate('employee-login')} style={{ background: 'none', border: 'none', color: '#3498db', textDecoration: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>Login here</button>
                </p>
            </div>
        </div>
    );
}

export default EmployeeRegister;
