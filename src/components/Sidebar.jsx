import React, { useContext } from 'react'
import { UserContext } from '../context/AuthContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient';
// import { Api } from '../utils/Api.js'

const Sidebar = () => {
    const { user, setUser } = useContext(UserContext)
    const location = useLocation()
    const navigate = useNavigate()

    const isActive = (path) => {
        return location.pathname === path
    }

    const handleLogout = async() => {
        try {
            await supabase.auth.signOut();
            localStorage.removeItem('staff_user'); // Clear staff session if exists
            setUser(null);
            navigate('/');
        } catch(err) {
            console.error("Logout failed:", err)
        }
    }

    const customerMenu = [
        { path: '/dashboard/customer', label: 'Dashboard', icon: '📊' },
        // { path: '/dashboard/customer/events', label: 'Events', icon: '🎪' },
        { path: '/dashboard/customer/booking', label: 'My Booking', icon: '📋' },
    ]

    const commonMenu = [
        { path: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
    ]

    // Determine menu items based on user role
    let menuItems = []
    if (user.role === 'Customer') {
        menuItems = [...customerMenu, ...commonMenu]
    } else {
        // Fallback or empty if not customer
        menuItems = []
    }

    return (
        <div className='w-full h-full bg-white border-r border-gray-200 flex flex-col shadow-lg'>
            {/* Profile Section */}
            <div className='p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50'>
                <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-md'>
                        <span className='text-white font-bold text-lg'>
                            {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h3 className='text-lg font-semibold text-gray-800 truncate'>{user?.fullname || 'User'}</h3>
                        <p className='text-gray-600 text-sm truncate'>
                            {user?.role === 'Staff' ? `@${user?.username}` : (user?.email || 'No email')}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                            user?.role === 'Admin' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : user?.role === 'Staff'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                            {user?.role || 'User'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className='flex-1 p-4 bg-white'>
                <ul className='space-y-2'>
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
                                    isActive(item.path)
                                        ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md border-transparent transform scale-105'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border-transparent'
                                }`}
                            >
                                <span className={`text-xl ${isActive(item.path) ? 'text-white' : 'text-gray-600'}`}>
                                    {item.icon}
                                </span>
                                <span className='font-medium'>{item.label}</span>
                                {isActive(item.path) && (
                                    <div className='ml-auto w-2 h-2 bg-white rounded-full'></div>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className='p-4 border-t border-gray-100'>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                >
                    <span className="text-xl">🚪</span>
                    <span className='font-medium'>Logout</span>
                </button>
            </div>

            {/* Footer Section */}
            <div className='p-4 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-green-50'>
                <div className='text-center'>
                    <p className='text-gray-700 font-semibold text-sm'>Susing & Rufin's Farm</p>
                    <p className='text-gray-500 text-xs mt-1'>Event Booking System</p>
                </div>
            </div>
        </div>
    )
}

export default Sidebar