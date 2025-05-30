// src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DailyLiftPage from './pages/DailyLiftPage'
import FavoritesPage from './pages/FavoritesPage'
import AboutPage from './pages/AboutPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ProtectedRoute from './pages/ProtectedRoute'
import SignedInLayout from './components/SignedInLayout'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* PROTECTED + SIGNED-IN LAYOUT */}
        <Route element={<ProtectedRoute />}>
          <Route element={<SignedInLayout />}>
            <Route path="/" element={<DashboardPage />} />
                <Route path="/devotional/:date" element={<DailyLiftPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
            {/* catch-all for protected */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
