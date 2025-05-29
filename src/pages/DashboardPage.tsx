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
import { Link, useNavigate } from 'react-router-dom'
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
import HomePage from './HomePage'

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userGroupIds, setUserGroupIds] = useState<string[]>([])

  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set())
  const [prayerDates,    setPrayerDates]    = useState<Set<string>>(new Set())
  const [fitnessDates,   setFitnessDates]   = useState<Set<string>>(new Set())

  const [googleFitAuthorized, setGoogleFitAuthorized] = useState(false)
  const [loading, setLoading]                         = useState(true)

  const navigate = useNavigate()

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

  useEffect(() => {
    if (!currentUser) {
      setCompletedDates(new Set())
      setPrayerDates(new Set())
      setFitnessDates(new Set())
      return
    }

    const fetchCompleted = async () => {
      const today = new Date()
      const days = eachDayOfInterval({
        start: startOfMonth(today),
        end:   endOfMonth(today),
      })

      const fullSet = new Set<string>()
      const praySet = new Set<string>()
      const fitSet  = new Set<string>()

      await Promise.all(
        days.map(async (d) => {
          const dateKey = format(d, 'yyyy-MM-dd')
          const cbDoc   = await getDoc(
            doc(db, 'days', dateKey, 'checkboxes', currentUser.uid)
          )
          if (!cbDoc.exists()) return

          const cb        = cbDoc.data() as {
            prayerDone?: boolean
            videoDone?: boolean
            otherFitnessDone?: boolean
          }
          const didPrayer = !!cb.prayerDone
          const didFit    = !!(cb.videoDone || cb.otherFitnessDone)
          const fitnessOk = isFitnessDay(dateKey)
            ? didFit
            : true

          if (didPrayer)               praySet.add(dateKey)
          if (didFit)                  fitSet.add(dateKey)
          if (didPrayer && fitnessOk)  fullSet.add(dateKey)
        })
      )

      setCompletedDates(fullSet)
      setPrayerDates(praySet)
      setFitnessDates(fitSet)
    }

    fetchCompleted()
  }, [currentUser])

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) return

    await setDoc(
      doc(db, 'groups', groupId, 'members', currentUser.uid),
      {},
      { merge: false }
    )
    const userRef   = doc(db, 'users', currentUser.uid)
    const userSnap  = await getDoc(userRef)
    const currentGs = userSnap.data()?.groupIds || []
    const updated   = currentGs.filter((id: string) => id !== groupId)
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

      {!currentUser && <HomePage />}

      {currentUser && (
        <>
          <header className="dashboard-header">
            <h1 className="welcome">Welcome, {userName}!</h1>
          </header>

          <section>
            <h2 className="section-title">📊 This Month’s Activity</h2>
            <MonthlyHeatmap
              completedDates={completedDates}
              prayerDates={prayerDates}
              fitnessDates={fitnessDates}
            />
          </section>

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
