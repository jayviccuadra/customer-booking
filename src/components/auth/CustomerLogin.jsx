import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
// import { Api } from '../../utils/Api';

const CustomerLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: false,
    password: false,
    message: ''
  });
  
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors[e.target.name] || errors.message) {
      setErrors({
        username: false,
        password: false,
        message: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({
      username: false,
      password: false,
      message: ''
    });
    
    try {
      let emailToLogin = formData.username;

      // Check if input is not an email (simple check)
      if (!formData.username.includes('@')) {
        // Try to find email by username
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('email')
          .eq('username', formData.username)
          .single();

        if (customerError || !customerData) {
          throw new Error('Username not found');
        }
        emailToLogin = customerData.email;
      }

      // Login with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password: formData.password
      });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          throw new Error('Incorrect password');
        }
        throw authError;
      }

      if (authData.user) {
        // Fetch full profile
        const { data: profile, error: profileError } = await supabase
          .from('customers')
          .select('*')
          .eq('auth_id', authData.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Fallback if profile not found (shouldn't happen if registered correctly)
          const fallbackUser = {
            _id: authData.user.id,
            email: authData.user.email,
            role: 'Customer',
            fullname: 'Customer' // Placeholder
          };
          setUser(fallbackUser);
        } else {
           // Check if user is banned
           if (profile.status === 'banned') {
             await supabase.auth.signOut();
             throw new Error('Your account has been banned. Please contact support.');
           }

           // Map Supabase profile to app user structure
           const appUser = {
             _id: profile.id,
             auth_id: profile.auth_id,
             fullname: profile.fullname,
             email: profile.email,
             username: profile.username,
             role: profile.role,
             contact: profile.contact
           };
           setUser(appUser);
        }

        setLoading(false);
        navigate('/dashboard/customer');
      }

    } catch (err) {
      console.log(err);
      let errorState = {
        username: false,
        password: false,
        message: err.message || 'Login failed'
      };

      if (err.message === 'Username not found') {
        errorState.username = true;
        errorState.message = 'Username not found';
      } else if (err.message === 'Incorrect password') {
        errorState.password = true;
        errorState.message = 'Incorrect password';
      } else if (err.message.includes('Invalid login credentials')) {
        errorState.message = 'Invalid email or password';
      } else if (err.message.includes('banned')) {
        errorState.message = err.message;
      }

      setErrors(errorState);
      setLoading(false);
    }
  };

  // Dynamic border color classes based on errors
  const getUsernameBorderClass = () => {
    if (errors.username) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    return 'border-gray-300 focus:ring-green-500 focus:border-green-500';
  };

  const getPasswordBorderClass = () => {
    if (errors.password) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    return 'border-gray-300 focus:ring-green-500 focus:border-green-500';
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="customer-username" className="sr-only">Username</label>
          <input
            id="customer-username"
            name="username"
            type="text"
            required
            className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:z-10 sm:text-sm ${getUsernameBorderClass()}`}
            placeholder="Customer Username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && (
            <div className="mt-1 text-xs text-red-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Username not found
            </div>
          )}
        </div>
        <div>
          <label htmlFor="customer-password" className="sr-only">Password</label>
          <input
            id="customer-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:z-10 sm:text-sm ${getPasswordBorderClass()}`}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <div className="mt-1 text-xs text-red-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Incorrect password
            </div>
          )}
        </div>
      </div>

      {/* Error Message Display */}
      {errors.message && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-600">{errors.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a href="#" className="font-medium text-green-600 hover:text-green-500">
            Forgot your password?
          </a>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </div>
          ) : (
            'Sign in as Customer'
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
            Sign up here
          </Link>
        </p>
      </div>
    </form>
  );
};

export default CustomerLogin;