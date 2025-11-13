'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, TrendingUp, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface PomodoroStats {
  completed: number;
  totalMinutes: number;
  streak: number;
}

export default function FocusModeModule() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [stats, setStats] = useState<PomodoroStats>({
    completed: 0,
    totalMinutes: 0,
    streak: 0,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const modes = {
    focus: { duration: 25 * 60, label: 'Foco', color: 'from-red-500 to-orange-500' },
    short: { duration: 5 * 60, label: 'Pausa Curta', color: 'from-green-500 to-teal-500' },
    long: { duration: 15 * 60, label: 'Pausa Longa', color: 'from-blue-500 to-purple-500' },
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    // Gerar recomendação da IA baseada nas estatísticas
    if (stats.completed > 0) {
      const recommendations = [
        'Ótimo trabalho! Continue mantendo esse ritmo.',
        'Você está no caminho certo. Lembre-se de fazer pausas.',
        'Sua produtividade está aumentando! Continue assim.',
        'Considere fazer uma pausa mais longa após 4 pomodoros.',
        'Excelente foco! Mantenha-se hidratado.',
      ];
      setAiRecommendation(recommendations[Math.floor(Math.random() * recommendations.length)]);
    }
  }, [stats.completed]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    if (soundEnabled) {
      playNotificationSound();
    }

    if (mode === 'focus') {
      setStats(prev => ({
        completed: prev.completed + 1,
        totalMinutes: prev.totalMinutes + 25,
        streak: prev.streak + 1,
      }));
    }

    // Sugerir próximo modo
    if (mode === 'focus') {
      if (stats.completed % 4 === 3) {
        setMode('long');
        setTimeLeft(modes.long.duration);
      } else {
        setMode('short');
        setTimeLeft(modes.short.duration);
      }
    } else {
      setMode('focus');
      setTimeLeft(modes.focus.duration);
    }
  };

  const playNotificationSound = () => {
    // Som de notificação simples usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].duration);
  };

  const changeMode = (newMode: 'focus' | 'short' | 'long') => {
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Modo Foco
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Técnica Pomodoro com sons e recomendações inteligentes
        </p>
      </div>

      {/* Timer Principal */}
      <div className={`bg-gradient-to-br ${modes[mode].color} p-8 rounded-xl shadow-2xl text-white`}>
        <div className="text-center space-y-6">
          <div className="flex justify-center gap-2 mb-4">
            {(Object.keys(modes) as Array<keyof typeof modes>).map((m) => (
              <button
                key={m}
                onClick={() => changeMode(m)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  mode === m
                    ? 'bg-white/30 backdrop-blur-sm'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {modes[m].label}
              </button>
            ))}
          </div>

          <div className="relative">
            <svg className="w-64 h-64 mx-auto transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="opacity-20"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{formatTime(timeLeft)}</div>
                <div className="text-white/80">{modes[mode].label}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={toggleTimer}
              className="p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all"
            >
              {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all"
            >
              <RotateCcw className="w-8 h-8" />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all"
            >
              {soundEnabled ? <Volume2 className="w-8 h-8" /> : <VolumeX className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Pomodoros</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {stats.completed}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completados hoje</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Tempo Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {stats.totalMinutes}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Minutos focados</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Sequência</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {stats.streak}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Dias consecutivos</p>
        </div>
      </div>

      {/* Recomendação da IA */}
      {aiRecommendation && (
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold mb-2">Recomendação da IA</h3>
              <p className="text-white/90">{aiRecommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bloqueio de Distrações */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Bloqueio de Distrações
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Durante o modo foco, minimize notificações e mantenha-se concentrado na tarefa atual.
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-gray-800 dark:text-gray-200">Notificações silenciadas</span>
            <div className="w-12 h-6 bg-green-500 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-gray-800 dark:text-gray-200">Modo não perturbe</span>
            <div className="w-12 h-6 bg-green-500 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
