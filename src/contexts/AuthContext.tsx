
import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

// Define user types
export type UserRole = 'admin' | 'user' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  credits: number;
  joinedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo purposes
const MOCK_ADMIN: User = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  credits: 1000,
  joinedAt: new Date('2023-01-01')
};

const MOCK_USER: User = {
  id: 'user-1',
  name: 'Demo User',
  email: 'user@example.com',
  role: 'user',
  credits: 50,
  joinedAt: new Date('2023-06-15')
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (email === 'admin@example.com' && password === 'admin') {
        setUser(MOCK_ADMIN);
        toast.success('Logged in as admin');
      } else if (email === 'user@example.com' && password === 'user') {
        setUser(MOCK_USER);
        toast.success('Logged in successfully');
      } else {
        toast.error('Invalid credentials');
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    toast.info('Logged out successfully');
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, just create a new user object and log them in
      const newUser: User = {
        id: `user-${Math.floor(Math.random() * 1000)}`,
        name,
        email,
        role: 'user',
        credits: 20, // Free starting credits
        joinedAt: new Date()
      };
      
      setUser(newUser);
      toast.success('Registration successful');
    } finally {
      setIsLoading(false);
    }
  };

  const addCredits = (amount: number) => {
    if (!user) return;
    
    setUser({
      ...user,
      credits: user.credits + amount
    });
    
    toast.success(`Added ${amount} credits to your account`);
  };

  const deductCredits = (amount: number) => {
    if (!user) return false;
    
    if (user.credits < amount) {
      toast.error('Insufficient credits');
      return false;
    }
    
    setUser({
      ...user,
      credits: user.credits - amount
    });
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAdmin: user?.role === 'admin',
      login, 
      logout, 
      register,
      addCredits,
      deductCredits
    }}>
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
