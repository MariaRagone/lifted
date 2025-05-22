import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../library/firebase';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/daily-lift-logo.png';


export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || '');
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div>
      <h2>Welcome, {userEmail}!</h2>
      <img className="logo" src={logo} alt="Lift & Lifted Logo" />

      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}
