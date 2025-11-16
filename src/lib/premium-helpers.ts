// Helper para testar o sistema de premium manualmente
// Use no console do navegador (DevTools)

// 1. Verificar status atual do usuário
export function checkPremiumStatus() {
  const user = JSON.parse(localStorage.getItem('odrna_current_user') || '{}');
  console.log('📊 Status do Usuário:', {
    email: user.email,
    name: user.name,
    id: user.id
  });
  
  // Verificar no contexto
  console.log('🔍 Verificando contexto global...');
  console.log('Use: const { currentUser, isPremium } = useUser() no componente');
}

// 2. Simular upgrade para premium (APENAS PARA TESTE LOCAL)
export function simulatePremiumUpgrade(email: string) {
  console.warn('⚠️ ATENÇÃO: Isso é apenas simulação local!');
  console.warn('⚠️ No ambiente real, o premium é controlado pelo Supabase via webhook da Stripe');
  
  // Isso NÃO atualiza o Supabase, apenas localStorage
  const user = JSON.parse(localStorage.getItem('odrna_current_user') || '{}');
  user.is_premium = true;
  localStorage.setItem('odrna_current_user', JSON.stringify(user));
  
  console.log('✅ Premium simulado localmente. Recarregue a página.');
  console.log('📝 Para teste real, use o fluxo completo: Stripe → Webhook → Supabase');
}

// 3. Resetar para free (APENAS PARA TESTE LOCAL)
export function simulatePremiumDowngrade() {
  const user = JSON.parse(localStorage.getItem('odrna_current_user') || '{}');
  user.is_premium = false;
  localStorage.setItem('odrna_current_user', JSON.stringify(user));
  
  console.log('✅ Premium removido localmente. Recarregue a página.');
}

// 4. Forçar sincronização com Supabase
export async function forceSyncWithSupabase() {
  console.log('🔄 Sincronizando com Supabase...');
  
  // Isso deve ser chamado dentro de um componente React
  console.log('Use no componente: await refreshUserData()');
  console.log('Ou recarregue a página para sincronizar automaticamente');
}

// 5. Verificar configuração do Supabase
export function checkSupabaseConfig() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('🔧 Configuração Supabase:', {
    url: hasUrl ? '✅ Configurado' : '❌ Faltando',
    anonKey: hasKey ? '✅ Configurado' : '❌ Faltando',
    status: (hasUrl && hasKey) ? '✅ Pronto' : '❌ Incompleto'
  });
  
  if (!hasUrl || !hasKey) {
    console.error('❌ Configure as variáveis de ambiente no .env.local');
  }
}

// 6. Testar fluxo completo (checklist)
export function testPremiumFlow() {
  console.log('📋 Checklist do Fluxo Premium:\n');
  
  const checks = [
    '1. ✅ Tabela users criada no Supabase',
    '2. ✅ Contexto UserContext implementado',
    '3. ✅ Login busca is_premium do Supabase',
    '4. ✅ Componente StripeCheckout criado',
    '5. ⏳ Produto criado na Stripe (manual)',
    '6. ⏳ Edge Function criada no Supabase (manual)',
    '7. ⏳ Webhook configurado na Stripe (manual)',
    '8. ⏳ Variáveis de ambiente configuradas (manual)',
    '9. ⏳ Teste completo realizado (manual)'
  ];
  
  checks.forEach(check => console.log(check));
  
  console.log('\n📖 Consulte PREMIUM-SETUP.md para instruções completas');
}

// 7. SQL para atualizar manualmente (copie e cole no Supabase SQL Editor)
export function getSQLForManualUpdate(email: string, isPremium: boolean) {
  const sql = `
-- Atualizar status premium manualmente
UPDATE users 
SET is_premium = ${isPremium}, updated_at = NOW() 
WHERE email = '${email}';

-- Verificar resultado
SELECT email, is_premium, updated_at 
FROM users 
WHERE email = '${email}';
  `.trim();
  
  console.log('📝 SQL para executar no Supabase:\n');
  console.log(sql);
  console.log('\n📋 Copie e cole no Supabase SQL Editor');
  
  return sql;
}

// Exportar todas as funções para uso global
if (typeof window !== 'undefined') {
  (window as any).premiumHelpers = {
    checkPremiumStatus,
    simulatePremiumUpgrade,
    simulatePremiumDowngrade,
    forceSyncWithSupabase,
    checkSupabaseConfig,
    testPremiumFlow,
    getSQLForManualUpdate
  };
  
  console.log('🛠️ Premium Helpers carregados!');
  console.log('📖 Use: premiumHelpers.testPremiumFlow() para começar');
}
