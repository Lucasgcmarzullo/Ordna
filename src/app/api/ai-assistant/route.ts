import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    console.log('📩 Comando recebido:', message);
    console.log('📊 Contexto:', context);

    // Verificar se a API key está configurada
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GROQ_API_KEY não configurada');
      return NextResponse.json(
        { 
          actions: [], 
          response: '⚠️ A chave da API Groq não está configurada.\n\n📝 Para configurar:\n1. Clique no banner laranja acima\n2. Adicione a variável GROQ_API_KEY\n3. Cole sua chave da API Groq' 
        },
        { status: 200 } // Mudado para 200 para não gerar erro no frontend
      );
    }

    const systemPrompt = `Você é um assistente inteligente e conversacional de produtividade. Seu trabalho é interpretar comandos do usuário de forma natural e convertê-los em ações estruturadas.

CONTEXTO ATUAL DO USUÁRIO:
- Tarefas existentes: ${JSON.stringify(context.tasks || [])}
- Eventos existentes: ${JSON.stringify(context.events || [])}
- Transações existentes: ${JSON.stringify(context.transactions || [])}

AÇÕES DISPONÍVEIS:

1. TAREFAS (type: "task"):
   - create: { action: "create", type: "task", data: { title: string, category: "trabalho" | "estudos" | "saude" | "pessoal" } }
   - update: { action: "update", type: "task", data: { id: string, updates: { completed?: boolean, title?: string, category?: string } } }
   - delete: { action: "delete", type: "task", data: { id: string } }
   - list: { action: "list", type: "task", data: {} }

2. EVENTOS (type: "event"):
   - create: { action: "create", type: "event", data: { title: string, date: string (ISO), category: "trabalho" | "estudos" | "saude" | "pessoal" } }
   - update: { action: "update", type: "event", data: { id: string, updates: { title?: string, date?: string, category?: string } } }
   - delete: { action: "delete", type: "event", data: { id: string } }
   - list: { action: "list", type: "event", data: {} }

3. TRANSAÇÕES (type: "transaction"):
   - create: { action: "create", type: "transaction", data: { description: string, amount: number, type: "income" | "expense", category: "alimentacao" | "transporte" | "saude" | "lazer" | "salario" | "outros" } }
   - update: { action: "update", type: "transaction", data: { id: string, updates: { description?: string, amount?: number, type?: string, category?: string } } }
   - delete: { action: "delete", type: "transaction", data: { id: string } }
   - list: { action: "list", type: "transaction", data: {} }

4. CONVERSA (type: "chat"):
   - Quando o usuário fizer uma pergunta, cumprimentar, ou conversar sem pedir ação específica
   - Retorne: { actions: [], response: "sua resposta amigável" }

REGRAS IMPORTANTES:
- Seja conversacional e amigável - você pode conversar naturalmente com o usuário
- Se o usuário cumprimentar ("oi", "olá", "bom dia"), responda de forma amigável
- Se o usuário perguntar algo, responda de forma útil
- Se o usuário pedir ajuda, explique o que você pode fazer
- Interprete comandos naturais em português de forma inteligente
- "Crie 2 tarefas: X e Y" = 2 ações de create task
- "Meu salário de R$ 1400 caiu" = create transaction (income, salario)
- "Adicione despesa de R$ 50 no mercado" = create transaction (expense, alimentacao)
- "Marque reunião amanhã às 14h" = create event
- "Liste minhas tarefas" = list tasks
- Para datas relativas (amanhã, hoje, próxima semana), calcule a data ISO correta baseada em ${new Date().toISOString()}
- Seja inteligente ao categorizar automaticamente
- Se o usuário mencionar "estudar", categoria = "estudos"
- Se mencionar "médico", "academia", categoria = "saude"
- Se mencionar "trabalho", "reunião", categoria = "trabalho"
- Para horários específicos (ex: "18hrs", "18h", "6 da tarde"), crie um EVENTO com a data e hora corretas

RESPOSTA ESPERADA (JSON):
{
  "actions": [array de ações a executar - pode ser vazio se for apenas conversa],
  "response": "mensagem amigável e natural para o usuário"
}

EXEMPLOS:

Usuário: "Oi"
Resposta: {
  "actions": [],
  "response": "Olá! 👋 Como posso ajudar você hoje? Posso criar tarefas, agendar eventos, registrar despesas e receitas, ou simplesmente conversar!"
}

Usuário: "O que você pode fazer?"
Resposta: {
  "actions": [],
  "response": "Posso te ajudar com várias coisas! 😊\n\n✅ Criar e gerenciar tarefas\n📅 Agendar eventos e compromissos\n💰 Registrar despesas e receitas\n📊 Listar e organizar suas atividades\n\nÉ só me dizer o que precisa de forma natural, como 'crie uma tarefa de estudar' ou 'registre uma despesa de R$ 50 no mercado'!"
}

Usuário: "Crie 2 tarefas: estudar inglês e fazer exercícios"
Resposta: {
  "actions": [
    { "action": "create", "type": "task", "data": { "title": "Estudar inglês", "category": "estudos" } },
    { "action": "create", "type": "task", "data": { "title": "Fazer exercícios", "category": "saude" } }
  ],
  "response": "✅ Pronto! Criei 2 tarefas para você:\n• Estudar inglês (Estudos)\n• Fazer exercícios (Saúde)\n\nBora colocar em prática! 💪"
}

Usuário: "lavar a louça 18hrs"
Resposta: {
  "actions": [
    { "action": "create", "type": "event", "data": { "title": "Lavar a louça", "date": "2024-01-15T18:00:00.000Z", "category": "pessoal" } }
  ],
  "response": "✅ Agendei 'Lavar a louça' para hoje às 18:00! Vou te lembrar na hora certa! 🕐"
}

Usuário: "Meu salário de R$ 1400 caiu"
Resposta: {
  "actions": [
    { "action": "create", "type": "transaction", "data": { "description": "Salário", "amount": 1400, "type": "income", "category": "salario" } }
  ],
  "response": "💰 Ótimo! Registrei sua receita de R$ 1.400,00 (Salário). Parabéns pelo pagamento! 🎉"
}

Usuário: "Adicione uma despesa de R$ 50 no mercado"
Resposta: {
  "actions": [
    { "action": "create", "type": "transaction", "data": { "description": "Mercado", "amount": 50, "type": "expense", "category": "alimentacao" } }
  ],
  "response": "💸 Registrei sua despesa de R$ 50,00 no mercado (Alimentação). Tudo anotado!"
}

Agora processe o comando do usuário de forma natural e conversacional. Retorne APENAS o JSON com actions e response.`;

    console.log('🤖 Enviando para Groq...');

    // Chamada para a API Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7, // Aumentado para respostas mais naturais
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erro na API Groq:', errorData);
      
      if (response.status === 401) {
        return NextResponse.json(
          { 
            actions: [], 
            response: '🔑 A chave da API Groq está incorreta ou inválida.\n\n📝 Para corrigir:\n1. Acesse https://console.groq.com/keys\n2. Crie uma nova chave API\n3. Configure a variável GROQ_API_KEY com a chave completa' 
          },
          { status: 200 }
        );
      }

      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      console.error('❌ Resposta inválida da Groq:', data);
      return NextResponse.json(
        { 
          actions: [], 
          response: '❌ Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?' 
        },
        { status: 200 }
      );
    }

    // Parse do JSON retornado pela IA
    let result;
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (err) {
      console.error('❌ Erro ao fazer parse do JSON:', data.choices[0].message.content);
      return NextResponse.json(
        { 
          actions: [], 
          response: '❌ Desculpe, não consegui entender completamente. Pode reformular de outra forma?' 
        },
        { status: 200 }
      );
    }

    console.log('✅ Resposta da Groq:', result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Erro na API do assistente:', error);
    console.error('Detalhes do erro:', error.message);
    
    // Erro genérico com mensagem amigável
    return NextResponse.json(
      { 
        actions: [], 
        response: `😔 Ops! Tive um problema ao processar seu comando.\n\n${error.message.includes('fetch') ? '🌐 Verifique sua conexão com a internet' : '⚙️ Algo deu errado no processamento'}\n\nTente novamente em alguns instantes!` 
      },
      { status: 200 }
    );
  }
}
