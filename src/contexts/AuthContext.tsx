// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../library/firebase'
import { doc, setDoc } from 'firebase/firestore'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const { uid, displayName, photoURL, email } = user
        const name = displayName || email?.split('@')[0] || 'User'

        await setDoc(
          doc(db, 'users', uid),
          {
            displayName: name,
            profilePicUrl: photoURL ?? '',
          },
          { merge: true }
        )
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
