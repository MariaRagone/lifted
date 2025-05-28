// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import {
  onSnapshot,
  doc,
  Unsubscribe,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { auth, db } from '../library/firebase'
import { useNavigate } from 'react-router-dom'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from 'date-fns'
import { isFitnessDay } from '../utilities/dateHelpers'

import Logo from '../components/Logo'
import GroupSelector from '../components/GroupSelector'
import Encourage from '../components/Encourage'
import MonthlyHeatmap from '../components/MonthlyHeatmap'
import GoogleFitConnect from '../library/GoogleFitConnect'
import GoogleFitDisconnect from '../components/googleFit/GoogleFitDisconnect'
import GroupMembers from '../components/GroupMemembers'

import '../components/Buttons.css'
import './Dashboard.css'
import GoogleFitWeeklyStats from '../components/googleFit/GoogleFitWeeklyStats'

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userGroupIds, setUserGroupIds] = useState<string[]>([])
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set())
  const [googleFitAuthorized, setGoogleFitAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  // 1) Auth + userName + groupIds + GoogleFit flag
  useEffect(() => {
    let unsubscribeUserDoc: Unsubscribe

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)

      if (unsubscribeUserDoc) unsubscribeUserDoc()

      if (user) {
        const userRef = doc(db, 'users', user.uid)
        unsubscribeUserDoc = onSnapshot(userRef, (snap) => {
          const data = snap.data() || {}
          setUserName(data.displayName || user.email || 'User')
          setUserGroupIds(data.groupIds || [])
          setGoogleFitAuthorized(!!data.googleFitAuthorized)
        })
      } else {
        setUserName('')
        setUserGroupIds([])
        setGoogleFitAuthorized(false)
      }
    })

    return () => {
      unsubAuth()
      if (unsubscribeUserDoc) unsubscribeUserDoc()
    }
  }, [])

  // 2) Fetch completedDates for current month (weekends count if prayerDone)
  useEffect(() => {
    if (!currentUser) {
      setCompletedDates(new Set())
      return
    }

    const fetchCompleted = async () => {
      const today = new Date()
      const days = eachDayOfInterval({
        start: startOfMonth(today),
        end: endOfMonth(today),
      })

      const doneSet = new Set<string>()
      await Promise.all(
        days.map(async (d) => {
          const dateKey = format(d, 'yyyy-MM-dd')
          const cbDoc = await getDoc(
            doc(db, 'days', dateKey, 'checkboxes', currentUser.uid)
          )
          if (!cbDoc.exists()) return

          const cb = cbDoc.data() as {
            prayerDone?: boolean
            videoDone?: boolean
            otherFitnessDone?: boolean
          }
          const prayerOk = !!cb.prayerDone
          const fitnessOk = isFitnessDay(dateKey)
            ? (cb.videoDone || cb.otherFitnessDone)
            : true

          if (prayerOk && fitnessOk) {
            doneSet.add(dateKey)
          }
        })
      )

      setCompletedDates(doneSet)
    }

    fetchCompleted()
  }, [currentUser])

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) return

    // remove from group members
    await setDoc(
      doc(db, 'groups', groupId, 'members', currentUser.uid),
      {},
      { merge: false }
    )
    // remove from user doc
    const userRef = doc(db, 'users', currentUser.uid)
    const userSnap = await getDoc(userRef)
    const currentGroups: string[] = userSnap.data()?.groupIds || []
    const updated = currentGroups.filter((id) => id !== groupId)
    await setDoc(userRef, { groupIds: updated }, { merge: true })
    setUserGroupIds(updated)
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  if (loading) return null

  return (
    <div className="container">
      <Logo size={200} />

      {!currentUser && <p className="info-text">Please sign in.</p>}

      {currentUser && (
        <>
          <header className="dashboard-header">
            <h1 className="welcome">Welcome, {userName}!</h1>
            <h3 className="announcement">
              This page is in test mode! Coming soon…stats and more.
            </h3>
          </header>

          
            <section className="heatmap-section section-box">
              <h2 className="section-title">📊 This Month’s Activity</h2>
              <MonthlyHeatmap completedDates={completedDates} />
            </section>
         
            {/* {googleFitAuthorized && (
              <>
                <GoogleFitWeeklyStats />
                <GoogleFitDisconnect onDisconnect={() => setGoogleFitAuthorized(false)} />
              </>
            )} */}

            {!googleFitAuthorized && (
              <GoogleFitConnect onAuthorized={() => setGoogleFitAuthorized(true)} />
            )}
          {userGroupIds.length > 0 && (
            <section className="circles-section section-box">
              <h2 className="section-title">
                💛 {userGroupIds.length > 1 ? 'My Lift Circles' : 'My Lift Circle'}
              </h2>
              {userGroupIds.map((groupId) => (
                <div key={groupId} className="circle-card">
                  <GroupMembers
                    groupId={groupId}
                    selectedDate={format(new Date(), 'yyyy-MM-dd')}
                    showFitness={false}
                    showProgress={false}
                    showCheckmarks={false}
                    showLeaveButton={true}
                  />
                </div>
              ))}
              <Encourage />
            </section>
          )}

          <div>
            <GroupSelector
              user={{
                uid: currentUser.uid,
                displayName: currentUser.displayName || '',
                profilePicUrl: currentUser.photoURL || '',
              }}
              onGroupJoined={(newId) =>
                setUserGroupIds((prev) => Array.from(new Set([...prev, newId])))
              }
            />
          </div>

          <div className="fit-section section-box">
            {!googleFitAuthorized && (
              <GoogleFitConnect onAuthorized={() => setGoogleFitAuthorized(true)} />
            )}
            {googleFitAuthorized && (
              <GoogleFitDisconnect onDisconnect={() => setGoogleFitAuthorized(false)} />
            )}
          </div>

          <div className="logout-section">
            <button onClick={handleLogout} className="btn-primary">
              Log Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
