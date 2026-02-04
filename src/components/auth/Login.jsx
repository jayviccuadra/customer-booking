import React, { useContext, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import PageLoading from '../PageLoading';
import { UserContext } from '../../context/AuthContext.jsx';
import CustomerLogin from './CustomerLogin';

const Login = () => {
  const {user,loading} = useContext(UserContext)
    if (loading) return <PageLoading />
    if (user) {
      if (user.role === 'Customer') {
        return <Navigate to="/dashboard/customer" replace />
      }
      // If somehow a non-customer logs in here, redirect or show error
      // But for this app, we assume only customers.
      return <Navigate to="/dashboard/customer" replace />
    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
              create a new customer account
            </Link>
          </p>
        </div>

        {/* Render appropriate login form */}
        <CustomerLogin accType='customer'/>
      </div>
    </div>
  );
};

export default Login;