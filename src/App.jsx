import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Layout from './pages/Layout';
import AuthContext from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/Protected/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerEvents from './pages/CustomerEvents';
import MyBooking from './pages/MyBooking';

function App() {
  return (
    <AuthContext>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          
          {/* Customer Routes */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          >
            <Route path='customer' element={<ProtectedRoute allowedRoles={['Customer']}>
              <CustomerDashboard/>
           </ProtectedRoute>}/>
            <Route path='customer/events' element={<ProtectedRoute allowedRoles={['Customer']}>
              <CustomerEvents/>
           </ProtectedRoute>}/>
            <Route path='customer/booking' element={<ProtectedRoute allowedRoles={['Customer']}>
              <MyBooking/>
           </ProtectedRoute>}/>
             <Route path='settings' element={<ProtectedRoute >
                  <AccountSettings/>
                </ProtectedRoute>}/>
          </Route>
          {/* Customer Dashboard - Only accessible by users with 'Customer' role */}
          {/* <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <div>Customer Dashboard</div>
              </ProtectedRoute>
            } 
          /> */}
          
          {/* Staff Dashboard - Only accessible by users with 'Staff' role */}
          {/* <Route 
            path="/staff/*" 
            element={
              <ProtectedRoute allowedRoles={['Staff']}>
                <div>Staff Dashboard</div>
              </ProtectedRoute>
            } 
          /> */}
        </Routes>
      </Router>
    </AuthContext>
  );
}

export default App;