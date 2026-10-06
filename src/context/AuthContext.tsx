import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteUser } from '../types';
import { 
  getCurrentSessionUser, 
  setCurrentSessionUser, 
  findUserForAuth, 
  registerSiteUser, 
  saveSiteUser,
  fetchSiteUsers
} from '../lib/db';

interface AuthContextType {
  currentUser: SiteUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; message?: string; user?: SiteUser }>;
  register: (data: {
    fullName: string;
    phoneNumber: string;
    nationalCode: string;
    email?: string;
    userRole?: 'producer' | 'director' | 'customer' | 'artist';
    password?: string;
  }) => Promise<{ success: boolean; message?: string; user?: SiteUser }>;
  logout: () => void;
  updateProfile: (updatedData: Partial<SiteUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SiteUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from session
  useEffect(() => {
    try {
      const sessionUser = getCurrentSessionUser();
      if (sessionUser) {
        setCurrentUser(sessionUser);
      }
    } catch (e) {
      console.error('Failed to load session user', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, _password?: string) => {
    setIsLoading(true);
    try {
      const user = await findUserForAuth(identifier);
      if (user) {
        user.lastLogin = 'همین الان';
        await saveSiteUser(user);
        setCurrentSessionUser(user);
        setCurrentUser(user);
        return { success: true, user };
      } else {
        // If not found, let's check if the identifier looks like a valid phone or national code
        // and offer to register or create a quick account
        return { 
          success: false, 
          message: 'حساب کاربری با این مشخصات یافت نشد. لطفاً ابتدا ثبت‌نام فرمایید.' 
        };
      }
    } catch (err) {
      console.error('Login error', err);
      return { success: false, message: 'خطا در ارتباط با سرور. لطفاً دوباره تلاش فرمایید.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    fullName: string;
    phoneNumber: string;
    nationalCode: string;
    email?: string;
    userRole?: 'producer' | 'director' | 'customer' | 'artist';
    password?: string;
  }) => {
    setIsLoading(true);
    try {
      const user = await registerSiteUser(data);
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      console.error('Registration error', err);
      return { success: false, message: 'خطا در ثبت‌نام. لطفاً مجدداً بررسی فرمایید.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentSessionUser(null);
    setCurrentUser(null);
  };

  const updateProfile = async (updatedData: Partial<SiteUser>) => {
    if (!currentUser) return;
    const merged: SiteUser = { ...currentUser, ...updatedData };
    await saveSiteUser(merged);
    setCurrentSessionUser(merged);
    setCurrentUser(merged);
  };

  const refreshUser = async () => {
    if (!currentUser) return;
    const all = await fetchSiteUsers();
    const fresh = all.find(u => u.id === currentUser.id);
    if (fresh) {
      setCurrentSessionUser(fresh);
      setCurrentUser(fresh);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
