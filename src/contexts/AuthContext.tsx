
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';

// Define user types
export type UserRole = 'admin' | 'user' | null;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  credits: number;
  joinedAt: Date;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phoneNumber?: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile data from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          phoneNumber: data.phone_number,
          role: data.role,
          credits: 50, // Default credits - this would be replaced with actual credit data in a real app
          joinedAt: new Date(data.created_at)
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch user profile when user is available
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.info('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out');
    }
  };

  const register = async (name: string, email: string, password: string, phoneNumber?: string) => {
    setIsLoading(true);
    try {
      console.log("Registering user with metadata:", { name, phoneNumber });
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone_number: phoneNumber
          }
        }
      });
      
      if (error) throw error;
      
      // Log the response for debugging
      console.log("Supabase registration response:", data);
      
      toast.success('Registration successful');
    } catch (error: any) {
      console.error("Supabase registration error:", error);
      toast.error(error.message || 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    
    setIsLoading(true);
    try {
      // Map profile data to Supabase format
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.phoneNumber !== undefined) updateData.phone_number = data.phoneNumber;
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setProfile({
        ...profile,
        ...data
      });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      });
      
      if (signInError) {
        toast.error('Current password is incorrect');
        throw new Error('Current password is incorrect');
      }
      
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addCredits = (amount: number) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      credits: profile.credits + amount
    });
    
    toast.success(`Added ${amount} credits to your account`);
  };

  const deductCredits = (amount: number) => {
    if (!profile) return false;
    
    if (profile.credits < amount) {
      toast.error('Insufficient credits');
      return false;
    }
    
    setProfile({
      ...profile,
      credits: profile.credits - amount
    });
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      session,
      isLoading, 
      isAdmin: profile?.role === 'admin',
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
