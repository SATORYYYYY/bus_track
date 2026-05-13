import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getUserProfile } from './utils/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      console.log('🔍 AuthContext - проверка профиля, токен:', token ? 'есть' : 'нет');
      if (token) {
        try {
          console.log('🔄 Получение профиля пользователя...');
          const userProfile = await getUserProfile(token);
          
          if (userProfile) {
            const adminStatus = userProfile.is_staff || userProfile.is_superuser;
            console.log('✅ Профиль загружен:', {
              username: userProfile.username,
              is_staff: userProfile.is_staff,
              is_superuser: userProfile.is_superuser,
              isAdmin: adminStatus
            });
            setUser(userProfile);
            setIsAdmin(adminStatus);
          } else {
            console.log('❌ Профиль не загружен');
            setUser(null);
            setIsAdmin(false);
            localStorage.removeItem('token');
            setToken(null);
            // Перенаправляем на страницу входа
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        } catch (error) {
          console.error('❌ Ошибка получения профиля:', error);
          setUser(null);
          setIsAdmin(false);
          localStorage.removeItem('token');
          setToken(null);
          // Перенаправляем на страницу входа
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        console.log('❌ Нет токена, пользователь не авторизован');
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkUserProfile();
  }, [token]);

  const login = async (username, password) => {
    try {
      console.log('🔐 Попытка входа для пользователя:', username);
      const response = await axios.post('http://localhost:8000/auth/jwt/create/', { username, password });
      const { access } = response.data;
      console.log('✅ Получен токен:', access.substring(0, 20) + '...');
      
      localStorage.setItem('token', access);
      setToken(access);
      
      console.log('✅ Токен сохранен в localStorage');
    } catch (error) {
      console.error('❌ Ошибка входа:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};