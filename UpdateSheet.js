import React, { useState, useEffect } from 'react';

function UpdateSheet() {
  const [updates, setUpdates] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);

  const [formData, setFormData] = useState({
    volunteerName: '',
    eventName: '',
    date: '',
    hoursWorked: '',
    status: 'pending'
  });

  const [filterStatus, setFilterStatus] = useState('all');
  const [draftData, setDraftData] = useState(null);

  // Load data from backend/localStorage on component mount
  useEffect(() => {
    fetchVolunteers();
    fetchEvents();
    const savedUpdates = localStorage.getItem('updateSheet');
    if (savedUpdates) {
      try {
        setUpdates(JSON.parse(savedUpdates));
      } catch (error) {
        console.error('Error loading updates:', error);
      }
    } else {
      setUpdates([
        { id: 1, volunteerName: 'Sarah Johnson', eventName: 'Beach Cleanup', date: '2026-01-20', hoursWorked: 5, status: 'completed' },
        { id: 2, volunteerName: 'John Doe', eventName: 'Food Bank', date: '2026-01-19', hoursWorked: 3, status: 'completed' },
        { id: 3, volunteerName: 'Jane Smith', eventName: 'Community Garden', date: '2026-01-21', hoursWorked: 4, status: 'in-progress' },
        { id: 4, volunteerName: 'Mike Wilson', eventName: 'Park Renovation', date: '2026-01-22', hoursWorked: 0, status: 'pending' },
      ]);
    }
  }, []);

  // Save updates to localStorage
  useEffect(() => {
    localStorage.setItem('updateSheet', JSON.stringify(updates));
  }, [updates]);

  // Auto-refresh events and volunteers every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVolunteers();
      fetchEvents();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveDraft = () => {
    if (formData.volunteerName && formData.eventName && formData.date && formData.hoursWorked) {
      setDraftData({
        id: Date.now(),
        ...formData,
        hoursWorked: parseInt(formData.hoursWorked),
      });
      setFormData({
        volunteerName: '',
        eventName: '',
        date: '',
        hoursWorked: '',
        status: 'pending'
      });
      alert('Saved as Draft - Not updated in table');
    }
  };

  const handleAddUpdate = () => {
    if (formData.volunteerName && formData.eventName && formData.date && formData.hoursWorked) {
      const newUpdate = {
        id: Date.now(),
        ...formData,
        hoursWorked: parseInt(formData.hoursWorked),
      };
      setUpdates([...updates, newUpdate]);
      setFormData({
        volunteerName: '',
        eventName: '',
        date: '',
        hoursWorked: '',
        status: 'pending'
      });
    }
  };

  const handleDeleteUpdate = (id) => {
    setUpdates(updates.filter(u => u.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    setUpdates(updates.map(u => u.id === id ? { ...u, status: newStatus } : u));
  };

  const filteredUpdates = filterStatus === 'all' ? updates : updates.filter(u => u.status === filterStatus);

  const stats = {
    completed: updates.filter(u => u.status === 'completed').length,
    inProgress: updates.filter(u => u.status === 'in-progress').length,
    pending: updates.filter(u => u.status === 'pending').length,
    totalHours: updates.filter(u => u.status === 'completed').reduce((sum, u) => sum + u.hoursWorked, 0),
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return '#27ae60';
      case 'in-progress':
        return '#f39c12';
      case 'pending':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const upcomingEventsCount = events.filter(event => new Date(event.date) > new Date()).length;

  return (
    <div className="page">
      <h2>Update Sheet - Activity Log</h2>
      
      {/* Upcoming Events Banner */}
      <div style={{ 
        padding: '1rem', 
        marginBottom: '1rem',
        backgroundColor: '#e3f2fd',
        borderRadius: '6px',
        borderLeft: '4px solid #2196f3',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <p style={{ color: '#1565c0', fontWeight: 'bold', margin: 0 }}>
          📅 Upcoming Events: <span style={{ fontSize: '1.2rem', color: '#0d47a1' }}>{upcomingEventsCount}</span>
        </p>
        <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>Total Volunteers: {volunteers.length}</p>
      </div>
      
      {/* Stats Section */}
      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ borderTop: `4px solid #27ae60` }}>
          <h3>Completed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
            {stats.completed}
          </p>
        </div>
        <div className="card" style={{ borderTop: `4px solid #f39c12` }}>
          <h3>In Progress</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>
            {stats.inProgress}
          </p>
        </div>
        <div className="card" style={{ borderTop: `4px solid #e74c3c` }}>
          <h3>Pending</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
            {stats.pending}
          </p>
        </div>
        <div className="card" style={{ borderTop: `4px solid #3498db` }}>
          <h3>Total Hours</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
            {stats.totalHours}
          </p>
        </div>
      </div>

      {/* Add New Update Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Update</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Volunteer Name</label>
            <select
              name="volunteerName"
              value={formData.volunteerName}
              onChange={handleInputChange}
            >
              <option value="">Select a volunteer</option>
              {volunteers.map(vol => (
                <option key={vol._id} value={vol.name}>{vol.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Event Name</label>
            <select
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
            >
              <option value="">Select an event</option>
              {events.map(event => (
                <option key={event._id} value={event.name}>{event.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Hours Worked</label>
            <input
              type="number"
              name="hoursWorked"
              value={formData.hoursWorked}
              onChange={handleInputChange}
              placeholder="Enter hours"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={handleAddUpdate}>Add Update</button>
          <button 
            className="btn-primary" 
            onClick={handleSaveDraft}
            style={{ backgroundColor: '#9b59b6' }}
          >
            Save as Draft
          </button>
        </div>
      </div>

      {/* Draft Display */}
      {draftData && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#fff3cd', borderLeft: '5px solid #ffc107' }}>
          <h3>Draft Saved</h3>
          <p><strong>Volunteer:</strong> {draftData.volunteerName}</p>
          <p><strong>Event:</strong> {draftData.eventName}</p>
          <p><strong>Date:</strong> {draftData.date}</p>
          <p><strong>Hours:</strong> {draftData.hoursWorked}</p>
          <p><strong>Status:</strong> {draftData.status}</p>
          <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>⚠️ This is saved as draft only - not in the table</p>
          <button 
            className="btn-primary" 
            onClick={() => setDraftData(null)}
            style={{ marginTop: '1rem', backgroundColor: '#95a5a6' }}
          >
            Clear Draft
          </button>
        </div>
      )}

      {/* Filter Section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Filter by Status: </label>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="all">All Updates</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Updates Table */}
      <table>
        <thead>
          <tr>
            <th>Volunteer Name</th>
            <th>Event Name</th>
            <th>Date</th>
            <th>Hours Worked</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUpdates.map(update => (
            <tr key={update.id}>
              <td>{update.volunteerName}</td>
              <td>{update.eventName}</td>
              <td>{update.date}</td>
              <td>{update.hoursWorked}</td>
              <td>
                <select
                  value={update.status}
                  onChange={(e) => handleStatusChange(update.id, e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    color: getStatusColor(update.status),
                    fontWeight: 'bold'
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
              <td>
                <button 
                  className="btn-primary" 
                  onClick={() => handleDeleteUpdate(update.id)}
                  style={{ backgroundColor: '#e74c3c' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UpdateSheet;