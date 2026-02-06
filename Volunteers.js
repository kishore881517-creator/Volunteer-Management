import React, { useState, useEffect } from 'react';

function Volunteers() {
  const [updates, setUpdates] = useState([]);
  const [events, setEvents] = useState([]);



  const [formData, setFormData] = useState({
    volunteerName: '',
    eventName: '',
    date: '',
    hoursWorked: '',
    status: 'pending'
  });

  const [draftList, setDraftList] = useState([]);

  useEffect(() => {
    fetchEvents();
    fetchUpdates();


    const interval = setInterval(() => {
      fetchEvents();
      fetchUpdates();

    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const fetchUpdates = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5001/api/updates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUpdates(data.map(u => ({ ...u, id: u._id })));
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  };



  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveDraft = () => {
    if (formData.volunteerName && formData.eventName && formData.date && formData.hoursWorked) {
      const draft = {
        draftId: Date.now(),
        ...formData,
        hoursWorked: parseInt(formData.hoursWorked),
      };
      setDraftList([...draftList, draft]);
      setFormData({
        volunteerName: '',
        eventName: '',
        date: '',
        hoursWorked: '',
        status: 'pending'
      });
      alert('✅ Saved as Draft - Changes NOT applied to sheet');
    }
  };

  const handleAddUpdate = async () => {
    if (formData.volunteerName && formData.eventName && formData.date && formData.hoursWorked) {
      let finalStatus = 'pending';
      const selectedEvent = events.find(e => e.name === formData.eventName);

      const inputDate = new Date(formData.date);
      inputDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (inputDate > today) {
        finalStatus = 'pending';
      } else if (selectedEvent && selectedEvent.hoursNeeded && parseInt(formData.hoursWorked) >= parseInt(selectedEvent.hoursNeeded)) {
        finalStatus = 'completed';
      } else if (inputDate.getTime() === today.getTime()) {
        finalStatus = 'in-progress';
      }

      const newUpdate = {
        ...formData,
        status: finalStatus,
        hoursWorked: parseInt(formData.hoursWorked),
      };

      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5001/api/updates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newUpdate)
        });

        if (response.ok) {
          fetchUpdates();
          setFormData({
            volunteerName: '',
            eventName: '',
            date: '',
            hoursWorked: '',
            status: 'pending'
          });
          alert('✅ Update Added to Sheet - Saved to database');
        } else {
          const errorData = await response.json();
          alert(`❌ Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error adding update:', error);
        alert('❌ Network Error');
      }
    }
  };

  const handleDeleteUpdate = async (id) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`http://localhost:5001/api/updates/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchUpdates();
          alert('✅ Update Deleted');
        } else {
          alert('❌ Failed to delete update');
        }
      } catch (error) {
        console.error('Error deleting update:', error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5001/api/updates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchUpdates();
      } else {
        alert('❌ Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEventChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, eventName: value });

    const selectedEvent = events.find(event => event.name === value);
    if (selectedEvent) {
      const eventDate = selectedEvent.date ? new Date(selectedEvent.date).toISOString().split('T')[0] : '';
      setFormData(prev => ({
        ...prev,
        eventName: value,
        date: eventDate,
        hoursWorked: selectedEvent.hoursNeeded ? selectedEvent.hoursNeeded.toString() : ''
      }));
    }
  };

  const handleRemoveDraft = (draftId) => {
    setDraftList(draftList.filter(d => d.draftId !== draftId));
  };

  const stats = {
    completed: updates.filter(u => u.status === 'completed').length,
    inProgress: updates.filter(u => u.status === 'in-progress').length,
    pending: updates.filter(u => u.status === 'pending').length,
    totalHours: updates.filter(u => u.status === 'completed').reduce((sum, u) => sum + u.hoursWorked, 0),
  };

  const getStatusColor = (status) => {
    switch (status) {
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

  return (
    <div className="page">
      <h2>Volunteer</h2>
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
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c', margin: '0.5rem 0' }}>
            {stats.pending}
          </p>
          <div style={{ fontSize: '0.85rem', color: '#555', maxHeight: '100px', overflowY: 'auto' }}>
            {[...new Set(updates.filter(u => u.status === 'pending').map(u => u.eventName))].map(ename => (
              <div key={ename} style={{ marginTop: '2px' }}>• {ename}</div>
            ))}
          </div>
        </div>
        <div className="card" style={{ borderTop: `4px solid #3498db` }}>
          <h3>Total Hours</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
            {stats.totalHours}
          </p>
        </div>

      </div>



      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Update</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label>Volunteer Name</label>
            <input
              type="text"
              name="volunteerName"
              value={formData.volunteerName}
              onChange={handleInputChange}
              placeholder="Enter volunteer name"
            />
          </div>
          <div className="form-group">
            <label>Event Name</label>
            <select
              name="eventName"
              value={formData.eventName}
              onChange={handleEventChange}
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
        </div>

        {formData.eventName && events.find(e => e.name === formData.eventName) && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#e3f2fd',
            borderLeft: '4px solid #2196f3',
            borderRadius: '4px'
          }}>
            <p style={{ margin: 0, color: '#1565c0', fontWeight: 'bold' }}>
              📋 Event: <strong>{formData.eventName}</strong>
            </p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
              🤝 Volunteers Needed: <strong>{events.find(e => e.name === formData.eventName)?.volunteersNeeded || 0}</strong>
            </p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
              🕛 HoursNeeded: <strong>{events.find(e => e.name === formData.eventName)?.hoursNeeded || 0}</strong>
            </p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
              📅 Date: <strong>{events.find(e => e.name === formData.eventName)?.date ? formatDate(events.find(e => e.name === formData.eventName).date) : 'N/A'}</strong>
            </p>
          </div>
        )}

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleAddUpdate} style={{ backgroundColor: '#27ae60' }}>
            ✓ Add Update to Sheet
          </button>
          <button
            className="btn-primary"
            onClick={handleSaveDraft}
            style={{ backgroundColor: '#9b59b6' }}
          >
            📝 Save as Draft Only
          </button>
        </div>
      </div>

      {draftList.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#fff3cd', borderLeft: '5px solid #ffc107' }}>
          <h3>📋 Saved Drafts ({draftList.length})</h3>
          <p style={{ color: '#e74c3c', fontWeight: 'bold', marginBottom: '1rem' }}>
            ⚠️ These are drafts only - NOT in the update sheet yet
          </p>

          {draftList.map(draft => (
            <div key={draft.draftId} style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#fff9e6',
              borderRadius: '6px',
              border: '1px solid #ffc107'
            }}>
              <p><strong>Volunteer:</strong> {draft.volunteerName}</p>
              <p><strong>Event:</strong> {draft.eventName}</p>
              <p><strong>Date:</strong> {draft.date}</p>
              <p><strong>Hours:</strong> {draft.hoursWorked}</p>
              <p><strong>Status:</strong> {draft.status}</p>
              <button
                className="btn-primary"
                onClick={() => handleRemoveDraft(draft.draftId)}
                style={{ marginTop: '0.5rem', backgroundColor: '#e74c3c' }}
              >
                🗑️ Remove Draft
              </button>
            </div>
          ))}
        </div>
      )}

      {updates.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          color: '#666'
        }}>
          <p>No updates yet. Click "Add Update to Sheet" to get started!</p>
        </div>
      ) : (
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
            {updates.map(update => (
              <tr key={update.id}>
                <td>{update.volunteerName}</td>
                <td>{update.eventName}</td>
                <td>{formatDate(update.date)}</td>
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
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}




    </div>
  );
}

export default Volunteers;
