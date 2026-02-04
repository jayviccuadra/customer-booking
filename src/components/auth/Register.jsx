import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { supabase } from '../../supabaseClient';
// import { Api } from '../../utils/Api.js';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    username: '',
    contact: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Fullname validation
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
    }

    // Contact validation
    const contactRegex = /^(09|\+639)\d{9}$/;
    if (!formData.contact) {
      newErrors.contact = 'Contact number is required';
    } else if (!contactRegex.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid Philippine contact number (e.g., 09123456789)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const showSuccessAlert = () => {
    return Swal.fire({
      title: 'Registration Successful!',
      text: 'Please check your email to confirm your account. After confirmation, you can login.',
      icon: 'success',
      confirmButtonText: 'Go to Login',
      confirmButtonColor: '#10B981',
      background: '#ffffff',
      iconColor: '#10B981',
      customClass: {
        title: 'text-xl font-bold text-gray-800',
        confirmButton: 'px-6 py-2 rounded-lg font-medium',
      },
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      }
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Registration Failed',
      text: message,
      icon: 'error',
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#EF4444',
      background: '#ffffff',
      iconColor: '#EF4444',
      customClass: {
        title: 'text-xl font-bold text-gray-800',
        confirmButton: 'px-6 py-2 rounded-lg font-medium',
      },
      buttonsStyling: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare data for API - remove confirmPassword as it's not needed in backend
      const { confirmPassword, ...submitData } = formData;

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert into customers table
        const { error: dbError } = await supabase
          .from('customers')
          .insert([
            {
              auth_id: authData.user.id,
              fullname: formData.fullname,
              email: formData.email,
              username: formData.username,
              contact: formData.contact,
              role: 'Customer'
            }
          ]);

        if (dbError) {
          // If DB insert fails, we might want to clean up the auth user, 
          // but for now let's just throw error
          throw dbError;
        }

        // Show success alert and navigate
        const result = await showSuccessAlert();
        if (result.isConfirmed) {
          navigate('/login');
        }
      }

    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.message) {
        if (error.message.includes('already registered')) errorMessage = 'Email is already registered.';
        else errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
      showErrorAlert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "appearance-none rounded relative block w-full px-3 py-3 pl-10 border placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-sm";
    
    if (errors[fieldName]) {
      return `${baseClass} border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50`;
    }
    
    return `${baseClass} border-gray-300 focus:ring-green-500 focus:border-green-500`;
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Create Customer Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                sign in to existing account
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <FaExclamationCircle className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className={`h-5 w-5 ${errors.fullname ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    autoComplete="name"
                    required
                    className={getInputClassName('fullname')}
                    placeholder="Full Name"
                    value={formData.fullname}
                    onChange={handleChange}
                  />
                </div>
                {errors.fullname && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <FaExclamationCircle className="flex-shrink-0" />
                    <span>{errors.fullname}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className={`h-5 w-5 ${errors.email ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={getInputClassName('email')}
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <FaExclamationCircle className="flex-shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className={`h-5 w-5 ${errors.username ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={getInputClassName('username')}
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <FaExclamationCircle className="flex-shrink-0" />
                    <span>{errors.username}</span>
                  </p>
                )}
              </div>

              {/* Contact */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className={`h-5 w-5 ${errors.contact ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="contact"
                    name="contact"
                    type="tel"
                    autoComplete="tel"
                    required
                    className={getInputClassName('contact')}
                    placeholder="Contact Number (e.g., 09123456789)"
                    value={formData.contact}
                    onChange={handleChange}
                  />
                </div>
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <FaExclamationCircle className="flex-shrink-0" />
                    <span>{errors.contact}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`h-5 w-5 ${errors.password ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={getInputClassName('password')}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <FaExclamationCircle className="flex-shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`h-5 w-5 ${errors.confirmPassword ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={getInputClassName('confirmPassword')}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <FaExclamationCircle className="flex-shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="text-green-600 hover:text-green-500">
                  Terms and Conditions
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Customer Account'
                )}
              </button>
            </div>

            
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;