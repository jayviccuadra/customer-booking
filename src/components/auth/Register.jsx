import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { supabase } from '../../supabaseClient';

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
  
  // Terms and Conditions State
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Password Strength State
  const [passwordStrength, setPasswordStrength] = useState('');
  
  // Real-time matching state
  const [passwordsMatch, setPasswordsMatch] = useState(null); // null, true, false

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'terms') {
      setTermsAccepted(checked);
    } else {
      // Prevent spaces in username
      if (name === 'username' && value.includes(' ')) {
        return; // Ignore input if it contains space
      }

      // Restrict contact number to numeric only
      if (name === 'contact') {
        const numericValue = value.replace(/\D/g, ''); // Remove non-numeric chars
        setFormData({
            ...formData,
            [name]: numericValue
        });
        return;
      }

      setFormData({
        ...formData,
        [name]: value
      });

      // Real-time Password Strength
      if (name === 'password') {
        calculatePasswordStrength(value);
        // Also check match if confirm password has value
        if (formData.confirmPassword) {
            setPasswordsMatch(value === formData.confirmPassword);
        }
      }

      // Real-time Confirm Password Match
      if (name === 'confirmPassword') {
        setPasswordsMatch(formData.password === value);
      }
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: ''
        });
      }
    }
  };

  const calculatePasswordStrength = (password) => {
    if (!password) {
        setPasswordStrength('');
        return;
    }
    if (password.length < 6) {
        setPasswordStrength('Bad');
        return;
    }
    
    // Simple strength logic
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasLetters && hasNumbers && hasSpecial && password.length >= 8) {
        setPasswordStrength('Excellent');
    } else if (hasLetters && (hasNumbers || hasSpecial) && password.length >= 6) {
        setPasswordStrength('Good');
    } else {
        setPasswordStrength('Bad');
    }
  };

  const getStrengthColor = () => {
      switch(passwordStrength) {
          case 'Excellent': return 'text-green-600';
          case 'Good': return 'text-yellow-500';
          case 'Bad': return 'text-red-500';
          default: return 'text-gray-400';
      }
  };

  const getStrengthBarColor = () => {
    switch(passwordStrength) {
        case 'Excellent': return 'bg-green-500';
        case 'Good': return 'bg-yellow-400';
        case 'Bad': return 'bg-red-500';
        default: return 'bg-gray-200';
    }
  };

  const getStrengthWidth = () => {
    switch(passwordStrength) {
        case 'Excellent': return 'w-full';
        case 'Good': return 'w-2/3';
        case 'Bad': return 'w-1/3';
        default: return 'w-0';
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

    if (!termsAccepted) {
        setErrors({ general: 'You must agree to the Terms and Conditions' });
        return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Check for Username Uniqueness
      const { data: existingUsername, error: usernameCheckError } = await supabase
        .from('customers')
        .select('username')
        .eq('username', formData.username)
        .maybeSingle();
        
      if (usernameCheckError) throw usernameCheckError;

      if (existingUsername) {
          setErrors({ username: 'Username is already taken' });
          setLoading(false);
          return;
      }

      // Check if email or contact is already banned or exists
      const { data: existingUser, error: checkError } = await supabase
        .from('customers')
        .select('status')
        .or(`email.eq.${formData.email},contact.eq.${formData.contact}`)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing user:', checkError);
      }

      if (existingUser) {
        if (existingUser.status === 'banned') {
           throw new Error('This account has been banned. You cannot register again.');
        }
      }

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
        if (error.message.includes('already registered') || error.message.includes('customers_auth_id_fkey')) {
            errorMessage = 'Email or contact number is already registered.';
        } else {
            errorMessage = error.message;
        }
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
                {/* Space & Uniqueness hint */}
                <p className="mt-1 text-xs text-gray-500">
                    No spaces allowed. Must be unique.
                </p>
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
                {/* Password Strength Meter */}
                {formData.password && (
                    <div className="mt-2">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${getStrengthBarColor()} ${getStrengthWidth()}`}></div>
                        </div>
                        <p className={`text-xs mt-1 font-medium ${getStrengthColor()}`}>
                            Strength: {passwordStrength}
                        </p>
                    </div>
                )}
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
                  
                  {/* Match Indicator Icon */}
                  {formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
                        {passwordsMatch ? (
                            <FaCheckCircle className="text-green-500 h-5 w-5" />
                        ) : (
                            <FaTimesCircle className="text-red-500 h-5 w-5" />
                        )}
                    </div>
                  )}

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
                {/* Match Text Hint */}
                {formData.confirmPassword && (
                    <p className={`mt-1 text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                        {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                )}
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
                checked={termsAccepted}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <button 
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-green-600 hover:text-green-500 underline focus:outline-none"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !termsAccepted}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  loading || !termsAccepted
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

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Terms and Conditions</h3>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
                <p className="italic">Effective Date: {new Date().toLocaleDateString()}</p>
                <p>Welcome to Susing and Rufin's Farm Booking System. By creating an account and booking our venue, you agree to comply with and be bound by the following terms and conditions:</p>

                <section>
                  <h4 className="font-bold text-gray-800 mb-2 text-base">1. Booking and Reservations</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All bookings are subject to availability and confirmation by the management.</li>
                    <li>A booking is considered <strong>Pending</strong> until confirmed by the admin or paid.</li>
                    <li>Users must provide accurate personal information during registration and booking.</li>
                    <li>We reserve the right to reject bookings that conflict with existing schedules or farm policies.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-800 mb-2 text-base">2. Payments</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>We accept <strong>Online Payments</strong> (via PayMongo) and <strong>Cash Payments</strong>.</li>
                    <li>For online transactions, a checkout link will be provided. Bookings remain pending until payment is successful.</li>
                    <li>Cash payments must be settled as per the arrangement with the management.</li>
                    <li>Full payment is required to secure the date and booking status as <strong>Paid/Confirmed</strong>.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-800 mb-2 text-base">3. Cancellations and Refunds</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You may cancel your booking directly from the dashboard if it is not yet rejected or past the event date.</li>
                    <li><strong>Refunds</strong> are only applicable for bookings with a status of <strong>Paid</strong>.</li>
                    <li>To request a refund, use the "Request Refund" button on your booking details page.</li>
                    <li>Refund requests are subject to review and approval by management. Processing times may vary.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-800 mb-2 text-base">4. User Responsibilities</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Users are responsible for maintaining the confidentiality of their account credentials.</li>
                    <li>Any damage to farm property during the event will be charged to the client.</li>
                    <li>Users agree to conduct events in an orderly manner, respecting the venue and staff.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-800 mb-2 text-base">5. Privacy Policy</h4>
                  <p>Your personal information is collected solely for booking and communication purposes. We value your privacy and do not share your data with third parties without consent, except for payment processing partners.</p>
                </section>

                <section>
                  <h4 className="font-bold text-gray-800 mb-2 text-base">6. Amendments</h4>
                  <p>Susing and Rufin's Farm reserves the right to modify these terms at any time. Continued use of the service constitutes acceptance of the new terms.</p>
                </section>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTermsModal(false);
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;