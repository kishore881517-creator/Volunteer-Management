import React from 'react';

function Home({ onNavigate }) {
  return (
    <div className="page">
      <h2>Welcome to Volunteer Management Platform</h2>
      <p>Manage volunteers and events efficiently.</p>
      <div className="card-grid">
        <div className="card" onClick={() => onNavigate('login-selection')} style={{ cursor: 'pointer' }}>
          <h3>Volunteer Management</h3>
          <p>Track and manage all your volunteers in one place. Register new volunteers and monitor their participation.</p>
        </div>
        <div className="card" onClick={() => onNavigate('login-selection')} style={{ cursor: 'pointer' }}>
          <h3>Event Management</h3>
          <p>Create and organize volunteer events. Assign volunteers to events and track their contributions.</p>
        </div>
        <div className="card" onClick={() => onNavigate('login-selection')} style={{ cursor: 'pointer' }}>
          <h3>Dashboard Analytics</h3>
          <p>View real-time analytics and reports about your volunteer program and events.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
