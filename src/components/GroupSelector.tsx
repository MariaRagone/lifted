// src/components/GroupSelector.tsx
import React, { useState } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../library/firebase'

interface GroupSelectorProps {
  user: { uid: string; displayName?: string; profilePicUrl?: string }
  onGroupJoined: (groupId: string) => void
}

export default function GroupSelector({ user, onGroupJoined }: GroupSelectorProps) {
  const [mode, setMode] = useState<'join' | 'create'>('join')
  const [groupInput, setGroupInput] = useState('')
  const [error, setError] = useState('')
  const [circleCode, setCircleCode] = useState('')

  const handleJoin = async () => {
    const groupId = groupInput.trim()
    if (!groupId) return
    const groupRef = doc(db, 'groups', groupId)
    const groupSnap = await getDoc(groupRef)
    if (!groupSnap.exists()) {
      setError('Group not found. Check the code and try again.')
      return
    }
    await setDoc(
      doc(db, 'groups', groupId, 'members', user.uid),
      {
        displayName: user.displayName ?? '',
        profilePicUrl: user.profilePicUrl ?? ''
      }
    )
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    const userData = userSnap.data()
    const currentGroups: string[] = userData?.groupIds || []
    const updatedGroups = Array.from(new Set([...currentGroups, groupId]))
    await setDoc(userRef, { groupIds: updatedGroups }, { merge: true })
    onGroupJoined(groupId)
  }

  const handleCreate = async () => {
    const groupName = groupInput.trim()
    if (!groupName) return
    const code = Math.random().toString(36).substring(2, 8)
    await setDoc(doc(db, 'groups', code), {
      name: groupName,
      createdBy: user.uid
    })
    await setDoc(
      doc(db, 'groups', code, 'members', user.uid),
      {
        displayName: user.displayName ?? '',
        profilePicUrl: user.profilePicUrl ?? ''
      }
    )
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    const userData = userSnap.data()
    const currentGroups: string[] = userData?.groupIds || []
    const updatedGroups = Array.from(new Set([...currentGroups, code]))
    await setDoc(userRef, { groupIds: updatedGroups, circleCode: code }, { merge: true })
    onGroupJoined(code)
    setCircleCode(code)

    const shareUrl = `${window.location.origin}/join?ref=${user.uid}&circle=${code}`
    const shareText = `Join my Lift Circle! ${shareUrl} — Use code "${code}" to join.`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invite to Lift & Lifted',
          text: shareText,
          url: shareUrl
        })
      } catch {
        await navigator.clipboard.writeText(shareText)
        alert('Invite link copied to clipboard')
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      alert('Invite link copied to clipboard')
    }
  }

  return (
    <div>
      <div className="group-selector">
        <h3>{mode === 'create' ? 'Create a Lift Circle' : 'Join a Lift Circle'}</h3>
        <input
          type="text"
          placeholder={mode === 'create' ? 'Circle name (e.g. Sunrise Squad)' : 'Join code'}
          value={groupInput}
          onChange={(e) => setGroupInput(e.target.value)}
          className="input"
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={mode === 'create' ? handleCreate : handleJoin}>
          {mode === 'create' ? 'Create Circle and Invite Friends' : 'Join Lift Circle'}
        </button>
        <p style={{ marginTop: '10px' }}>
          {mode === 'create' ? (
            <>
              Already have a code?{' '}
              <span onClick={() => { setMode('join'); setError('') }} style={{ color: '#f1a84d', cursor: 'pointer' }}>
                Join one
              </span>
            </>
          ) : (
            <>
              Want to start your own?{' '}
              <span onClick={() => { setMode('create'); setError('') }} style={{ color: '#f1a84d', cursor: 'pointer' }}>
                Create one
              </span>
            </>
          )}
        </p>
      </div>
      <p className="circle-description">
        Need a boost? <strong>Lift Circles</strong> pair you with friends for daily prayer &amp; workouts.
      </p>
    </div>
  )
}
