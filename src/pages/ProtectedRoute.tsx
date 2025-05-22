import type { JSX } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}
