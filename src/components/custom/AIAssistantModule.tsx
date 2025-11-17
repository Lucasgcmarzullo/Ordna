'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, CheckSquare, Calendar, DollarSign, Trash2, Edit } from 'lucide-react';
import { addTask, getTasks, updateTask, deleteTask } from '@/lib/storage';
import { addEvent, getEvents, updateEvent, deleteEvent } from '@/lib/storage';
import { addTransaction, getTransactions, updateTransaction, deleteTransaction } from '@/lib/storage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ExecutedAction[];
}

interface ExecutedAction {
  type: 'task' | 'event' | 'transaction';
  action: 'create' | 'update' | 'delete' | 'list';
  data: any;
}

export default function AIAssistantModule() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu assistente inteligente. Posso ajudá-lo a criar tarefas, eventos, registrar despesas e receitas, editar ou excluir itens. Basta me dizer o que você precisa! 🚀\n\nExemplos:\n- "Crie 2 tarefas: estudar inglês e fazer exercícios"\n- "Adicione uma despesa de R$ 50 no mercado"\n- "Meu salário de R$ 1400 caiu"\n- "Marque reunião amanhã às 14h"\n- "Liste minhas tarefas pendentes"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processUserCommand = async (userMessage: string): Promise<{ response: string; actions: ExecutedAction[] }> => {
    const actions: ExecutedAction[] = [];
    let response = '';

    try {
      console.log('🔵 Iniciando processamento do comando:', userMessage);

      // Chamar OpenAI para interpretar o comando
      const apiResponse = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            tasks: getTasks(),
            events: getEvents(),
            transactions: getTransactions(),
          },
        }),
      });

      console.log('🔵 Status da resposta da API:', apiResponse.status);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('❌ Erro na API:', errorText);
        throw new Error(`Erro ao processar comando: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      console.log('✅ Resultado da API:', result);
      
      // Executar as ações retornadas pela IA
      if (result.actions && result.actions.length > 0) {
        console.log('🔵 Executando', result.actions.length, 'ações...');
        
        for (const action of result.actions) {
          try {
            console.log('🔵 Executando ação:', action);
            
            switch (action.type) {
              case 'task':
                if (action.action === 'create') {
                  const newTask = addTask(action.data.title, action.data.category || 'pessoal');
                  actions.push({ type: 'task', action: 'create', data: newTask });
                  console.log('✅ Tarefa criada:', newTask);
                } else if (action.action === 'update') {
                  updateTask(action.data.id, action.data.updates);
                  actions.push({ type: 'task', action: 'update', data: action.data });
                  console.log('✅ Tarefa atualizada');
                } else if (action.action === 'delete') {
                  deleteTask(action.data.id);
                  actions.push({ type: 'task', action: 'delete', data: action.data });
                  console.log('✅ Tarefa excluída');
                } else if (action.action === 'list') {
                  const tasks = getTasks();
                  actions.push({ type: 'task', action: 'list', data: tasks });
                  console.log('✅ Tarefas listadas:', tasks.length);
                }
                break;

              case 'event':
                if (action.action === 'create') {
                  const newEvent = addEvent(
                    action.data.title,
                    action.data.date,
                    action.data.category || 'pessoal'
                  );
                  actions.push({ type: 'event', action: 'create', data: newEvent });
                  console.log('✅ Evento criado:', newEvent);
                } else if (action.action === 'update') {
                  updateEvent(action.data.id, action.data.updates);
                  actions.push({ type: 'event', action: 'update', data: action.data });
                  console.log('✅ Evento atualizado');
                } else if (action.action === 'delete') {
                  deleteEvent(action.data.id);
                  actions.push({ type: 'event', action: 'delete', data: action.data });
                  console.log('✅ Evento excluído');
                } else if (action.action === 'list') {
                  const events = getEvents();
                  actions.push({ type: 'event', action: 'list', data: events });
                  console.log('✅ Eventos listados:', events.length);
                }
                break;

              case 'transaction':
                if (action.action === 'create') {
                  const newTransaction = addTransaction(
                    action.data.description,
                    action.data.amount,
                    action.data.type,
                    action.data.category || 'outros'
                  );
                  actions.push({ type: 'transaction', action: 'create', data: newTransaction });
                  console.log('✅ Transação criada:', newTransaction);
                } else if (action.action === 'update') {
                  updateTransaction(action.data.id, action.data.updates);
                  actions.push({ type: 'transaction', action: 'update', data: action.data });
                  console.log('✅ Transação atualizada');
                } else if (action.action === 'delete') {
                  deleteTransaction(action.data.id);
                  actions.push({ type: 'transaction', action: 'delete', data: action.data });
                  console.log('✅ Transação excluída');
                } else if (action.action === 'list') {
                  const transactions = getTransactions();
                  actions.push({ type: 'transaction', action: 'list', data: transactions });
                  console.log('✅ Transações listadas:', transactions.length);
                }
                break;
            }
          } catch (error) {
            console.error('❌ Erro ao executar ação:', error);
          }
        }
      } else {
        console.log('⚠️ Nenhuma ação retornada pela API');
      }

      response = result.response || 'Comando processado com sucesso!';
      console.log('✅ Resposta final:', response);
    } catch (error) {
      console.error('❌ Erro ao processar comando:', error);
      response = 'Desculpe, ocorreu um erro ao processar seu comando. Verifique se a chave da API OpenAI está configurada corretamente.';
    }

    return { response, actions };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    console.log('🔵 Enviando mensagem:', input);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { response, actions } = await processUserCommand(input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      console.log('✅ Mensagem do assistente adicionada');
    } catch (error) {
      console.error('❌ Erro no handleSend:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionBadge = (action: ExecutedAction) => {
    const icons = {
      task: CheckSquare,
      event: Calendar,
      transaction: DollarSign,
    };

    const colors = {
      create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      list: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };

    const Icon = icons[action.type];
    const colorClass = colors[action.action];

    const actionLabels = {
      create: 'Criado',
      update: 'Atualizado',
      delete: 'Excluído',
      list: 'Listado',
    };

    const typeLabels = {
      task: 'Tarefa',
      event: 'Evento',
      transaction: 'Transação',
    };

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        <Icon className="w-3 h-3" />
        <span>
          {typeLabels[action.type]} {actionLabels[action.action]}
        </span>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Assistente IA</h2>
            <p className="text-white/80 text-sm">Controle tudo com comandos naturais</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20 dark:border-gray-600 space-y-2">
                  <p className="text-xs font-semibold opacity-80 mb-2">Ações executadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.actions.map((action, idx) => (
                      <div key={idx}>{renderActionBadge(action)}</div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite seu comando... (ex: crie uma tarefa de estudar)"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setInput('Crie 2 tarefas: estudar inglês e fazer exercícios')}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Criar tarefas
          </button>
          <button
            onClick={() => setInput('Adicione uma despesa de R$ 50 no mercado')}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Registrar despesa
          </button>
          <button
            onClick={() => setInput('Meu salário de R$ 1400 caiu')}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Registrar receita
          </button>
          <button
            onClick={() => setInput('Liste minhas tarefas pendentes')}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Listar tarefas
          </button>
        </div>
      </div>
    </div>
  );
}
