'use client';

import { useState } from 'react';
import { Crown, Check, Loader2, ExternalLink } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function PremiumModule() {
  const { currentUser, isPremium } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!currentUser?.email) {
      setError('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mercadopago/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email }),
      });

      const data = await response.json();

      if (data.success && data.data?.init_point) {
        // Redirecionar para o checkout do Mercado Pago
        window.location.href = data.data.init_point;
      } else {
        setError(data.message || 'Erro ao criar assinatura');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-8 rounded-xl shadow-2xl text-white">
          <div className="flex items-center gap-4 mb-6">
            <Crown className="w-16 h-16" />
            <div>
              <h2 className="text-4xl font-bold">Você é Premium! 🎉</h2>
              <p className="text-white/90 text-lg mt-1">Obrigado por apoiar o ORDNA</p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Seus Benefícios Ativos:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Check className="w-6 h-6" />
                <span className="text-lg">✅ Planejamento Semanal com IA</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-6 h-6" />
                <span className="text-lg">✅ Modo Foco com Pomodoro</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-6 h-6" />
                <span className="text-lg">✅ Assistente IA Ilimitado</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-6 h-6" />
                <span className="text-lg">✅ Sincronização entre Dispositivos</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-6 h-6" />
                <span className="text-lg">✅ Backup e Exportação de Dados</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/80 text-sm">
              Para gerenciar sua assinatura, acesse o painel do Mercado Pago
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-8 rounded-xl shadow-2xl text-white mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Crown className="w-16 h-16" />
          <div>
            <h2 className="text-4xl font-bold">ORDNA Premium</h2>
            <p className="text-white/90 text-2xl mt-1">Apenas R$ 19,90/mês</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-xl font-bold mb-2">Planejamento Semanal</h3>
            <p className="text-white/90">
              IA cria cronograma personalizado com suas metas, eventos e descanso
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl mb-3">⏱️</div>
            <h3 className="text-xl font-bold mb-2">Modo Foco</h3>
            <p className="text-white/90">
              Pomodoro inteligente com sons, estatísticas e recomendações
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-xl font-bold mb-2">Assistente IA</h3>
            <p className="text-white/90">
              Comandos naturais para criar tarefas, eventos e muito mais
            </p>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm p-6 rounded-lg mb-8">
          <h3 className="text-2xl font-bold mb-4">Todos os Benefícios Premium:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 flex-shrink-0" />
              <span>Planejamento Semanal Inteligente</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 flex-shrink-0" />
              <span>Modo Foco com Pomodoro</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 flex-shrink-0" />
              <span>Assistente IA Ilimitado</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 flex-shrink-0" />
              <span>Sincronização Automática</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 flex-shrink-0" />
              <span>Backup e Restauração</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 flex-shrink-0" />
              <span>Exportação em PDF</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 flex-shrink-0" />
              <span>Tarefas e Eventos Ilimitados</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 flex-shrink-0" />
              <span>Suporte Prioritário</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-300 p-4 rounded-lg mb-6">
            <p className="text-white font-semibold">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="w-full bg-white text-orange-600 font-bold py-5 px-8 rounded-lg hover:bg-gray-100 transition-all text-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Crown className="w-6 h-6" />
              Assinar Premium Agora
              <ExternalLink className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-white/80 text-sm mt-4">
          Pagamento seguro via Mercado Pago • Cancele quando quiser
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Perguntas Frequentes
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
              Como funciona o pagamento?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              O pagamento é processado de forma segura pelo Mercado Pago. Você será redirecionado para finalizar a compra.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
              Posso cancelar a qualquer momento?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Sim! Você pode cancelar sua assinatura a qualquer momento pelo painel do Mercado Pago.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
              Os recursos premium funcionam em todos os dispositivos?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Sim! Com a sincronização automática, você acessa seus dados premium em qualquer dispositivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
