'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface UserData {
  id: string;
  email: string;
  nome: string;
  is_premium: boolean;
}

interface UserContextType {
  currentUser: UserData | null;
  setCurrentUser: (user: UserData | null) => void;
  refreshUserData: () => Promise<void>;
  isPremium: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Garantir que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Função para carregar dados do usuário do Supabase (memoizada com useCallback)
  const refreshUserData = useCallback(async () => {
    // Só executar no cliente
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const localUser = localStorage.getItem('odrna_current_user');
      if (!localUser) {
        setCurrentUser(null);
        setIsPremium(false);
        return;
      }

      const user = JSON.parse(localUser);
      
      // Buscar dados do usuário no Supabase, PRIORIZANDO is_premium da tabela users
      if (supabase) {
        try {
          const { data: supabaseUser, error } = await supabase
            .from('users')
            .select('id, email, nome, is_premium')
            .eq('email', user.email)
            .single();

          if (error) {
            console.error('Erro ao buscar dados do Supabase:', error);
            // Fallback para dados locais
            const userData: UserData = {
              id: user.id,
              email: user.email,
              nome: user.name || user.email.split('@')[0],
              is_premium: user.is_premium || false
            };
            setCurrentUser(userData);
            setIsPremium(userData.is_premium);
            return;
          }

          // PRIORIDADE ABSOLUTA: is_premium da tabela users do Supabase
          const isPremiumStatus = Boolean(supabaseUser.is_premium);
          
          const userData: UserData = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            nome: supabaseUser.nome,
            is_premium: isPremiumStatus
          };

          setCurrentUser(userData);
          setIsPremium(userData.is_premium);
          
          // Atualizar localStorage com dados atualizados do Supabase
          localStorage.setItem('odrna_current_user', JSON.stringify({
            id: userData.id,
            email: userData.email,
            name: userData.nome,
            is_premium: userData.is_premium
          }));

          console.log('✅ Status Premium verificado no Supabase:', {
            email: userData.email,
            is_premium: userData.is_premium,
            source: 'supabase.users.is_premium'
          });
        } catch (err) {
          console.error('Erro na conexão com Supabase:', err);
          // Fallback para dados locais
          const userData: UserData = {
            id: user.id,
            email: user.email,
            nome: user.name || user.email.split('@')[0],
            is_premium: user.is_premium || false
          };
          setCurrentUser(userData);
          setIsPremium(userData.is_premium);
        }
      } else {
        // Supabase não configurado - usar dados locais
        const userData: UserData = {
          id: user.id,
          email: user.email,
          nome: user.name || user.email.split('@')[0],
          is_premium: user.is_premium || false
        };
        setCurrentUser(userData);
        setIsPremium(userData.is_premium);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setCurrentUser(null);
      setIsPremium(false);
    }
  }, []);

  // Atualizar dados ao montar o componente (quando app abre)
  useEffect(() => {
    if (isClient) {
      refreshUserData();
    }
  }, [isClient, refreshUserData]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, refreshUserData, isPremium }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
}
