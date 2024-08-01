"use client";
import { useAuth } from '@/app/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const token = localStorage.getItem("token")

  useEffect(() => {
    // if (!loading && !user) {
    //   router.push('/signIn');
    // }
    if (!token) {
      router.push('/signIn');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>; // Or your custom loading component
  }

  return user ? children : null;
};

export default ProtectedRoute;