# Studio Manager

Studio Manager e um MVP full stack mobile first para profissionais de studio de beleza administrarem clientes, servicos, agenda, atendimentos, pagamentos e indicadores do negocio.

## Tecnologias

- Next.js App Router + TypeScript
- Tailwind CSS
- Next.js API Routes
- PostgreSQL
- Prisma ORM
- JWT em cookie httpOnly para sessao
- bcryptjs para senha criptografada
- Zod para validacoes
- Recharts para graficos

## Funcionalidades

- Login e cadastro de administradora
- Rotas protegidas por middleware
- Dashboard com faturamento, atendimentos, clientes, ticket medio, servicos mais vendidos, retornos e graficos
- CRUD de clientes com busca por nome/telefone, historico e WhatsApp
- CRUD de servicos com status ativo/inativo
- Agenda diaria/semanal com criacao manual, edicao, cancelamento, destaque do proximo horario e bloqueio de conflito
- Conclusao de atendimento com valor final e forma de pagamento
- Financeiro com atendimentos concluidos
- Mensagens prontas de confirmacao e lembrete via WhatsApp
- Layout responsivo com menu inferior no mobile e sidebar no desktop

## Como rodar localmente

1. Instale dependencias:

```bash
npm install
```

2. Configure o ambiente:

```bash
cp .env.example .env
```

Edite `DATABASE_URL` apontando para seu PostgreSQL e defina um `JWT_SECRET` forte.

3. Rode as migrations e gere o client Prisma:

```bash
npm run prisma:migrate
```

4. Popule dados de exemplo:

```bash
npm run prisma:seed
```

5. Inicie a aplicacao:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Usuario seed

- Email: `admin@beautyschedule.com`
- Senha: `123456`

## Comandos Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
```

## Deploy

### Vercel

1. Crie um banco PostgreSQL externo, por exemplo Railway, Neon ou Supabase.
2. Configure `DATABASE_URL` e `JWT_SECRET` nas variaveis do projeto.
3. Rode `npx prisma migrate deploy` no processo de deploy ou manualmente antes da primeira versao.
4. Publique o repositorio na Vercel.

### Railway

1. Crie um servico PostgreSQL.
2. Configure as mesmas variaveis.
3. Use `npm run build` como build command e `npm run start` como start command.
4. Execute `npx prisma migrate deploy` antes do start em producao.