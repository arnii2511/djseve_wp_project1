import React, { useEffect, useState } from 'react';
import { getApprovedEvents } from '../services/events';
import { getMyRegistrations, registerForEvent } from '../services/registrations';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSafeImageUrl, isPlaceholderUrl } from '../utils/imageUtils';

function EventImage({ image, title }) {
  const [imageError, setImageError] = useState(false);
  const safeImage = getSafeImageUrl(image);
  
  // Never render if it's a placeholder or invalid
  if (!safeImage || imageError) {
    return (
      <div 
        className="event-image" 
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="text-white text-center p-3" style={{fontSize: '3rem', opacity: 0.7}}>
          📅
        </div>
      </div>
    );
  }
  
  // Double-check: never render if it's still a placeholder (safety check)
  if (!safeImage || isPlaceholderUrl(safeImage)) {
    return (
      <div 
        className="event-image" 
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="text-white text-center p-3" style={{fontSize: '3rem', opacity: 0.7}}>
          📅
        </div>
      </div>
    );
  }
  
  return (
    <div className="event-image" style={{minHeight: '200px', overflow: 'hidden'}}>
      <img 
        src={safeImage} 
        alt={title || 'Event'} 
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          display: 'block'
        }}
        onError={() => setImageError(true)}
      />
    </div>
  );
}

export default function UserDashboard() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'registrations'
  const [registering, setRegistering] = useState({}); // Track which events are being registered

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load events
      const eventsResponse = await getApprovedEvents();
      // Filter out placeholder image URLs from events
      const events = (eventsResponse.data || []).map(ev => ({
        ...ev,
        image: getSafeImageUrl(ev.image) // Replace placeholder URLs with null
      }));
      setEvents(events);
      
      // Load registrations
      const regsResponse = await getMyRegistrations();
      const regs = (regsResponse.data || []).filter(x => x.eventId).map(reg => ({
        ...reg,
        eventId: reg.eventId ? {
          ...reg.eventId,
          image: getSafeImageUrl(reg.eventId.image) // Filter placeholder URLs
        } : reg.eventId
      }));
      // Sort by event date
      regs.sort((a, b) => {
        const dateA = a.eventId?.date ? new Date(a.eventId.date) : new Date(0);
        const dateB = b.eventId?.date ? new Date(b.eventId.date) : new Date(0);
        return dateA - dateB;
      });
      setRegistrations(regs);
    } catch (err) {
      console.error('Error loading data:', err);
      let errorMsg = 'Failed to load data';
      if (err.response) {
        errorMsg = err.response.data?.message || `Error ${err.response.status}`;
      } else if (err.request) {
        errorMsg = 'Network error - please check your connection';
      } else {
        errorMsg = err.message || 'Failed to load events and registrations';
      }
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check if event is already registered
  const isRegistered = (eventId) => {
    return registrations.some(reg => reg.eventId && reg.eventId._id === eventId);
  };

  // Handle registration
  const handleRegister = async (eventId) => {
    if (isRegistered(eventId)) {
      toast.info('You are already registered for this event');
      return;
    }

    setRegistering(prev => ({ ...prev, [eventId]: true }));
    try {
      await registerForEvent(eventId);
      toast.success('Successfully registered for the event!');
      // Reload data to update registrations
      await loadData();
      // Switch to registrations tab to show the newly registered event
      setActiveTab('registrations');
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
    } finally {
      setRegistering(prev => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <div className="container mt-4">
      <h2>User Dashboard</h2>
      
      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Available Events ({events.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            My Registrations ({registrations.length})
          </button>
        </li>
      </ul>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Events Tab */}
      {!loading && !error && activeTab === 'events' && (
        <>
          {events.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No events available at the moment.</p>
            </div>
          ) : (
            <div className="row g-4">
              {events.map(ev => {
                const registered = isRegistered(ev._id);
                const isRegistering = registering[ev._id];
                return (
                  <div className="col-md-6 col-lg-4" key={ev._id}>
                    <div className="event-card shadow-sm h-100 d-flex flex-column">
                      <EventImage image={ev.image} title={ev.title} />
                      <div className="p-3 d-flex flex-column flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="flex-grow-1">
                            <h5 className="mb-1">{ev.title}</h5>
                            <small className="text-muted d-block">{ev.category}</small>
                          </div>
                          <div>
                            <span className="badge bg-success">Approved</span>
                          </div>
                        </div>
                        
                        {/* Full Description */}
                        <div className="mb-2 flex-grow-1">
                          <p className="mb-1" style={{fontSize: '0.9rem', lineHeight: '1.5'}}>{ev.description}</p>
                        </div>

                        {/* Event Details */}
                        <div className="mb-2 small text-muted">
                          {ev.date && (
                            <div><strong>Date:</strong> {new Date(ev.date).toLocaleDateString()}</div>
                          )}
                          {ev.time && (
                            <div><strong>Time:</strong> {ev.time}</div>
                          )}
                          {ev.venue && (
                            <div><strong>Venue:</strong> {ev.venue}</div>
                          )}
                        </div>

                        {/* Timeline */}
                        {ev.timeline && Array.isArray(ev.timeline) && ev.timeline.length > 0 && (
                          <div className="mb-2 small">
                            <strong>Timeline:</strong>
                            <ul className="mb-0" style={{paddingLeft: '1.2rem', fontSize: '0.85rem'}}>
                              {ev.timeline.slice(0, 3).map((t, i) => (
                                <li key={i}><strong>{t.time || 'TBA'}</strong> — {t.activity || 'Activity'}</li>
                              ))}
                              {ev.timeline.length > 3 && <li className="text-muted">+{ev.timeline.length - 3} more</li>}
                            </ul>
                          </div>
                        )}

                        {/* Registration Note */}
                        {ev.registrationNote && (
                          <div className="alert alert-warning py-2 px-2 mb-2" style={{fontSize: '0.85rem'}}>
                            <strong>Note:</strong> {ev.registrationNote}
                          </div>
                        )}

                        {/* Register Button */}
                        <div className="mt-auto">
                          {registered ? (
                            <button className="btn btn-success btn-sm w-100" disabled>
                              ✓ Registered
                            </button>
                          ) : (
                            <button 
                              className="btn btn-primary btn-sm w-100" 
                              onClick={() => handleRegister(ev._id)}
                              disabled={isRegistering}
                            >
                              {isRegistering ? 'Registering...' : 'Register for Event'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Registrations Tab */}
      {!loading && !error && activeTab === 'registrations' && (
        <>
          {registrations.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">You haven't registered for any events yet.</p>
              <Link to="/user" className="btn btn-primary mt-2" onClick={() => setActiveTab('events')}>
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {registrations.map(reg => {
                const ev = reg.eventId;
                if (!ev) return null;
                return (
                  <div className="col-md-6 col-lg-4" key={reg._id}>
                    <div className="event-card shadow-sm">
                      <EventImage image={ev.image} title={ev.title} />
                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="mb-1">{ev.title}</h5>
                            <small className="text-muted">
                              {ev.category} • {ev.date ? new Date(ev.date).toLocaleDateString() : 'TBA'}
                            </small>
                          </div>
                          <div>
                            <span className="badge bg-info">Registered</span>
                          </div>
                        </div>
                        <div className="mb-2">
                          <p className="mb-1" style={{fontSize: '0.9rem', lineHeight: '1.5'}}>{ev.description}</p>
                        </div>

                        {/* Event Details */}
                        <div className="mb-2 small text-muted">
                          {ev.date && (
                            <div><strong>Date:</strong> {new Date(ev.date).toLocaleDateString()}</div>
                          )}
                          {ev.time && (
                            <div><strong>Time:</strong> {ev.time}</div>
                          )}
                          {ev.venue && (
                            <div><strong>Venue:</strong> {ev.venue}</div>
                          )}
                        </div>

                        {/* Timeline */}
                        {ev.timeline && Array.isArray(ev.timeline) && ev.timeline.length > 0 && (
                          <div className="mb-2 small">
                            <strong>Timeline:</strong>
                            <ul className="mb-0" style={{paddingLeft: '1.2rem', fontSize: '0.85rem'}}>
                              {ev.timeline.slice(0, 3).map((t, i) => (
                                <li key={i}><strong>{t.time || 'TBA'}</strong> — {t.activity || 'Activity'}</li>
                              ))}
                              {ev.timeline.length > 3 && <li className="text-muted">+{ev.timeline.length - 3} more</li>}
                            </ul>
                          </div>
                        )}

                        {/* Registration Note */}
                        {ev.registrationNote && (
                          <div className="alert alert-warning py-2 px-2 mb-2" style={{fontSize: '0.85rem'}}>
                            <strong>Note:</strong> {ev.registrationNote}
                          </div>
                        )}

                        <div className="mt-2">
                          <small className="text-muted">
                            Registered on: {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : 'N/A'}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
