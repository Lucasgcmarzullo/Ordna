// AI Assistant for Odrna - Productivity Intelligence

import { Task, Goal, Reminder } from './types';

export interface AIResponse {
  goals: Goal[];
  tasks: Task[];
  reminders: Reminder[];
  message: string;
}

export async function processUserIntent(userInput: string): Promise<AIResponse> {
  // Simulação de IA (em produção, use OpenAI API)
  const input = userInput.toLowerCase();
  
  const response: AIResponse = {
    goals: [],
    tasks: [],
    reminders: [],
    message: '',
  };

  // Detectar intenção de estudar
  if (input.includes('estudar') || input.includes('estudo')) {
    const goal: Goal = {
      id: Date.now().toString(),
      title: 'Meta de Estudos',
      description: 'Melhorar hábitos de estudo e aprendizado contínuo',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const tasks: Task[] = [
      {
        id: `${Date.now()}-1`,
        title: 'Definir horário fixo de estudos',
        description: 'Escolher 2 horas por dia para estudar',
        completed: false,
        category: 'estudos',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: `${Date.now()}-2`,
        title: 'Criar lista de tópicos para estudar',
        description: 'Organizar conteúdos por prioridade',
        completed: false,
        category: 'estudos',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: `${Date.now()}-3`,
        title: 'Estudar 30 minutos por dia',
        description: 'Começar com sessões curtas e aumentar gradualmente',
        completed: false,
        category: 'estudos',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
    ];

    const reminders: Reminder[] = [
      {
        id: `${Date.now()}-r1`,
        title: 'Hora de estudar! 📚',
        time: '19:00',
        createdAt: new Date().toISOString(),
      },
      {
        id: `${Date.now()}-r2`,
        title: 'Revisar progresso semanal',
        time: '18:00',
        createdAt: new Date().toISOString(),
      },
    ];

    response.goals.push(goal);
    response.tasks.push(...tasks);
    response.reminders.push(...reminders);
    response.message = '✨ Criei uma meta de estudos com 3 tarefas e 2 lembretes automáticos para você! Vamos começar?';
  }
  
  // Detectar intenção de exercitar
  else if (input.includes('exerc') || input.includes('treino') || input.includes('academia')) {
    const goal: Goal = {
      id: Date.now().toString(),
      title: 'Meta de Exercícios',
      description: 'Criar rotina de exercícios físicos',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const tasks: Task[] = [
      {
        id: `${Date.now()}-1`,
        title: 'Escolher tipo de exercício',
        description: 'Decidir entre academia, corrida, yoga, etc.',
        completed: false,
        category: 'saude',
        priority: 'high',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: `${Date.now()}-2`,
        title: 'Exercitar 3x por semana',
        description: 'Começar com 30 minutos por sessão',
        completed: false,
        category: 'saude',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
    ];

    const reminders: Reminder[] = [
      {
        id: `${Date.now()}-r1`,
        title: 'Hora do treino! 💪',
        time: '07:00',
        createdAt: new Date().toISOString(),
      },
    ];

    response.goals.push(goal);
    response.tasks.push(...tasks);
    response.reminders.push(...reminders);
    response.message = '💪 Criei uma meta de exercícios com tarefas e lembretes! Vamos começar essa jornada?';
  }
  
  // Detectar intenção de economizar
  else if (input.includes('economizar') || input.includes('poupar') || input.includes('guardar dinheiro')) {
    const goal: Goal = {
      id: Date.now().toString(),
      title: 'Meta de Economia',
      description: 'Melhorar controle financeiro e poupar dinheiro',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const tasks: Task[] = [
      {
        id: `${Date.now()}-1`,
        title: 'Analisar gastos mensais',
        description: 'Revisar todas as despesas do último mês',
        completed: false,
        category: 'pessoal',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: `${Date.now()}-2`,
        title: 'Definir meta de economia mensal',
        description: 'Estabelecer quanto guardar por mês',
        completed: false,
        category: 'pessoal',
        priority: 'high',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
      {
        id: `${Date.now()}-3`,
        title: 'Cortar gastos desnecessários',
        description: 'Identificar e eliminar despesas supérfluas',
        completed: false,
        category: 'pessoal',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      },
    ];

    const reminders: Reminder[] = [
      {
        id: `${Date.now()}-r1`,
        title: 'Registrar gastos do dia 💰',
        time: '21:00',
        createdAt: new Date().toISOString(),
      },
    ];

    response.goals.push(goal);
    response.tasks.push(...tasks);
    response.reminders.push(...reminders);
    response.message = '💰 Criei uma meta de economia com tarefas práticas e lembretes diários!';
  }
  
  // Resposta genérica
  else {
    response.message = '🤔 Não entendi completamente. Tente frases como: "quero estudar mais", "preciso me exercitar", "quero economizar dinheiro"';
  }

  return response;
}

export function generateProductivityInsights(tasks: Task[]): string[] {
  const insights: string[] = [];
  
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (completionRate >= 80) {
    insights.push('🎉 Excelente! Você está completando mais de 80% das suas tarefas!');
  } else if (completionRate >= 50) {
    insights.push('👍 Bom trabalho! Continue assim para melhorar sua produtividade.');
  } else if (completionRate < 50 && totalTasks > 0) {
    insights.push('💡 Dica: Tente dividir tarefas grandes em menores para facilitar a conclusão.');
  }

  const highPriorityPending = tasks.filter(t => !t.completed && t.priority === 'high').length;
  if (highPriorityPending > 3) {
    insights.push('⚠️ Você tem muitas tarefas de alta prioridade pendentes. Foque nelas primeiro!');
  }

  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  if (overdueTasks > 0) {
    insights.push(`📅 Você tem ${overdueTasks} tarefa(s) atrasada(s). Considere reorganizar suas prioridades.`);
  }

  return insights;
}
