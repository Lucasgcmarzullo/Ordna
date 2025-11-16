import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verificar se as credenciais estão configuradas
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Função para criar usuário no Supabase Auth
export async function criar_usuario_supabase_auth(email: string, password: string) {
  try {
    const response = await fetch('https://wdwerqkivqzjnnihgvdk.supabase.co/auth/v1/signup', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkd2VycWtpdnF6am5uaWhndmRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODU1MjQsImV4cCI6MjA3ODU2MTUyNH0.g1JUXaDz9DKSvBoe0xewWdUxmt-ZYSt_lWPBEkunrp4',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao criar usuário no Supabase Auth:', errorData);
      throw new Error(errorData.msg || 'Erro ao criar conta. Tente novamente.');
    }

    const data = await response.json();
    console.log('Usuário criado no Supabase Auth com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro na requisição de signup:', error);
    throw error;
  }
}
