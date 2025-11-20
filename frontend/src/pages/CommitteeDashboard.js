import React, { useEffect, useState, useRef } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';

const POLL_INTERVAL = 8000;

export default function CommitteeDashboard(){
  const [requests,setRequests] = useState([]);
  const prevRef = useRef({});
  const timerRef = useRef(null);

  const fetchRequests = async () => {
    try{
      const r = await API.get('/events/all');
      const list = r.data.requests || [];

      // detect changes compared to prev
      const prev = prevRef.current || {};
      list.forEach(item => {
        const prevItem = prev[item._id];
        if (prevItem && prevItem.status !== item.status) {
          toast.info(`Your request "${item.title}" is now ${item.status}`);
        }
      });

      // update refs and state
      const map = {};
      list.forEach(i=> map[i._id] = i);
      prevRef.current = map;
      setRequests(list);
    }catch(err){ console.error(err); }
  }

  useEffect(()=>{
    // initial load
    fetchRequests();
    // start polling
    timerRef.current = setInterval(fetchRequests, POLL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  },[]);

  const manualRefresh = () => fetchRequests();

  return (
    <div className="container mt-4">
      <h2>Committee Dashboard</h2>
      <p>Request an Event from the <a href="/committee/request">Request Event</a> page.</p>
      <h4 className="mt-3">My Requests</h4>
      {requests.length === 0 && (
        <div className="card p-3 mb-2 text-muted">No requests yet. Use the Request Event page to submit a new event.</div>
      )}
      {requests.map(req=> (
        <div key={req._id} className="committee-item card mb-3 p-3">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="mb-1">{req.title}</h5>
            <span className={`badge ${req.status==='Pending'?'bg-warning': req.status==='Approved'?'bg-success':'bg-danger'}`}>{req.status}</span>
          </div>
          {req.timeline && req.timeline.length > 0 && (
            <small className="text-muted">Timeline: {req.timeline.map(t=>t.activity).join(' • ')}</small>
          )}
          <p className="mt-2 mb-0">{req.description}</p>
          <div className="mt-2">
            {req.status === 'Pending' && <a className="btn btn-sm btn-outline-primary me-2" href={`/committee/request/${req._id}/edit`}>Edit</a>}
            {req.status === 'Pending' && <button className="btn btn-sm btn-outline-secondary" disabled>Withdraw</button>}
          </div>
        </div>
      ))}
    </div>
  )
}
