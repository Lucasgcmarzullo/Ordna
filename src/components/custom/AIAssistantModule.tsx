'use client';

import { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { processUserIntent } from '@/lib/ai-assistant';
import { getTasks, saveTasks, getGoals, saveGoals, getReminders, saveReminders } from '@/lib/storage';

export default function AIAssistantModule() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [suggestions] = useState([
    'Quero estudar mais',
    'Preciso me exercitar',
    'Quero economizar dinheiro',
  ]);

  const handleSubmit = async (text?: string) => {
    const userInput = text || input;
    if (!userInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setResponse('');

    try {
      // Processar intenção do usuário
      const aiResponse = await processUserIntent(userInput);

      // Salvar metas criadas
      if (aiResponse.goals.length > 0) {
        const currentGoals = getGoals();
        saveGoals([...currentGoals, ...aiResponse.goals]);
      }

      // Salvar tarefas criadas
      if (aiResponse.tasks.length > 0) {
        const currentTasks = getTasks();
        saveTasks([...currentTasks, ...aiResponse.tasks]);
      }

      // Salvar lembretes criados
      if (aiResponse.reminders.length > 0) {
        const currentReminders = getReminders();
        saveReminders([...currentReminders, ...aiResponse.reminders]);
      }

      setResponse(aiResponse.message);
      setInput('');
    } catch (error) {
      setResponse('❌ Erro ao processar sua solicitação. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-500" />
          Assistente de IA
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Diga o que você quer alcançar e eu crio metas e lembretes automáticos para você!
        </p>
      </div>

      {/* Sugestões rápidas */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          💡 Experimente dizer:
        </h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSubmit(suggestion)}
              disabled={isProcessing}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input de texto */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Digite o que você quer alcançar..."
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={isProcessing || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resposta da IA */}
      {response && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Resposta da IA:
              </h4>
              <p className="text-gray-700 dark:text-gray-300">{response}</p>
            </div>
          </div>
        </div>
      )}

      {/* Informações sobre o assistente */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Como funciona?
        </h3>
        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">Cria Metas Automáticas</p>
              <p className="text-sm">Baseado no que você quer alcançar, crio metas estruturadas</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">Gera Tarefas</p>
              <p className="text-sm">Divido suas metas em tarefas práticas e alcançáveis</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">Configura Lembretes</p>
              <p className="text-sm">Crio lembretes automáticos para você não esquecer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
