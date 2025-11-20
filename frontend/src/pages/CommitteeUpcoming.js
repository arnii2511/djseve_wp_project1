import React, { useEffect, useState } from 'react';
import { getUserFromStorage } from '../services/auth';
import API from '../services/api';
import { Link } from 'react-router-dom';

export default function CommitteeUpcoming(){
  const user = getUserFromStorage();
  const [events, setEvents] = useState([]);

  useEffect(()=>{
    API.get('/events').then(r=>{
      const all = r.data || [];
      const mine = all.filter(e => e.createdBy && user && (e.createdBy === user.id || e.createdBy === user._id));
      mine.sort((a,b)=> new Date(a.date) - new Date(b.date));
      setEvents(mine);
    }).catch(console.error);
  },[]);

  return (
    <div className="container mt-4">
      <h2>My Upcoming Events</h2>
      {events.length === 0 && <div className="card p-3 text-muted">You have no upcoming approved events.</div>}
      <div className="row g-3 mt-2">
        {events.map(ev => (
          <div className="col-md-6" key={ev._id}>
            <div className="card p-3">
              <h5>{ev.title} <small className="text-muted">{new Date(ev.date).toLocaleDateString()}</small></h5>
              <p className="text-muted">{ev.description}</p>
              <Link to={`/events/${ev._id}`} className="btn btn-sm btn-outline-primary">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
