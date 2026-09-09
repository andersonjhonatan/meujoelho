# Joelho Recovery — Deploy 100% Vercel

Versão consolidada em **um único projeto Next.js** (App Router + Route Handlers), sem backend separado.
Banco de dados via **Vercel Postgres** (Neon). Tudo sobe com um único deploy na Vercel.

## Deploy (passo a passo)

### 1. Suba o código para o GitHub
```bash
cd joelho-recovery-vercel
git push -u origin main   # remote já configurado, ver instruções abaixo
```

### 2. Crie o banco na Vercel
1. No [dashboard da Vercel](https://vercel.com/dashboard) → aba **Storage** → **Create Database** → **Postgres**
2. Dê um nome (ex: `joelho-db`) e crie
3. Isso já disponibiliza a variável `DATABASE_URL` automaticamente para qualquer projeto que você conectar a ele

### 3. Importe o projeto
1. **Add New → Project** → selecione o repositório `meujoelho`
2. Em **Environment Variables**, confirme que `DATABASE_URL` foi injetada automaticamente (se você já linkou o Postgres do passo 2 a este projeto). Se não, cole manualmente a Connection String do banco criado.
3. Clique em **Deploy**

O `buildCommand` já roda `prisma generate` + `prisma migrate deploy` automaticamente antes do build do Next.js —
as tabelas são criadas sozinhas no primeiro deploy.

### 4. Popule o banco (seed) — só uma vez
Localmente, apontando para o banco da Vercel:
```bash
# copie a DATABASE_URL do dashboard da Vercel (Storage > seu banco > .env.local tab)
echo 'DATABASE_URL="postgresql://...vercel-postgres-url..."' > .env
npm install
npx prisma db seed
```

Pronto — acesse a URL que a Vercel te deu (`https://meujoelho.vercel.app`) e o app estará no ar, com todo o
conteúdo do guia (exercícios, nutrição, lista de mercado) já carregado.

### 5. Instalar como PWA no celular
Abra a URL no Chrome/Safari do celular → menu → "Adicionar à tela inicial".

## Rodando localmente
```bash
npm install
cp .env.example .env   # aponte para um Postgres local ou o da Vercel
npx prisma migrate dev --name init
npx prisma db seed
npm run dev             # http://localhost:3000
```
