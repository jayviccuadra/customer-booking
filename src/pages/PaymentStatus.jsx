import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { supabase } from '../supabaseClient';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const isSuccess = status === 'success';

  // Handle DB Update on Success (Fallback for missing backend webhook)
  useEffect(() => {
    const updatePaymentStatus = async () => {
      const bookingId = localStorage.getItem('pending_payment_booking_id');
      
      // Notify other tabs about payment completion immediately
      const channel = new BroadcastChannel('payment_channel');
      channel.postMessage({ 
        type: 'PAYMENT_COMPLETE', 
        status: isSuccess ? 'success' : 'failed',
        bookingId 
      });

      if (isSuccess && bookingId) {
        console.log('Updating payment status for booking:', bookingId);
        try {
          const { error } = await supabase
            .from('bookings')
            .update({ payment_status: 'Paid', status: 'Confirmed' })
            .eq('id', bookingId);
          
          if (error) {
             console.error('Error updating payment status:', error);
          } else {
             console.log('Payment status updated to Paid');
             localStorage.removeItem('pending_payment_booking_id');
             
             // Send another success message after DB update just in case
             channel.postMessage({ type: 'PAYMENT_UPDATED', bookingId });
          }
        } catch (err) {
          console.error('Unexpected error updating payment status:', err);
        }
      }
    };
    
    updatePaymentStatus();
  }, [isSuccess]);

  // Automatically redirect after 5 seconds
  useEffect(() => {
    // Only redirect automatically if success to allow user to read error message if failed
    if (isSuccess) {
      const timer = setTimeout(() => {
        const channel = new BroadcastChannel('payment_channel');
        channel.postMessage({ type: 'FOCUS_TAB' });
        
        window.close(); // Try to close the tab first
        // If script can't close it (security restriction), show message or navigate
        // navigate('/dashboard/customer/booking'); 
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [navigate, isSuccess]);

  const handleClose = () => {
    const channel = new BroadcastChannel('payment_channel');
    channel.postMessage({ type: 'FOCUS_TAB' });
    
    window.close();
    // If window.close() fails (e.g. not opened by script), fallback to navigate
    if (!window.closed) {
        navigate('/dashboard/customer/booking');
    }
  };

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
            ? 'Thank you for your payment. Your booking has been confirmed. You can close this tab now.' 
            : 'Something went wrong with your payment. Please try again.'}
        </p>

        <div className="space-y-4">
          <button
            onClick={handleClose}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-300 ${
              isSuccess 
                ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                : 'bg-red-600 hover:bg-red-700 shadow-red-200'
            } shadow-lg`}
          >
            {isSuccess ? 'Close Tab' : 'Return to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;