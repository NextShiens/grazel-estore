"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProfileApi } from "@/apis";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserFromToken() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await getProfileApi();
          setUser(data.user);
          localStorage.setItem('theUser', JSON.stringify(data.user));
        } catch (error) {
          console.error("Failed to load user", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    }
    loadUserFromToken();
  }, []);

  const login = async (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


export const AuthConsumer = AuthContext.Consumer;