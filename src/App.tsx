// src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DailyLiftPage from './pages/DailyLiftPage'
import FavoritesPage from './pages/FavoritesPage'
import AboutPage from './pages/AboutPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ProtectedRoute from './pages/ProtectedRoute'
import BottomNavBar from './components/BottomNavBar'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/login" element={<LoginPage />} />

        {/* everything below is protected */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <>
                <DashboardPage />
                <BottomNavBar />
              </>
            }
          />
          <Route
            path="/devotional"
            element={
              <>
                <DailyLiftPage />
                <BottomNavBar />
              </>
            }
          />
          <Route
            path="/favorites"
            element={
              <>
                <FavoritesPage />
                <BottomNavBar />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <AboutPage />
                <BottomNavBar />
              </>
            }
          />
          <Route
            path="/privacy"
            element={
              <>
                <PrivacyPolicy />
                <BottomNavBar />
              </>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
