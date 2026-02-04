import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/booking.jpg'; // Adjust the path as needed



const Home = () => {
  const venueSpaces = [
    {
      id: 1,
      name: "Garden Pavilion",
      type: "Outdoor Area",
      price: 15000,
      capacity: 150,
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
      description: "Beautiful outdoor setting surrounded by nature, perfect for large celebrations",
      features: ["Garden Setting", "Open Space", "Natural Lighting", "Ample Parking"]
    },
    {
      id: 2,
      name: "Farmhouse Hall",
      type: "Indoor Area",
      price: 12000,
      capacity: 100,
      image: "https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=600",
      description: "Cozy indoor space with rustic charm, ideal for intimate gatherings",
      features: ["Air-conditioned", "Sound System", "Kitchen Access", "Restrooms"]
    },
    {
      id: 3,
      name: "Poolside Area",
      type: "Outdoor Recreation",
      price: 18000,
      capacity: 80,
      image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600",
      description: "Refreshng poolside venue perfect for summer parties and celebrations",
      features: ["Swimming Pool", "Gazebo", "Outdoor Seating", "Recreation Area"]
    },
    {
      id: 4,
      name: "Event Lawn",
      type: "Open Field",
      price: 10000,
      capacity: 200,
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600",
      description: "Spacious open field for large gatherings and traditional celebrations",
      features: ["Vast Space", "Flexible Layout", "Natural Setting", "Vehicle Access"]
    }
  ];

  const venueInfo = {
    name: "Susing and Rufin's Farm",
    location: "Barangay Apsayan, Gerona, Tarlac",
    description: "A charming farm venue offering beautiful spaces for your special occasions. Family-owned and operated, we provide authentic Filipino hospitality in a serene countryside setting.",
    owner: "The Susing and Rufin Family",
    established: "2005"
  };

  const eventTypes = [
    {
      icon: '🎂',
      name: 'Birthday',
      description: 'Celebrate life\'s special moments with family and friends'
    },
    {
      icon: '👑',
      name: '18th Birthday/Debut',
      description: 'Make this milestone celebration truly memorable'
    },
    {
      icon: '👨‍👩‍👧‍👦',
      name: 'Family Reunion',
      description: 'Gather your loved ones in our spacious venues'
    },
    {
      icon: '🎄',
      name: 'Christmas Party',
      description: 'Create holiday memories in our festive spaces'
    },
    {
      icon: '👶',
      name: 'Christening',
      description: 'Blessed occasions in a peaceful environment'
    },
    {
      icon: '💍',
      name: 'Wedding',
      description: 'Celebrate your special day in a romantic setting'
    }
  ];


  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className=" rounded-3xl p-8 lg:p-12   ">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Web-Based Development of
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300 mt-2">
                Events and Booking Management System
              </span>
            </h1>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-yellow-300">
              Susing and Rufin's Farm
            </h2>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              {venueInfo.description}
            </p>
            <p className="text-lg mb-8 opacity-90 flex items-center justify-center">
              <span className="mr-2">📍</span>
              {venueInfo.location}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/venues"
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition duration-300 shadow-lg transform hover:scale-105"
              >
                Explore Our Spaces
              </Link>
              <Link
                to="/contact"
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300 shadow-lg transform hover:scale-105"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Susing and Rufin's Farm</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Family-owned and operated since {venueInfo.established}, we take pride in providing 
              authentic Filipino hospitality in our beautiful farm venue.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600" 
                alt="Susing and Rufin's Farm" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">Our Family Story</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded by the {venueInfo.owner}, our farm has been a cherished family property 
                for generations. What started as a simple family farm has evolved into Tarlac's 
                beloved event venue, hosting countless celebrations and creating beautiful memories 
                for our community.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">18+</div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">4</div>
                  <div className="text-gray-600">Event Spaces</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">500+</div>
                  <div className="text-gray-600">Events Hosted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">95%</div>
                  <div className="text-gray-600">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Available Event Types</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We specialize in these special celebrations that matter most to Filipino families
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventTypes.map((event, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition duration-300">
                <div className="text-4xl mb-4">{event.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{event.name}</h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Celebrate at Our Farm?</h2>
          <p className="text-xl mb-8 opacity-90">
            Book your perfect event space today and experience authentic Filipino hospitality 
            in the beautiful countryside of Gerona, Tarlac.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/venues"
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300"
            >
              View All Spaces
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-green-600 transition duration-300"
            >
              Contact Us
            </Link>
          </div>
          <div className="mt-8 text-lg">
            <p>📍 {venueInfo.location}</p>
            <p className="mt-2">📞 0912 345 6789 | ✉️ susing.rufin.farm@gmail.com</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;