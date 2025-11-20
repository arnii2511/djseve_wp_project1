import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../services/events';
import { registerForEvent } from '../services/registrations';
import { toast } from 'react-toastify';
import { getSafeImageUrl, isPlaceholderUrl } from '../utils/imageUtils';

export default function EventApply(){
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(()=>{
    const loadEvent = async () => {
      setLoading(true);
      try {
        const response = await getEventById(id);
        // Filter out placeholder image URL
        const eventData = {
          ...response.data,
          image: getSafeImageUrl(response.data.image)
        };
        setEvent(eventData);
      } catch (err) {
        console.error('Error loading event:', err);
        toast.error(err.response?.data?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadEvent();
    }
  },[id]);

  if(loading) return <div className="container mt-4"><div className="text-center py-5">Loading...</div></div>;
  if(!event) return <div className="container mt-4"><div className="alert alert-danger">Event not found</div></div>;

  const onRegister = async () => {
    try{
      await registerForEvent(event._id);
      setMsg('Successfully registered for the event.');
      setTimeout(()=> navigate('/profile'), 1200);
    }catch(err){
      setMsg(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card p-3">
            <h3>{event.title}</h3>
            <p className="text-muted">{event.category} • {new Date(event.date).toLocaleString()}</p>
            {(() => {
              const safeImage = getSafeImageUrl(event.image);
              return safeImage ? (
                <img 
                  src={safeImage} 
                  className="img-fluid mb-3" 
                  alt={event.title || 'Event'} 
                  style={{borderRadius: '8px'}}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
              ) : null;
            })()}
            {!getSafeImageUrl(event.image) && (
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
            {getSafeImageUrl(event.image) && (
              <div 
                style={{
                  display: 'none',
                  height: '300px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  marginBottom: '1rem'
                }}
              >
                <div className="text-center">
                  <div style={{fontSize: '4rem', opacity: 0.7}}>📅</div>
                  <p className="mt-2 mb-0">Image failed to load</p>
                </div>
              </div>
            )}
            <h5>About</h5>
            <p>{event.description}</p>
            <h5>Timeline</h5>
            <ul>
              {(event.timeline || []).map((t,i)=>(<li key={i}><strong>{t.time}</strong> — {t.activity}</li>))}
            </ul>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h5>Register / Apply</h5>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p><strong>Time:</strong> {event.time}</p>
            <button className="btn btn-primary w-100" onClick={onRegister}>Register</button>
            {msg && <div className="mt-3 alert alert-info">{msg}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
