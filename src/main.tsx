// src/main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { PostHogProvider } from 'posthog-js/react'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'

const container = document.getElementById('root')!
const posthogOptions = { api_host: import.meta.env.VITE_POSTHOG_HOST! }

createRoot(container).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_POSTHOG_KEY!}
      options={posthogOptions}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </PostHogProvider>
  </React.StrictMode>
)
