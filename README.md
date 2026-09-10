# Joelho Recovery — Deploy 100% Vercel

App fullstack **mobile-first PWA** de reabilitação para condropatia patelofemoral. Um único projeto
Next.js (App Router + Server Actions), Postgres via Vercel, com um **sistema de progressão clínica** e
integração de mídia licenciada via **wger.de**.

## Rodando localmente

Pré-requisitos: Node 18+ e Docker.

```bash
npm install
cp .env.example .env
npm run db:up        # sobe o Postgres local (porta 5434, via docker compose)
npm run db:setup     # aplica as migrations + popula o banco
npm run dev          # http://localhost:3000
```

O schema usa array de texto e JSON, tipos que o SQLite não suporta no Prisma — por isso o Postgres em
container é o caminho local, e não um arquivo `.db`.

Scripts úteis:

| Comando | O que faz |
|---|---|
| `npm run check` | typecheck + lint (o que roda antes de qualquer commit) |
| `npm run db:migrate` | cria/aplica migration em desenvolvimento |
| `npm run db:seed` | popula o banco — **idempotente**, pode rodar quantas vezes quiser |
| `npm run db:studio` | abre o Prisma Studio para inspecionar os dados |

## O que tem de robusto aqui

### 1. Sistema de fases (evolui de verdade, com segurança)

Em vez de repetir os mesmos 11 exercícios pra sempre, o protocolo evolui em 3 fases:

| Fase | Quando | O que muda |
|---|---|---|
| 1 — Controle de dor/derrame | Semanas 1-2 | Só isometria e exercícios de baixo estresse articular |
| 2 — Fortalecimento em cadeia fechada | Semanas 3-6 | Soma leg press parcial, wall sit, cadeira flexora, abdução |
| 3 — Trabalho unilateral/funcional | Semana 7+ | Soma elevação pélvica unilateral, extensão de quadril no cabo |

A fase considera três critérios e vale sempre **o mais conservador**:

1. **tempo** — semanas desde a primeira sessão registrada;
2. **volume** — sessões efetivamente feitas (6 para a fase 2, 18 para a fase 3): quem treina pouco não
   ganha fase só porque o calendário passou;
3. **sintomas** — dor ≥ 5 ou derrame em qualquer uma das 3 últimas sessões **segura a progressão**.
   Aumentar carga sobre uma articulação que está reagindo mal é justamente o erro que o protocolo evita.

A tela sempre diz *por que* a fase não avançou, em vez de simplesmente não avançar.

**O que a fase NUNCA muda:** a amplitude máxima de flexão de nenhum exercício. Isso só um
fisioterapeuta pode liberar — o sistema evolui volume e complexidade, não o limite de segurança do
laudo.

### 2. Sessões A/B (variedade sem inventar exercício novo)

- **Âncoras** (isometria de quadríceps + prancha) aparecem em toda sessão.
- O resto alterna entre **Sessão A** (foco patelofemoral) e **Sessão B** (cadeia posterior/quadril).
- A alternância é automática (par = A, ímpar = B). Se o dia já tem sessão registrada, a tela mostra o
  template **daquela** sessão — o plano não muda debaixo do usuário depois que ele salvou o treino.

### 3. Registro por exercício

Cada exercício registra séries, repetições, **carga em kg** e **dor específica durante o exercício**.
É o que responde a pergunta que o histórico existe para responder: *qual* exercício está incomodando o
joelho — e não só "doeu 4/10 hoje". O rascunho fica no `localStorage` durante o treino (a academia não
tem sinal) e vai para o banco de uma vez, ao finalizar a sessão.

**Uma sessão por dia**, garantida por uma constraint `@@unique([userId, dayKey])`: finalizar de novo
no mesmo dia atualiza a sessão em vez de criar outra. Duas sessões no mesmo dia inflariam a contagem
que calcula fase, streak e alternância A/B.

### 4. Integração com wger.de (fotos reais, licenciadas)

- Resolução por **id numérico estável** (`wgerExerciseId`), com o nome exato em inglês como fallback.
- A licença exibida é a **real, retornada pela API** (a maior parte do acervo é CC-BY-SA 4.0), com
  autor e **link para a página do exercício** — que é o que a licença de fato exige.
- Timeout de 4s e fallback silencioso para a ilustração customizada em qualquer falha.
- Cache no banco (`ExerciseMediaCache`) por 30 dias.

**Quais exercícios buscam mídia externa — e por quê os outros não:**

| Exercício | wger | Motivo |
|---|---|---|
| Prancha, Ponte de glúteo, Panturrilha, Abdução de quadril | ✅ | movimento genérico, sem restrição de amplitude |
| Isometria, Extensão terminal, Leg press parcial, Wall sit parcial | ❌ | amplitude restrita — foto genérica mostraria ROM completa |
| Cadeira flexora | ❌ | a imagem cadastrada na wger ilustra uma **cadeira extensora**, que está nas contraindicações do laudo |
| Elevação pélvica unilateral | ❌ | o exercício existe na wger, mas sem nenhuma imagem |
| Extensão de quadril no cabo | ❌ | só existem variações em outra posição/equipamento |

Cada imagem foi conferida visualmente antes de entrar — num app clínico, imagem errada é informação
clínica errada.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend + backend | Next.js 15 (App Router + Server Actions) + React 19 + TypeScript + Tailwind |
| ORM / DB | Prisma + Postgres (Vercel Postgres / Neon) |
| Mídia externa | wger.de REST API (sem chave, CC-BY-SA) |
| PWA | manifest + service worker (`@ducanh2912/next-pwa`) com fallback offline |

Mutações são **Server Actions**, não rotas de API: o usuário é resolvido no servidor e todo payload é
validado antes de tocar no banco.

## Estrutura

```
joelho-vercel/
├── prisma/
│   ├── schema.prisma          # Exercise (+ fases/progressão/wger), WorkoutLog, cache de mídia...
│   ├── migrations/            # versionadas — o build da Vercel roda `migrate deploy`
│   └── seed.ts                # todo o conteúdo clínico (idempotente)
├── lib/
│   ├── data.ts                # fase clínica, plano do dia, streak, séries do histórico
│   ├── wger.ts                # cliente wger com cache + fallback seguro
│   ├── date.ts                # dia no fuso do app (nunca use toISOString aqui)
│   ├── session-store.ts       # rascunho do treino no localStorage (offline)
│   └── validation.ts          # validação de entrada das Server Actions
├── app/
│   ├── actions.ts             # saveSession, toggleShoppingItem, resetShoppingList
│   ├── page.tsx               # dashboard
│   ├── treino/                # plano do dia, detalhe do exercício, finalizar
│   ├── nutricao/, historico/, perfil/, offline/
│   ├── error.tsx / not-found.tsx / loading.tsx
└── public/exercises/          # ilustrações customizadas (fallback sempre seguro)
```

## Deploy na Vercel

1. **Suba o código**: `git push -u origin main`
2. **Crie o banco**: dashboard → **Storage** → **Create Database** → **Postgres**
3. **Importe o projeto**: **Add New → Project** → conecte o banco → **Deploy**
   O build roda `prisma generate && prisma migrate deploy && next build`, então as tabelas são criadas
   automaticamente a partir de `prisma/migrations/`.
4. **Popule o banco** (uma vez):
   ```bash
   echo 'DATABASE_URL="cole-a-connection-string-da-vercel"' > .env
   npm install && npm run db:seed
   ```
5. Abra a URL e instale como PWA ("Adicionar à tela inicial").

> Use a connection string **pooled** (com `-pooler` no host) em `DATABASE_URL`: funções serverless
> abrem muitas conexões curtas e estouram o limite do Postgres sem o pooler.

## Importante

Este é material de apoio educativo. A progressão de fases é uma estrutura sensata baseada em
princípios padrão de reabilitação (isometria → cadeia fechada → funcional), mas **deve ser validada
pelo seu fisioterapeuta** antes de avançar de fase — o app não tem como saber se seu joelho está pronto
além do que você mesmo registra.
