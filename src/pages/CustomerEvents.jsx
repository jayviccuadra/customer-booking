// CustomerEvents
import React, { useState, useContext, useEffect } from 'react'
import { UserContext } from '../context/AuthContext'
import { 
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaCalendarCheck,
  FaMapMarkerAlt
} from 'react-icons/fa'

const CustomerEvents = () => {
  const { user } = useContext(UserContext)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Sample events data - same as admin but customer view only
  const [eventsData, setEventsData] = useState([
    {
      id: 1,
      name: 'Birthday Celebration',
      type: 'Birthday',
      description: 'Perfect for all ages with fun decorations and party setup',
      price: 8000,
      status: 'active',
      available: true,
      icon: 'birthday',
      inclusions: ['Basic Decor', 'Sound System', 'Party Tables'],
      availableDates: [
        '2024-12-15', '2024-12-18', '2024-12-20', '2024-12-22',
        '2024-12-25', '2024-12-28', '2024-12-30'
      ],
      unavailableDates: [
        '2024-12-10', '2024-12-12', '2024-12-14', '2024-12-16',
        '2024-12-19', '2024-12-24', '2024-12-31'
      ]
    },
    {
      id: 2,
      name: '18th Birthday/Debut',
      type: 'Debut',
      description: 'Special debut package with elegant setup and 18 roses ceremony area',
      price: 15000,
      status: 'active',
      available: true,
      icon: 'debut',
      inclusions: ['Elegant Decor', 'Sound System', '18 Roses Area', 'Photo Booth Setup'],
      availableDates: [
        '2024-12-17', '2024-12-21', '2024-12-23', '2024-12-26',
        '2024-12-29'
      ],
      unavailableDates: [
        '2024-12-15', '2024-12-18', '2024-12-20', '2024-12-22',
        '2024-12-25', '2024-12-28'
      ]
    },
    {
      id: 3,
      name: 'Family Reunion',
      type: 'Reunion',
      description: 'Spacious setup for family gatherings and reunions',
      price: 12000,
      status: 'active',
      available: true,
      icon: 'reunion',
      inclusions: ['Spacious Setup', 'Sound System', 'Long Tables', 'Buffet Area'],
      availableDates: [
        '2024-12-16', '2024-12-19', '2024-12-24', '2024-12-27',
        '2024-12-31'
      ],
      unavailableDates: [
        '2024-12-15', '2024-12-17', '2024-12-20', '2024-12-23',
        '2024-12-25', '2024-12-28', '2024-12-30'
      ]
    },
    {
      id: 4,
      name: 'Christmas Party',
      type: 'Christmas',
      description: 'Festive Christmas celebration with holiday decorations',
      price: 15000,
      status: 'active',
      available: false,
      icon: 'christmas',
      inclusions: ['Christmas Decor', 'Sound System', 'Party Lights', 'Santa Area'],
      availableDates: [],
      unavailableDates: [
        '2024-12-10', '2024-12-15', '2024-12-20', '2024-12-25'
      ]
    },
    {
      id: 5,
      name: 'Christening',
      type: 'Christening',
      description: 'Beautiful setup for baptism and christening ceremonies',
      price: 10000,
      status: 'active',
      available: true,
      icon: 'christening',
      inclusions: ['Elegant Setup', 'Sound System', 'Ceremony Area', 'Photo Spot'],
      availableDates: [
        '2024-12-14', '2024-12-21', '2024-12-28'
      ],
      unavailableDates: [
        '2024-12-07', '2024-12-15', '2024-12-22', '2024-12-29'
      ]
    },
    {
      id: 6,
      name: 'Wedding Celebration',
      type: 'Wedding',
      description: 'Complete wedding package with ceremony and reception setup',
      price: 35000,
      status: 'active',
      available: true,
      icon: 'wedding',
      inclusions: ['Bridal Room', 'Full Decor', 'Sound System', 'Catering Area'],
      availableDates: [
        '2024-12-18', '2024-12-22', '2024-12-26', '2024-12-30'
      ],
      unavailableDates: [
        '2024-12-15', '2024-12-20', '2024-12-25', '2024-12-28'
      ]
    }
  ])

  // Event types for filter
  const eventTypes = ['all', 'Birthday', 'Debut', 'Reunion', 'Christmas', 'Christening', 'Wedding']

  // Get icon component based on event type
  const getEventIcon = (iconType) => {
    const iconProps = { className: "text-2xl" }
    
    switch(iconType) {
      case 'birthday':
        return <FaCalendarCheck {...iconProps} />
      case 'debut':
        return <FaCalendarCheck {...iconProps} />
      case 'reunion':
        return <FaCalendarCheck {...iconProps} />
      case 'christmas':
        return <FaCalendarCheck {...iconProps} />
      case 'christening':
        return <FaCalendarCheck {...iconProps} />
      case 'wedding':
        return <FaCalendarCheck {...iconProps} />
      default:
        return <FaCalendarAlt {...iconProps} />
    }
  }

  // Filter events based on search and filter
  const filteredEvents = eventsData.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || event.type === filterType
    return matchesSearch && matchesFilter && event.available
  })

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

  // Check if date is available
  const isDateAvailable = (event, date) => {
    return event.availableDates.includes(date)
  }

  // Handle event selection
  const handleEventSelect = (event) => {
    setSelectedEvent(event)
    setSelectedDate(null)
  }

  // Handle booking
  const handleBookEvent = () => {
    if (selectedEvent && selectedDate) {
      alert(`Booking confirmed!\n\nEvent: ${selectedEvent.name}\nDate: ${formatDate(selectedDate)}\nPrice: ₱${selectedEvent.price.toLocaleString()}\n\nPlease proceed to payment.`)
      // Here you would typically navigate to booking form or payment page
    }
  }

  // Get next available dates
  const getNextAvailableDates = (event, count = 3) => {
    return event.availableDates.slice(0, count)
  }

  return (
    <div className='w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 p-6 overflow-y-auto'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>
              Available Event Packages
            </h1>
            <p className='text-gray-600 mt-2'>
              Browse and book available event packages at Susing & Rufin's Farm
            </p>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-600'>Welcome back,</p>
            <p className='text-xl font-bold text-gray-800'>{user?.fullname || 'Customer'}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='flex-1 relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type='text'
            placeholder='Search events...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
        <div className='flex gap-2'>
          <div className='flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-300'>
            <FaFilter className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className='bg-transparent border-none focus:ring-0 text-gray-700'
            >
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Events List */}
        <div className='lg:col-span-2'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {filteredEvents.map((event) => (
              <div 
                key={event.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 border-2 cursor-pointer ${
                  selectedEvent?.id === event.id 
                    ? 'border-green-500 ring-2 ring-green-200' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleEventSelect(event)}
              >
                <div className='p-4'>
                  <div className='flex items-center space-x-3 mb-3'>
                    <div className="text-blue-600">
                      {getEventIcon(event.icon)}
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-bold text-gray-800 text-lg'>{event.name}</h3>
                      <span className='inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'>
                        {event.type}
                      </span>
                    </div>
                    <div className='text-right'>
                      <div className='text-lg font-bold text-green-600'>₱{event.price.toLocaleString()}</div>
                      <div className='flex items-center space-x-1 text-green-600 text-sm'>
                        <FaCheckCircle />
                        <span>Available</span>
                      </div>
                    </div>
                  </div>

                  <p className='text-gray-600 text-sm mb-4'>{event.description}</p>

                  {/* Next Available Dates */}
                  <div className='mb-3'>
                    <div className='flex items-center space-x-2 text-gray-700 text-sm mb-2'>
                      <FaClock className="text-blue-500" />
                      <span className='font-medium'>Next Available Dates:</span>
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {getNextAvailableDates(event).map((date, index) => (
                        <span 
                          key={index}
                          className='px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium'
                        >
                          {new Date(date).toLocaleDateString('en-PH', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      ))}
                      {event.availableDates.length > 3 && (
                        <span className='px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs'>
                          +{event.availableDates.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inclusions */}
                  <div>
                    <p className='text-sm text-gray-500 mb-2'>Package Includes:</p>
                    <div className='flex flex-wrap gap-1'>
                      {event.inclusions.slice(0, 3).map((inclusion, index) => (
                        <span key={index} className='px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs'>
                          {inclusion}
                        </span>
                      ))}
                      {event.inclusions.length > 3 && (
                        <span className='px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs'>
                          +{event.inclusions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className='text-center py-12 bg-white rounded-xl shadow-md'>
              <FaCalendarAlt className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className='text-lg font-medium text-gray-800 mb-2'>No events found</h3>
              <p className='text-gray-600'>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>

        {/* Booking Panel */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-xl shadow-md p-6 sticky top-6'>
            <h3 className='text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2'>
              <FaCalendarCheck className="text-green-600" />
              <span>Book Event</span>
            </h3>

            {!selectedEvent ? (
              <div className='text-center py-8'>
                <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-3" />
                <p className='text-gray-600'>Select an event to see available dates</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Selected Event Info */}
                <div className='bg-blue-50 rounded-lg p-4'>
                  <h4 className='font-bold text-gray-800 text-lg'>{selectedEvent.name}</h4>
                  <p className='text-gray-600 text-sm'>{selectedEvent.type}</p>
                  <div className='flex justify-between items-center mt-2'>
                    <span className='text-lg font-bold text-green-600'>₱{selectedEvent.price.toLocaleString()}</span>
                    <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'>
                      Available
                    </span>
                  </div>
                </div>

                {/* Available Dates */}
                <div>
                  <h5 className='font-medium text-gray-700 mb-3 flex items-center space-x-2'>
                    <FaCalendarAlt className="text-blue-500" />
                    <span>Select Available Date</span>
                  </h5>
                  <div className='grid grid-cols-1 gap-2 max-h-60 overflow-y-auto'>
                    {selectedEvent.availableDates.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                          selectedDate === date
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        <div className='font-medium'>{formatDate(date)}</div>
                        <div className={`text-sm ${
                          selectedDate === date ? 'text-green-100' : 'text-green-600'
                        }`}>
                          Available
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Unavailable Dates */}
                {selectedEvent.unavailableDates.length > 0 && (
                  <div>
                    <h5 className='font-medium text-gray-700 mb-2 flex items-center space-x-2'>
                      <FaTimesCircle className="text-red-500" />
                      <span>Unavailable Dates</span>
                    </h5>
                    <div className='text-sm text-gray-600'>
                      {selectedEvent.unavailableDates.slice(0, 3).map((date, index) => (
                        <div key={index} className='line-through text-red-600'>
                          {formatDate(date)}
                        </div>
                      ))}
                      {selectedEvent.unavailableDates.length > 3 && (
                        <div className='text-gray-500 mt-1'>
                          +{selectedEvent.unavailableDates.length - 3} more unavailable dates
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleBookEvent}
                  disabled={!selectedDate}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    selectedDate
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaCalendarCheck />
                  <span>
                    {selectedDate ? `Book for ${formatDate(selectedDate)}` : 'Select a Date'}
                  </span>
                </button>

                {/* Location Info */}
                <div className='bg-gray-50 rounded-lg p-3 mt-4'>
                  <div className='flex items-center space-x-2 text-gray-700'>
                    <FaMapMarkerAlt className="text-red-500" />
                    <span className='font-medium'>Location:</span>
                  </div>
                  <p className='text-sm text-gray-600 mt-1'>Susing & Rufin's Farm Event Venue</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerEvents