'use client';

import { useState } from 'react';
import { Crown, Check, Sparkles } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function StripeCheckout() {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!currentUser) {
      alert('Você precisa estar logado para assinar');
      return;
    }

    setLoading(true);

    try {
      // Configurar URL de checkout da Stripe
      const stripeCheckoutUrl = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL || '';
      
      if (!stripeCheckoutUrl) {
        alert('Configuração da Stripe não encontrada. Configure NEXT_PUBLIC_STRIPE_CHECKOUT_URL');
        setLoading(false);
        return;
      }

      // Construir URL com parâmetros
      const successUrl = `${window.location.origin}/?payment=success`;
      const cancelUrl = `${window.location.origin}/?payment=cancelled`;
      
      const checkoutUrl = `${stripeCheckoutUrl}?prefilled_email=${encodeURIComponent(currentUser.email)}&client_reference_id=${currentUser.id}`;

      // Redirecionar para checkout da Stripe
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Odrna Premium
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Desbloqueie todo o potencial da sua organização pessoal
        </p>
      </div>

      {/* Plano Premium */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 p-1 rounded-2xl shadow-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Plano Premium
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Acesso completo a todos os recursos
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                R$ 19,90
              </p>
              <p className="text-gray-600 dark:text-gray-400">por mês</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  Planejamento Semanal Inteligente
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  IA cria cronograma balanceado com suas metas e eventos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  Modo Foco com Pomodoro
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Timer inteligente com sons, estatísticas e recomendações
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  Assistente de IA Avançado
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Insights personalizados e sugestões inteligentes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  Análises e Relatórios Avançados
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visualize seu progresso com gráficos detalhados
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  Suporte Prioritário
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Atendimento rápido e personalizado
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Processando...</span>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Assinar Premium Agora</span>
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Cancele quando quiser. Sem compromisso.
          </p>
        </div>
      </div>

      {/* Garantia */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">
          Garantia de 7 dias
        </h3>
        <p className="text-blue-700 dark:text-blue-400">
          Não gostou? Devolvemos seu dinheiro sem perguntas
        </p>
      </div>
    </div>
  );
}
