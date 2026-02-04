import React, { useState, useContext } from 'react'
import { UserContext } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Swal from 'sweetalert2'

const AccountSettings = () => {
  const { user, setUser } = useContext(UserContext)
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    username: user?.username || ''
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // SweetAlert2 success message
  const showSuccessAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonColor: '#10B981',
      confirmButtonText: 'OK',
      timer: 3000,
      timerProgressBar: true
    })
  }

  // SweetAlert2 error message
  const showErrorAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Try Again'
    })
  }

  // SweetAlert2 warning message
  const showWarningAlert = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      confirmButtonColor: '#F59E0B',
      confirmButtonText: 'OK'
    })
  }

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Update admins table
      const { error } = await supabase
        .from('admins')
        .update({
          fullname: profileForm.fullname,
          username: profileForm.username
        })
        .eq('auth_id', user.auth_id)

      if (error) throw error

      // Update local context
      setUser({ ...user, ...profileForm })
      setIsEditing(false)
      
      showSuccessAlert('Profile Updated', 'Your profile information has been successfully updated.')
    } catch (error) {
      console.error('Error updating profile:', error)
      const errorMessage = error.message || 'Failed to update profile information.'
      showErrorAlert('Update Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Calculate password strength
  const getPasswordStrength = (password) => {
    if (!password) return '';
    if (password.length < 6) return 'Bad';
    
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    
    if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) return 'Excellent';
    if (password.length >= 6 && hasLetters && (hasNumbers || hasSpecial)) return 'Good';
    
    return 'Bad';
  }

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Excellent': return 'text-green-600 font-bold';
      case 'Good': return 'text-yellow-600 font-semibold';
      case 'Bad': return 'text-red-600 font-semibold';
      default: return 'text-gray-500';
    }
  }

  const getStrengthWidth = (strength) => {
    switch (strength) {
      case 'Excellent': return '100%';
      case 'Good': return '66%';
      case 'Bad': return '33%';
      default: return '0%';
    }
  }

  const getStrengthBarColor = (strength) => {
    switch (strength) {
      case 'Excellent': return 'bg-green-500';
      case 'Good': return 'bg-yellow-500';
      case 'Bad': return 'bg-red-500';
      default: return 'bg-gray-200';
    }
  }

  // Handle account deletion request
  const handleDeletionRequest = async () => {
    Swal.fire({
      title: 'Request Account Deletion?',
      text: "This action cannot be undone. Your account will be marked for deletion and reviewed by an administrator.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, request deletion'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const { error } = await supabase
            .from('customers')
            .update({ 
              deletion_requested: true,
              deletion_requested_at: new Date().toISOString()
            })
            .eq('auth_id', user.auth_id);

          if (error) throw error;

          showSuccessAlert('Request Sent', 'Your account deletion request has been submitted to the admin.');
        } catch (error) {
          console.error('Error requesting deletion:', error);
          showErrorAlert('Request Failed', 'Failed to submit deletion request. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showErrorAlert('Password Mismatch', 'New passwords do not match!')
      return
    }
    
    const strength = getPasswordStrength(passwordForm.newPassword);
    if (strength === 'Bad') {
      showWarningAlert('Weak Password', 'Please choose a stronger password (at least 6 characters).')
      return
    }

    setLoading(true)
    
    try {
      // 1. Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword
      })

      if (signInError) {
        throw new Error('Incorrect current password. Please try again.')
      }

      // 2. Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (updateError) throw updateError

      showSuccessAlert('Password Updated', 'Your password has been successfully changed.')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error updating password:', error)
      const errorMessage = error.message || 'Failed to update password.'
      showErrorAlert('Update Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 p-6 overflow-y-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>
          Account Settings
        </h1>
        <p className='text-gray-600 mt-2'>
          Manage your account information and security settings
        </p>
      </div>

      <div className='max-w-4xl mx-auto'>
        {/* Tab Navigation */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-6'>
          <div className='flex border-b border-gray-200'>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className='flex items-center justify-center space-x-2'>
                <span>👤</span>
                <span>Profile Information</span>
              </div>
            </button>
            {user?.role !== 'Staff' && (
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                  activeTab === 'password'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className='flex items-center justify-center space-x-2'>
                  <span>🔒</span>
                  <span>Password & Security</span>
                </div>
              </button>
            )}
          </div>

          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-semibold text-gray-800'>Profile Information</h3>
                {!isEditing && user?.role !== 'Staff' && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50'
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Edit Profile'}
                  </button>
                )}
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Profile Picture Section */}
                <div className='lg:col-span-1'>
                  <div className='text-center'>
                    <div className='w-32 h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4'>
                      <span className='text-white font-bold text-4xl'>
                        {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 mb-4'>Profile Picture</p>
                    <button 
                      className='text-blue-600 text-sm font-medium hover:text-blue-700 disabled:opacity-50'
                      disabled={loading}
                    >
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Profile Form Section */}
                <div className='lg:col-span-2'>
                  <form onSubmit={handleProfileUpdate}>
                    <div className='space-y-4'>
                      {/* Fullname Field */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Full Name
                        </label>
                        {isEditing ? (
                          <input
                            type='text'
                            value={profileForm.fullname}
                            onChange={(e) => setProfileForm({...profileForm, fullname: e.target.value})}
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50'
                            placeholder='Enter your full name'
                            disabled={loading}
                            required
                          />
                        ) : (
                          <div className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800'>
                            {user?.fullname || 'Not set'}
                          </div>
                        )}
                      </div>

                      {/* Email Field (Read-only) - Only show for non-Staff */}
                      {user?.role !== 'Staff' && (
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Email Address
                          </label>
                          <div className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 flex items-center justify-between'>
                            <span>{user?.email || 'No email'}</span>
                            <span className='text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded'>Permanent</span>
                          </div>
                          <p className='text-xs text-gray-500 mt-1'>Email address cannot be changed</p>
                        </div>
                      )}

                      {/* Username Field (Read-only) */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Username
                        </label>
                        <div className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 flex items-center justify-between'>
                          <span>@{user?.username || 'username'}</span>
                          <span className='text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded'>Permanent</span>
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>Username cannot be changed</p>
                      </div>

                      {/* Role Field (Read-only) - Replaced with Account Deletion */}
                      {user?.role !== 'Staff' && (
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Account Actions
                          </label>
                          <div className='w-full p-4 bg-red-50 border border-red-200 rounded-lg'>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-red-800 font-medium">Request Account Deletion</h4>
                                <p className="text-red-600 text-sm mt-1">
                                  Want to leave? You can request to have your account and data deleted.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleDeletionRequest}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors shadow-sm"
                                disabled={loading}
                              >
                                Request Deletion
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {isEditing && (
                        <div className='flex space-x-3 pt-4'>
                          <button
                            type='button'
                            onClick={() => {
                              setIsEditing(false)
                              setProfileForm({
                                fullname: user?.fullname || '',
                                email: user?.email || '',
                                username: user?.username || ''
                              })
                            }}
                            className='flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50'
                            disabled={loading}
                          >
                            Cancel
                          </button>
                          <button
                            type='submit'
                            className='flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center'
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab Content */}
          {activeTab === 'password' && (
            <div className='p-6'>
              <h3 className='text-xl font-semibold text-gray-800 mb-6'>Change Password</h3>
              
              <form onSubmit={handlePasswordChange} className='max-w-md'>
                <div className='space-y-4'>
                  {/* Current Password */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Current Password
                    </label>
                    <input
                      type='password'
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50'
                      placeholder='Enter your current password'
                      disabled={loading}
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      New Password
                    </label>
                    <input
                      type='password'
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50'
                      placeholder='Enter new password'
                      disabled={loading}
                    />
                    {passwordForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Password Strength:</span>
                          <span className={`text-xs ${getStrengthColor(getPasswordStrength(passwordForm.newPassword))}`}>
                            {getPasswordStrength(passwordForm.newPassword)}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getStrengthBarColor(getPasswordStrength(passwordForm.newPassword))}`}
                            style={{ width: getStrengthWidth(getPasswordStrength(passwordForm.newPassword)) }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type='password'
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className={`w-full px-4 py-3 border ${
                          passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword 
                            ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
                            : passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-lg disabled:opacity-50`}
                        placeholder='Confirm new password'
                        disabled={loading}
                      />
                      {passwordForm.confirmPassword && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {passwordForm.newPassword === passwordForm.confirmPassword ? (
                            <span className="text-green-600 font-medium">✓ Match</span>
                          ) : (
                            <span className="text-red-600 font-medium">✕ Mismatch</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                    <h4 className='font-medium text-yellow-800 mb-2'>Password Requirements:</h4>
                    <ul className='text-sm text-yellow-700 space-y-1'>
                      <li>• At least 6 characters long</li>
                      <li>• Include letters and numbers</li>
                      <li>• Should not be easily guessable</li>
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className='pt-4'>
                    <button
                      type='submit'
                      className='w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center'
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Changing Password...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountSettings