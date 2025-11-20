import React, { useEffect, useState } from 'react';
import { getAllEventsAdmin, approveRequest, rejectRequest } from '../services/events';
import { toast } from 'react-toastify';

export default function AdminDashboard(){
  const [data,setData] = useState({requests:[]});
  const [loading,setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  const load = async ()=>{
    setLoading(true);
    setError(null);
    try{
      const r = await getAllEventsAdmin();
      // Ensure we have the correct data structure
      const requests = r.data.requests || [];
      setData({ requests });
      // refresh selected to latest object so history shows updates
      if (selected) {
        const updated = requests.find(x => x._id === selected._id);
        if (updated) setSelected(updated);
        else setSelected(null);
      }
    }catch(err){ 
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
      toast.error(err.response?.data?.message || 'Failed to load event requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); },[]);

  const [note, setNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const onApprove = async (id) => {
    setLoading(true);
    try{ 
      await approveRequest(id, note); 
      toast.success('Request approved successfully');
      await load(); 
      setNote(''); 
      setSelected(null);
    }catch(e){
      console.error(e);
      toast.error(e.response?.data?.message || 'Failed to approve request');
    } finally{setLoading(false)}
  }

  const onReject = async (id) => {
    setLoading(true);
    try{ 
      await rejectRequest(id, note); 
      toast.success('Request rejected');
      await load(); 
      setNote(''); 
      setSelected(null);
    }catch(e){
      console.error(e);
      toast.error(e.response?.data?.message || 'Failed to reject request');
    } finally{setLoading(false)}
  }

  // Sort requests by creation date (newest first), then filter
  const sortedRequests = [...(data.requests || [])].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filtered = sortedRequests.filter(r=>{
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!((r.title||'').toLowerCase().includes(s) || (r.requestedBy?.name||'').toLowerCase().includes(s) || (r.description||'').toLowerCase().includes(s))) return false;
    }
    return true;
  });

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <div className="row mb-3">
        <div className="col-md-6"><div className="card p-3">Pending Requests: {data.requests.filter(x=>x.status==='Pending').length}</div></div>
        <div className="col-md-6"><div className="card p-3 text-end"><a className="btn btn-sm btn-outline-secondary" href="/admin/history">View History / Export</a></div></div>
      </div>

      <div className="admin-outlook card">
        <div className="d-flex">
          <div style={{width:360, borderRight:'1px solid #e9ecef', maxHeight:'70vh', overflowY:'auto'}}>
            <div className="outlook-header d-flex justify-content-between align-items-center p-2 border-bottom">
              <h5 className="mb-0">Event Requests</h5>
              <small className="text-muted">Inbox • {data.requests.length}</small>
            </div>
            <div>
              <div className="p-2 d-flex gap-2 align-items-center">
                <select className="form-select form-select-sm" style={{width:120}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <input className="form-control form-control-sm" placeholder="Search title, requester, description" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
              </div>
              {loading && <div className="p-3 text-center text-muted">Loading...</div>}
              {!loading && error && <div className="p-3 text-center text-danger">{error}</div>}
              {!loading && !error && filtered.length === 0 && (
                <div className="p-3 text-center text-muted">No requests found</div>
              )}
              {!loading && !error && filtered.map(r=> (
                <div key={r._id} className={`outlook-item d-flex align-items-center p-3 border-bottom ${selected && selected._id===r._id ? 'bg-light':''}`} onClick={()=>setSelected(r)} style={{cursor:'pointer'}}>
                  <div className="sender-avatar bg-secondary text-white rounded-circle me-3">{(r.requestedBy?.name||'U').charAt(0)}</div>
                  <div style={{flex:1}}>
                    <div className="d-flex justify-content-between">
                      <strong>{r.title}</strong>
                      <small className="text-muted">{new Date(r.createdAt).toLocaleString()}</small>
                    </div>
                    <div className="text-muted small">{r.requestedBy?.name} • <span className={`badge ${r.status==='Pending'?'bg-warning':r.status==='Approved'?'bg-success':'bg-danger'}`}>{r.status}</span></div>
                    <div className="text-truncate mt-1" style={{maxWidth:260}}>{r.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{flex:1, padding:18, maxHeight:'70vh', overflowY:'auto'}}>
            {!selected && (
              <div className="text-center text-muted">Select a request to view details</div>
            )}
            {selected && (
              <div>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h4 className="mb-1">{selected.title}</h4>
                    <div className="text-muted small">From: {selected.requestedBy?.name} • {selected.requestedBy?.email}</div>
                    <div className="text-muted small">Requested: {new Date(selected.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    {selected.status === 'Pending' && (
                      <div className="mb-2">
                        <button className="btn btn-success btn-sm me-2" onClick={()=>onApprove(selected._id)} disabled={loading}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>onReject(selected._id)} disabled={loading}>Reject</button>
                      </div>
                    )}
                    <div className="small">
                      <span className={`badge ${selected.status==='Pending'?'bg-warning':selected.status==='Approved'?'bg-success':'bg-danger'}`}>{selected.status}</span>
                    </div>
                  </div>
                </div>
                <hr />
                <p>{selected.description}</p>
                {selected.timeline && selected.timeline.length>0 && (
                  <ul>
                    {selected.timeline.map((t,i)=>(<li key={i}><strong>{t.time}</strong> — {t.activity}</li>))}
                  </ul>
                )}
                <div className="mt-3">
                  <label className="form-label">Reason / Note (optional)</label>
                  <textarea className="form-control mb-2" value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a short reason or note for approval/rejection" />
                  <h6 className="mt-2">History</h6>
                  <div>
                    {(selected.statusLogs || []).slice().reverse().map((log, idx)=> (
                      <div key={idx} className="mb-2">
                        <div><strong>{log.status}</strong> — <span className="text-muted">{log.by?.name || 'System'}</span></div>
                        <div className="text-muted small">{new Date(log.at).toLocaleString()}</div>
                        {log.note && <div className="mt-1">{log.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
