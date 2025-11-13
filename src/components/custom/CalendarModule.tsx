'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Crown, AlertCircle } from 'lucide-react';
import { CalendarEvent, FREE_PLAN_LIMITS } from '@/lib/types';
import { getEvents, saveEvents, getSubscription } from '@/lib/storage';

export default function CalendarModule() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    color: '#8B5CF6',
  });

  useEffect(() => {
    setEvents(getEvents());
    const subscription = getSubscription();
    setIsPremium(subscription.isPremium);
  }, []);

  const canAddEvent = () => {
    if (isPremium) return true;
    return events.length < FREE_PLAN_LIMITS.EVENTS;
  };

  const handleAddClick = () => {
    if (!canAddEvent()) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 3000);
      return;
    }
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.date) return;

    if (editingId) {
      const updated = events.map(event =>
        event.id === editingId ? { ...event, ...formData } : event
      );
      setEvents(updated);
      saveEvents(updated);
      setEditingId(null);
    } else {
      if (!canAddEvent()) {
        setShowLimitWarning(true);
        setTimeout(() => setShowLimitWarning(false), 3000);
        return;
      }

      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      const updated = [...events, newEvent];
      setEvents(updated);
      saveEvents(updated);
      setIsAdding(false);
    }

    setFormData({ title: '', description: '', date: '', time: '', color: '#8B5CF6' });
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      color: event.color,
    });
  };

  const handleDelete = (id: string) => {
    const updated = events.filter(event => event.id !== id);
    setEvents(updated);
    saveEvents(updated);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Calendário</h2>
          {!isPremium && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {events.length}/{FREE_PLAN_LIMITS.EVENTS} eventos usados (Plano Free)
            </p>
          )}
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Novo Evento
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
              Você atingiu o limite de {FREE_PLAN_LIMITS.EVENTS} eventos. Faça upgrade para Premium e tenha eventos ilimitados!
            </p>
          </div>
          <Crown className="w-5 h-5 text-yellow-500" />
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Título do evento"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
            rows={2}
          />
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-20 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
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
                setFormData({ title: '', description: '', date: '', time: '', color: '#8B5CF6' });
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayEvents = getEventsForDate(day);
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`min-h-[80px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer ${
                  isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : ''
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate text-white"
                      style={{ backgroundColor: event.color }}
                      title={event.title}
                    >
                      {event.time && `${event.time} `}{event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {events.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Próximos Eventos</h3>
          {events
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border-l-4 border-gray-200 dark:border-gray-700"
                style={{ borderLeftColor: event.color }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                      {event.time && <span>{event.time}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
