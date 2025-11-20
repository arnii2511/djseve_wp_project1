// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Landing from './pages/Landing';
// import AdminDashboard from './pages/AdminDashboard';
// import AdminHistory from './pages/AdminHistory';
// import CommitteeDashboard from './pages/CommitteeDashboard';
// import CommitteeUpcoming from './pages/CommitteeUpcoming';
// import UserDashboard from './pages/UserDashboard';
// import EventList from './pages/EventList';
// import EventDetails from './pages/EventDetails';
// import EventApply from './pages/EventApply';
// import RequestEvent from './pages/RequestEvent';
// import Profile from './pages/Profile';
// import { getToken, getUserFromStorage } from './services/auth';
// import Navbar from './components/Navbar';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const ProtectedRoute = ({ children, roles }) => {
//   const token = getToken();
//   const user = getUserFromStorage();
//   if (!token) return <Navigate to="/login" replace />;
//   if (roles && roles.length && !roles.includes(user?.role)) return <Navigate to="/login" replace />;
//   return children;
// };

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Navbar />
//       <ToastContainer position="top-right" />
//       <Routes>
//         <Route path="/" element={<Landing />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         <Route
//           path="/admin/*"
//           element={<ProtectedRoute roles={["Admin"]}><AdminDashboard /></ProtectedRoute>}
//         />
//         <Route path="/admin/history" element={<ProtectedRoute roles={["Admin"]}><AdminHistory /></ProtectedRoute>} />
//         <Route
//           path="/committee/*"
//           element={<ProtectedRoute roles={["Committee"]}><CommitteeDashboard /></ProtectedRoute>}
//         />
//         <Route path="/committee/request" element={<ProtectedRoute roles={["Committee"]}><RequestEvent /></ProtectedRoute>} />
//         <Route path="/committee/upcoming" element={<ProtectedRoute roles={["Committee"]}><CommitteeUpcoming /></ProtectedRoute>} />
//         <Route path="/committee/request/:id/edit" element={<ProtectedRoute roles={["Committee"]}><RequestEvent /></ProtectedRoute>} />
//         <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
//         <Route
//           path="/user/*"
//           element={<ProtectedRoute roles={["User"]}><UserDashboard /></ProtectedRoute>}
//         />

//         <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
//         <Route path="/events/:id/apply" element={<ProtectedRoute><EventApply /></ProtectedRoute>} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import AdminHistory from './pages/AdminHistory';
import CommitteeDashboard from './pages/CommitteeDashboard';
import CommitteeUpcoming from './pages/CommitteeUpcoming';
import UserDashboard from './pages/UserDashboard';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import EventApply from './pages/EventApply';
import RequestEvent from './pages/RequestEvent';
import Profile from './pages/Profile';
import { getToken, getUserFromStorage } from './services/auth';
import Navbar from './components/Navbar';
import Footer from './components/footer';  // <-- Footer imported
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children, roles }) => {
  const token = getToken();
  const user = getUserFromStorage();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && roles.length && !roles.includes(user?.role)) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <ToastContainer position="top-right" />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin/*"
          element={<ProtectedRoute roles={["Admin"]}><AdminDashboard /></ProtectedRoute>}
        />
        <Route path="/admin/history" element={<ProtectedRoute roles={["Admin"]}><AdminHistory /></ProtectedRoute>} />

        <Route
          path="/committee/*"
          element={<ProtectedRoute roles={["Committee"]}><CommitteeDashboard /></ProtectedRoute>}
        />
        <Route path="/committee/request" element={<ProtectedRoute roles={["Committee"]}><RequestEvent /></ProtectedRoute>} />
        <Route path="/committee/upcoming" element={<ProtectedRoute roles={["Committee"]}><CommitteeUpcoming /></ProtectedRoute>} />
        <Route path="/committee/request/:id/edit" element={<ProtectedRoute roles={["Committee"]}><RequestEvent /></ProtectedRoute>} />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route
          path="/user/*"
          element={<ProtectedRoute roles={["User"]}><UserDashboard /></ProtectedRoute>}
        />

        <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/events/:id/apply" element={<ProtectedRoute><EventApply /></ProtectedRoute>} />
      </Routes>

      {/* Footer Always Visible */}
      <Footer />
    </BrowserRouter>
  );
}
