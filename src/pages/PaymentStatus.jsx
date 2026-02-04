import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const isSuccess = status === 'success';

  // Automatically redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard/customer/booking');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          {isSuccess ? (
            <FaCheckCircle className="text-6xl text-green-500 animate-bounce" />
          ) : (
            <FaTimesCircle className="text-6xl text-red-500 animate-pulse" />
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {isSuccess 
            ? 'Thank you for your payment. Your booking has been confirmed.' 
            : 'Something went wrong with your payment. Please try again.'}
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Redirecting to your bookings in a few seconds...
          </p>
          
          <button
            onClick={() => navigate('/dashboard/customer/booking')}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-300 ${
              isSuccess 
                ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                : 'bg-red-600 hover:bg-red-700 shadow-red-200'
            } shadow-lg`}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;