import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return null; // ou spinner
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
