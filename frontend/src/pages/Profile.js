import React, { useEffect, useState } from 'react';
import { getUserFromStorage } from '../services/auth';
import { getMyRegistrations } from '../services/registrations';

export default function Profile(){
  const user = getUserFromStorage();
  const [regs, setRegs] = useState([]);

  useEffect(()=>{
    getMyRegistrations().then(r=> {
      const list = (r.data || []).filter(x=> x.eventId && new Date(x.eventId.date) >= new Date());
      list.sort((a,b)=> new Date(a.eventId.date) - new Date(b.eventId.date));
      setRegs(list);
    }).catch(console.error);
  },[]);

  if(!user) return <div className="container mt-4">Please login</div>;

  return (
    <div className="container mt-4">
      <h2>Profile</h2>
      <div className="card p-3 mb-3">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <h4>My Upcoming Events</h4>
      {regs.length===0 && <p>No upcoming registrations.</p>}
      {regs.map(r=> (
        <div key={r._id} className="card mb-2 p-2">
          <h5>{r.eventId?.title} <small className="text-muted">({new Date(r.eventId?.date).toLocaleDateString()})</small></h5>
          <p>{r.eventId?.description}</p>
        </div>
      ))}
    </div>
  )
}
