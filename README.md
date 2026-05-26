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
- Multi-tenant por studio, com dados isolados por `studioId`
- Identidade visual por studio: nome, logo, cor principal e cor secundaria
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

## Configuração de Email

O Studio Manager envia um email de boas-vindas ao concluir o cadastro. A configuração é opcional:

- **Sem configuração**: O email é logado no console (modo desenvolvimento)
- **Com SMTP configurado**: O email é enviado via servidor SMTP

### Variáveis de Ambiente

Edite o arquivo `.env` com as variáveis SMTP:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
SMTP_FROM="Studio Manager <seu-email@gmail.com>"
APP_URL="http://localhost:3000"
```

### Gmail

1. Acesse [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Selecione "Mail" e "Windows Computer"
3. Copie a senha de 16 caracteres gerada
4. Cole em `SMTP_PASS` no `.env`

### Resend (Alternativa)

Use [Resend](https://resend.com) como provedor de email:

```env
SMTP_HOST="smtp.resend.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="resend"
SMTP_PASS="re_xxxxxxxxxxxxx"  # Sua API key do Resend
SMTP_FROM="Studio Manager <onboarding@resend.dev>"
```

## Usuarios seed

- Rose Beauty: `admin@rosebeauty.com`
- Gold Brows: `admin@goldbrows.com`
- Senha para ambos: `123456`

Cada login pertence a um studio diferente e enxerga apenas seus proprios clientes, servicos, agenda, atendimentos e financeiro.

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
