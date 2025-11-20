import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { requestEvent, updateRequest, getRequestById } from '../services/events';
import { toast } from 'react-toastify';

export default function RequestEvent(){
  const { id } = useParams();
  const [form,setForm] = useState({ title:'', description:'', date:'', time:'', venue:'', category:'', image:'', timeline:'', registrationNote: ''});
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    if (id) {
      getRequestById(id).then(r=>{
        const data = r.data;
        setForm({
          title: data.title || '',
          description: data.description || '',
          date: data.date ? new Date(data.date).toISOString().slice(0,10) : '',
          time: data.time || '',
          venue: data.venue || '',
          category: data.category || '',
          image: data.image || '',
          timeline: (data.timeline || []).map(t=>`${t.time} - ${t.activity}`).join('\n'),
          registrationNote: data.registrationNote || ''
        });
      }).catch(err=>{
        toast.error(err.response?.data?.message || 'Failed to load request');
      });
    }
  },[id]);

  const onChange = e => setForm({...form, [e.target.name]: e.target.value});

  const submit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    const errs = {};
    if (!form.title) errs.title = 'Title is required';
    if (!form.date) errs.date = 'Date is required';
    if (Object.keys(errs).length) { setFieldErrors(errs); return toast.error('Please fix the marked fields'); }
    setLoading(true);
    try{
      const timeline = (form.timeline || '').split('\n').map(l => {
        const parts = l.split(' - ');
        return { time: parts[0]?.trim() || '', activity: parts[1]?.trim() || parts[0]?.trim() };
      }).filter(x=>x.activity || x.time);
      if (id) {
        await updateRequest(id, { ...form, timeline });
        toast.success('Request updated successfully');
      } else {
        await requestEvent({ ...form, timeline });
        toast.success('Request submitted successfully');
      }
      setTimeout(()=> navigate('/committee'),1200);
    }catch(err){
      const msg = err.response?.data?.message || 'Failed to submit request';
      toast.error(msg);
    } finally { setLoading(false); }
  }

  return (
    <div className="container">
      <form onSubmit={submit} className="gform request-form">
        <h3>Request Event</h3>
        <div className="mb-3"><label className="form-label">Title</label><input name="title" className={`form-control ${fieldErrors.title ? 'is-invalid':''}`} value={form.title} onChange={onChange} />{fieldErrors.title && <div className="invalid-feedback">{fieldErrors.title}</div>}</div>
        <div className="mb-3"><label className="form-label">Description</label><textarea name="description" className="form-control" value={form.description} onChange={onChange} /></div>
        <div className="row">
          <div className="col-md-4 mb-3"><label className="form-label">Date</label><input type="date" name="date" className={`form-control ${fieldErrors.date ? 'is-invalid':''}`} value={form.date} onChange={onChange} />{fieldErrors.date && <div className="invalid-feedback">{fieldErrors.date}</div>}</div>
          <div className="col-md-4 mb-3"><label className="form-label">Time</label><input type="time" name="time" className="form-control" value={form.time} onChange={onChange} /></div>
          <div className="col-md-4 mb-3"><label className="form-label">Venue</label><input name="venue" className="form-control" value={form.venue} onChange={onChange} /></div>
        </div>
        <div className="mb-3"><label className="form-label">Category</label><input name="category" className="form-control" value={form.category} onChange={onChange} /></div>
        <div className="mb-3"><label className="form-label">Image URL</label><input name="image" className="form-control" value={form.image} onChange={onChange} /></div>
        <div className="mb-3"><label className="form-label">Timeline (one per line, format: "HH:MM - Activity")</label><textarea name="timeline" className="form-control" value={form.timeline} onChange={onChange} /></div>
        <div className="mb-3"><label className="form-label">Registration Note (conditions shown to users before registering)</label><textarea name="registrationNote" className="form-control" value={form.registrationNote} onChange={onChange} /></div>
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Submitting...' : id ? 'Update Request' : 'Submit Request'}</button>
      </form>
    </div>
  )
}
