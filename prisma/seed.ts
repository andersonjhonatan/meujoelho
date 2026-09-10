import { PrismaClient } from "@prisma/client";
import { exercises } from "./data/exercises";
import { clinicalProfile, medications } from "./data/clinical";
import { foods, marketCategories } from "./data/nutrition";

/**
 * Popula o banco com o conteúdo clínico do protocolo.
 *
 * É IDEMPOTENTE: pode rodar quantas vezes for preciso. Tudo usa upsert por
 * chave natural, e o `update` do item de mercado não toca em `checked` — rodar
 * o seed não desmarca o que já foi comprado.
 *
 * O conteúdo em si mora em ./data/, separado da mecânica de escrita:
 *   data/exercises.ts  — biblioteca de exercícios, sessões A/B/C e justificativas
 *   data/clinical.ts   — laudo, contraindicações, perguntas ao fisio, medicação
 *   data/nutrition.ts  — alimentos e lista de mercado
 */

const prisma = new PrismaClient();
const USER_EMAIL = "anderson@k2tech.dev";

async function main() {
  console.log("Seed: usuário...");
  const user = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {},
    create: { name: "Anderson", email: USER_EMAIL },
  });

  console.log("Seed: perfil clínico...");
  await prisma.clinicalProfile.upsert({
    where: { userId: user.id },
    update: clinicalProfile,
    create: { userId: user.id, ...clinicalProfile },
  });

  console.log(`Seed: medicação (${medications.length})...`);
  for (const med of medications) {
    await prisma.medication.upsert({
      where: { userId_name: { userId: user.id, name: med.name } },
      update: med,
      create: { userId: user.id, ...med },
    });
  }

  console.log(`Seed: exercícios (${exercises.length})...`);
  for (const ex of exercises) {
    const { progression, ...rest } = ex;
    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: { ...rest, progression },
      create: { ...rest, progression },
    });
  }

  // Exercícios que saíram do protocolo em versões anteriores continuariam no
  // banco para sempre — e apareceriam no plano do dia. Remove só os órfãos que
  // ninguém registrou ainda; os que têm histórico ficam, para não apagar o
  // passado do usuário.
  const slugs = exercises.map((e) => e.slug);
  const orphans = await prisma.exercise.findMany({
    where: { slug: { notIn: slugs }, logs: { none: {} } },
    select: { id: true, slug: true },
  });
  if (orphans.length > 0) {
    await prisma.exerciseMediaCache.deleteMany({ where: { exerciseId: { in: orphans.map((o) => o.id) } } });
    await prisma.exercise.deleteMany({ where: { id: { in: orphans.map((o) => o.id) } } });
    console.log(`Seed: removidos ${orphans.length} exercícios fora do protocolo (${orphans.map((o) => o.slug).join(", ")})`);
  }

  console.log(`Seed: alimentos (${foods.length})...`);
  for (const f of foods) {
    await prisma.foodItem.upsert({
      where: { listType_nutrient: { listType: f.listType, nutrient: f.nutrient } },
      update: f,
      create: f,
    });
  }

  console.log(`Seed: lista de mercado (${marketCategories.length} categorias)...`);
  for (const cat of marketCategories) {
    const category = await prisma.shoppingCategory.upsert({
      where: { name: cat.name },
      update: { isAvoidList: cat.isAvoidList, order: cat.order },
      create: { name: cat.name, isAvoidList: cat.isAvoidList, order: cat.order },
    });
    let i = 0;
    for (const itemName of cat.items) {
      i++;
      await prisma.shoppingItem.upsert({
        where: { categoryId_name: { categoryId: category.id, name: itemName } },
        update: { order: i, userId: user.id },
        create: { categoryId: category.id, name: itemName, order: i, userId: user.id },
      });
    }
  }

  const porSessao = { A: 0, B: 0, C: 0, ancora: 0, retido: 0 };
  for (const ex of exercises) {
    if (ex.needsClearance) porSessao.retido++;
    else if (ex.anchor) porSessao.ancora++;
    else if (ex.templateGroup) porSessao[ex.templateGroup]++;
  }
  console.log(
    `Seed concluído ✅  ${exercises.length} exercícios — ` +
      `${porSessao.ancora} âncoras, A(seg): ${porSessao.A}, B(qua): ${porSessao.B}, C(sex): ${porSessao.C}, ` +
      `${porSessao.retido} aguardando liberação do fisioterapeuta`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
