import React from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'

const container = document.getElementById('root')!

createRoot(container).render(
  <React.StrictMode>
          <AuthProvider>
        <App />
      </AuthProvider>
  </React.StrictMode>
)
