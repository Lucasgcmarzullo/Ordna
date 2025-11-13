'use client';

import { useState, useEffect } from 'react';
import { Crown, Check, Sparkles, Timer, TrendingUp, Smile, BarChart3, Zap, CheckCircle } from 'lucide-react';
import { getSubscription, saveSubscription, getPremiumWidgets, savePremiumWidgets } from '@/lib/storage';
import { UserSubscription, PremiumWidget } from '@/lib/types';

const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/test_14AdR8gXkfM56CD5PNew804';

export default function PremiumModule() {
  const [subscription, setSubscription] = useState<UserSubscription>({ isPremium: false, planName: 'free' });
  const [widgets, setWidgets] = useState<PremiumWidget[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    setSubscription(getSubscription());
    setWidgets(getPremiumWidgets());

    // Verificar se voltou do checkout com sucesso
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      handleUpgrade();
      setShowSuccessMessage(true);
      // Limpar URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleUpgrade = () => {
    const newSubscription: UserSubscription = {
      isPremium: true,
      planName: 'premium',
      price: 19.90,
      startDate: new Date().toISOString(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    saveSubscription(newSubscription);
    setSubscription(newSubscription);
  };

  const handleCheckout = () => {
    // Redirecionar para o Stripe Checkout
    const returnUrl = `${window.location.origin}${window.location.pathname}?success=true`;
    window.location.href = `${STRIPE_CHECKOUT_URL}?success_url=${encodeURIComponent(returnUrl)}`;
  };

  const handleCancelSubscription = () => {
    const newSubscription: UserSubscription = {
      isPremium: false,
      planName: 'free',
    };
    saveSubscription(newSubscription);
    setSubscription(newSubscription);
  };

  const toggleWidget = (widgetId: string) => {
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    setWidgets(updatedWidgets);
    savePremiumWidgets(updatedWidgets);
  };

  const premiumFeatures = [
    { icon: Timer, title: 'Timer Pomodoro', description: 'Técnica de produtividade com intervalos' },
    { icon: TrendingUp, title: 'Rastreador de Hábitos', description: 'Acompanhe seus hábitos diários' },
    { icon: Smile, title: 'Registro de Humor', description: 'Monitore seu bem-estar emocional' },
    { icon: BarChart3, title: 'Análises Avançadas', description: 'Relatórios detalhados de produtividade' },
    { icon: Sparkles, title: 'Insights de IA', description: 'Sugestões inteligentes personalizadas' },
    { icon: Zap, title: 'Sincronização em Nuvem', description: 'Acesse de qualquer dispositivo' },
  ];

  if (!subscription.isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            Odrna Premium
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Desbloqueie recursos exclusivos e turbine sua produtividade!
          </p>
        </div>

        {/* Card de Upgrade */}
        <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 p-8 rounded-2xl shadow-2xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-12 h-12" />
            <div>
              <h3 className="text-3xl font-bold">Plano Premium</h3>
              <p className="text-white/90">Recursos ilimitados</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">R$ 19,90</span>
              <span className="text-xl text-white/80">/mês</span>
            </div>
            <p className="text-white/90 mt-2">Cancele quando quiser, sem compromisso</p>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-white text-orange-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            Assinar Premium Agora
          </button>
        </div>

        {/* Recursos Premium */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            O que você ganha com Premium:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparação de Planos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Comparação de Planos
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Tarefas</span>
              <div className="flex gap-8 items-center">
                <span className="text-sm text-gray-500">5 tarefas</span>
                <span className="text-sm text-green-600 font-semibold">Ilimitadas</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Eventos</span>
              <div className="flex gap-8 items-center">
                <span className="text-sm text-gray-500">5 eventos</span>
                <span className="text-sm text-green-600 font-semibold">Ilimitados</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Transações</span>
              <div className="flex gap-8 items-center">
                <span className="text-sm text-gray-500">5 transações</span>
                <span className="text-sm text-green-600 font-semibold">Ilimitadas</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">Widgets Premium</span>
              <div className="flex gap-8">
                <span className="w-5 h-5 text-gray-400">—</span>
                <Check className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">Assistente de IA</span>
              <div className="flex gap-8">
                <span className="w-5 h-5 text-gray-400">—</span>
                <Check className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">Análises avançadas</span>
              <div className="flex gap-8">
                <span className="w-5 h-5 text-gray-400">—</span>
                <Check className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuário Premium
  return (
    <div className="space-y-6">
      {showSuccessMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              Plano Premium ativado!
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Bem-vindo ao Premium! Aproveite todos os recursos exclusivos.
            </p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          ✅ Você é Premium!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Aproveite todos os recursos exclusivos do Odrna
        </p>
      </div>

      {/* Status da Assinatura */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Plano Premium Ativo</h3>
            <p className="text-white/90">R$ 19,90/mês</p>
          </div>
          <Crown className="w-12 h-12" />
        </div>
        {subscription.renewalDate && (
          <p className="text-white/90 mb-4">
            Próxima renovação: {new Date(subscription.renewalDate).toLocaleDateString('pt-BR')}
          </p>
        )}
        <button
          onClick={handleCancelSubscription}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all"
        >
          Cancelar Assinatura
        </button>
      </div>

      {/* Widgets Premium */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Seus Widgets Premium
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Ative ou desative os widgets que você quer usar
        </p>
        <div className="space-y-3">
          {widgets.map((widget) => {
            const Icon = premiumFeatures.find(f => f.title.toLowerCase().includes(widget.type.split('-')[0]))?.icon || Sparkles;
            return (
              <div
                key={widget.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {widget.title}
                  </span>
                </div>
                <button
                  onClick={() => toggleWidget(widget.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    widget.enabled
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  {widget.enabled ? 'Ativado' : 'Desativado'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefícios Premium */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Seus Benefícios Premium
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {premiumFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              >
                <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
