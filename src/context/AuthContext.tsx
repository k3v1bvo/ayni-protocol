'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile, UserRole } from '@/lib/supabase/types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setDemoUser: (role: UserRole) => void;
}

const DEMO_USERS: Record<UserRole, UserProfile> = {
  client: {
    id: '00000000-0000-0000-0000-000000000002',
    wallet_address: '0x2B5AD5c4795c026514f8317c7a215E218DcCD6CF',
    full_name: 'Dra. Claudia Vargas R.',
    email: 'claudia.vargas@ayni.io',
    phone: '+591 71234567',
    role: 'client',
    reputation_score: 5.0,
    guarantee_balance: 0.0,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  traveler: {
    id: '00000000-0000-0000-0000-000000000001',
    wallet_address: '0x71C83f707f1B78B06Ac5eB0135d97FeC1b5F4295',
    full_name: 'Alejandro Mamani Choque',
    email: 'alejandro.viajero@ayni.io',
    phone: '+591 76543210',
    role: 'traveler',
    reputation_score: 4.95,
    guarantee_balance: 250.0,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  merchant: {
    id: '00000000-0000-0000-0000-000000000003',
    wallet_address: '0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69',
    full_name: 'Artesanías & Textiles Illimani',
    email: 'comercio.illimani@ayni.io',
    phone: '+591 78901234',
    role: 'merchant',
    reputation_score: 4.88,
    guarantee_balance: 500.0,
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
  admin: {
    id: '00000000-0000-0000-0000-000000000004',
    wallet_address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
    full_name: 'Auditor Ayni Protocol',
    email: 'auditor@ayni.io',
    phone: '+591 70000000',
    role: 'admin',
    reputation_score: 5.0,
    guarantee_balance: 1000.0,
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión inicial
  useEffect(() => {
    async function initSession() {
      if (!isSupabaseConfigured) {
        // En entorno local de demostración, cargamos por defecto el perfil de viajero
        const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('ayni_demo_role') : null;
        const initialRole = (savedDemo as UserRole) || 'traveler';
        setUser(DEMO_USERS[initialRole] || DEMO_USERS.traveler);
        setIsLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Traer perfil de la base de datos
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
          } else {
            // Perfil fallback con metadata de auth
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              role: session.user.user_metadata?.role || 'client',
              reputation_score: 5.0,
              guarantee_balance: 0.0,
              avatar_url: session.user.user_metadata?.avatar_url,
            });
          }
        }
      } catch (err) {
        console.error('Error cargando sesión de Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Modo demo
      const found = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setUser(found);
        return { error: null };
      }
      setUser({
        id: 'demo-user-' + Date.now(),
        email,
        full_name: email.split('@')[0],
        role: 'client',
        reputation_score: 5.0,
        guarantee_balance: 0.0,
      });
      return { error: null };
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Refrescar usuario
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      if (profile) setUser(profile);
    }
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string, role: UserRole) => {
    if (!isSupabaseConfigured) {
      const newUser: UserProfile = {
        id: 'user-' + Date.now(),
        email,
        full_name: fullName,
        role,
        reputation_score: 5.0,
        guarantee_balance: role === 'traveler' ? 50.0 : 0.0,
      };
      setUser(newUser);
      return { error: null };
    }

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) return { error: error.message };

    if (data.user) {
      // Asegurar inserción inmediata en tabla pública
      await supabase.from('users').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        reputation_score: 5.0,
        guarantee_balance: 0.0,
      });
      setUser({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        reputation_score: 5.0,
        guarantee_balance: 0.0,
      });
    }

    return { error: null };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      // Simulación en modo demo
      setUser(DEMO_USERS.client);
      return { error: null };
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const setDemoUser = (targetRole: UserRole) => {
    const selected = DEMO_USERS[targetRole] || DEMO_USERS.traveler;
    setUser(selected);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayni_demo_role', targetRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'client',
        isLoading,
        isConfigured: isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
