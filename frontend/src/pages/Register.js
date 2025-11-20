import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import { toast } from 'react-toastify';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'User' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = 'Full name is required';
    if (!form.email?.trim()) errs.email = 'Email is required';
    else {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(form.email)) errs.email = 'Enter a valid email';
    }
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    if (form.role === 'Admin' && !form.adminCode) errs.adminCode = 'Admin code is required for Admin role';
    if (form.role === 'Committee') {
      if (!form.committeeName) errs.committeeName = 'Committee name is required';
      if (!form.department) errs.department = 'Department is required';
      if (!form.idProof) errs.idProof = 'ID proof is required';
    }
    if (form.role === 'User') {
      if (!form.course) errs.course = 'Course is required';
      if (!form.year) errs.year = 'Year is required';
    }
    return errs;
  };

  const submit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const v = validate();
    if (Object.keys(v).length) {
      setFieldErrors(v);
      return setError('Please fix the marked fields');
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role };
      // add role specific fields
      if (form.role === 'Committee') {
        payload.committeeName = form.committeeName;
        payload.department = form.department;
        payload.idProof = form.idProof;
      }
      if (form.role === 'Admin') payload.adminCode = (form.adminCode || '').toString().trim();
      if (form.role === 'User') {
        payload.course = form.course;
        payload.year = form.year;
      }

      await register(payload);
      toast.success('Registration successful — redirecting to login...');
      setSuccess('Registration successful — redirecting to login...');
      setTimeout(() => navigate('/login'), 1400);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={submit} className="gform">
        <h2>Register</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="mb-3">
          <label className="form-label">Full name</label>
          <input className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`} name="name" value={form.name} onChange={onChange} />
          {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`} name="email" value={form.email} onChange={onChange} />
          {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`} name="phone" value={form.phone} onChange={onChange} />
          {fieldErrors.phone && <div className="invalid-feedback">{fieldErrors.phone}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`} name="password" value={form.password} onChange={onChange} />
          {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input type="password" className={`form-control ${fieldErrors.confirm ? 'is-invalid' : ''}`} name="confirm" value={form.confirm} onChange={onChange} />
          {fieldErrors.confirm && <div className="invalid-feedback">{fieldErrors.confirm}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Role</label>
          <select name="role" className={`form-select ${fieldErrors.role ? 'is-invalid' : ''}`} value={form.role} onChange={onChange}>
            <option>Admin</option>
            <option>Committee</option>
            <option>User</option>
          </select>
          {fieldErrors.role && <div className="invalid-feedback">{fieldErrors.role}</div>}
        </div>

        {form.role === 'Committee' && (
          <>
            <div className="mb-3"><label className="form-label">Committee name</label><input className={`form-control ${fieldErrors.committeeName ? 'is-invalid' : ''}`} name="committeeName" onChange={onChange} /><div className="invalid-feedback">{fieldErrors.committeeName}</div></div>
            <div className="mb-3"><label className="form-label">Department</label><input className={`form-control ${fieldErrors.department ? 'is-invalid' : ''}`} name="department" onChange={onChange} /><div className="invalid-feedback">{fieldErrors.department}</div></div>
            <div className="mb-3"><label className="form-label">ID Proof</label><input className={`form-control ${fieldErrors.idProof ? 'is-invalid' : ''}`} name="idProof" onChange={onChange} /><div className="invalid-feedback">{fieldErrors.idProof}</div></div>
          </>
        )}

        {form.role === 'Admin' && (
          <div className="mb-3">
            <label className="form-label">Admin Code</label>
            <input className={`form-control ${fieldErrors.adminCode ? 'is-invalid' : ''}`} name="adminCode" onChange={onChange} />
            {fieldErrors.adminCode && <div className="invalid-feedback">{fieldErrors.adminCode}</div>}
            <div className="form-text hint">Admin code must match the secret configured on the server (case-sensitive). Contact your system administrator to obtain the code.</div>
          </div>
        )}

        {form.role === 'User' && (
          <>
            <div className="mb-3"><label className="form-label">Course</label><input className={`form-control ${fieldErrors.course ? 'is-invalid' : ''}`} name="course" onChange={onChange} /><div className="invalid-feedback">{fieldErrors.course}</div></div>
            <div className="mb-3"><label className="form-label">Year</label><input className={`form-control ${fieldErrors.year ? 'is-invalid' : ''}`} name="year" onChange={onChange} /><div className="invalid-feedback">{fieldErrors.year}</div></div>
          </>
        )}

        <div className="d-flex justify-content-end">
          <button className="btn btn-success" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </div>
      </form>
    </div>
  );
}
