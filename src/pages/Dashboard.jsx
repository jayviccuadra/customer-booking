import React from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div className='w-full h-dvh grid grid-cols-[300px_1fr]'>
        <Sidebar/>
        <Outlet/>
    </div>
  )
}

export default Dashboard