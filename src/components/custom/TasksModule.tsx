'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Edit2, X, Crown, AlertCircle } from 'lucide-react';
import { Task, FREE_PLAN_LIMITS } from '@/lib/types';
import { getTasks, saveTasks, getSubscription } from '@/lib/storage';

export default function TasksModule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });

  useEffect(() => {
    setTasks(getTasks());
    const subscription = getSubscription();
    setIsPremium(subscription.isPremium);
  }, []);

  const canAddTask = () => {
    if (isPremium) return true;
    return tasks.length < FREE_PLAN_LIMITS.TASKS;
  };

  const handleAddClick = () => {
    if (!canAddTask()) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 3000);
      return;
    }
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;

    if (editingId) {
      const updated = tasks.map(task =>
        task.id === editingId
          ? { ...task, ...formData }
          : task
      );
      setTasks(updated);
      saveTasks(updated);
      setEditingId(null);
    } else {
      if (!canAddTask()) {
        setShowLimitWarning(true);
        setTimeout(() => setShowLimitWarning(false), 3000);
        return;
      }
      
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [...tasks, newTask];
      setTasks(updated);
      saveTasks(updated);
      setIsAdding(false);
    }

    setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || '',
    });
  };

  const handleToggle = (id: string) => {
    const updated = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updated);
    saveTasks(updated);
  };

  const handleDelete = (id: string) => {
    const updated = tasks.filter(task => task.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tarefas</h2>
          {!isPremium && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {tasks.length}/{FREE_PLAN_LIMITS.TASKS} tarefas usadas (Plano Free)
            </p>
          )}
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      {showLimitWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Limite do Plano Free Atingido
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Você atingiu o limite de {FREE_PLAN_LIMITS.TASKS} tarefas. Faça upgrade para Premium e tenha tarefas ilimitadas!
            </p>
          </div>
          <Crown className="w-5 h-5 text-yellow-500" />
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Título da tarefa"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
            rows={3}
          />
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="low">Baixa Prioridade</option>
              <option value="medium">Média Prioridade</option>
              <option value="high">Alta Prioridade</option>
            </select>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Salvar
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                setFormData({ title: '', description: '', priority: 'medium', dueDate: '' });
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Nenhuma tarefa ainda. Crie sua primeira tarefa!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggle(task.id)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 border-transparent'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1">
                  <h3
                    className={`font-semibold text-gray-900 dark:text-gray-100 ${
                      task.completed ? 'line-through' : ''
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                      {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Vence: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
