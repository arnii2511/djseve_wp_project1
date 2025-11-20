import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserFromStorage } from '../services/auth';

export default function Navbar() {
  const user = getUserFromStorage();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar shadow-md custom-navbar">
      <div className="container d-flex justify-content-between align-items-center">
        
        {/* Brand */}
        <Link className="navbar-brand fw-bold text-white" to="/">
          DJSEve
        </Link>

        {/* RIGHT SIDE ITEMS */}
        <ul className="navbar-nav d-flex flex-row align-items-center gap-4">

          {/* Committee items */}
          {user && user.role === 'Committee' && (
            <>
              <li className="nav-item">
                <Link className="nav-link text-white nav-hover" to="/committee/request">
                  Request Event
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link text-white nav-hover" to="/committee/upcoming">
                  My Upcoming Events
                </Link>
              </li>
            </>
          )}

          {/* Guest routes */}
          {!user && (
            <>
              <li className="nav-item">
                <Link className="nav-link text-white nav-hover" to="/login">
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link text-white nav-hover" to="/register">
                  Register
                </Link>
              </li>
            </>
          )}

          {/* Logged in */}
          {user && (
            <>
              <li className="nav-item">
                <Link className="nav-link text-white nav-hover" to="/profile">
                  {user.name}
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="nav-link text-white nav-hover"
                  to={`/${user.role.toLowerCase()}`}
                >
                  Dashboard
                </Link>
              </li>

              <li className="nav-item">
                <button className="btn btn-sm logout-btn" onClick={logout}>
                  Logout
                </button>
              </li>
            </>
          )}

        </ul>
      </div>
    </nav>
  );
}
