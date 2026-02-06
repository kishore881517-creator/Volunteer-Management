import React, { useState, useEffect } from 'react';

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    activeEvents: 0,
    totalHours: 0,
    thisMonthHours: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [updates, setUpdates] = useState([]);

  // Fetch data from backend and localStorage
  useEffect(() => {
    fetchVolunteers();
    fetchEvents();
    fetchUpdates();
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVolunteers();
      fetchEvents();
      fetchUpdates();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update stats and recent activity when data changes
  useEffect(() => {
    calculateStats();
    generateRecentActivity();
  }, [volunteers, events, updates]);

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/volunteers');
      if (response.ok) {
        const data = await response.json();
        setVolunteers(data);
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchUpdates = () => {
    try {
      const savedUpdates = localStorage.getItem('updates');
      if (savedUpdates) {
        const data = JSON.parse(savedUpdates);
        setUpdates(data);
      }
    } catch (error) {
      console.error('Error loading updates:', error);
    }
  };

  const calculateStats = () => {
    const totalVolunteers = volunteers.length;
    const activeEvents = events.filter(e => new Date(e.date) > new Date()).length;
    const totalHours = updates.reduce((sum, u) => sum + (u.hoursWorked || 0), 0);
    
    // Calculate this month hours
    const now = new Date();
    const thisMonthHours = updates
      .filter(u => {
        const updateDate = new Date(u.date);
        return updateDate.getMonth() === now.getMonth() && 
               updateDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, u) => sum + (u.hoursWorked || 0), 0);

    setStats({
      totalVolunteers,
      activeEvents,
      totalHours,
      thisMonthHours,
    });
  };

  const generateRecentActivity = () => {
    const activities = [];

    // Add new volunteers (last 3)
    if (volunteers.length > 0) {
      volunteers.slice(-3).forEach(vol => {
        activities.push({
          type: 'volunteer',
          message: `New volunteer registered - ${vol.name}`,
          timestamp: new Date(),
          icon: '👤'
        });
      });
    }

    // Add new events (last 3)
    if (events.length > 0) {
      events.slice(-3).forEach(event => {
        activities.push({
          type: 'event',
          message: `Event created - ${event.name}`,
          timestamp: new Date(event.date),
          icon: '📅'
        });
      });
    }

    // Add total hours logged
    if (updates.length > 0) {
      const totalHours = updates.reduce((sum, u) => sum + (u.hoursWorked || 0), 0);
      activities.push({
        type: 'hours',
        message: `${totalHours} volunteer hours logged`,
        timestamp: new Date(),
        icon: '⏱️'
      });
    }

    // Add upcoming events count
    const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
    if (upcomingEvents > 0) {
      activities.push({
        type: 'upcoming',
        message: `${upcomingEvents} events scheduled for upcoming dates`,
        timestamp: new Date(),
        icon: '🗓️'
      });
    }

    setRecentActivity(activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8));
  };

  return (
    <div className="page">
      <h2>Dashboard</h2>

      {/* Stats Grid */}
      <div className="card-grid">
        <div className="card" style={{ borderTop: `4px solid #3498db` }}>
          <h3>Total Volunteers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
            {stats.totalVolunteers}
          </p>
        </div>
        <div className="card" style={{ borderTop: `4px solid #27ae60` }}>
          <h3>Active Events</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
            {stats.activeEvents}
          </p>
        </div>
        <div className="card" style={{ borderTop: `4px solid #e74c3c` }}>
          <h3>Total Hours</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
            {stats.totalHours}
          </p>
        </div>
        <div className="card" style={{ borderTop: `4px solid #f39c12` }}>
          <h3>This Month</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>
            {stats.thisMonthHours}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>📋 Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <ul style={{ lineHeight: '2.2', listStyle: 'none', padding: 0 }}>
            {recentActivity.map((activity, index) => (
              <li key={index} style={{ 
                padding: '0.8rem', 
                backgroundColor: '#f8f9fa', 
                marginBottom: '0.8rem',
                borderLeft: '4px solid #2196f3',
                borderRadius: '4px'
              }}>
                <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{activity.icon}</span>
                {activity.message}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No recent activity yet.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;