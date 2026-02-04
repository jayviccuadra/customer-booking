import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { UserContext } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Swal from 'sweetalert2' // Import SweetAlert2
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { 
  FaCalendarAlt,
  FaCheckCircle,
  FaStar,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
  FaCircle,
  FaPlus,
  FaUtensils,
  FaMusic,
  FaLightbulb,
  FaChair,
  FaGlassCheers,
  FaCamera,
  FaPalette,
  FaBoxOpen,
  FaTimes
} from 'react-icons/fa'

const MyBooking = () => {
  const { user } = useContext(UserContext)
  
  // Debug log for user context
  useEffect(() => {
    console.log('MyBooking - Current User Context:', user);
  }, [user]);

  // Handle Payment Status from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    
    if (status === 'success') {
      alert('Payment Successful! Your booking is now confirmed.');
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'cancelled') {
      alert('Payment Cancelled. You can try booking again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [bookedDates, setBookedDates] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Booking Creation State
  const [showBookingSection, setShowBookingSection] = useState(false)
  const [bookingMode, setBookingMode] = useState('package') // 'package' or 'custom'
  const [packages, setPackages] = useState([])
  const [categories, setCategories] = useState({
    dishes: [],
    soundSystems: [],
    lights: [],
    decor: [],
    equipment: [],
    beverages: [],
    mediaServices: []
  })
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [customSelection, setCustomSelection] = useState({
    dishes: [],
    soundSystems: [],
    lights: [],
    decor: [],
    equipment: [],
    beverages: [],
    mediaServices: []
  })
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [viewingPackage, setViewingPackage] = useState(null)
  const [notes, setNotes] = useState('')

  const [bookings, setBookings] = useState([])
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) return
      
      try {
        const customerId = user.id || user._id
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setBookings(data || [])
      } catch (error) {
        console.error('Error fetching user bookings:', error)
      } finally {
        setFetchLoading(false)
      }
    }

    if (user) {
      fetchUserBookings()
    }
  }, [user])

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Cancelled' })
        .eq('id', bookingId)

      if (error) throw error

      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'Cancelled' } : b
      ))
      alert('Booking cancelled successfully')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking')
    }
  }

  const handleRequestRefund = async (bookingId) => {
    if (!window.confirm('Are you sure you want to request a refund?')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Refund Requested' })
        .eq('id', bookingId)

      if (error) throw error

      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'Refund Requested' } : b
      ))
      alert('Refund request sent successfully')
    } catch (error) {
      console.error('Error requesting refund:', error)
      alert('Failed to request refund')
    }
  }

  useEffect(() => {
    fetchBookedDates()
    fetchBookingOptions()
  }, [])

  const fetchBookingOptions = async () => {
    try {
      const [
        eventsRes,
        dishesRes,
        soundRes,
        lightsRes,
        decorRes,
        equipRes,
        bevRes,
        mediaRes
      ] = await Promise.all([
        supabase.from('events').select('*').eq('status', 'active'),
        supabase.from('dishes').select('*').eq('available', true),
        supabase.from('sound_systems').select('*').eq('available', true),
        supabase.from('lights_and_effects').select('*').eq('available', true),
        supabase.from('decor_items').select('*').eq('available', true),
        supabase.from('equipment_rentals').select('*').eq('available', true),
        supabase.from('beverage_items').select('*').eq('available', true),
        supabase.from('media_services').select('*').eq('available', true)
      ])

      if (eventsRes.data) setPackages(eventsRes.data)
      setCategories({
        dishes: dishesRes.data || [],
        soundSystems: soundRes.data || [],
        lights: lightsRes.data || [],
        decor: decorRes.data || [],
        equipment: equipRes.data || [],
        beverages: bevRes.data || [],
        mediaServices: mediaRes.data || []
      })
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const fetchBookedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('date, status')
        // .in('status', ['Confirmed', 'Pending']) // Fetch all statuses to handle Rejected/Unavailable
      
      if (error) throw error

      if (data) {
        setBookedDates(data)
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper to check if a date is booked
  const getBookingStatus = (date) => {
    // Adjust for timezone offset to compare dates correctly
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    const bookingsForDate = bookedDates.filter(b => b.date === dateStr);
    
    if (bookingsForDate.length === 0) return null;

    // Priority: Confirmed/Approved > Unavailable > Pending > Rejected
    if (bookingsForDate.some(b => b.status === 'Confirmed' || b.status === 'Approved')) return { status: 'Approved' };
    if (bookingsForDate.some(b => b.status === 'Unavailable')) return { status: 'Unavailable' };
    if (bookingsForDate.some(b => b.status === 'Pending')) return { status: 'Pending' };
    if (bookingsForDate.some(b => b.status === 'Rejected')) return { status: 'Rejected' };
    
    return bookingsForDate[0];
  }

  // Helper to check if date is in the past
  const isPastDate = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Calendar tile styling
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const booking = getBookingStatus(date)
      // Outline box style: Border with light background
      const baseClass = 'border-2 font-bold hover:shadow-md transition-all';
      
      if (!booking) {
        return `${baseClass} border-green-500 text-green-700 bg-green-50`;
      }

      switch (booking.status) {
        case 'Approved':
        case 'Confirmed':
          return `${baseClass} border-blue-600 text-blue-700 bg-blue-50`;
        case 'Pending':
          return `${baseClass} border-yellow-500 text-yellow-700 bg-yellow-50`;
        case 'Unavailable':
          return `${baseClass} border-red-600 text-red-700 bg-red-50`;
        case 'Rejected':
          return `${baseClass} border-orange-500 text-orange-700 bg-orange-50`;
        default:
          return `${baseClass} border-gray-400 text-gray-700 bg-gray-50`;
      }
    }
  }

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

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Logic for Booking
  const handleToggleItem = (category, item) => {
    const currentItems = customSelection[category]
    const exists = currentItems.find(i => i.id === item.id)
    
    let newItems
    if (exists) {
      newItems = currentItems.filter(i => i.id !== item.id)
    } else {
      newItems = [...currentItems, { ...item, quantity: 1 }]
    }
    
    setCustomSelection({
      ...customSelection,
      [category]: newItems
    })
  }

  const updateItemQuantity = (category, itemId, delta) => {
    const currentItems = customSelection[category]
    const newItems = currentItems.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, (item.quantity || 1) + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    setCustomSelection({
      ...customSelection,
      [category]: newItems
    })
  }

  const calculateTotal = () => {
    if (bookingMode === 'package' && selectedPackage) {
      return selectedPackage.price
    }
    
    let total = 0
    Object.keys(customSelection).forEach(key => {
      customSelection[key].forEach(item => {
        // Price might be under 'price', 'price_per_tray', etc.
        const price = item.price || item.price_per_tray || 0
        const qty = item.quantity || 1
        total += price * qty
      })
    })
    return total
  }

  const [isPolling, setIsPolling] = useState(false);
  const [pollingBookingId, setPollingBookingId] = useState(null);

  useEffect(() => {
    let interval;
    if (isPolling && pollingBookingId) {
      interval = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('bookings')
            .select('payment_status')
            .eq('id', pollingBookingId)
            .single();

          if (data && data.payment_status === 'Paid') {
            setIsPolling(false);
            setPollingBookingId(null);
            
            // Close the loading modal if it's open
            if (Swal.isVisible()) {
              Swal.close();
            }

            Swal.fire('Success', 'Payment confirmed! Your booking is now secure.', 'success');
            fetchBookedDates();
            // Redirect or refresh bookings list
            // Since we are already on the booking page, we just refresh the data
            const customerId = user.id || user._id;
            const { data: bookingsData } = await supabase
              .from('bookings')
              .select('*')
              .eq('customer_id', customerId)
              .order('created_at', { ascending: false });
            if (bookingsData) setBookings(bookingsData);
            
            setShowBookingSection(false);
            
            // Optionally redirect to main dashboard if requested, but staying here shows the updated list
            // window.location.href = '/dashboard/customer'; 
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isPolling, pollingBookingId, user]);

  const handleBookEvent = async () => {
    console.log('Attempting to book event...');
    console.log('Current user state:', user);

    if (!selectedDate) {
      alert('Please select a date')
      return
    }

    if (!user || (!user.id && !user._id)) {
      console.error('Booking failed: No user ID found', user);
      alert('You must be logged in to book an event. Please try refreshing the page.')
      return
    }

    const customerId = user.id || user._id;

    if (isPastDate(selectedDate)) {
      alert('Cannot book a new event on a past date.')
      return
    }

    if (bookingMode === 'package' && !selectedPackage) {
      alert('Please select a package first.')
      return
    }

    if (bookingMode === 'custom' && calculateTotal() === 0) {
      alert('Please select at least one item.')
      return
    }

    const totalAmount = calculateTotal()
    const inclusions = bookingMode === 'package' 
      ? selectedPackage.inclusions 
      : customSelection

    // Format date to YYYY-MM-DD to ensure compatibility
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    const bookingData = {
      customer_id: customerId, // Using validated user.id
      event_id: bookingMode === 'package' ? selectedPackage.id : null,
      event_name: bookingMode === 'package' ? selectedPackage.name : 'Custom Event',
      event_type: bookingMode === 'package' ? selectedPackage.type : 'Custom',
      date: formattedDate,
      status: 'Pending',
      payment_status: 'Pending',
      total_amount: totalAmount,
      inclusions: inclusions,
      notes: notes
    }

    try {
      // Show Payment Selection Modal
      const result = await Swal.fire({
        title: 'Select Payment Method',
        text: 'Choose how you would like to pay for your booking.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Online Payment (PayMongo)',
        cancelButtonText: 'Cash Payment',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        showCloseButton: true,
      })

      if (result.isDismissed && result.dismiss === Swal.DismissReason.close) {
        // User closed the modal without selecting
        return;
      }

      const paymentMethod = result.isConfirmed ? 'online' : 'cash';
      
      console.log('Sending booking data:', bookingData)
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()

      if (error) throw error

      console.log('Booking success:', data)
      
      if (paymentMethod === 'online') {
        // Proceed to Payment via PayMongo
        try {
          // Use environment variable for backend URL or default to localhost
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4242';
          
          console.log('Initiating payment session...');
          
          Swal.fire({
            title: 'Initiating Payment...',
            text: 'Please wait while we redirect you to the secure payment page.',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          const paymentResponse = await axios.post(`${API_URL}/create-checkout-session`, {
            booking_id: data[0].id,
            amount: totalAmount,
            description: `Booking for ${bookingMode === 'package' ? selectedPackage.name : 'Custom Event'}`,
            remarks: notes
          });

          const checkoutUrl = paymentResponse.data.data.attributes.checkout_url;
          
          if (checkoutUrl) {
            console.log('Redirecting to payment:', checkoutUrl);
            // Open PayMongo in new tab
            window.open(checkoutUrl, '_blank');
            
            // Start polling in current tab
            setPollingBookingId(data[0].id);
            setIsPolling(true);
            
            Swal.fire({
              title: 'Payment in Progress',
              text: 'A new tab has opened for payment. We are waiting for your confirmation...',
              icon: 'info',
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });
          } else {
            throw new Error('No checkout URL received');
          }

        } catch (paymentError) {
          console.error('Payment initiation failed:', paymentError);
          Swal.fire('Error', 'Booking saved, but payment initiation failed. Please go to "My Bookings" to pay.', 'error');
          setShowBookingSection(false);
          fetchBookedDates();
        }
      } else {
        // Cash Payment Flow
        Swal.fire('Success', 'Booking request sent successfully! Please wait for admin confirmation.', 'success');
        setShowBookingSection(false);
        fetchBookedDates(); // Refresh calendar
      }

    } catch (error) {
      console.error('Error booking event:', error)
      alert(`Failed to book event: ${error.message || error.error_description || 'Unknown error'}`)
    }
  }

  return (
    <div className='w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 p-6 overflow-y-auto'>
      <style>
        {`
          .react-calendar {
            width: 100% !important;
            border: none !important;
            background: white !important;
            border-radius: 0.75rem !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            padding: 1.5rem !important;
          }
          .react-calendar__navigation {
            margin-bottom: 1.5rem !important;
          }
          .react-calendar__navigation button {
            font-size: 1.25rem !important;
            font-weight: 600 !important;
            color: #1f2937 !important;
          }
          .react-calendar__month-view__weekdays {
            text-transform: uppercase !important;
            font-weight: 600 !important;
            font-size: 0.875rem !important;
            color: #6b7280 !important;
            margin-bottom: 0.5rem !important;
          }
          .react-calendar__tile {
            height: 100px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: flex-end !important;
            padding: 0.75rem !important;
            font-weight: 500 !important;
            border-radius: 0.5rem !important;
            margin-bottom: 0.25rem !important;
            transition: all 0.2s !important;
          }
          .react-calendar__tile--now {
            background: #eff6ff !important;
            color: #2563eb !important;
            border: 2px solid #3b82f6 !important;
          }
          .react-calendar__tile--active {
            background: #3b82f6 !important;
            color: white !important;
          }
        `}
      </style>

      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>
              My Booking
            </h1>
            <p className='text-gray-600 mt-2'>
              Check availability and view your booking details
            </p>
          </div>
        </div>
      </div>

      {/* Availability Calendar Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
            <FaCalendarAlt className="text-blue-600" />
            Event Availability Calendar
          </h2>
          <div className='flex items-center gap-4 text-sm font-medium flex-wrap'>
            <div className='flex items-center gap-2'>
              <div className="w-4 h-4 border-2 border-green-500 bg-green-50 rounded-full"></div>
              <span className='text-gray-600'>Available</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className="w-4 h-4 border-2 border-yellow-500 bg-yellow-50 rounded-full"></div>
              <span className='text-gray-600'>Pending</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className="w-4 h-4 border-2 border-blue-600 bg-blue-50 rounded-full"></div>
              <span className='text-gray-600'>Approved</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className="w-4 h-4 border-2 border-orange-500 bg-orange-50 rounded-full"></div>
              <span className='text-gray-600'>Rejected</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className="w-4 h-4 border-2 border-red-600 bg-red-50 rounded-full"></div>
              <span className='text-gray-600'>Unavailable</span>
            </div>
          </div>
        </div>
        
        <div className='bg-white rounded-xl shadow-md p-2'>
          <Calendar 
            tileClassName={tileClassName}
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const booking = getBookingStatus(date)
                if (booking) {
                  return (
                    <div className='mt-2 text-xs font-bold w-full text-right uppercase'>
                      {booking.status}
                    </div>
                  )
                }
                return (
                  <div className='mt-2 text-xs font-medium w-full text-right text-green-600'>
                    Available
                  </div>
                )
              }
            }}
            onClickDay={(date) => setSelectedDate(date)}
            value={selectedDate}
          />
        </div>
      </div>

      {/* Book Your Event Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
            <FaPlus className="text-green-600" />
            Book Your Event
          </h2>
        </div>

        <div className='bg-white rounded-xl shadow-md p-6'>
          {/* Mode Selection */}
          <div className='flex space-x-4 mb-8 border-b border-gray-100 pb-4'>
            <button
              onClick={() => { setBookingMode('package'); setSelectedPackage(null); }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-lg transition-all ${
                bookingMode === 'package'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📦 Select Package
            </button>
            <button
              onClick={() => { setBookingMode('custom'); setSelectedPackage(null); }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-lg transition-all ${
                bookingMode === 'custom'
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🛠️ Create a Package
            </button>
          </div>

          {/* Package Selection Mode */}
          {bookingMode === 'package' && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {packages.map(pkg => (
                <div 
                  key={pkg.id}
                  onClick={() => setViewingPackage(pkg)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-xl ${
                    selectedPackage?.id === pkg.id
                      ? 'border-blue-500 bg-blue-50 transform scale-105'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className='text-xl font-bold text-gray-800 mb-2'>{pkg.name}</h3>
                  <div className='flex justify-between items-center mb-4'>
                    <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold'>
                      {pkg.type}
                    </span>
                    <span className='text-lg font-bold text-green-600'>
                      ₱{pkg.price?.toLocaleString()}
                    </span>
                  </div>
                  <p className='text-gray-600 text-sm mb-4 line-clamp-3'>{pkg.description}</p>
                  {selectedPackage?.id === pkg.id && (
                    <div className='text-center text-blue-600 font-bold'>
                      <FaCheckCircle className="inline mr-2" /> Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Custom Builder Mode */}
          {bookingMode === 'custom' && (
            <div className='space-y-8'>
              {/* Categories */}
              {[
                { id: 'dishes', label: 'Food / Catering', icon: FaUtensils, items: categories.dishes, priceKey: 'price_per_tray' },
                { id: 'beverages', label: 'Beverages', icon: FaGlassCheers, items: categories.beverages, priceKey: 'price' },
                { id: 'soundSystems', label: 'Sound System', icon: FaMusic, items: categories.soundSystems, priceKey: 'price' },
                { id: 'lights', label: 'Lights & Effects', icon: FaLightbulb, items: categories.lights, priceKey: 'price' },
                { id: 'decor', label: 'Decorations', icon: FaPalette, items: categories.decor, priceKey: 'price' },
                { id: 'equipment', label: 'Equipment & Rentals', icon: FaChair, items: categories.equipment, priceKey: 'price' },
                { id: 'mediaServices', label: 'Media Services', icon: FaCamera, items: categories.mediaServices, priceKey: 'price' }
              ].map(category => (
                <div key={category.id} className='bg-gray-50 rounded-xl p-4'>
                  <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
                    <category.icon className="text-blue-600" />
                    {category.label}
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {category.items.map(item => {
                      const isSelected = customSelection[category.id]?.find(i => i.id === item.id)
                      return (
                        <div 
                          key={item.id}
                          className={`bg-white p-3 rounded-lg border transition-all ${
                            isSelected ? 'border-green-500 shadow-md ring-1 ring-green-500' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <h4 className='font-bold text-gray-800 text-sm'>{item.name}</h4>
                            <input 
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => handleToggleItem(category.id, item)}
                              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                            />
                          </div>

                          {/* Item Details based on Category */}
                          <div className='text-xs text-gray-500 mb-2 space-y-1 bg-gray-50 p-2 rounded'>
                            {category.id === 'dishes' && (
                               <>
                                 {item.serving_size && <p><span className="font-semibold">Serving:</span> {item.serving_size}</p>}
                                 {item.description && <p className='italic'>{item.description}</p>}
                               </>
                            )}
                            {category.id === 'beverages' && (
                               <>
                                 {item.serving_unit && <p><span className="font-semibold">Unit:</span> {item.serving_unit}</p>}
                                 {item.description && <p className='italic'>{item.description}</p>}
                               </>
                            )}
                            {category.id === 'soundSystems' && (
                               <>
                                 {item.coverage_pax && <p><span className="font-semibold">Coverage:</span> {item.coverage_pax}</p>}
                                 {item.duration && <p><span className="font-semibold">Duration:</span> {item.duration}</p>}
                                 {item.description && <p className='italic'>{item.description}</p>}
                               </>
                            )}
                            {category.id === 'lights' && (
                               <>
                                 {item.type && <p><span className="font-semibold">Type:</span> {item.type}</p>}
                                 {item.unit && <p><span className="font-semibold">Unit:</span> {item.unit}</p>}
                                 {item.duration && <p><span className="font-semibold">Duration:</span> {item.duration}</p>}
                                 {item.description && <p className='italic'>{item.description}</p>}
                               </>
                            )}
                            {category.id === 'decor' && (
                               <>
                                 {item.type && <p><span className="font-semibold">Type:</span> {item.type}</p>}
                                 {item.theme && <p><span className="font-semibold">Theme:</span> {item.theme}</p>}
                                 {item.unit && <p><span className="font-semibold">Unit:</span> {item.unit}</p>}
                                 {item.description && <p className='italic'>{item.description}</p>}
                               </>
                            )}
                            {category.id === 'equipment' && (
                               <>
                                 {item.unit && <p><span className="font-semibold">Unit:</span> {item.unit}</p>}
                                 {item.description && <p className='italic'>{item.description}</p>}
                               </>
                            )}
                            {category.id === 'mediaServices' && (
                               <>
                                 {item.service_type && <p><span className="font-semibold">Type:</span> {item.service_type}</p>}
                                 {item.duration_hours && <p><span className="font-semibold">Duration:</span> {item.duration_hours} hrs</p>}
                                 {item.inclusions && <p><span className="font-semibold">Inclusions:</span> {item.inclusions}</p>}
                                 {item.output_type && <p><span className="font-semibold">Output:</span> {item.output_type}</p>}
                                 {item.special_inclusions && <p><span className="font-semibold">Special:</span> {item.special_inclusions}</p>}
                                 {item.turnaround_time && <p><span className="font-semibold">Turnaround:</span> {item.turnaround_time}</p>}
                               </>
                            )}
                          </div>

                          <p className='text-green-600 font-bold text-sm mb-2'>
                            ₱{(item[category.priceKey] || item.price || 0).toLocaleString()}
                          </p>
                          {isSelected && (
                            <div className='flex items-center justify-between bg-gray-100 rounded p-1'>
                              <button 
                                onClick={() => updateItemQuantity(category.id, item.id, -1)}
                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow text-gray-600 hover:text-red-600 font-bold"
                              >
                                -
                              </button>
                              <span className='font-bold text-gray-800 text-sm'>{isSelected.quantity}</span>
                              <button 
                                onClick={() => updateItemQuantity(category.id, item.id, 1)}
                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow text-gray-600 hover:text-green-600 font-bold"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booking Summary & Action */}
          <div className='mt-8 pt-6 border-t border-gray-200'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div>
                <h4 className='font-bold text-gray-800 mb-2'>Selected Date</h4>
                <div className='flex items-center gap-2 text-lg text-blue-600 font-bold bg-blue-50 p-3 rounded-lg inline-block'>
                  <FaCalendarAlt />
                  {selectedDate.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                {isPastDate(selectedDate) && (
                  <p className='text-red-500 font-bold mt-2 text-sm'>
                    ⚠️ Cannot book a new event on a past date.
                  </p>
                )}
                <div className='mt-4'>
                   <label className='block text-sm font-medium text-gray-700 mb-1'>Notes / Special Requests</label>
                   <textarea
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                     rows="3"
                     placeholder="Any additional details..."
                     disabled={isPastDate(selectedDate)}
                   ></textarea>
                </div>
              </div>
              
              <div className='flex flex-col justify-between'>
                <div className='bg-gray-50 p-4 rounded-xl mb-4'>
                  <h4 className='font-bold text-gray-800 mb-2'>Booking Summary</h4>
                  <div className='space-y-2 text-sm text-gray-600'>
                    <div className='flex justify-between'>
                      <span>Event Type:</span>
                      <span className='font-bold text-gray-800'>
                        {bookingMode === 'package' ? (selectedPackage?.name || '-') : 'Custom Package'}
                      </span>
                    </div>
                    {bookingMode === 'package' && selectedPackage && (
                      <div className='flex flex-col gap-2'>
                        <span className='font-semibold'>Package Inclusions:</span>
                        <div className='text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 max-h-40 overflow-y-auto'>
                            {Object.entries(selectedPackage.inclusions || {}).map(([key, items]) => {
                                if (!items || items.length === 0) return null
                                return (
                                    <div key={key} className='mb-1'>
                                        <span className='font-bold capitalize text-blue-600'>{key}: </span>
                                        <span>{items.map(i => i.name).join(', ')}</span>
                                    </div>
                                )
                            })}
                        </div>
                      </div>
                    )}
                    {bookingMode === 'custom' && (
                      <div className='border-t border-gray-200 pt-2 mt-2'>
                        <p className='font-bold text-gray-800 mb-1'>Selected Items:</p>
                        {Object.keys(customSelection).map(key => {
                          const items = customSelection[key]
                          if (items.length === 0) return null
                          return (
                            <div key={key} className='mb-1'>
                              <span className='capitalize text-xs font-semibold text-blue-600'>{key}:</span>
                              {items.map(item => (
                                <div key={item.id} className='flex justify-between pl-2 text-xs'>
                                  <span>{item.name} (x{item.quantity})</span>
                                  <span>₱{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <div className='border-t border-gray-200 mt-4 pt-2 flex justify-between items-center'>
                    <span className='font-bold text-gray-800 text-lg'>Total Estimated Price:</span>
                    <span className='font-bold text-green-600 text-xl'>
                      ₱{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBookEvent}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                    (bookingMode === 'package' && !selectedPackage) || 
                    (bookingMode === 'custom' && calculateTotal() === 0) ||
                    isPastDate(selectedDate)
                      ? 'bg-gray-300 text-gray-500' // Visual cue only, but clickable for feedback
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02]'
                  }`}
                >
                  {isPastDate(selectedDate) ? 'Date Unavailable for Booking' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Content - Single Booking Card */}
      <div className='max-w-4xl mx-auto mb-12'>
        <div className='mb-6'>
          <h2 className='text-xl font-bold text-gray-800 mb-4'>My Bookings</h2>
        </div>
        
        {fetchLoading ? (
           <div className="text-center py-8">Loading bookings...</div>
        ) : bookings.length > 0 ? (
           <div className="space-y-6">
             {bookings.map(booking => (
               <div key={booking.id} className='bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200'>
                 {/* Header */}
                 <div className='bg-gradient-to-r from-blue-50 to-green-50 p-6 border-b border-gray-200'>
                   <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                     <div className='flex items-center space-x-4'>
                       <div className='bg-blue-100 p-3 rounded-lg'>
                         <FaCalendarAlt className="text-2xl text-blue-600" />
                       </div>
                       <div>
                         <h3 className='text-2xl font-bold text-gray-800'>{booking.event_name}</h3>
                         <div className='flex flex-wrap items-center gap-2 mt-2'>
                           <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
                             {booking.event_type}
                           </span>
                           <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(booking.status?.toLowerCase())}`}>
                             {booking.status}
                           </span>
                           <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                             booking.payment_status === 'Paid' 
                               ? 'bg-green-100 text-green-800 border-green-200'
                               : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                           }`}>
                             Payment: {booking.payment_status}
                           </span>
                         </div>
                       </div>
                     </div>
                     <div className='text-right'>
                       <div className='text-2xl font-bold text-green-600'>₱{booking.total_amount?.toLocaleString()}</div>
                     </div>
                   </div>
                 </div>

                 {/* Event Details */}
                 <div className='p-6'>
                   <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                     {/* Event Information */}
                     <div className='space-y-4'>
                       <h4 className='text-lg font-bold text-gray-800 border-b pb-2'>Event Information</h4>
                       <div className='space-y-3'>
                         <div className='flex items-center space-x-3 text-gray-700'>
                           <FaCalendarAlt className="text-green-500 text-lg" />
                           <div>
                             <p className='font-medium'>Event Date</p>
                             <p className='text-sm text-gray-600'>{formatDate(booking.date)}</p>
                           </div>
                         </div>
                         
                         {booking.notes && (
                            <div className='flex items-start space-x-3 text-gray-700'>
                              <FaBoxOpen className="text-blue-500 text-lg mt-1" />
                              <div>
                                <p className='font-medium'>Notes</p>
                                <p className='text-sm text-gray-600'>{booking.notes}</p>
                              </div>
                            </div>
                         )}
                       </div>
                     </div>

                     <div className='space-y-4'>
                       <h4 className='text-lg font-bold text-gray-800 border-b pb-2'>Booking Status</h4>
                       <div className='space-y-3'>
                         <div className='flex items-center space-x-3 text-gray-700'>
                           <FaCheckCircle className="text-blue-500 text-lg" />
                           <div>
                             <p className='font-medium'>Booking Created</p>
                             <p className='text-sm text-gray-600'>{new Date(booking.created_at).toLocaleDateString()}</p>
                           </div>
                         </div>
                         
                         {/* Actions */}
                         <div className="flex gap-3 mt-4">
                           {booking.status !== 'Cancelled' && booking.status !== 'Refund Requested' && !isPastDate(new Date(booking.date)) && (
                             <button 
                               onClick={() => handleCancelBooking(booking.id)}
                               className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm transition-colors"
                             >
                               Cancel Booking
                             </button>
                           )}
                           
                           {(booking.payment_status === 'Paid' || booking.payment_status === 'Partial') && booking.status !== 'Refund Requested' && (
                             <button 
                               onClick={() => handleRequestRefund(booking.id)}
                               className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-medium text-sm transition-colors"
                             >
                               Request Refund
                             </button>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className='border-t border-gray-200 pt-6'>
                     <h4 className='text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2'>
                       <FaCheckCircle className="text-green-500" />
                       <span>Inclusions Summary</span>
                     </h4>
                     <div className='flex flex-wrap gap-2'>
                       {Object.entries(booking.inclusions || {}).flatMap(([cat, items]) => 
                          Array.isArray(items) ? items.map((item, idx) => (
                            <span key={`${cat}-${idx}`} className='px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100'>
                              {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                            </span>
                          )) : []
                       )}
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <div className='text-center py-12 bg-white rounded-xl shadow-md'>
            <FaCalendarAlt className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className='text-lg font-medium text-gray-800 mb-2'>No Active Booking</h3>
            <p className='text-gray-600'>
              You don't have any active bookings. Start by booking an event!
            </p>
          </div>
        )}
      </div>

      {/* Package Details Modal */}
      {viewingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative animate-fade-in-up">
              <button 
                onClick={() => setViewingPackage(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes size={24} />
              </button>
              
              <div className="mb-6 border-b border-gray-100 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{viewingPackage.name}</h2>
                    <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-bold uppercase tracking-wide">
                      {viewingPackage.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-green-600">₱{viewingPackage.price?.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">Base Package Price</p>
                  </div>
                </div>
                <p className="text-gray-600 mt-6 text-lg leading-relaxed">{viewingPackage.description}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaBoxOpen className="text-blue-600" />
                  Package Inclusions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(viewingPackage.inclusions || {}).map(([category, items]) => {
                    if (!items || items.length === 0) return null
                    
                    const labels = {
                       dishes: { label: 'Food & Catering', icon: <FaUtensils /> },
                       soundSystems: { label: 'Sound System', icon: <FaMusic /> },
                       lights: { label: 'Lights & Effects', icon: <FaLightbulb /> },
                       decor: { label: 'Decorations', icon: <FaPalette /> },
                       equipment: { label: 'Equipment', icon: <FaChair /> },
                       beverages: { label: 'Beverages', icon: <FaGlassCheers /> },
                       mediaServices: { label: 'Media Services', icon: <FaCamera /> }
                    }

                    const config = labels[category] || { label: category, icon: <FaCircle /> }

                    return (
                      <div key={category} className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-lg">
                          <span className="text-blue-500">{config.icon}</span>
                          {config.label}
                        </h4>
                        <ul className="space-y-2">
                          {items.map((item, idx) => (
                             <li key={idx} className="flex justify-between items-start text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">
                               <span className="font-medium">{item.name}</span>
                               {item.quantity && item.quantity > 1 && (
                                 <span className="font-bold text-blue-600 bg-blue-50 px-2 rounded-full text-xs">x{item.quantity}</span>
                               )}
                             </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 border-t border-gray-100 pt-6">
                <button
                   onClick={() => setViewingPackage(null)}
                   className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Close Details
                </button>
                <button
                   onClick={() => {
                     setSelectedPackage(viewingPackage)
                     setViewingPackage(null)
                   }}
                   className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:from-blue-700 hover:to-blue-800 shadow-lg transform hover:scale-[1.02] transition-all flex items-center gap-2"
                >
                  <FaCheckCircle />
                  Select This Package
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default MyBooking