// src/components/SignedInLayout.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import BottomNavBar from './BottomNavBar'
import './SignedInLayout.css'

const SignedInLayout: React.FC = () => (
  <div className="app-shell">
    <div className="content">
      <Outlet />
    </div>
    <BottomNavBar />
  </div>
)

export default SignedInLayout
