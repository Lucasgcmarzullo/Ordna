'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckSquare, Calendar, DollarSign, LayoutDashboard, Menu, X, Sparkles, Crown, LogOut, Clock, CalendarDays } from 'lucide-react';
import dynamic from 'next/dynamic';
import { getTasks, getEvents, getTransactions } from '@/lib/storage';
import { getCurrentUser, logout } from '@/lib/auth';
import { ModuleType } from '@/lib/types';
import { useUser } from '@/contexts/UserContext';

// Importação dinâmica dos módulos para evitar problemas de SSR
const TasksModule = dynamic(() => import('@/components/custom/TasksModule'), { ssr: false });
const CalendarModule = dynamic(() => import('@/components/custom/CalendarModule'), { ssr: false });
const FinanceModule = dynamic(() => import('@/components/custom/FinanceModule'), { ssr: false });
const AIAssistant = dynamic(() => import('@/components/custom/AIAssistantModule'), { ssr: false });
const WeekPlannerModule = dynamic(() => import('@/components/custom/WeekPlannerModule'), { ssr: false });
const FocusModeModule = dynamic(() => import('@/components/custom/FocusModeModule'), { ssr: false });

export default function ClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isPremium, refreshUserData } = useUser();
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingEvents: 0,
    balance: 0,
  });

  useEffect(() => {
    // Verificar autenticação
    const user = getCurrentUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setLocalUser(user);
    setIsLoading(false);

    // Atualizar dados do usuário do Supabase
    refreshUserData();

    const tasks = getTasks();
    const events = getEvents();
    const transactions = getTransactions();

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const today = new Date();
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today;
    }).length;

    setStats({
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      upcomingEvents,
      balance: totalIncome - totalExpense,
    });
  }, [activeModule, router, refreshUserData]);

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const menuItems = [
    { id: 'dashboard' as ModuleType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as ModuleType, label: 'Tarefas', icon: CheckSquare },
    { id: 'calendar' as ModuleType, label: 'Calendário', icon: Calendar },
    { id: 'finance' as ModuleType, label: 'Finanças', icon: DollarSign },
    { id: 'week-planner' as ModuleType, label: 'Planejamento', icon: CalendarDays, premium: true },
    { id: 'focus-mode' as ModuleType, label: 'Modo Foco', icon: Clock, premium: true },
    { id: 'ai-assistant' as ModuleType, label: 'Assistente IA', icon: Sparkles, premium: true },
  ];

  if (isLoading || !localUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-cyan-600 to-blue-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/dc950168-8616-4b25-98ec-a492901ea4ee.jpg" 
              alt="ORDNA Logo" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
              ORDNA
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Organização Pessoal</p>
          {isPremium && (
            <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
              <Crown className="w-3 h-3" />
              <span className="font-semibold">Premium</span>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{localUser.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{localUser.email}</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isLocked = item.premium && !isPremium;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                disabled={isLocked}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                  activeModule === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                    : isLocked
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isLocked && (
                  <Crown className="w-4 h-4 ml-auto text-yellow-500" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Feito com ❤️ por ORDNA
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/dc950168-8616-4b25-98ec-a492901ea4ee.jpg" 
              alt="ORDNA Logo" 
              className="h-8 w-8 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
                ORDNA
              </h1>
              {isPremium && (
                <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                  <Crown className="w-3 h-3" />
                  <span className="font-semibold">Premium</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-4 space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{localUser.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{localUser.email}</p>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isLocked = item.premium && !isPremium;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!isLocked) {
                        setActiveModule(item.id);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    disabled={isLocked}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeModule === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                        : isLocked
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {isLocked && (
                      <Crown className="w-4 h-4 ml-auto text-yellow-500" />
                    )}
                  </button>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeModule === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Bem-vindo, {localUser.name.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Seu espaço de organização pessoal completo
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <CheckSquare className="w-8 h-8 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tarefas</span>
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {stats.completedTasks}/{stats.totalTasks}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Concluídas</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-cyan-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Eventos</span>
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {stats.upcomingEvents}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Próximos</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 sm:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Saldo</span>
                </div>
                <p className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Atual</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-8 rounded-xl shadow-2xl text-white">
              <h3 className="text-2xl font-bold mb-3">Comece a organizar sua vida! 🚀</h3>
              <p className="text-white/90 mb-6">
                Use o menu lateral para navegar entre Tarefas, Calendário e Finanças. Tudo é editável e personalizável!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveModule('tasks')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg transition-all"
                >
                  <CheckSquare className="w-6 h-6 mb-2" />
                  <p className="font-semibold">Criar Tarefa</p>
                </button>
                <button
                  onClick={() => setActiveModule('calendar')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg transition-all"
                >
                  <Calendar className="w-6 h-6 mb-2" />
                  <p className="font-semibold">Adicionar Evento</p>
                </button>
                <button
                  onClick={() => setActiveModule('finance')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg transition-all"
                >
                  <DollarSign className="w-6 h-6 mb-2" />
                  <p className="font-semibold">Registrar Transação</p>
                </button>
              </div>
            </div>

            {/* Recursos Premium Preview (apenas para usuários free) */}
            {!isPremium && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-blue-300 dark:border-blue-700">
                  <div className="flex items-center gap-3 mb-4">
                    <CalendarDays className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Planejamento Semanal
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Recurso Premium
                      </p>
                    </div>
                    <Crown className="w-6 h-6 text-yellow-500 ml-auto" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    A IA cria um cronograma balanceado com suas metas, eventos e descanso!
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-cyan-300 dark:border-cyan-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-8 h-8 text-cyan-500" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Modo Foco
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Recurso Premium
                      </p>
                    </div>
                    <Crown className="w-6 h-6 text-yellow-500 ml-auto" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Pomodoro inteligente com sons, estatísticas e recomendações da IA!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeModule === 'tasks' && <TasksModule />}
        {activeModule === 'calendar' && <CalendarModule />}
        {activeModule === 'finance' && <FinanceModule />}
        
        {activeModule === 'week-planner' && (
          isPremium ? <WeekPlannerModule /> : (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Recurso Premium
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Faça upgrade para acessar o Planejamento Semanal Inteligente
              </p>
            </div>
          )
        )}
        
        {activeModule === 'focus-mode' && (
          isPremium ? <FocusModeModule /> : (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Recurso Premium
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Faça upgrade para acessar o Modo Foco com Pomodoro
              </p>
            </div>
          )
        )}
        
        {activeModule === 'ai-assistant' && (
          isPremium ? <AIAssistant /> : (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Recurso Premium
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Faça upgrade para acessar o Assistente de IA
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
