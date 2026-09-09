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

const TEST_PROFILES: Record<UserRole, UserProfile> = {
  client: {
    id: '11111111-1111-4111-a111-111111111111',
    wallet_address: '0x71A09E1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F',
    full_name: 'Ana María Quispe',
    email: 'cliente@ayni.app',
    phone: '+591 71234567',
    role: 'client',
    reputation_score: 4.90,
    guarantee_balance: 0.0,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  traveler: {
    id: '22222222-2222-4222-a222-222222222222',
    wallet_address: '0x3a82F7B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9',
    full_name: 'Alejandro Mamani',
    email: 'viajero@ayni.app',
    phone: '+34 612345678',
    role: 'traveler',
    reputation_score: 4.95,
    guarantee_balance: 500.0,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  merchant: {
    id: '33333333-3333-4333-a333-333333333333',
    wallet_address: '0x9B11Cd88A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8',
    full_name: 'Demetrio Flores (Sabores & Artesanías)',
    email: 'comercio@ayni.app',
    phone: '+591 79876543',
    role: 'merchant',
    reputation_score: 4.88,
    guarantee_balance: 250.0,
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
  admin: {
    id: '44444444-4444-4444-a444-444444444444',
    wallet_address: '0x000000000000000000000000000000000000dEaD',
    full_name: 'Auditor Oficial AYNI',
    email: 'admin@ayni.app',
    phone: '+591 22446688',
    role: 'admin',
    reputation_score: 5.0,
    guarantee_balance: 10000.0,
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicialización de sesión y sincronización con Supabase
  useEffect(() => {
    async function initSession() {
      // 1. Revisar si hay un perfil guardado en localStorage
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('ayni_active_profile');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Error parseando perfil guardado:', e);
          }
        }
      }

      if (!isSupabaseConfigured) {
        setUser(TEST_PROFILES.traveler);
        setIsLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Traer perfil de public.profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
            if (typeof window !== 'undefined') {
              localStorage.setItem('ayni_active_profile', JSON.stringify(profile));
            }
          } else {
            const fallback: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              role: (session.user.user_metadata?.role as UserRole) || 'client',
              reputation_score: 5.0,
              guarantee_balance: 0.0,
              avatar_url: session.user.user_metadata?.avatar_url,
            };
            setUser(fallback);
          }
        } else {
          // Por defecto en desarrollo activo, cargamos el perfil del viajero
          setUser(TEST_PROFILES.traveler);
        }
      } catch (err) {
        console.error('Error inicializando sesión con Supabase:', err);
        setUser(TEST_PROFILES.traveler);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    const cleanEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      
      // 1. Intentar inicio de sesión estándar con Supabase Auth
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!authError && authData?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          const activeUser = profile || {
            id: authData.user.id,
            email: authData.user.email || cleanEmail,
            full_name: authData.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            role: (authData.user.user_metadata?.role as UserRole) || 'client',
            reputation_score: 5.0,
            guarantee_balance: 0.0,
          };

          setUser(activeUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ayni_active_profile', JSON.stringify(activeUser));
          }
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase Auth error:', err);
      }

      // 2. Consulta directa a la tabla public.profiles de Supabase
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .single();

        if (profile) {
          setUser(profile);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ayni_active_profile', JSON.stringify(profile));
          }
          return { error: null };
        }
      } catch (err) {
        console.warn('Profiles table check error:', err);
      }
    }

    // 3. Coincidencia con credenciales maestras de prueba
    const match = Object.values(TEST_PROFILES).find(u => u.email.toLowerCase() === cleanEmail);
    if (match) {
      setUser(match);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ayni_active_profile', JSON.stringify(match));
      }
      return { error: null };
    }

    // Si es un correo nuevo durante la prueba
    const newProfile: UserProfile = {
      id: 'usr-' + Date.now(),
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0],
      role: 'client',
      reputation_score: 5.0,
      guarantee_balance: 0.0,
    };
    setUser(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayni_active_profile', JSON.stringify(newProfile));
    }
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string, role: UserRole): Promise<{ error: string | null }> => {
    const cleanEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
            },
          },
        });

        if (data?.user) {
          // Inserción directa en profiles
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: cleanEmail,
            full_name: fullName,
            role,
            reputation_score: 5.0,
            guarantee_balance: role === 'traveler' ? 50.0 : 0.0,
            country: 'Bolivia',
            verified_id: true,
          });

          const createdUser: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            full_name: fullName,
            role,
            reputation_score: 5.0,
            guarantee_balance: role === 'traveler' ? 50.0 : 0.0,
          };
          setUser(createdUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ayni_active_profile', JSON.stringify(createdUser));
          }
          return { error: null };
        }
      } catch (err: unknown) {
        console.warn('SignUp error:', err);
      }
    }

    // Fallback local
    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      email: cleanEmail,
      full_name: fullName,
      role,
      reputation_score: 5.0,
      guarantee_balance: role === 'traveler' ? 50.0 : 0.0,
    };
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayni_active_profile', JSON.stringify(newUser));
    }
    return { error: null };
  };

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured) {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    }
    setUser(TEST_PROFILES.client);
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      } catch (e) {
        console.error('SignOut error:', e);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ayni_active_profile');
    }
    setUser(null);
  };

  const setDemoUser = (targetRole: UserRole) => {
    const selected = TEST_PROFILES[targetRole] || TEST_PROFILES.traveler;
    setUser(selected);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayni_active_profile', JSON.stringify(selected));
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
