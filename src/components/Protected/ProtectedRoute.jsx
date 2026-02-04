import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { UserContext } from "../../context/AuthContext"
import PageLoading from "../PageLoading"

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isLog } = useContext(UserContext)

  if (loading) return <PageLoading/>

  // 1. Check strict authentication first (session existence)
  if (!isLog) return <Navigate to="/login" replace/>

  // 2. If authenticated but profile is still loading (or failed to load)
  // We must wait for 'user' because children components (like Sidebar) depend on it.
  if (!user) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
           <PageLoading/>
           <p className="mt-4 text-gray-500 text-sm">Loading user profile...</p>
        </div>
     )
  }

  // 3. Role Check
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Prevent redirect loop: if user is already at /dashboard and is a customer, don't redirect to /dashboard
    if (user.role === 'Customer') {
       return <Navigate to="/dashboard/customer" replace/>
    }
    return <Navigate to="/dashboard" replace/>
  }

  return children
}

export default ProtectedRoute