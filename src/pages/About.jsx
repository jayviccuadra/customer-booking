import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About Susing & Rufin's Farm</h1>
            
            <div className="prose prose-lg max-w-none">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  Susing & Rufin's Farm has been a cherished family property in Barangay Apsayan, Gerona, Tarlac for generations. 
                  What started as a simple agricultural farm has evolved into a beloved event venue, hosting countless celebrations 
                  and creating beautiful memories for our community.
                </p>
                <p className="text-gray-600">
                  Founded by the Susing and Rufin family, our farm represents the warmth and hospitality that Filipino families 
                  are known for. We take pride in providing a beautiful, natural setting where families and friends can gather 
                  to celebrate life's most important moments.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
                <p className="text-gray-600">
                  To provide a beautiful, affordable, and memorable venue for celebrations while maintaining the authentic 
                  charm of countryside living. We believe that every celebration deserves a special setting, and we're 
                  committed to making your event truly unforgettable.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why Choose Us?</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Family-owned and operated with personal attention to every event</li>
                  <li>Beautiful natural setting away from city noise</li>
                  <li>Multiple event spaces to suit different needs and budgets</li>
                  <li>Years of experience hosting various types of celebrations</li>
                  <li>Flexible arrangements and customizable options</li>
                  <li>Authentic Filipino hospitality</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-green-800 mb-3">Visit Us</h3>
                <p className="text-green-700">
                  Come and experience the charm of Susing & Rufin's Farm. We're located in the peaceful countryside of 
                  Barangay Apsayan, Gerona, Tarlac - the perfect setting for your next celebration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;