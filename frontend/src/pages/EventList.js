import React, { useEffect, useState } from 'react';
import { getApprovedEvents } from '../services/events';
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

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getApprovedEvents();
        // Filter out placeholder image URLs from events
        const events = (response.data || []).map(ev => ({
          ...ev,
          image: getSafeImageUrl(ev.image) // Replace placeholder URLs with null
        }));
        setEvents(events);
      } catch (err) {
        console.error('Error loading events:', err);
        setError(err.response?.data?.message || 'Failed to load events');
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Upcoming Events</h2>
        <div className="text-muted">Explore and register for campus events</div>
      </div>

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

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No events available at the moment.</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="row g-4">
          {events.map(ev => (
            <div className="col-md-6 col-lg-4" key={ev._id}>
              <div className="event-card shadow-sm">
                <EventImage image={ev.image} title={ev.title} />
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="mb-1">{ev.title}</h5>
                      <small className="text-muted">{ev.category} • {ev.date ? new Date(ev.date).toLocaleDateString() : 'TBA'}</small>
                    </div>
                    <div>
                      <span className={`badge ${ev.status==='Approved'?'bg-success':'bg-warning'}`}>{ev.status}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-truncate" style={{maxHeight: '3.6em'}}>{ev.description}</p>
                  <div className="d-flex justify-content-start align-items-center">
                    <Link to={`/events/${ev._id}`} className="btn btn-outline-primary btn-sm">View Details</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
