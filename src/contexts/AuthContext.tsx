
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';

// Define user types
export type UserRole = 'admin' | 'user' | null;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  credits: number;
  joinedAt: Date;
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, phoneNumber?: string) => Promise<void>;
  updateProfile: (data: Partial<AppUser>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo purposes
const MOCK_ADMIN: AppUser = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  phoneNumber: '+1234567890',
  role: 'admin',
  credits: 1000,
  joinedAt: new Date('2023-01-01')
};

const MOCK_USER: AppUser = {
  id: 'user-1',
  name: 'Demo User',
  email: 'user@example.com',
  phoneNumber: '+9876543210',
  role: 'user',
  credits: 50,
  joinedAt: new Date('2023-06-15')
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        if (session?.user) {
          try {
            // Demo users for easy testing
            if (session.user.email === 'admin@example.com') {
              setUser(MOCK_ADMIN);
            } else if (session.user.email === 'user@example.com') {
              setUser(MOCK_USER);
            } else {
              // Get user profile from Supabase
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching user profile:', error);
                toast.error('Failed to load user profile');
              } else if (profileData) {
                setUser({
                  id: profileData.id,
                  name: profileData.name || session.user.user_metadata.name || '',
                  email: profileData.email || session.user.email || '',
                  phoneNumber: profileData.phone_number || session.user.user_metadata.phone_number || '',
                  role: (profileData.role as UserRole) || 'user',
                  credits: profileData.credits || 0,
                  joinedAt: new Date(profileData.created_at || new Date())
                });
              }
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Handle initial session (similar logic as above)
        if (session.user.email === 'admin@example.com') {
          setUser(MOCK_ADMIN);
        } else if (session.user.email === 'user@example.com') {
          setUser(MOCK_USER);
        } else {
          // We'll let the onAuthStateChange handler above handle the profile fetching
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Login attempt with:", email);
      
      // Special case for demo accounts
      if (email === 'admin@example.com' && password === 'admin') {
        setUser(MOCK_ADMIN);
        console.log("Mock admin login successful");
        toast.success('Logged in as admin');
        return;
      } else if (email === 'user@example.com' && password === 'user') {
        setUser(MOCK_USER);
        console.log("Mock user login successful");
        toast.success('Logged in successfully');
        return;
      }

      // Real login with Supabase
      console.log("Attempting Supabase login");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Supabase login error:", error);
        throw error;
      }

      console.log("Supabase login successful:", data);
      toast.success('Logged in successfully');
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof AuthError ? error.message : 'Invalid credentials');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.info('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phoneNumber?: string) => {
    setIsLoading(true);
    try {
      console.log("Registration attempt:", { name, email, phoneNumber });
      
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone_number: phoneNumber,
          }
        }
      });

      if (error) {
        console.error("Registration error:", error);
        throw error;
      }

      console.log("Registration response:", data);
      
      if (data.user) {
        // The profile will be created automatically by the database trigger
        toast.success('Registration successful');
        
        // For demo accounts, set the user immediately
        if (email === 'admin@example.com') {
          setUser(MOCK_ADMIN);
        } else if (email === 'user@example.com') {
          setUser(MOCK_USER);
        }
      } else {
        toast.info('Please check your email to confirm your registration');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof AuthError ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<AppUser>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Email should not be updated
      const { email, ...updateData } = data;
      
      if (user.email === 'admin@example.com' || user.email === 'user@example.com') {
        // Mock update for demo users
        setUser({
          ...user,
          ...updateData
        });
      } else {
        // Update profile in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({
            name: updateData.name,
            phone_number: updateData.phoneNumber,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (error) {
          throw error;
        }
        
        setUser({
          ...user,
          ...updateData
        });
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // For demo users
      if (user.email === 'admin@example.com' || user.email === 'user@example.com') {
        const validCurrentPassword = 
          (user.email === 'admin@example.com' && currentPassword === 'admin') ||
          (user.email === 'user@example.com' && currentPassword === 'user');
        
        if (!validCurrentPassword) {
          toast.error('Current password is incorrect');
          throw new Error('Current password is incorrect');
        }
        toast.success('Password updated successfully');
        return;
      }
      
      // Real password update with Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Update password error:', error);
      toast.error(error instanceof AuthError ? error.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const addCredits = (amount: number) => {
    if (!user) return;
    
    if (user.email === 'admin@example.com' || user.email === 'user@example.com') {
      // Mock update for demo users
      setUser({
        ...user,
        credits: user.credits + amount
      });
      toast.success(`Added ${amount} credits to your account`);
      return;
    }
    
    // Update credits in Supabase
    supabase
      .from('profiles')
      .update({
        credits: user.credits + amount
      })
      .eq('id', user.id)
      .then(({ error }) => {
        if (error) {
          toast.error('Failed to add credits');
          return;
        }
        
        setUser({
          ...user,
          credits: user.credits + amount
        });
        
        toast.success(`Added ${amount} credits to your account`);
      });
  };

  const deductCredits = (amount: number) => {
    if (!user) return false;
    
    if (user.credits < amount) {
      toast.error('Insufficient credits');
      return false;
    }
    
    if (user.email === 'admin@example.com' || user.email === 'user@example.com') {
      // Mock update for demo users
      setUser({
        ...user,
        credits: user.credits - amount
      });
      return true;
    }
    
    // Update credits in Supabase
    supabase
      .from('profiles')
      .update({
        credits: user.credits - amount
      })
      .eq('id', user.id)
      .then(({ error }) => {
        if (error) {
          toast.error('Failed to deduct credits');
          return false;
        }
        
        setUser({
          ...user,
          credits: user.credits - amount
        });
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
      updateProfile,
      updatePassword,
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
