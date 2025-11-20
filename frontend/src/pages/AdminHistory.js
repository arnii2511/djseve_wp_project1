import React, { useEffect, useState } from 'react';
import { getAllEventsAdmin } from '../services/events';

function toCSV(rows) {
  if (!rows || !rows.length) return '';
  const keys = Object.keys(rows[0]);
  const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  return [keys.join(',')].concat(rows.map(r => keys.map(k => esc(r[k])).join(','))).join('\n');
}

export default function AdminHistory(){
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [q, setQ] = useState('');

  useEffect(()=>{
    getAllEventsAdmin().then(r=>{
      const requests = r.data.requests || [];
      // flatten statusLogs
      const rows = [];
      requests.forEach(req => {
        (req.statusLogs || []).forEach(log => {
          rows.push({
            requestId: req._id,
            title: req.title,
            requestByName: req.requestedBy?.name || '',
            requestByEmail: req.requestedBy?.email || '',
            status: log.status,
            actedByName: log.by?.name || 'System',
            actedByEmail: log.by?.email || '',
            at: log.at ? new Date(log.at).toLocaleString() : '',
            note: log.note || '',
          });
        });
      });
      setData(rows);
      setFiltered(rows);
    }).catch(console.error);
  },[]);

  useEffect(()=>{
    if (!q) return setFiltered(data);
    const s = q.toLowerCase();
    setFiltered(data.filter(r=> Object.values(r).join(' ').toLowerCase().includes(s)));
  },[q,data]);

  const exportCsv = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-requests-history-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Requests History</h3>
        <div>
          <input className="form-control form-control-sm d-inline-block me-2" style={{width:300}} placeholder="Search history..." value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn btn-outline-primary btn-sm" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      <div className="card p-2">
        <div style={{overflowX:'auto'}}>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>When</th>
                <th>Request Title</th>
                <th>Request By</th>
                <th>Status</th>
                <th>Actioned By</th>
                <th>Note</th>
                <th>Request ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r,i)=> (
                <tr key={i}>
                  <td>{r.at}</td>
                  <td>{r.title}</td>
                  <td>{r.requestByName} ({r.requestByEmail})</td>
                  <td>{r.status}</td>
                  <td>{r.actedByName} ({r.actedByEmail})</td>
                  <td style={{maxWidth:300}}>{r.note}</td>
                  <td>{r.requestId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
