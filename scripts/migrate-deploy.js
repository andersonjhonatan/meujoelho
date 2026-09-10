#!/usr/bin/env node
/**
 * Aplica as migrations pendentes usando a conexão DIRETA do banco.
 *
 * Por que isto existe, em vez de um `directUrl` no schema.prisma:
 *
 * O app precisa de duas conexões diferentes. Em runtime, a POOLED — funções
 * serverless abrem muitas conexões curtas e sem o pooler o Postgres estoura o
 * limite. Já `prisma migrate deploy` precisa da DIRETA, porque migration usa
 * advisory lock e sessão estável, coisas que o PgBouncer em modo transação não
 * oferece.
 *
 * O problema é que o NOME da variável com a conexão direta muda conforme o
 * provedor e a época da integração: DATABASE_URL_UNPOOLED, POSTGRES_URL_NON_POOLING,
 * DIRECT_DATABASE_URL... Declarar um nome fixo em `directUrl` faz o build
 * quebrar com erro P1012 em qualquer ambiente que use outro nome — que foi
 * exatamente o que aconteceu no primeiro deploy deste projeto.
 *
 * Então: o schema declara só `DATABASE_URL`, e este script descobre a conexão
 * direta entre os nomes conhecidos, com dois fallbacks. A migration roda com
 * `DATABASE_URL` apontando temporariamente para ela; o runtime segue no pooler.
 */

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Carrega o .env local, se existir.
 *
 * Na Vercel as variáveis já vêm do ambiente e este passo não faz nada. Em
 * desenvolvimento, quem lê o .env é o Prisma CLI — não este processo — então
 * sem isto o script não enxergaria DATABASE_URL na sua máquina.
 *
 * Variável já presente no ambiente tem precedência: passar na linha de comando
 * continua sobrescrevendo o arquivo.
 */
function carregarEnvLocal() {
  const arquivo = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(arquivo)) return;

  for (const linha of fs.readFileSync(arquivo, "utf8").split("\n")) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith("#")) continue;

    const separador = limpa.indexOf("=");
    if (separador === -1) continue;

    const chave = limpa.slice(0, separador).trim();
    if (process.env[chave] !== undefined) continue;

    const valor = limpa.slice(separador + 1).trim();
    process.env[chave] = valor.replace(/^["']|["']$/g, "");
  }
}

/** Nomes usados pelas integrações mais comuns, em ordem de preferência. */
const DIRECT_URL_VARS = [
  "DATABASE_URL_UNPOOLED", // Neon (integração atual da Vercel)
  "POSTGRES_URL_NON_POOLING", // Vercel Postgres (nomes antigos)
  "DIRECT_DATABASE_URL",
  "DIRECT_URL",
];

/**
 * Deriva a conexão direta a partir da pooled.
 * O Neon usa o mesmo host com o sufixo `-pooler` para o PgBouncer, então
 * removê-lo devolve o endpoint direto. Retorna null se o padrão não bater.
 */
function derivarDoPooler(url) {
  if (!url || !url.includes("-pooler.")) return null;
  return url.replace("-pooler.", ".");
}

function resolverUrlDireta() {
  for (const nome of DIRECT_URL_VARS) {
    const valor = process.env[nome];
    if (valor) return { url: valor, origem: `variável ${nome}` };
  }

  const derivada = derivarDoPooler(process.env.DATABASE_URL);
  if (derivada) return { url: derivada, origem: "derivada de DATABASE_URL (host sem -pooler)" };

  // Último caso: bancos sem pooler (Postgres local, Supabase direto, RDS...).
  // Aqui a própria DATABASE_URL já é uma conexão direta.
  return { url: process.env.DATABASE_URL, origem: "DATABASE_URL (banco sem pooler)" };
}

/**
 * Monta a chamada do Prisma CLI.
 *
 * Resolver o arquivo do CLI e executá-lo com o próprio Node evita depender do
 * PATH: dentro de `npm run` o node_modules/.bin entra no PATH, mas fora dele
 * (rodando `node scripts/migrate-deploy.js` direto) não, e o comando falharia
 * com ENOENT.
 */
function comandoPrisma(args) {
  try {
    const cli = require.resolve("prisma/build/index.js");
    return [process.execPath, [cli, ...args]];
  } catch {
    return ["prisma", args];
  }
}

function main() {
  carregarEnvLocal();

  if (!process.env.DATABASE_URL) {
    console.error(
      "[migrate] DATABASE_URL não está definida.\n" +
        "         Na Vercel, conecte um banco Postgres ao projeto em Storage → Create Database.\n" +
        "         Localmente, copie .env.example para .env e rode `npm run db:up`."
    );
    process.exit(1);
  }

  const { url, origem } = resolverUrlDireta();
  console.log(`[migrate] conexão direta: ${origem}`);

  const resultado = spawnSync(...comandoPrisma(["migrate", "deploy"]), {
    stdio: "inherit",
    // A migration roda na conexão direta; o app em runtime continua no pooler,
    // porque esta troca vale só para este processo filho.
    env: { ...process.env, DATABASE_URL: url },
  });

  if (resultado.error) {
    console.error("[migrate] não foi possível executar o Prisma CLI:", resultado.error.message);
    process.exit(1);
  }
  process.exit(resultado.status ?? 1);
}

// Só executa quando chamado direto; importado, expõe a lógica para os testes.
if (require.main === module) main();

module.exports = { derivarDoPooler, resolverUrlDireta, DIRECT_URL_VARS };
