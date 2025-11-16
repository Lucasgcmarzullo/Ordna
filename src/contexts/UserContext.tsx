'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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

  // Função para carregar dados do usuário do localStorage (memoizada com useCallback)
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
      
      // Usar dados locais diretamente (sem tentar conectar ao Supabase)
      const userData: UserData = {
        id: user.id,
        email: user.email,
        nome: user.name || user.email.split('@')[0],
        is_premium: false // Por padrão, usuários não são premium
      };

      setCurrentUser(userData);
      setIsPremium(userData.is_premium);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setCurrentUser(null);
      setIsPremium(false);
    }
  }, []); // Array vazio: função só é criada uma vez

  // Atualizar dados ao montar o componente (quando app abre)
  useEffect(() => {
    if (isClient) {
      refreshUserData();
    }
  }, [isClient, refreshUserData]); // Agora refreshUserData está nas dependências

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
