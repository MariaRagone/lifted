import { NavLink } from 'react-router-dom'
import './BottomNavBar.css'
import { FaDumbbell, FaUser, FaHeart } from 'react-icons/fa'

const BottomNavBar = () => (
  <nav className="bottom-nav">
    <NavLink
      to="/devotional"
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <FaDumbbell className="nav-icon" />
    </NavLink>

    <NavLink
      to="/"
      end
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <FaUser className="nav-icon" />
    </NavLink>

    <NavLink
      to="/favorites"
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <FaHeart className="nav-icon" />
    </NavLink>
  </nav>
)

export default BottomNavBar
