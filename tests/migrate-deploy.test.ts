import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { derivarDoPooler, resolverUrlDireta, variaveisDeBancoPresentes, DIRECT_URL_VARS } =
  require("../scripts/migrate-deploy.js");

/**
 * Estes testes existem por causa de um deploy real que quebrou: o schema
 * declarava `directUrl = env("DATABASE_URL_UNPOOLED")` e a integração daquele
 * projeto não expunha esse nome, então o build morria com P1012 antes de
 * qualquer coisa. A resolução passou a tolerar cada nomenclatura conhecida.
 */

test("deriva a conexão direta removendo o sufixo -pooler do host (Neon)", () => {
  assert.equal(
    derivarDoPooler("postgresql://u:p@ep-abc-123-pooler.sa-east-1.aws.neon.tech/db?sslmode=require"),
    "postgresql://u:p@ep-abc-123.sa-east-1.aws.neon.tech/db?sslmode=require"
  );
});

test("não inventa derivação quando o host não tem pooler", () => {
  assert.equal(derivarDoPooler("postgresql://joelho:joelho@localhost:5434/joelho"), null);
  assert.equal(derivarDoPooler(undefined), null);
  assert.equal(derivarDoPooler(""), null);
});

function comAmbiente<T>(vars: Record<string, string | undefined>, fn: () => T): T {
  const anterior: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    anterior[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(anterior)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

const LIMPO = Object.fromEntries(DIRECT_URL_VARS.map((v: string) => [v, undefined]));

test("prefere a variável explícita de conexão direta, na ordem definida", () => {
  const resultado = comAmbiente(
    { ...LIMPO, DATABASE_URL: "postgres://pooled", DATABASE_URL_UNPOOLED: "postgres://direta" },
    () => resolverUrlDireta()
  );
  assert.equal(resultado.url, "postgres://direta");
  assert.match(resultado.origem, /DATABASE_URL_UNPOOLED/);
});

test("aceita o nome antigo POSTGRES_URL_NON_POOLING", () => {
  const resultado = comAmbiente(
    { ...LIMPO, DATABASE_URL: "postgres://pooled", POSTGRES_URL_NON_POOLING: "postgres://antiga" },
    () => resolverUrlDireta()
  );
  assert.equal(resultado.url, "postgres://antiga");
});

test("sem variável explícita, cai na própria DATABASE_URL", () => {
  const resultado = comAmbiente(
    { ...LIMPO, DATABASE_URL: "postgresql://joelho@localhost:5434/joelho" },
    () => resolverUrlDireta()
  );
  assert.equal(resultado.url, "postgresql://joelho@localhost:5434/joelho");
  assert.match(resultado.origem, /sem pooler/);
});

test("diagnóstico lista nomes de variáveis de banco, nunca valores", () => {
  const nomes = comAmbiente(
    { DATABASE_URL: "postgres://segredo", POSTGRES_URL_NON_POOLING: "postgres://outro", HOME_TESTE: "x" },
    () => variaveisDeBancoPresentes()
  );
  assert.ok(nomes.includes("DATABASE_URL"));
  assert.ok(nomes.includes("POSTGRES_URL_NON_POOLING"));
  assert.ok(!nomes.includes("HOME_TESTE"), "só variáveis de banco entram na lista");
  // A connection string é segredo: o diagnóstico não pode vazá-la em log de build.
  assert.ok(!nomes.some((n: string) => n.includes("segredo") || n.includes("postgres://")));
});
