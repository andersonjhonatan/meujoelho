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

### 1. Suba o código
```bash
git push origin main
```

### 2. Crie o banco e **conecte ao projeto**

> **Escolha do banco:** prefira um Postgres com conexão TCP normal — **Neon**, na aba Storage, é o
> caminho que este projeto documenta e testa. Evite **Prisma Postgres**: ele pode entregar a
> `DATABASE_URL` no formato `prisma+postgres://` (Prisma Accelerate), que fala HTTP em vez de
> Postgres, exige `@prisma/extension-accelerate` no client e não aceita migration. Se isso acontecer,
> o build para com uma mensagem explicando as saídas.

No dashboard da Vercel → **Storage** → **Create Database** → **Postgres**. Em seguida, na aba
**Projects** do banco, conecte-o a este projeto — é esse passo que cria as variáveis de ambiente.
Bancos criados mas não conectados não expõem variável nenhuma, e o build falha por falta de
`DATABASE_URL`.

`DATABASE_URL` é a **única variável obrigatória**, e a conexão preenche ela sozinha. Se o seu projeto
já existia antes de conectar o banco, rode um **Redeploy** para o build enxergar as variáveis novas.

Se o build falhar por falta de `DATABASE_URL`, o log lista os nomes das variáveis de banco que
existem no ambiente (só os nomes — connection string não vai para log) e diz o que fazer com elas.

<details>
<summary>Por que não é preciso configurar a conexão direta</summary>

O app precisa de duas conexões diferentes. Em runtime, a **pooled**: funções serverless abrem muitas
conexões curtas e sem o pooler o Postgres estoura o limite. Já `prisma migrate deploy` precisa da
**direta**, porque migration usa advisory lock e sessão estável, que o PgBouncer em modo transação não
oferece.

O nome da variável com a conexão direta muda conforme o provedor e a época da integração
(`DATABASE_URL_UNPOOLED`, `POSTGRES_URL_NON_POOLING`, `DIRECT_DATABASE_URL`...). Declarar um nome fixo
em `directUrl` no schema faz o build quebrar com erro **P1012** em qualquer ambiente que use outro
nome — foi exatamente o que aconteceu no primeiro deploy deste projeto.

Por isso o `schema.prisma` declara só `DATABASE_URL`, e `scripts/migrate-deploy.js` resolve a conexão
direta no momento da migration, nesta ordem:

1. `DATABASE_URL_UNPOOLED` · 2. `POSTGRES_URL_NON_POOLING` · 3. `DIRECT_DATABASE_URL` · 4. `DIRECT_URL`
5. deriva de `DATABASE_URL` removendo o sufixo `-pooler` do host (convenção do Neon)
6. usa a própria `DATABASE_URL` (bancos sem pooler)

O build imprime qual origem usou. A regra está coberta por testes em `tests/migrate-deploy.test.ts`.

</details>

### 3. Importe o projeto
**Add New → Project** → selecione o repositório → **Deploy**.

O build roda `prisma generate && prisma migrate deploy && next build`, então as tabelas são criadas
automaticamente a partir de `prisma/migrations/`. Não é preciso mexer em Build Command.

### 4. Popule o banco — uma vez só
O seed **não** roda no build (o build não deve escrever conteúdo). Rode uma vez, da sua máquina,
apontando para o banco de produção sem alterar o seu `.env`:

```bash
DATABASE_URL="<cole a DATABASE_URL da Vercel>" npm run db:seed
```

Variável passada na linha de comando tem precedência sobre o `.env`, então o seu ambiente local
continua intacto. O seed é idempotente: se rodar de novo, atualiza o conteúdo sem duplicar nada e sem
desmarcar a lista de mercado.

### 5. Abra e instale
Acesse a URL, toque no menu do navegador e escolha **"Adicionar à tela inicial"** para instalar como
PWA. A capa de entrada é a primeira tela.

### Opcional

- `NEXT_PUBLIC_SITE_URL` com a URL final do app deixa os metadados de compartilhamento absolutos.
- **Deploys de preview usam o mesmo banco de produção** e, portanto, aplicam migrations nele. Num app
  pessoal isso costuma ser o desejado; se algum dia incomodar, crie um banco separado para o ambiente
  Preview nas variáveis do projeto.

### Atualizando depois

`git push` — a Vercel reconstrói e aplica migrations pendentes sozinha. Só rode o seed de novo quando
o **conteúdo clínico** mudar (exercícios, nutrição, medicação), o que não acontece a cada deploy.

## Se o deploy falhar

| Erro no log | O que é | O que fazer |
|---|---|---|
| `DATABASE_URL não está definida` | banco não conectado ao projeto | Storage → Create Database → conectar ao projeto → Redeploy. O log lista os nomes das variáveis de banco que existem, se houver |
| `P3009 · migrate found failed migrations` | uma tentativa anterior deixou migration marcada como falha, o que bloqueia todas as seguintes | num banco ainda sem dados, o caminho limpo é recriar: `DATABASE_URL="<a da Vercel>" npm run db:reset` (apaga tudo, aplica as migrations e semeia) |
| `DATABASE_URL está no formato do Prisma Accelerate` | o banco escolhido devolve `prisma+postgres://` | troque por um Postgres TCP (Neon) ou use a connection string direta do Prisma Console |
| `relation "X" does not exist` aplicando migration | ordem das migrations quebrada | `npm run test` acusa: o timestamp da pasta precisa refletir a ordem de dependência |

`npm run db:reset` é **destrutivo** — recria o schema do zero. Só use em banco sem dado que importe.

## Importante

Este é material de apoio educativo. A progressão de fases é uma estrutura sensata baseada em
princípios padrão de reabilitação (isometria → cadeia fechada → funcional), mas **deve ser validada
pelo seu fisioterapeuta** antes de avançar de fase — o app não tem como saber se seu joelho está pronto
além do que você mesmo registra.
