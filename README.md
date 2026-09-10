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
| `npm run test` | testes das funções puras (fuso horário, validação) |

## O que tem de robusto aqui

### 1. O protocolo foi desenhado a partir do laudo, não de um modelo genérico

A RM de 25/08/2026 diz duas coisas que mudam tudo no desenho:

**A lesão está confinada à articulação patelofemoral** (patela + tróclea). Meniscos, cruzados e
colaterais estão íntegros, e as demais superfícies condrais são regulares. Ou seja: quadril, cadeia
posterior, panturrilha e core podem ser treinados com carga de verdade sem tocar na área lesionada —
e é justamente aí que a evidência é mais forte (fortalecer quadril + joelho supera joelho isolado na
dor patelofemoral).

**As erosões estão nos terços médio e inferior do vértice da patela e no terço superior da tróclea.**
Essas duas superfícies se encontram entre ~10° e ~30° de flexão, faixa em que a área de contato
patelofemoral é a menor de toda a amplitude (~168 mm² a 20° contra ~334 mm² a 60°): mesma força,
tensão bem maior. Por isso a extensão terminal de arco curto — exercício clássico de quadríceps e que
estava no protocolo original — **saiu do plano automático** e virou item aguardando liberação do
fisioterapeuta, com o motivo escrito na tela.

Somam-se dois achados que também entram no desenho: o **derrame moderado** inibe o quadríceps por via
reflexa (enquanto não ceder, ganho de força é limitado por neurologia, não por esforço), e a **leve
tendinopatia distal do quadríceps** responde a isometria evoluindo para carga lenta e pesada.

### 2. Semana de 3 sessões diferentes — segunda, quarta e sexta

São **28 exercícios** no protocolo, distribuídos em três sessões com foco próprio:

| Dia | Sessão | Foco | Por quê |
|---|---|---|---|
| Segunda | A | Quadríceps e controle patelar | Cadeia fechada em amplitude controlada, a faixa de menor compressão |
| Quarta | B | Quadril e cadeia posterior | Carga alta possível com risco patelofemoral praticamente nulo |
| Sexta | C | Controle motor, integração e panturrilha | Treina o gesto que sobrecarrega o joelho na vida real |

Cada sessão é montada em blocos — **mobilidade → ativação → trabalho principal → core → finalização** —
e duas âncoras (isometria de quadríceps e prancha) aparecem em todas.

Terça, quinta e fim de semana são dias de recuperação: o app avisa e mostra a próxima sessão, sem
bloquear quem quiser adiantar.

Cada exercício traz o **porquê clínico** dele no seu caso, o equipamento necessário e um selo quando
gera compressão na patela.

### 3. Sistema de fases (evolui de verdade, com segurança)

O protocolo evolui em 3 fases:

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

Se o dia já tem sessão registrada, a tela mostra o template **daquela** sessão — o plano não muda
debaixo do usuário depois que ele salvou o treino.

### 4. O que o app se recusa a decidir

Duas coisas ficam explicitamente fora do alcance do app, visíveis em vez de escondidas:

- **Exercícios aguardando liberação** aparecem numa seção separada no fim do treino, com o motivo
  clínico completo — não entram no plano automático nem somem do app.
- **Perguntas para o fisioterapeuta**, no Perfil: os pontos que o laudo levanta e que só quem examina
  o joelho pode responder. A tela existe para ser aberta na consulta.

O Perfil também lista a **medicação em uso** com o que importa de cada uma — incluindo que o
cetorolaco (Mytro) é, por bula, um anti-inflamatório de uso curto (até 5 dias) e não indicado para
dor crônica, e que anti-inflamatório mascara justamente a dor que segura a progressão de carga.

### 5. Registro por exercício

Cada exercício registra séries, repetições, **carga em kg** e **dor específica durante o exercício**.
É o que responde a pergunta que o histórico existe para responder: *qual* exercício está incomodando o
joelho — e não só "doeu 4/10 hoje". O rascunho fica no `localStorage` durante o treino (a academia não
tem sinal) e vai para o banco de uma vez, ao finalizar a sessão.

**Uma sessão por dia**, garantida por uma constraint `@@unique([userId, dayKey])`: finalizar de novo
no mesmo dia atualiza a sessão em vez de criar outra. Duas sessões no mesmo dia inflariam a contagem
que calcula fase, streak e alternância A/B.

### 6. Integração com wger.de (fotos reais, licenciadas)

- Resolução por **id numérico estável** (`wgerExerciseId`), com o nome exato em inglês como fallback.
- A licença exibida é a **real, retornada pela API** (a maior parte do acervo é CC-BY-SA 4.0), com
  autor e **link para a página do exercício** — que é o que a licença de fato exige.
- Timeout de 4s e fallback silencioso para a ilustração customizada em qualquer falha.
- Cache no banco (`ExerciseMediaCache`) por 30 dias.

**Quais exercícios buscam mídia externa — e por quê os outros não:**

| Exercício | wger | Motivo |
|---|---|---|
| Prancha, Ponte de glúteo, Panturrilha, Abdução de quadril, Stiff, Alongamento de isquiotibiais e de panturrilha | ✅ | movimento genérico, imagem conferida e fiel |
| Isometria, Extensão terminal, Leg press parcial, Wall sit parcial | ❌ | amplitude restrita — foto genérica mostraria ROM completa |
| Cadeira flexora | ❌ | a imagem cadastrada na wger ilustra uma **cadeira extensora**, que está nas contraindicações do laudo |
| Step-up | ❌ | a imagem mostra degrau na altura do joelho; o protocolo pede 10-15 cm |
| Alongamento de flexor de quadril | ❌ | a imagem é a versão ajoelhada, que apoia a patela lesionada no chão |
| Elevação pélvica unilateral, Extensão de quadril no cabo | ❌ | sem imagem, ou só variações em outra posição/equipamento |

Cada imagem foi conferida visualmente antes de entrar — num app clínico, imagem errada é informação
clínica errada. Dos 28 exercícios, 7 têm imagem confiável; os outros mostram um símbolo da categoria,
em vez de uma foto genérica que ensinaria o movimento errado.

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
│   ├── schema.prisma          # Exercise (+ fases/blocos/wger), WorkoutLog, Medication, cache...
│   ├── migrations/            # versionadas — o build da Vercel roda `migrate deploy`
│   ├── seed.ts                # orquestra a escrita (idempotente)
│   └── data/                  # o conteúdo clínico, separado da mecânica
│       ├── exercises.ts       # 28 exercícios, sessões A/B/C, justificativa de cada um
│       ├── clinical.ts        # laudo, contraindicações, perguntas ao fisio, medicação
│       └── nutrition.ts       # alimentos e lista de mercado
├── lib/
│   ├── data.ts                # fase clínica, plano do dia, streak, séries do histórico
│   ├── wger.ts                # cliente wger com cache + fallback seguro
│   ├── date.ts                # dia no fuso do app (nunca use toISOString aqui)
│   ├── session-store.ts       # rascunho do treino no localStorage (offline)
│   └── validation.ts          # validação de entrada das Server Actions
├── app/
│   ├── actions.ts             # saveSession, toggleShoppingItem, resetShoppingList
│   ├── page.tsx               # capa de entrada (sem barra de navegação)
│   ├── hoje/                  # painel do dia
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
