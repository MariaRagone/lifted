// src/components/GroupMembers.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { auth, db } from '../library/firebase'
import { getInitials } from '../utilities/userHelpers'
import './GroupMembers.css'

interface GroupMembersProps {
  groupId: string
  selectedDate: string
  showFitness: boolean
  showProgress?: boolean       // whether to display the progress bar
  showCheckmarks?: boolean     // whether to show ✓ on avatars
  showLeaveButton?: boolean    // whether to render a "Leave Group" button
}

interface Member {
  uid: string
  displayName?: string
  profilePicUrl?: string
  completed: boolean
}

const DEFAULT_CHECKBOXES = {
  prayerDone: false,
  videoDone: false,
  otherFitnessDone: false,
}

const GroupMembers: React.FC<GroupMembersProps> = ({
  groupId,
  selectedDate,
  showFitness,
  showProgress = true,
  showCheckmarks = true,
  showLeaveButton = false,
}) => {
  const [members, setMembers] = useState<Member[]>([])
  const [groupName, setGroupName] = useState<string>(groupId)
  const [loading, setLoading] = useState(true)

  const fetchGroupInfo = useCallback(async () => {
    if (!groupId || !selectedDate) return
    setLoading(true)
    try {
      const membersRef = collection(db, 'groups', groupId, 'members')
      const snapshot = await getDocs(membersRef)

      const results = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const uid = docSnap.id
          const { displayName, profilePicUrl } = docSnap.data()
          const cbSnap = await getDoc(doc(db, 'days', selectedDate, 'checkboxes', uid))
          const cb = cbSnap.exists() ? (cbSnap.data() as any) : DEFAULT_CHECKBOXES
          const completed = cb.prayerDone && (showFitness ? (cb.videoDone || cb.otherFitnessDone) : true)
          return { uid, displayName, profilePicUrl, completed }
        })
      )
      setMembers(results)
      const groupDoc = await getDoc(doc(db, 'groups', groupId))
      if (groupDoc.exists()) {
        const data = groupDoc.data() as any
        if (data.name) setGroupName(data.name)
      }
    } catch (err) {
      console.error('Error loading group members:', err)
    } finally {
      setLoading(false)
    }
  }, [groupId, selectedDate, showFitness])

  useEffect(() => {
    fetchGroupInfo()
  }, [fetchGroupInfo])

  const handleLeaveGroup = async () => {
    const user = auth.currentUser
    if (!user) return
    await setDoc(doc(db, 'groups', groupId, 'members', user.uid), {}, { merge: false })
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    const currentGroups: string[] = userSnap.data()?.groupIds || []
    const updated = currentGroups.filter((id) => id !== groupId)
    await setDoc(userRef, { groupIds: updated }, { merge: true })
    fetchGroupInfo()
  }

  if (loading) return <p className="loading-text">Loading Lift Circle…</p>

  const completedCount = members.filter((m) => m.completed).length
  const progressPercent = members.length > 0 ? (completedCount / members.length) * 100 : 0

  const progressClass =
    progressPercent === 100 ? 'green' :
    progressPercent >= 60 ? 'yellow' :
    'red'

  return (
    <div className="group-members">
      <div className="group-header">
        <h4 className="group-name">{groupName}</h4>
        {showLeaveButton && (
          <button className="leave-group-button" onClick={handleLeaveGroup}>Leave</button>
        )}
      </div>

      {showProgress && (
        <div className="group-progress">
          <div className="progress-bar-bg">
            <div
              className={`progress-bar-fill ${progressClass}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="progress-label">{completedCount} of {members.length} completed</p>
        </div>
      )}

      <div className="community-checkins">
        {members.map(({ uid, displayName, profilePicUrl, completed }) => (
          <div key={uid} className="user-checkin">
            {profilePicUrl ? (
              <img className="avatar" src={profilePicUrl} alt={displayName} />
            ) : (
              <div className="avatar-fallback">{getInitials(displayName)}</div>
            )}
            {showCheckmarks && completed && <span className="checkmark">✓</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default GroupMembers
