
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  faceData?: string;
}

interface UserContextType {
  users: User[];
  currentUser: User | null;
  registerUser: (userData: Omit<User, 'id'>) => void;
  loginUser: (email: string, password: string) => boolean;
  setCurrentUser: (user: User | null) => void;
  updateUserFace: (userId: string, faceData: string) => void;
  verifyFace: (faceData: string) => boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const registerUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  const loginUser = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const updateUserFace = (userId: string, faceData: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, faceData } : user
    ));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, faceData });
    }
  };

  const verifyFace = (faceData: string) => {
    if (!currentUser || !currentUser.faceData) return false;
    // Simple verification - in real app, use ML comparison
    return faceData.length > 0 && currentUser.faceData.length > 0;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{
      users,
      currentUser,
      registerUser,
      loginUser,
      setCurrentUser,
      updateUserFace,
      verifyFace,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
