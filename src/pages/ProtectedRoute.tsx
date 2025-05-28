// src/pages/ProtectedRoute.tsx
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute: React.FC = () => {
  const { currentUser } = useAuth()
  return currentUser
    ? <Outlet />
    : <Navigate to="/login" replace />
}

export default ProtectedRoute
