# Projeto Next.js

Este é um projeto [Next.js](https://nextjs.org) criado com [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Começando

Primeiro, instale as dependências:

```bash
npm install
```

Em seguida, execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

Você pode começar a editar a página modificando `src/app/page.tsx`. A página é atualizada automaticamente conforme você edita o arquivo.

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento na porta 3000
- `npm run build` - Cria a versão de produção otimizada
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter para verificar problemas no código

## Estrutura do Projeto

```
/src
  /app          - Páginas e rotas da aplicação
  /components   - Componentes reutilizáveis
  /lib          - Utilitários e configurações
  /hooks        - React hooks customizados
```

## Variáveis de Ambiente

Configure as variáveis de ambiente necessárias no arquivo `.env.local`:

- Supabase (banco de dados e autenticação)
- APIs de pagamento (Stripe, Mercado Pago)
- APIs de IA (OpenAI, Groq)
- Configurações de autenticação (Google OAuth)

## Deploy

Este projeto está configurado para deploy na **Lasy**. 

Para fazer deploy:
1. Configure todas as variáveis de ambiente necessárias
2. Execute `npm run build` para verificar se não há erros
3. Use a plataforma Lasy para fazer o deploy automático

## Saiba Mais

Para aprender mais sobre Next.js, confira os seguintes recursos:

- [Documentação do Next.js](https://nextjs.org/docs) - aprenda sobre recursos e API do Next.js
- [Tutorial Interativo do Next.js](https://nextjs.org/learn) - tutorial interativo do Next.js

Você pode conferir [o repositório do Next.js no GitHub](https://github.com/vercel/next.js) - seu feedback e contribuições são bem-vindos!
