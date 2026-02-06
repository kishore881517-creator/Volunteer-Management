import React, { useState, useEffect } from 'react';

function Events() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ name: '', date: '', location: '', volunteers: '', hours: 0 });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
   // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Clear error after 5 seconds
  // useEffect(() => {
  //   if (error) {
  //     const timer = setTimeout(() => setError(''), 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [error]);

  // Load events from backend on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-refresh events every 5 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchEvents(); 
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
      setError('');
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events from server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddEvent = () => {
    if (!localStorage.getItem('adminToken')) {
      setError('You must be logged in as an admin to create or edit events.');
      return;
    }
    if (formData.name && formData.date && formData.location && formData.volunteers) {
      if (editingId) {
        // Update existing event
        updateEventOnBackend(editingId);
      } else {
        // Add new event
        createEventOnBackend();
      }
    } else {
      setError('Please fill in all required fields: Event Name, Date, Location, and Volunteers Needed');
    }
  };

  const createEventOnBackend = async () => {
    try {
      const hoursValue = formData.hours ? parseInt(formData.hours) : 0;
      const response = await fetch('http://localhost:5001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({
          name: formData.name,
          date: new Date(formData.date).toISOString(),
          location: formData.location,
          volunteersNeeded: parseInt(formData.volunteers),
          hoursNeeded: hoursValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const newEvent = await response.json();
      setEvents([...events, newEvent]);
      setFormData({ name: '', date: '', location: '', volunteers: '', hours: 0 });
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Failed to create event. Make sure you are logged in as admin.');
      console.error('Error creating event:', err);
    }
  };

  const updateEventOnBackend = async (id) => {
    try {
      const hoursValue = formData.hours ? parseInt(formData.hours) : 0;
      const response = await fetch(`http://localhost:5001/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
        body: JSON.stringify({
          name: formData.name,
          date: new Date(formData.date).toISOString(),
          location: formData.location,
          volunteersNeeded: parseInt(formData.volunteers),
          hoursNeeded: hoursValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = await response.json();
      setEvents(events.map(event => event._id === id ? updatedEvent : event));
      setFormData({ name: '', date: '', location: '', volunteers: '', hours: ''});
      setEditingId(null);
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Failed to update event. Make sure you are logged in as admin.');
      console.error('Error updating event:', err);
    }
  };

  const handleEditEvent = (event) => {
    const eventDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
    setFormData({
      name: event.name,
      date: eventDate,
      location: event.location,
      volunteers: event.volunteersNeeded,
      hours: event.hoursNeeded,
    });
    setEditingId(event._id);
    setShowForm(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(events.filter(e => e._id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete event. Admin access required.');
      console.error('Error deleting event:', err);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', date: '', location: '', volunteers: '', hours: ''});
    setEditingId(null);
    setShowForm(false);
  };

  // Calculate upcoming events
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
  const pastEvents = events.filter(event => new Date(event.date) <= new Date());

  return (
    <div className="page">
      <h2>Events Management</h2>

      {/* Stats Section */}
      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ borderTop: `4px solid #3498db` }}>
          <h3>Total Events</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
            {events.length}
          </p>
        </div>
        <div className="card" style={{ borderTop: `4px solid #27ae60` }}>
          <h3>Upcoming Events</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
            {upcomingEvents.length}
          </p>
        </div>
        <div className="card" style={{ borderTop: `4px solid #95a5a6` }}>
          <h3>Past Events</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#95a5a6' }}>
            {pastEvents.length}
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          color: '#e74c3c',
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: '#fadbd8',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#e74c3c',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
          {error.includes('logged in') && (
            <button
              className="btn-primary"
              onClick={() => window.location.reload()} 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: 'fit-content' }}
            >
              Refresh Page
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p>Loading events...</p>
      ) : (
        <>
          {!showForm && (
            <button className="btn-success" onClick={() => setShowForm(true)} style={{ marginBottom: '2rem' }}>
              + Create New Event
            </button>
          )}

          {showForm && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3>{editingId ? 'Edit Event' : 'Create New Event'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Event Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter event name"
                  />
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
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                  />
                </div>
                <div className="form-group">
                  <label>Volunteers Needed</label>
                  <input
                    type="number"
                    name="volunteers"
                    value={formData.volunteers}
                    onChange={handleInputChange}
                    placeholder="Enter number of volunteers needed"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Hours Needed</label>
                  <input
                    type="number"
                    name="hours"
                    value={formData.hours}
                    onChange={handleInputChange}
                    placeholder="Enter total hours needed"
                    min="0"
                  />
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button className="btn-success" onClick={handleAddEvent}>
                  {editingId ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  className="btn-primary"
                  onClick={handleCancel}
                  style={{ backgroundColor: '#95a5a6' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Location</th>
                <th>Volunteers</th>
                <th>Hours</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event._id}>
                  <td>{event.name}</td>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{event.location}</td>
                  <td>{event.volunteersNeeded}</td>
                  <td>{event.hoursNeeded && event.hoursNeeded > 0 ? event.hoursNeeded : '-'}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-primary"
                      onClick={() => handleEditEvent(event)}
                      style={{ backgroundColor: '#f39c12' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleDeleteEvent(event._id)}
                      style={{ backgroundColor: '#e74c3c' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Events;