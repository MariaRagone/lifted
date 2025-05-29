import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../library/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import "./Login.css";
import icon from '../assets/google-icon.png';
import "../components/Buttons.css";
import './Login.css';
import Logo from '../components/Logo';
import AppInfo from '../components/AppInfo';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/devotional');
    } catch (err) {
      alert('Google sign-in failed');
      console.error(err);
    }
  };
  

  return (
    <>
    <div className="login-container">
        <Logo size={200} aria-label='logo of a cross and a dumbbell that says daily lift'/>
        <button className="google-login-button" onClick={handleGoogleLogin}>
        <img src={icon} className="google-icon" />
        Sign in with Google
      </button>
    </div>

      <AppInfo />
      </>
  );
};

export default LoginPage;
