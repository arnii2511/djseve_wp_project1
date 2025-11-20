import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveToken, saveUser } from '../services/auth';
import { toast } from 'react-toastify';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'User' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(form.email)) errs.email = 'Enter a valid email';
    }
    if (!form.password) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setFieldErrors(errs); return setError('Please fix the marked fields'); }
    setLoading(true);
    try {
      const data = await login(form);
      saveToken(data.token);
      saveUser(data.user);
      // redirect based on role
      if (data.user.role === 'Admin') navigate('/admin');
      else if (data.user.role === 'Committee') navigate('/committee');
      else navigate('/user');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      setError(msg);
    }
    finally { setLoading(false); }
  };

  return (
    <div className="container">
      <form onSubmit={submit} className="gform" style={{maxWidth:520}}>
        <h2>Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`} name="email" value={form.email} onChange={onChange} />
          {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`} name="password" value={form.password} onChange={onChange} />
          {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select name="role" className="form-select" value={form.role} onChange={onChange}>
            <option>Admin</option>
            <option>Committee</option>
            <option>User</option>
          </select>
        </div>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </div>
      </form>
    </div>
  );
}
