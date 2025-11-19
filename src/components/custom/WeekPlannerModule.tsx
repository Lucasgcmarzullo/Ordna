'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, Plus, Trash2, Check, BookOpen, Heart, Briefcase, User, Save, Download } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  category: 'work' | 'study' | 'health' | 'personal';
  description: string;
  days?: string[];
}

interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  activity: string;
  category: 'work' | 'study' | 'health' | 'personal';
  duration: number;
  goalId: string;
}

interface SavedPlanning {
  id: string;
  name: string;
  goals: Goal[];
  schedule: ScheduleItem[];
  createdAt: Date;
}

export default function WeekPlannerModule() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalInput, setGoalInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Goal['category']>('study');
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPlannings, setSavedPlannings] = useState<SavedPlanning[]>([]);
  const [planningName, setPlanningName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Carregar planejamentos salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedPlannings');
    if (saved) {
      setSavedPlannings(JSON.parse(saved));
    }
  }, []);

  const categories = [
    { id: 'work' as const, label: 'Trabalho', color: 'bg-blue-500', icon: Briefcase },
    { id: 'study' as const, label: 'Estudos', color: 'bg-blue-500', icon: BookOpen },
    { id: 'health' as const, label: 'Saúde', color: 'bg-blue-500', icon: Heart },
    { id: 'personal' as const, label: 'Pessoal', color: 'bg-blue-500', icon: User },
  ];

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const daysMap: { [key: string]: string } = {
    'segunda': 'Segunda',
    'terça': 'Terça',
    'terca': 'Terça',
    'quarta': 'Quarta',
    'quinta': 'Quinta',
    'sexta': 'Sexta',
    'sábado': 'Sábado',
    'sabado': 'Sábado',
    'domingo': 'Domingo',
  };

  const parseGoalInput = (input: string): { description: string; days: string[] } => {
    const lowerInput = input.toLowerCase();
    const detectedDays: string[] = [];

    Object.keys(daysMap).forEach(dayKey => {
      if (lowerInput.includes(dayKey)) {
        const normalizedDay = daysMap[dayKey];
        if (!detectedDays.includes(normalizedDay)) {
          detectedDays.push(normalizedDay);
        }
      }
    });

    if (lowerInput.includes('todos os dias') || 
        lowerInput.includes('todo dia') || 
        lowerInput.includes('diariamente') ||
        lowerInput.includes('por dia')) {
      return { description: input, days: [] };
    }

    return { description: input, days: detectedDays };
  };

  const addGoal = () => {
    if (!goalInput.trim()) return;
    
    const { description, days: detectedDays } = parseGoalInput(goalInput);
    
    const goal: Goal = {
      id: Date.now().toString(),
      title: goalInput,
      category: selectedCategory,
      description: description,
      days: detectedDays.length > 0 ? detectedDays : undefined,
    };
    
    setGoals([...goals, goal]);
    setGoalInput('');
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const generateSchedule = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const newSchedule: ScheduleItem[] = [];
      
      const categoryTimes: { [key: string]: string[] } = {
        study: ['08:00', '14:00', '19:00'],
        work: ['09:00', '14:00'],
        health: ['07:00', '18:00'],
        personal: ['10:00', '15:00', '20:00'],
      };

      const categoryDuration: { [key: string]: number } = {
        study: 120,
        work: 180,
        health: 60,
        personal: 90,
      };

      goals.forEach(goal => {
        const targetDays = goal.days && goal.days.length > 0 ? goal.days : days;
        const times = categoryTimes[goal.category] || ['09:00'];
        const duration = categoryDuration[goal.category] || 60;

        let customDuration = duration;
        const hoursMatch = goal.description.match(/(\d+)\s*h(ora)?s?/i);
        const minutesMatch = goal.description.match(/(\d+)\s*min(uto)?s?/i);
        
        if (hoursMatch) {
          customDuration = parseInt(hoursMatch[1]) * 60;
        } else if (minutesMatch) {
          customDuration = parseInt(minutesMatch[1]);
        }

        targetDays.forEach((day, index) => {
          const timeIndex = index % times.length;
          const time = times[timeIndex];

          newSchedule.push({
            id: `${goal.id}-${day}`,
            day,
            time,
            activity: goal.title,
            category: goal.category,
            duration: customDuration,
            goalId: goal.id,
          });
        });
      });

      newSchedule.sort((a, b) => {
        const dayDiff = days.indexOf(a.day) - days.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.time.localeCompare(b.time);
      });

      setSchedule(newSchedule);
      setIsGenerating(false);
    }, 1500);
  };

  const savePlanning = () => {
    if (!planningName.trim()) {
      alert('Por favor, dê um nome ao seu planejamento');
      return;
    }

    const newPlanning: SavedPlanning = {
      id: Date.now().toString(),
      name: planningName,
      goals,
      schedule,
      createdAt: new Date(),
    };

    const updated = [...savedPlannings, newPlanning];
    setSavedPlannings(updated);
    localStorage.setItem('savedPlannings', JSON.stringify(updated));
    
    setPlanningName('');
    setShowSaveDialog(false);
    alert('✅ Planejamento salvo com sucesso!');
  };

  const loadPlanning = (planning: SavedPlanning) => {
    setGoals(planning.goals);
    setSchedule(planning.schedule);
    alert(`✅ Planejamento "${planning.name}" carregado!`);
  };

  const deletePlanning = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este planejamento?')) {
      const updated = savedPlannings.filter(p => p.id !== id);
      setSavedPlannings(updated);
      localStorage.setItem('savedPlannings', JSON.stringify(updated));
    }
  };

  const exportPlanning = () => {
    const data = {
      name: planningName || 'Meu Planejamento',
      goals,
      schedule,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planejamento-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: Goal['category']) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-500';
  };

  const getCategoryIcon = (category: Goal['category']) => {
    const cat = categories.find(c => c.id === category);
    const Icon = cat?.icon || Check;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-black mb-2">
          Planejamento Semanal Inteligente
        </h2>
        <p className="text-black">
          Descreva suas atividades e a IA criará um cronograma personalizado
        </p>
      </div>

      {/* Planejamentos Salvos */}
      {savedPlannings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Save className="w-5 h-5 text-green-500" />
            Planejamentos Salvos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPlannings.map(planning => (
              <div
                key={planning.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {planning.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {planning.goals.length} atividades • {planning.schedule.length} horários
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadPlanning(planning)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                  >
                    Carregar
                  </button>
                  <button
                    onClick={() => deletePlanning(planning.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          Adicionar Atividades
        </h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              💡 Exemplos de como usar:
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• &quot;Estudar 2 horas por dia&quot; → Todos os dias</li>
              <li>• &quot;Ir ao médico na segunda-feira&quot; → Apenas segunda</li>
              <li>• &quot;Trabalhar com marketing&quot; → Todos os dias</li>
              <li>• &quot;Academia na terça e quinta&quot; → Terça e quinta</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Goal['category'])}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              placeholder="Ex: Estudar 2 horas por dia"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            
            <button
              onClick={addGoal}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>

          {goals.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Atividades adicionadas ({goals.length}):
              </p>
              {goals.map(goal => {
                const category = categories.find(c => c.id === goal.category);
                const Icon = category?.icon || Check;
                return (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${category?.color} text-white`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                          {goal.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {category?.label} • {goal.days && goal.days.length > 0 
                            ? goal.days.join(', ') 
                            : 'Todos os dias'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="text-red-500 hover:text-red-600 transition-all p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Gerando cronograma...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar Cronograma Personalizado
              </>
            )}
          </button>
        </div>
      </div>

      {schedule.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Seu Cronograma Personalizado
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveDialog(!showSaveDialog)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
              <button
                onClick={exportPlanning}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>

          {showSaveDialog && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <label className="block text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                Nome do Planejamento:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={planningName}
                  onChange={(e) => setPlanningName(e.target.value)}
                  placeholder="Ex: Rotina de Estudos - Janeiro"
                  className="flex-1 px-4 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                <button
                  onClick={savePlanning}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {days.map(day => {
              const daySchedule = schedule.filter(s => s.day === day);
              
              if (daySchedule.length === 0) return null;
              
              return (
                <div key={day} className="space-y-2">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 pb-2 border-b-2 border-blue-300 dark:border-blue-700">
                    {day}
                  </h4>
                  {daySchedule.map(item => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border-2 ${getCategoryColor(item.category)} bg-opacity-10 border-opacity-30`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded ${getCategoryColor(item.category)} text-white`}>
                          {getCategoryIcon(item.category)}
                        </div>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                        {item.activity}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {item.duration >= 60 
                            ? `${Math.floor(item.duration / 60)}h${item.duration % 60 > 0 ? ` ${item.duration % 60}min` : ''}`
                            : `${item.duration} min`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map(cat => {
                const Icon = cat.icon;
                const count = schedule.filter(s => s.category === cat.id).length;
                const totalMinutes = schedule
                  .filter(s => s.category === cat.id)
                  .reduce((sum, s) => sum + s.duration, 0);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                
                if (count === 0) return null;
                
                return (
                  <div key={cat.id} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className={`w-10 h-10 ${cat.color} text-white rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{cat.label}</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      {count}x
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {hours > 0 && `${hours}h`}{minutes > 0 && `${minutes}min`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
