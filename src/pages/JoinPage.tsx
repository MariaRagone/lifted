// src/pages/JoinPage.tsx
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  arrayUnion,
} from 'firebase/firestore'
import { auth, db } from '../library/firebase'

export default function JoinPage() {
  const { search } = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(search)
  const inviterUid = params.get('ref')
  const circleCode = params.get('circle')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid)
        await setDoc(
          userRef,
          {
            referredBy: inviterUid || null,
            displayName: user.displayName || '',
            email: user.email || '',
            groupIds: circleCode ? arrayUnion(circleCode) : arrayUnion(),
          },
          { merge: true }
        )

        if (circleCode) {
          const groupMemberRef = doc(
            db,
            'groups',
            circleCode,
            'members',
            user.uid
          )
          await setDoc(groupMemberRef, {
            displayName: user.displayName || '',
            profilePicUrl: user.photoURL || '',
          })
        }

        navigate('/')
      }
    })
    return () => unsub()
  }, [inviterUid, circleCode, navigate])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h1>Join a Lift Circle</h1>
      <p>Click below to sign in (or sign up) and automatically join your friend’s circle.</p>
      <button onClick={signInWithGoogle} className="btn-primary">
        Sign in with Google
      </button>
    </div>
  )
}
