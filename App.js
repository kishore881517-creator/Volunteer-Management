import React, { useState, useRef } from 'react';
import './App.css';
import Home from './pages/Home';
import Volunteers from './pages/Volunteers';
import Events from './pages/Events';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';

import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeRegister from './pages/EmployeeRegister';
import LoginSelection from './pages/LoginSelection';

function App() {
  const isFirstRun = useRef(true);

  if (isFirstRun.current) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    isFirstRun.current = false;
  }

  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'volunteers':
        return <Volunteers />;
      case 'events':
        const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
        if (user.role !== 'admin') {
          return <Dashboard onNavigate={setCurrentPage} />;
        }
        return <Events />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'admin-login':
        return <AdminLogin onNavigate={setCurrentPage} />;

      case 'employee-login':
        return <EmployeeLogin onNavigate={setCurrentPage} />;
      case 'employee-register':
        return <EmployeeRegister onNavigate={setCurrentPage} />;
      case 'login-selection':
        return <LoginSelection onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1 onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer' }}>Volunteer Management</h1>
        </div>
        <ul className="nav-links">

          {!localStorage.getItem('adminToken') ? (
            null
          ) : (
            <>
              {(() => {
                const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
                return (
                  <>
                    <li><button onClick={() => setCurrentPage('dashboard')}>Dashboard</button></li>
                    <li><button onClick={() => setCurrentPage('volunteers')}>Volunteers</button></li>
                    {user.role === 'admin' && (
                      <li><button onClick={() => setCurrentPage('events')}>Events</button></li>
                    )}
                  </>
                );
              })()}
              <li><button onClick={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); setCurrentPage('home'); }} style={{ backgroundColor: '#e74c3c' }}>Logout</button></li>
            </>
          )}
        </ul>
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;