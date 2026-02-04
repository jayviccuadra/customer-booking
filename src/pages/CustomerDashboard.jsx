import React, { useState, useContext, useEffect } from 'react'
import { UserContext } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { 
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaSearch
} from 'react-icons/fa'

const CustomerDashboard = () => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchTerm, setSearchTerm] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Handle Payment Status from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    
    if (status === 'success') {
      alert('Payment Successful! Your booking is now confirmed.');
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      // Optional: Trigger a re-fetch of bookings if needed, though the user effect dependency on 'user' might handle initial load.
      // Since we don't have a direct fetch function exposed here easily without prop drilling or refactoring, 
      // the user will see the updated status on next load or if we force a refresh.
      // Ideally, we could toggle a refresh trigger state.
    } else if (status === 'cancelled') {
      alert('Payment Cancelled. You can try booking again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch bookings from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || (!user.id && !user._id)) return

      try {
        const customerId = user.id || user._id
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_id', customerId)
          .order('date', { ascending: true })

        if (error) throw error

        if (data) {
          // Map Supabase data to component format
          const mappedBookings = data.map(booking => ({
            id: booking.id,
            eventName: booking.event_name || 'Event Booking',
            eventType: booking.event_type || 'General',
            date: booking.date,
            status: booking.status?.toLowerCase() || 'pending',
            price: booking.total_amount || 0,
            paymentStatus: booking.payment_status?.toLowerCase() || 'pending',
            guests: booking.guests || 0, // Fallback if not in DB
            venue: 'Susing & Rufin\'s Farm', // Default venue
            bookingDate: booking.created_at,
            contactPerson: user.fullname,
            contactNumber: user.contact || '',
            inclusions: booking.inclusions
          }))
          setBookings(mappedBookings)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user])

  // Filter bookings based on active tab and search
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.eventType.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === 'upcoming') {
      return matchesSearch && (booking.status === 'confirmed' || booking.status === 'pending')
    } else if (activeTab === 'completed') {
      return matchesSearch && booking.status === 'completed'
    } else if (activeTab === 'cancelled') {
      return matchesSearch && booking.status === 'cancelled'
    }
    return matchesSearch
  })

  // Calculate total spent (only for paid/completed bookings)
  const totalSpent = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((total, b) => total + b.price, 0)

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calculate days until event
  const getDaysUntilEvent = (eventDate) => {
    const today = new Date()
    const event = new Date(eventDate)
    const diffTime = event - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Get payment status badge styling
  const getPaymentBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      refunded: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Get upcoming bookings count
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className='w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 p-6 overflow-y-auto'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>
              My Dashboard
            </h1>
            <p className='text-gray-600 mt-2'>
              Welcome back to Susing & Rufin's Farm - Manage your event bookings
            </p>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-600'>Hello,</p>
            <p className='text-xl font-bold text-gray-800'>{user?.fullname || 'Customer'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Upcoming Events</p>
              <p className='text-2xl font-bold text-gray-800'>{upcomingBookings}</p>
              <p className='text-xs text-gray-500 mt-1'>Confirmed and pending bookings</p>
            </div>
            <div className='bg-green-100 p-3 rounded-full'>
              <FaCalendarCheck className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Total Bookings</p>
              <p className='text-2xl font-bold text-gray-800'>{bookings.length}</p>
              <p className='text-xs text-gray-500 mt-1'>All your event bookings</p>
            </div>
            <div className='bg-blue-100 p-3 rounded-full'>
              <FaCalendarAlt className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Total Spent</p>
              <p className='text-2xl font-bold text-gray-800'>₱{totalSpent.toLocaleString()}</p>
              <p className='text-xs text-gray-500 mt-1'>On paid events</p>
            </div>
            <div className='bg-yellow-100 p-3 rounded-full'>
              <FaMoneyBillWave className="text-2xl text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className='bg-white rounded-xl shadow-md p-6 mb-6'>
        <div className='flex flex-col md:flex-row gap-4 justify-between items-start md:items-center'>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'upcoming'
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaClock />
              <span>Upcoming</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'completed'
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaCheckCircle />
              <span>Completed</span>
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === 'cancelled'
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaTimesCircle />
              <span>Cancelled</span>
            </button>
          </div>

          <div className='relative w-full md:w-64'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type='text'
              placeholder='Search bookings...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className='space-y-4'>
        {filteredBookings.map((booking) => (
          <div key={booking.id} className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200'>
            <div className='p-6'>
              <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                {/* Event Info */}
                <div className='flex-1'>
                  <div className='flex items-start space-x-4'>
                    <div className='bg-blue-100 p-3 rounded-lg'>
                      <FaCalendarAlt className="text-2xl text-blue-600" />
                    </div>
                    <div className='flex-1'>
                      <div className='flex flex-wrap items-center gap-2 mb-2'>
                        <h3 className='text-xl font-bold text-gray-800'>{booking.eventName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentBadge(booking.paymentStatus)}`}>
                          Payment: {booking.paymentStatus}
                        </span>
                      </div>
                      
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600'>
                        <div className='flex items-center space-x-2'>
                          <FaCalendarCheck className="text-green-500" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <FaMapMarkerAlt className="text-red-500" />
                          <span>{booking.venue}</span>
                        </div>
                        {booking.guests > 0 && (
                          <div className='flex items-center space-x-2'>
                            <FaUser className="text-blue-500" />
                            <span>{booking.guests} guests</span>
                          </div>
                        )}
                      </div>

                      {/* Price and Contact Info */}
                      <div className='mt-3 flex flex-wrap gap-4 text-sm'>
                        <div className='flex items-center space-x-2 text-gray-800'>
                          <FaMoneyBillWave className="text-green-500" />
                          <span className='font-bold'>₱{booking.price.toLocaleString()}</span>
                        </div>
                        <div className='flex items-center space-x-1 text-gray-500'>
                          <FaUser className="text-gray-400" />
                          <span>Contact: {booking.contactPerson}</span>
                        </div>
                        <div className='flex items-center space-x-1 text-gray-500'>
                          <FaPhone className="text-gray-400" />
                          <span>{booking.contactNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row lg:flex-col gap-2'>
                  {booking.status === 'pending' && (
                    <button 
                      onClick={() => navigate('/contact')}
                      className='px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2'
                    >
                      <FaEnvelope />
                      <span>Inquire Payment</span>
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <div className='text-center'>
                      <div className='flex items-center space-x-2 text-green-600 mb-2'>
                        <FaExclamationTriangle />
                        <span className='font-medium'>{getDaysUntilEvent(booking.date)} days to go</span>
                      </div>
                      <button 
                        onClick={() => navigate('/contact')}
                        className='px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2'
                      >
                        <FaEnvelope />
                        <span>Contact Us</span>
                      </button>
                    </div>
                  )}
                  {(booking.status === 'completed' || booking.status === 'cancelled') && (
                    <button 
                      onClick={() => navigate('/dashboard/customer/booking')}
                      className='px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center space-x-2'
                    >
                      <FaCalendarCheck />
                      <span>Book Again</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Timeline for upcoming events */}
              {(booking.status === 'confirmed' || booking.status === 'pending') && (
                <div className='mt-4 pt-4 border-t border-gray-200'>
                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <div className='text-center'>
                      <div className='font-medium'>Booking Made</div>
                      <div>{formatDate(booking.bookingDate)}</div>
                    </div>
                    <div className='flex-1 h-1 bg-gray-200 mx-4 relative'>
                      <div className={`absolute top-0 left-0 h-full ${
                        booking.status === 'confirmed' ? 'bg-green-500 w-2/3' : 'bg-yellow-500 w-1/3'
                      }`}></div>
                    </div>
                    <div className='text-center'>
                      <div className='font-medium'>Event Date</div>
                      <div>{formatDate(booking.date)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className='text-center py-12 bg-white rounded-xl shadow-md'>
          <FaCalendarAlt className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className='text-lg font-medium text-gray-800 mb-2'>No bookings found</h3>
          <p className='text-gray-600'>
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming bookings. Start by booking an event!"
              : `You don't have any ${activeTab} bookings.`
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default CustomerDashboard