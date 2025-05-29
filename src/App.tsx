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
        {/* public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/about"
          element={
            <>
              <AboutPage />
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
         <Route
            path="/"
            element={
              <>
                <DashboardPage />
              </>
            }
          />

        <Route element={<ProtectedRoute />}>        
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
          {/* catch-all for protected */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
