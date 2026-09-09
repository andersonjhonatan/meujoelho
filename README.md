# Joelho Recovery — Deploy 100% Vercel

App fullstack **mobile-first PWA** de reabilitação para condropatia patelofemoral. Um único projeto
Next.js (App Router + Route Handlers), Postgres via Vercel, com um **sistema de progressão clínica**
e integração de mídia real via **wger.de**.

## O que tem de robusto aqui

### 1. Sistema de fases (evolui de verdade, com segurança)

Em vez de repetir os mesmos 11 exercícios pra sempre, o protocolo evolui em 3 fases, calculadas pela
**constância real de treino** (data da primeira sessão registrada, não o calendário):

| Fase | Quando | O que muda |
|---|---|---|
| 1 — Controle de dor/derrame | Semanas 1-2 | Só isometria e exercícios de baixo estresse articular |
| 2 — Fortalecimento em cadeia fechada | Semanas 3-6 | Soma leg press parcial, wall sit, cadeira flexora, abdução |
| 3 — Trabalho unilateral/funcional | Semana 7+ | Soma elevação pélvica unilateral, extensão de quadril no cabo |

**O que a fase NUNCA muda:** a amplitude máxima de flexão de nenhum exercício. Isso só um
fisioterapeuta pode liberar — o sistema evolui volume e complexidade, não o limite de segurança do
laudo.

### 2. Sessões A/B (variedade sem inventar exercício novo)

Trocar exercícios de reabilitação sem orientação profissional é arriscado, então a variedade vem da
**estrutura da sessão**, não de exercícios novos:
- **Âncoras** (isometria de quadríceps + prancha) aparecem em toda sessão — são a base de proteção
  patelar e core.
- O resto alterna entre **Sessão A** (foco patelofemoral: extensão terminal, leg press, wall sit,
  panturrilha) e **Sessão B** (foco cadeia posterior/quadril: ponte, cadeira flexora, abdução,
  extensão de quadril).
- A alternância é automática, baseada no número de sessões já registradas (par = A, ímpar = B).

### 3. Progressão de séries/reps/tempo por fase

Cada exercício tem um campo `progression` (JSON) no banco com os alvos de série/repetição/tempo de
sustentação específicos pra cada fase — visível na tela de treino (`currentTarget`). Isso é o que dá a
sensação de evolução real sessão a sessão, sem tocar em amplitude.

### 4. Integração com wger.de (fotos reais, licenciadas)

Depois de pesquisar várias fontes (ExerciseDB, free-exercise-db, bancos de fisioterapia), o **wger**
foi o único com licenciamento de imagem realmente verificável: **CC BY-SA 3.0**, autor creditado por
exercício (via `license_author`), boa parte originada do banco Everkinetic (mesma fonte que a
Wikipedia usa).

- `lib/wger.ts` busca ao vivo (`/exercise/search` + `/exerciseinfo`) para os exercícios com
  `wgerSearchTerm` preenchido no banco — **só os de movimento genérico e amplitude completa livre**
  (ponte de glúteo, cadeira flexora, abdução de quadril, extensão de quadril, panturrilha, prancha).
- Exercícios com restrição de amplitude (isometria, extensão terminal, leg press parcial, wall sit
  parcial) **nunca** têm esse campo preenchido — nunca vão buscar uma foto genérica que mostraria
  amplitude completa, o que seria uma informação clinicamente errada dentro do próprio app.
- Toda chamada à wger tem timeout de 4s e cai em `null` (usa a ilustração customizada) em qualquer
  falha — a tela nunca quebra por causa de uma API externa fora do ar.
- Resultado cacheado no banco (`ExerciseMediaCache`) por 30 dias — a wger só é consultada uma vez por
  exercício por ciclo, não a cada carregamento de tela.
- A atribuição (`wger.de · CC BY-SA 3.0 · autor`) aparece visivelmente embaixo da foto — atende a
  exigência da licença compartilhada.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend + API | Next.js 14 (App Router) + Route Handlers + TypeScript + Tailwind + next-pwa |
| ORM / DB | Prisma + Postgres (Vercel Postgres / Neon) |
| Mídia externa | wger.de REST API (sem chave, CC BY-SA 3.0) |
| PWA | manifest.json + service worker com cache offline das imagens de exercício |

## Estrutura

```
joelho-vercel/
├── prisma/
│   ├── schema.prisma        # Exercise (+ fases/progressão/wger), ExerciseMediaCache, etc.
│   └── seed.ts               # todo o conteúdo clínico: fases, âncoras, grupos A/B, progressão
├── lib/
│   ├── data.ts                # getCurrentPhase, getTodaysTemplate, getTodaysPlan
│   ├── wger.ts                 # cliente wger com cache + fallback seguro
│   └── prisma.ts
├── app/
│   ├── page.tsx                # Dashboard — mostra fase atual e sessão de hoje
│   ├── treino/                 # plano do dia já filtrado/progredido pela fase
│   ├── nutricao/
│   ├── historico/
│   ├── perfil/
│   └── api/                    # 2 route handlers (shopping toggle, workout-logs POST)
└── public/exercises/            # ilustrações customizadas (fallback sempre seguro)
```

## Deploy (passo a passo)

### 1. Suba o código para o GitHub
```bash
cd joelho-vercel
git push -u origin main
```

### 2. Crie o banco na Vercel
No [dashboard da Vercel](https://vercel.com/dashboard) → **Storage** → **Create Database** → **Postgres**.

### 3. Importe o projeto
**Add New → Project** → selecione `meujoelho` → conecte o banco criado no passo 2 → **Deploy**.
O `buildCommand` já roda `prisma generate` + `prisma migrate deploy` automaticamente.

### 4. Popule o banco (seed) — uma vez
```bash
echo 'DATABASE_URL="cole-a-connection-string-da-vercel-aqui"' > .env
npm install && npx prisma db seed
```

### 5. Abra a URL que a Vercel te deu
Instale como PWA pelo menu do navegador ("Adicionar à tela inicial").

## Rodando localmente
```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma db seed
npm run dev             # http://localhost:3000
```

## Importante

Este é material de apoio educativo. A progressão de fases é uma estrutura sensata baseada em
princípios padrão de reabilitação (isometria → cadeia fechada → funcional), mas **deve ser validada
pelo seu fisioterapeuta** antes de avançar de fase — o app não tem como saber se seu joelho está pronto
além do que você mesmo registra.
