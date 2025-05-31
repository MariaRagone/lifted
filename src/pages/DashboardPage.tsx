import React, { useEffect, useState, useMemo } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { onSnapshot, doc, Unsubscribe, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../library/firebase'
import { useNavigate } from 'react-router-dom'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns'
import { isFitnessDay } from '../utilities/dateHelpers'
import Logo from '../components/Logo'
import GroupSelector from '../components/GroupSelector'
import Encourage from '../components/Encourage'
import MonthlyHeatmap from '../components/MonthlyHeatmap'
import GoogleFitConnect from '../library/GoogleFitConnect'
import GoogleFitDisconnect from '../components/googleFit/GoogleFitDisconnect'
import GroupMembers from '../components/GroupMemembers'
import InviteButton from '../components/InviteButton'
import '../components/Buttons.css'
import './Dashboard.css'
import HomePage from './HomePage'

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userGroupIds, setUserGroupIds] = useState<string[]>([])
  const [circleCode, setCircleCode] = useState<string>('')
  const [circleName, setCircleName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [monthOffset, setMonthOffset] = useState(0)
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set())
  const [prayerDates, setPrayerDates] = useState<Set<string>>(new Set())
  const [fitnessDates, setFitnessDates] = useState<Set<string>>(new Set())
  const [googleFitAuthorized, setGoogleFitAuthorized] = useState(false)

  const viewDate = useMemo(() => addMonths(new Date(), monthOffset), [monthOffset])

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
          setCircleCode(data.circleCode || data.groupIds?.[0] || '')
          setGoogleFitAuthorized(!!data.googleFitAuthorized)
        })
      } else {
        setUserName('')
        setUserGroupIds([])
        setGoogleFitAuthorized(false)
        setCircleCode('')
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
      const days = eachDayOfInterval({
        start: startOfMonth(viewDate),
        end: endOfMonth(viewDate)
      })
      const fullSet = new Set<string>()
      const praySet = new Set<string>()
      const fitSet = new Set<string>()
      await Promise.all(
        days.map(async (d) => {
          const dateKey = format(d, 'yyyy-MM-dd')
          const cbDoc = await getDoc(doc(db, 'days', dateKey, 'checkboxes', currentUser.uid))
          if (!cbDoc.exists()) return
          const cb = cbDoc.data() as {
            prayerDone?: boolean
            videoDone?: boolean
            otherFitnessDone?: boolean
          }
          const didPrayer = !!cb.prayerDone
          const didFit = !!(cb.videoDone || cb.otherFitnessDone)
          const fitnessOk = isFitnessDay(dateKey) ? didFit : true
          if (didPrayer) praySet.add(dateKey)
          if (didFit) fitSet.add(dateKey)
          if (didPrayer && fitnessOk) fullSet.add(dateKey)
        })
      )
      setCompletedDates(fullSet)
      setPrayerDates(praySet)
      setFitnessDates(fitSet)
    }
    fetchCompleted()
  }, [currentUser, viewDate])

  useEffect(() => {
    if (!circleCode) {
      setCircleName('')
      return
    }
    const fetchGroupName = async () => {
      try {
        const circleDoc = await getDoc(doc(db, 'groups', circleCode))
        if (circleDoc.exists()) {
          const data = circleDoc.data()
          setCircleName((data as any).name || '')
        } else {
          setCircleName('')
        }
      } catch {
        setCircleName('')
      }
    }
    fetchGroupName()
  }, [circleCode])

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) return
    await setDoc(doc(db, 'groups', groupId, 'members', currentUser.uid), {}, { merge: false })
    const userRef = doc(db, 'users', currentUser.uid)
    const userSnap = await getDoc(userRef)
    const currentGs: string[] = userSnap.data()?.groupIds || []
    const updated = currentGs.filter((id) => id !== groupId)
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
          <section className="section-box">
            <h2 className="section-title">📊 This Month’s Activity</h2>
            <MonthlyHeatmap
              viewDate={viewDate}
              completedDates={completedDates}
              prayerDates={prayerDates}
              fitnessDates={fitnessDates}
            />
            <div className="month-nav">
              <button onClick={() => setMonthOffset((o) => o - 1)}>← Prev</button>
              <button onClick={() => setMonthOffset((o) => o + 1)}>Next →</button>
            </div>
          </section>
          {userGroupIds.length > 0 && (
            <section className="circles-section section-box">
              <h2 className="section-title">
                💛 {userGroupIds.length > 1 ? 'My Lift Circles' : 'My Lift Circle'}
              </h2>
              <p>{circleName}</p>
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
                profilePicUrl: currentUser.photoURL || ''
              }}
              onGroupJoined={(newId) => {
                setUserGroupIds((prev) => Array.from(new Set([...prev, newId])))
                setCircleCode(newId)
              }}
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
            <button onClick={handleLogout} className="btn-primary">Log Out</button>
          </div>
        </>
      )}
    </div>
  )
}
