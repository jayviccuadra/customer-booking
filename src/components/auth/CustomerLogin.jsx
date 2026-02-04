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

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(null);
  
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: 'https://susingrufinpassword.netlify.app/',
      });
      
      if (error) throw error;
      
      setForgotMessage({ 
        type: 'success', 
        text: 'Password recovery link has been sent to your email.' 
      });
      setForgotEmail('');
    } catch (error) {
      setForgotMessage({ 
        type: 'error', 
        text: error.message 
      });
    } finally {
      setForgotLoading(false);
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
    <>
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
            <button 
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setForgotMessage(null);
                setForgotEmail('');
              }}
              className="font-medium text-green-600 hover:text-green-500 bg-transparent border-none cursor-pointer p-0"
            >
              Forgot your password?
            </button>
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
            aria-hidden="true"
            onClick={() => setShowForgotModal(false)}
          ></div>

          {/* Modal panel */}
          <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full z-10">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Reset Password
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    
                    {forgotMessage && (
                      <div className={`mb-4 p-3 rounded-md text-sm ${
                        forgotMessage.type === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {forgotMessage.text}
                      </div>
                    )}

                    {!forgotMessage?.type || forgotMessage.type === 'error' ? (
                      <form id="forgot-form" onSubmit={handleForgotSubmit}>
                        <input
                          type="email"
                          required
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="Enter your email address"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                        />
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {(!forgotMessage?.type || forgotMessage.type === 'error') && (
                <button
                  type="submit"
                  form="forgot-form"
                  disabled={forgotLoading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    forgotLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {forgotLoading ? 'Sending...' : 'Send Link'}
                </button>
              )}
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setShowForgotModal(false)}
              >
                {forgotMessage?.type === 'success' ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerLogin;