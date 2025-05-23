import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Login from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './pages/ProtectedRoute'
import DailyDevotionalPage from './pages/DailyDevotionalPage'
import BottomNavBar from './components/BottomNavBar'
import NotesPage from './pages/NotesPage'
import FavoritesPage from './pages/FavoritesPage'
import { AuthProvider } from './contexts/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/devotional" element={<DailyDevotionalPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />



      </Routes>
      <BottomNavBar />
    </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
