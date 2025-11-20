'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Task, CalendarEvent, Transaction } from '@/lib/types';

export interface UserDataRecord {
  id?: string;
  user_id: string;
  tasks: Task[];
  events: CalendarEvent[];
  transactions: Transaction[];
  created_at?: string;
  updated_at?: string;
}

export function useUserData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CREATE - Criar novo registro de dados do usuário
  const createUserData = async (data: Omit<UserDataRecord, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error: err } = await supabase
        .from('user_data')
        .insert([{
          user_id: data.user_id,
          tasks: data.tasks,
          events: data.events,
          transactions: data.transactions,
        }])
        .select()
        .single();

      if (err) throw err;
      return result;
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Erro ao criar dados do usuário:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // READ - Buscar dados do usuário autenticado
  const getUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error: err } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (err) {
        // Se não encontrar dados, retorna estrutura vazia
        if (err.code === 'PGRST116') {
          return {
            user_id: user.id,
            tasks: [],
            events: [],
            transactions: [],
          };
        }
        throw err;
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Erro ao buscar dados do usuário:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE - Atualizar dados do usuário autenticado
  const updateUserData = async (updates: Partial<Omit<UserDataRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error: err } = await supabase
        .from('user_data')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Erro ao atualizar dados do usuário:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // UPSERT - Criar ou atualizar dados do usuário
  const upsertUserData = async (data: Omit<UserDataRecord, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: result, error: err } = await supabase
        .from('user_data')
        .upsert({
          user_id: data.user_id,
          tasks: data.tasks,
          events: data.events,
          transactions: data.transactions,
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (err) throw err;
      return result;
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Erro ao fazer upsert dos dados do usuário:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Funções específicas para cada tipo de dado
  const updateTasks = async (tasks: Task[]) => {
    return updateUserData({ tasks });
  };

  const updateEvents = async (events: CalendarEvent[]) => {
    return updateUserData({ events });
  };

  const updateTransactions = async (transactions: Transaction[]) => {
    return updateUserData({ transactions });
  };

  return {
    loading,
    error,
    createUserData,
    getUserData,
    updateUserData,
    upsertUserData,
    updateTasks,
    updateEvents,
    updateTransactions,
  };
}
