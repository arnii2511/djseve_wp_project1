import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEventById } from '../services/events';
import { registerForEvent } from '../services/registrations';
import { getUserFromStorage } from '../services/auth';
import { getMyRegistrations } from '../services/registrations';
import { toast } from 'react-toastify';
import { getSafeImageUrl, isPlaceholderUrl } from '../utils/imageUtils';

export default function EventDetails(){
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [msg, setMsg] = useState('');
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = getUserFromStorage();

  useEffect(()=>{
    let cancelled = false;
    
    const loadEvent = async () => {
      setLoading(true);
      setError(null);
      setEvent(null);
      
      if (!id) {
        setError('Invalid event ID');
        setLoading(false);
        return;
      }
      
      try {
        console.log('[EventDetails] Loading event ID:', id);
        const response = await getEventById(id);
        console.log('[EventDetails] Got response:', response);
        
        if (cancelled) return;
        
        const eventData = response?.data;
        
        if (!eventData) {
          console.error('[EventDetails] No data in response');
          setError('Event not found - no data returned');
          setLoading(false);
          return;
        }
        
        if (!eventData._id) {
          console.error('[EventDetails] Missing _id in event data');
          setError('Invalid event data - missing ID');
          setLoading(false);
          return;
        }
        
        const filteredEvent = {
          ...eventData,
          image: getSafeImageUrl(eventData.image)
        };
        
        if (cancelled) return;
        
        setEvent(filteredEvent);
        setLoading(false);
        
      } catch (err) {
        console.error('[EventDetails] Error loading event:', err);
        
        if (cancelled) return;
        
        let errorMsg = 'Failed to load event';
        if (err.response) {
          errorMsg = err.response.data?.message || `Server error: ${err.response.status}`;
        } else if (err.request) {
          errorMsg = 'Cannot connect to server. Is the backend running on http://localhost:5000?';
        } else {
          errorMsg = err.message || 'Failed to load event';
        }
        
        setError(errorMsg);
        setEvent(null);
        setLoading(false);
        toast.error(errorMsg);
      }
    };
    
    loadEvent();
    
    // Check if user already registered
    if (user && id) {
      getMyRegistrations().then(r=>{
        if (!cancelled) {
          const regs = r.data || [];
          if (regs.find(x => x.eventId && x.eventId._id === id)) {
            setRegistered(true);
          }
        }
      }).catch(()=>{});
    }
    
    return () => {
      cancelled = true;
    };
  },[id, user]);

  if(loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading event details...</p>
          <p className="mt-2 text-muted small">If this takes more than 15 seconds, check the browser console for errors</p>
        </div>
      </div>
    );
  }
  
  if(error || !event) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Event Not Found</h4>
          <p>{error || 'The event you are looking for does not exist or is no longer available.'}</p>
        </div>
      </div>
    );
  }

  const onRegister = async ()=>{
    setMsg('');
    if (registered) { setMsg('You are already registered for this event'); return; }
    try{
      await registerForEvent(event._id);
      setMsg('Registered successfully');
      setRegistered(true);
    }catch(err){
      setMsg(err.response?.data?.message || 'Registration failed');
    }
  }

  // Safety check - ensure event is valid
  if (!event || !event._id) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Invalid event data</div>
      </div>
    );
  }

  const safeImage = getSafeImageUrl(event.image);
  
  return (
    <div className="container mt-4">
      <h2>{event.title || 'Event'}</h2>
      {safeImage ? (
        <img 
          src={safeImage} 
          className="img-fluid mb-3" 
          alt={event.title || 'Event'} 
          style={{maxHeight: '400px', objectFit: 'cover', width: '100%', borderRadius: '8px'}}
          onError={(e) => {
            // Replace with gradient background if image fails to load
            e.target.style.display = 'none';
            const fallback = e.target.nextElementSibling;
            if (fallback) fallback.style.display = 'block';
          }}
        />
      ) : (
        <div 
          className="mb-3" 
          style={{
            height: '300px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <div className="text-center">
            <div style={{fontSize: '4rem', opacity: 0.7}}>📅</div>
            <p className="mt-2 mb-0">No image available</p>
          </div>
        </div>
      )}
      {safeImage && (
        <div 
          style={{
            display: 'none',
            height: '300px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <div className="text-center">
            <div style={{fontSize: '4rem', opacity: 0.7}}>📅</div>
            <p className="mt-2 mb-0">Image failed to load</p>
          </div>
        </div>
      )}
      {event.description && (
        <div className="mb-3">
          <p style={{whiteSpace: 'pre-wrap'}}>{event.description}</p>
        </div>
      )}
      {event.registrationNote && (
        <div className="alert alert-warning mb-3">
          <strong>Note:</strong> {event.registrationNote}
        </div>
      )}
      <div className="mb-3">
        {event.date && (
          <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
        )}
        {event.time && (
          <p><strong>Time:</strong> {event.time}</p>
        )}
        {event.venue && (
          <p><strong>Venue:</strong> {event.venue}</p>
        )}
        {event.category && (
          <p><strong>Category:</strong> {event.category}</p>
        )}
      </div>
      {event.timeline && Array.isArray(event.timeline) && event.timeline.length > 0 && (
        <div className="mb-3">
          <h5>Timeline</h5>
          <ul>
            {event.timeline.map((t, i) => (
              <li key={i}><strong>{t.time || 'TBA'}</strong> — {t.activity || 'Activity'}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4">
        <button 
          className="btn btn-primary" 
          onClick={onRegister} 
          disabled={registered || !user}
        >
          {registered ? 'Registered' : 'Register for Event'}
        </button>
        {!user && (
          <p className="text-muted mt-2 small">Please log in to register for this event</p>
        )}
        {msg && <div className="mt-2 alert alert-info">{msg}</div>}
      </div>
    </div>
  )
}
