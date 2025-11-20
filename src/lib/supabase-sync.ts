import { supabase } from './supabase';
import { Task, CalendarEvent, Transaction } from './types';

/**
 * Sincroniza dados locais com o Supabase (PC <-> Celular)
 * Usa auth.uid() automaticamente através das políticas RLS
 */

// Salvar tarefas no Supabase
export async function syncTasksToSupabase(tasks: Task[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('⚠️ Usuário não autenticado - sincronização ignorada');
      return;
    }

    // Primeiro, buscar dados existentes
    const { data: existing, error: fetchError } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      // Atualizar registro existente
      const { error } = await supabase
        .from('user_data')
        .update({
          tasks,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Criar novo registro
      const { error } = await supabase
        .from('user_data')
        .insert({
          user_id: user.id,
          tasks,
          events: [],
          transactions: [],
        });

      if (error) throw error;
    }

    console.log('✅ Tarefas sincronizadas com Supabase');
  } catch (error: any) {
    console.error('❌ Erro ao sincronizar tarefas:', error);
    if (error.code === '42501') {
      console.error('🔒 Políticas RLS não configuradas. Configure as políticas no Supabase.');
    }
  }
}

// Salvar eventos no Supabase
export async function syncEventsToSupabase(events: CalendarEvent[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('⚠️ Usuário não autenticado - sincronização ignorada');
      return;
    }

    // Primeiro, buscar dados existentes
    const { data: existing, error: fetchError } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      // Atualizar registro existente
      const { error } = await supabase
        .from('user_data')
        .update({
          events,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Criar novo registro
      const { error } = await supabase
        .from('user_data')
        .insert({
          user_id: user.id,
          tasks: [],
          events,
          transactions: [],
        });

      if (error) throw error;
    }

    console.log('✅ Eventos sincronizados com Supabase');
  } catch (error: any) {
    console.error('❌ Erro ao sincronizar eventos:', error);
    if (error.code === '42501') {
      console.error('🔒 Políticas RLS não configuradas. Configure as políticas no Supabase.');
    }
  }
}

// Salvar transações no Supabase
export async function syncTransactionsToSupabase(transactions: Transaction[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('⚠️ Usuário não autenticado - sincronização ignorada');
      return;
    }

    // Primeiro, buscar dados existentes
    const { data: existing, error: fetchError } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      // Atualizar registro existente
      const { error } = await supabase
        .from('user_data')
        .update({
          transactions,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Criar novo registro
      const { error } = await supabase
        .from('user_data')
        .insert({
          user_id: user.id,
          tasks: [],
          events: [],
          transactions,
        });

      if (error) throw error;
    }

    console.log('✅ Transações sincronizadas com Supabase');
  } catch (error: any) {
    console.error('❌ Erro ao sincronizar transações:', error);
    if (error.code === '42501') {
      console.error('🔒 Políticas RLS não configuradas. Configure as políticas no Supabase.');
    }
  }
}

// Carregar tarefas do Supabase
export async function loadTasksFromSupabase(): Promise<Task[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('⚠️ Usuário não autenticado - retornando dados vazios');
      return [];
    }

    const { data, error } = await supabase
      .from('user_data')
      .select('tasks')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        return [];
      }
      throw error;
    }
    
    return (data?.tasks as Task[]) || [];
  } catch (error: any) {
    console.error('❌ Erro ao carregar tarefas:', error);
    if (error.code === '42501') {
      console.error('🔒 Políticas RLS não configuradas. Configure as políticas no Supabase.');
    }
    return [];
  }
}

// Carregar eventos do Supabase
export async function loadEventsFromSupabase(): Promise<CalendarEvent[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('⚠️ Usuário não autenticado - retornando dados vazios');
      return [];
    }

    const { data, error } = await supabase
      .from('user_data')
      .select('events')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        return [];
      }
      throw error;
    }
    
    return (data?.events as CalendarEvent[]) || [];
  } catch (error: any) {
    console.error('❌ Erro ao carregar eventos:', error);
    if (error.code === '42501') {
      console.error('🔒 Políticas RLS não configuradas. Configure as políticas no Supabase.');
    }
    return [];
  }
}

// Carregar transações do Supabase
export async function loadTransactionsFromSupabase(): Promise<Transaction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('⚠️ Usuário não autenticado - retornando dados vazios');
      return [];
    }

    const { data, error } = await supabase
      .from('user_data')
      .select('transactions')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        return [];
      }
      throw error;
    }
    
    return (data?.transactions as Transaction[]) || [];
  } catch (error: any) {
    console.error('❌ Erro ao carregar transações:', error);
    if (error.code === '42501') {
      console.error('🔒 Políticas RLS não configuradas. Configure as políticas no Supabase.');
    }
    return [];
  }
}

// Sincronização completa (carregar do Supabase para localStorage)
export async function loadAllDataFromSupabase() {
  try {
    const tasks = await loadTasksFromSupabase();
    const events = await loadEventsFromSupabase();
    const transactions = await loadTransactionsFromSupabase();

    console.log('✅ Dados carregados do Supabase');
    return { tasks, events, transactions };
  } catch (error) {
    console.error('❌ Erro ao carregar dados do Supabase:', error);
    return { tasks: [], events: [], transactions: [] };
  }
}

// Sincronização completa (salvar do localStorage para Supabase)
export async function syncAllDataToSupabase(tasks: Task[], events: CalendarEvent[], transactions: Transaction[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('⚠️ Usuário não autenticado - sincronização ignorada');
      return;
    }

    // Verificar se já existe registro
    const { data: existing, error: fetchError } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      // Atualizar registro existente
      const { error } = await supabase
        .from('user_data')
        .update({
          tasks,
          events,
          transactions,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Criar novo registro
      const { error } = await supabase
        .from('user_data')
        .insert({
          user_id: user.id,
          tasks,
          events,
          transactions,
        });

      if (error) throw error;
    }

    console.log('✅ Todos os dados sincronizados com Supabase');
  } catch (error: any) {
    console.error('❌ Erro ao sincronizar dados:', error);
    if (error.code === '42501') {
      console.error('🔒 Políticas RLS não configuradas. Configure as políticas no Supabase.');
    }
  }
}
