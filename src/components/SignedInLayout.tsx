import React from 'react'
import { Outlet } from 'react-router-dom'
import BottomNavBar from './BottomNavBar'

const SignedInLayout: React.FC = () => (
  <>
    <Outlet />
    <BottomNavBar />
  </>
)

export default SignedInLayout