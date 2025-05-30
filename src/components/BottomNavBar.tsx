// src/components/BottomNavBar.tsx
import React from 'react'
import { NavLink } from 'react-router-dom'
import { format } from 'date-fns'
import { FaDumbbell, FaUser, FaHeart } from 'react-icons/fa'
import './BottomNavBar.css'

const BottomNavBar: React.FC = () => {
  // build today’s date string once
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <nav className="bottom-nav">
      {/* Devotional (Daily Lift) */}
      <NavLink
        to={`/devotional/${today}`}
        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      >
        <FaDumbbell className="nav-icon" />
      </NavLink>

      {/* Dashboard */}
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      >
        <FaUser className="nav-icon" />
      </NavLink>

      {/* Favorites */}
      <NavLink
        to="/favorites"
        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      >
        <FaHeart className="nav-icon" />
      </NavLink>
    </nav>
  )
}

export default BottomNavBar
