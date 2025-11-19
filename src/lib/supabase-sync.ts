import { supabase } from './supabase';
import { getTasks, getEvents, getTransactions, saveTasks, saveEvents, saveTransactions } from './storage';
import { Task, Event, Transaction } from './types';

/**
 * Sincroniza dados locais com o Supabase (PC <-> Celular)
 */

// Salvar tarefas no Supabase
export async function syncTasksToSupabase(userId: string, tasks: Task[]) {
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        data_type: 'tasks',
        data: tasks,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    console.log('✅ Tarefas sincronizadas com Supabase');
  } catch (error) {
    console.error('❌ Erro ao sincronizar tarefas:', error);
  }
}

// Salvar eventos no Supabase
export async function syncEventsToSupabase(userId: string, events: Event[]) {
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        data_type: 'events',
        data: events,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    console.log('✅ Eventos sincronizados com Supabase');
  } catch (error) {
    console.error('❌ Erro ao sincronizar eventos:', error);
  }
}

// Salvar transações no Supabase
export async function syncTransactionsToSupabase(userId: string, transactions: Transaction[]) {
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        data_type: 'transactions',
        data: transactions,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    console.log('✅ Transações sincronizadas com Supabase');
  } catch (error) {
    console.error('❌ Erro ao sincronizar transações:', error);
  }
}

// Carregar dados do Supabase
export async function loadDataFromSupabase(userId: string, dataType: 'tasks' | 'events' | 'transactions') {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .eq('data_type', dataType)
      .single();

    if (error) throw error;
    return data?.data || [];
  } catch (error) {
    console.error(`❌ Erro ao carregar ${dataType}:`, error);
    return [];
  }
}

// Sincronização completa (carregar do Supabase para localStorage)
export async function loadAllDataFromSupabase(userId: string) {
  try {
    const tasks = await loadDataFromSupabase(userId, 'tasks');
    const events = await loadDataFromSupabase(userId, 'events');
    const transactions = await loadDataFromSupabase(userId, 'transactions');

    if (tasks.length > 0) saveTasks(tasks);
    if (events.length > 0) saveEvents(events);
    if (transactions.length > 0) saveTransactions(transactions);

    console.log('✅ Dados carregados do Supabase para localStorage');
    return { tasks, events, transactions };
  } catch (error) {
    console.error('❌ Erro ao carregar dados do Supabase:', error);
    return { tasks: [], events: [], transactions: [] };
  }
}

// Sincronização completa (salvar do localStorage para Supabase)
export async function syncAllDataToSupabase(userId: string) {
  try {
    const tasks = getTasks();
    const events = getEvents();
    const transactions = getTransactions();

    await syncTasksToSupabase(userId, tasks);
    await syncEventsToSupabase(userId, events);
    await syncTransactionsToSupabase(userId, transactions);

    console.log('✅ Todos os dados sincronizados com Supabase');
  } catch (error) {
    console.error('❌ Erro ao sincronizar dados:', error);
  }
}
