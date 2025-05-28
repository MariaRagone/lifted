import React from 'react'
import './Encourage.css'

interface EncourageProps {
  message?: string
}

const Encourage: React.FC<EncourageProps> = ({
  message = 'Lift up your friends in prayer and encourage them to do their daily lift!'
}) => {
  return <p className="encourage">{message}</p>
}

export default Encourage
