import React, { useState } from 'react'

interface InviteButtonProps {
  myUid: string
  circleCode: string
}

const InviteButton: React.FC<InviteButtonProps> = ({ myUid, circleCode }) => {
  const [copied, setCopied] = useState(false)

  const shareText = `Join my Lift Circle! ${window.location.origin}/join?ref=${myUid}  — Use code "${circleCode}" to join.`

  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invite to Lift & Lifted',
          text: shareText,
          url: `${window.location.origin}/join?ref=${myUid}`,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        alert(`Copy this link to share:\n${shareText}`)
      }
    }
  }

  return (
    <button onClick={onShare} className="btn-primary" style={{ marginTop: 12 }}>
      Invite a Friend {copied && <small>✓ Copied</small>}
    </button>
  )
}

export default InviteButton
