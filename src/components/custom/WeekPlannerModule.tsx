'use client';

import { useState } from 'react';
import { Calendar, Clock, Coffee, Sparkles, Plus, Trash2, Check } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  category: 'work' | 'study' | 'health' | 'personal';
}

interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  activity: string;
  type: 'task' | 'event' | 'rest';
  duration: number;
}

export default function WeekPlannerModule() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Goal['category']>('work');
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = [
    { id: 'work' as const, label: 'Trabalho', color: 'bg-blue-500' },
    { id: 'study' as const, label: 'Estudos', color: 'bg-purple-500' },
    { id: 'health' as const, label: 'Saúde', color: 'bg-green-500' },
    { id: 'personal' as const, label: 'Pessoal', color: 'bg-orange-500' },
  ];

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const addGoal = () => {
    if (!newGoal.trim()) return;
    
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal,
      category: selectedCategory,
    };
    
    setGoals([...goals, goal]);
    setNewGoal('');
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const generateSchedule = () => {
    setIsGenerating(true);
    
    // Simular geração de cronograma pela IA
    setTimeout(() => {
      const newSchedule: ScheduleItem[] = [];
      
      days.forEach((day, dayIndex) => {
        // Manhã - Tarefas importantes
        if (dayIndex < 5) { // Dias úteis
          newSchedule.push({
            id: `${day}-morning`,
            day,
            time: '08:00',
            activity: 'Tarefas de alta prioridade',
            type: 'task',
            duration: 120,
          });
        }
        
        // Almoço
        newSchedule.push({
          id: `${day}-lunch`,
          day,
          time: '12:00',
          activity: 'Almoço e descanso',
          type: 'rest',
          duration: 60,
        });
        
        // Tarde
        if (dayIndex < 5) {
          newSchedule.push({
            id: `${day}-afternoon`,
            day,
            time: '14:00',
            activity: 'Reuniões e colaboração',
            type: 'event',
            duration: 180,
          });
        } else {
          newSchedule.push({
            id: `${day}-afternoon`,
            day,
            time: '14:00',
            activity: 'Atividades pessoais',
            type: 'rest',
            duration: 240,
          });
        }
        
        // Noite
        newSchedule.push({
          id: `${day}-evening`,
          day,
          time: '19:00',
          activity: 'Exercícios e relaxamento',
          type: 'rest',
          duration: 90,
        });
      });
      
      setSchedule(newSchedule);
      setIsGenerating(false);
    }, 2000);
  };

  const getTypeColor = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'event': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'rest': return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getTypeIcon = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'task': return <Check className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'rest': return <Coffee className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Planejamento Semanal
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Informe suas metas e a IA criará um cronograma balanceado
        </p>
      </div>

      {/* Adicionar Metas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Suas Metas
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Goal['category'])}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              placeholder="Ex: Estudar 2h por dia"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            
            <button
              onClick={addGoal}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>

          {goals.length > 0 && (
            <div className="space-y-2">
              {goals.map(goal => {
                const category = categories.find(c => c.id === goal.category);
                return (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category?.color}`}></div>
                      <span className="text-gray-800 dark:text-gray-200">{goal.title}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {category?.label}
                      </span>
                    </div>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="text-red-500 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={generateSchedule}
            disabled={goals.length === 0 || isGenerating}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Gerando cronograma...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar Cronograma Inteligente
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cronograma Gerado */}
      {schedule.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Seu Cronograma Balanceado
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map(day => {
              const daySchedule = schedule.filter(s => s.day === day);
              return (
                <div key={day} className="space-y-2">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-700">
                    {day}
                  </h4>
                  {daySchedule.map(item => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border ${getTypeColor(item.type)}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(item.type)}
                        <span className="text-sm font-semibold">{item.time}</span>
                      </div>
                      <p className="text-sm">{item.activity}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {item.duration} minutos
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
