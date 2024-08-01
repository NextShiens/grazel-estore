"use client";
import { useAuth } from '@/app/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
const getLocalStorage = (key) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key)
  }
  return null
}

const setLocalStorage = (key, value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value)
  }
}


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const token = getLocalStorage("token")

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