import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";

/**
 * O Prisma aplica migrations em ordem ALFABÉTICA do nome da pasta, e o nome
 * começa com um timestamp. Num banco já migrado isso nunca aparece, porque cada
 * migration foi aplicada na hora em que foi criada — o problema só explode num
 * banco NOVO, que é exatamente o caso de um deploy novo em produção.
 *
 * Foi o que aconteceu aqui: `prisma migrate dev` nomeou a migration inicial com
 * o horário em UTC (23:36) e as seguintes foram criadas com horário local, três
 * horas atrás (20:44, 21:37, 21:40). Alfabeticamente o `init` virou a ÚLTIMA, e
 * o deploy morreu com "relation Exercise does not exist" — depois de já ter
 * gravado uma migration falha no banco, o que bloqueia todas as próximas (P3009).
 *
 * Este teste garante que nenhuma migration mexa numa tabela antes da migration
 * que a cria.
 */

const DIR_MIGRATIONS = path.join(import.meta.dirname, "..", "prisma", "migrations");

type Migration = { nome: string; sql: string };

function lerMigrationsEmOrdemDeAplicacao(): Migration[] {
  return fs
    .readdirSync(DIR_MIGRATIONS, { withFileTypes: true })
    .filter((entrada) => entrada.isDirectory())
    .map((entrada) => entrada.name)
    .sort() // a mesma ordenação que o Prisma usa
    .map((nome) => ({
      nome,
      sql: fs.readFileSync(path.join(DIR_MIGRATIONS, nome, "migration.sql"), "utf8"),
    }));
}

type Comando = { tipo: "CREATE" | "ALTER"; tabela: string; posicao: number };

/**
 * Comandos de tabela na ordem em que aparecem NO ARQUIVO.
 *
 * A ordem interna importa: uma migration do Prisma tipicamente cria todas as
 * tabelas e só depois adiciona as chaves estrangeiras com ALTER TABLE. Comparar
 * "todos os ALTER" contra "todos os CREATE" sem olhar a posição acusaria falso
 * positivo em toda migration inicial.
 */
function comandosDeTabela(sql: string): Comando[] {
  const padrao = /(CREATE|ALTER)\s+TABLE\s+(?:IF NOT EXISTS\s+)?"([^"]+)"/gi;
  return [...sql.matchAll(padrao)].map((m) => ({
    tipo: m[1].toUpperCase() as "CREATE" | "ALTER",
    tabela: m[2],
    posicao: m.index ?? 0,
  }));
}

test("existe pelo menos uma migration", () => {
  assert.ok(lerMigrationsEmOrdemDeAplicacao().length > 0);
});

test("nenhuma tabela é alterada antes de ser criada", () => {
  const migrations = lerMigrationsEmOrdemDeAplicacao();
  const criadas = new Set<string>();
  const problemas: string[] = [];

  for (const { nome, sql } of migrations) {
    for (const comando of comandosDeTabela(sql).sort((a, b) => a.posicao - b.posicao)) {
      if (comando.tipo === "CREATE") {
        criadas.add(comando.tabela);
      } else if (!criadas.has(comando.tabela)) {
        problemas.push(`${nome} altera "${comando.tabela}" antes de qualquer migration criá-la`);
      }
    }
  }

  assert.deepEqual(
    problemas,
    [],
    "Ordem de migrations quebrada — um banco novo não conseguiria subir:\n" + problemas.join("\n")
  );
});

test("a migration inicial é a primeira na ordem de aplicação", () => {
  const [primeira] = lerMigrationsEmOrdemDeAplicacao();
  assert.match(
    primeira.nome,
    /_init$/,
    `A primeira migration a rodar é "${primeira.nome}", que não é a inicial. ` +
      "Renomeie a pasta para que o timestamp do init seja o menor."
  );
});
