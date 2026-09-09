import { PrismaClient, ExerciseCategory, FoodListType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding: usuário demo...");
  const user = await prisma.user.upsert({
    where: { email: "anderson@k2tech.dev" },
    update: {},
    create: {
      name: "Anderson",
      email: "anderson@k2tech.dev",
    },
  });

  console.log("Seeding: perfil clínico...");
  await prisma.clinicalProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      diagnosis: "Condropatia patelofemoral grave — joelho esquerdo",
      mriFindings: [
        "Edema difuso do revestimento condral da patela, com erosões profundas nos terços médio e inferior e foco de edema subcondral",
        "Erosões condrais profundas no terço superior da tróclea femoral",
        "Pequeno osteófito plano no terço superior do sulco troclear (1,1 x 0,5 cm)",
        "Leve tendinopatia distal do quadríceps, sem roturas",
        "Moderado derrame articular com espessamento sinovial",
      ],
      currentMedication: [
        "Along-C (colágeno tipo II, curcumina, ácido hialurônico, manganês)",
        "Mytro",
        "Proflam creme",
      ],
      contraindications: [
        "Agachamento profundo",
        "Leg press além de 45-60° de flexão",
        "Passadas / afundos profundos",
        "Exercícios de alto impacto (saltos, corrida)",
        "Cadeira extensora com carga pesada nos últimos graus de extensão",
      ],
    },
  });

  console.log("Seeding: exercícios...");
  const exercises: Array<{
    slug: string;
    order: number;
    name: string;
    category: ExerciseCategory;
    imageUrl: string;
    sets: string;
    reps: string;
    targetMuscles: string;
    maxFlexionDeg: number | null;
    isIsometric: boolean;
    holdSeconds: number | null;
    execution: string[];
    careNote: string;
  }> = [
    {
      slug: "isometria-quadriceps",
      order: 1,
      name: "Isometria de Quadríceps",
      category: "ISOMETRIA",
      imageUrl: "/exercises/isometria_quadriceps.png",
      sets: "3 séries",
      reps: "10-15 segundos de contração (5-6 repetições)",
      targetMuscles: "Quadríceps (ênfase no vasto medial oblíquo)",
      maxFlexionDeg: 0,
      isIsometric: true,
      holdSeconds: 12,
      execution: [
        "Sente-se com a perna totalmente estendida à frente, apoiada em uma cadeira, banco ou no chão.",
        "Contraia o quadríceps com força, como se 'empurrasse' a parte de trás do joelho contra o apoio, sem mover a perna.",
        "Mantenha a contração isométrica pelo tempo indicado, respirando normalmente.",
        "Relaxe e repita.",
      ],
      careNote:
        "Não flexione o joelho durante o exercício. Ponto de partida do protocolo: ativa o músculo protetor da patela sem gerar atrito articular.",
    },
    {
      slug: "extensao-terminal",
      order: 2,
      name: "Extensão Terminal de Joelho (arco curto)",
      category: "ISOMETRIA",
      imageUrl: "/exercises/extensao_terminal.png",
      sets: "3 séries",
      reps: "12-15 repetições",
      targetMuscles: "Quadríceps, porção final de extensão",
      maxFlexionDeg: 30,
      isIsometric: false,
      holdSeconds: null,
      execution: [
        "Sentado, com a perna levemente flexionada (~30°), toalha enrolada ou rolo sob o joelho.",
        "Estenda o joelho até ficar reto, terminando com contração firme.",
        "Retorne lentamente até os 30° de flexão, sem ir além disso.",
        "Pode usar caneleira leve conforme evolução, sempre orientado pelo fisioterapeuta.",
      ],
      careNote:
        "Restrinja o movimento estritamente ao arco de 0° a 30°. Essa faixa evita contato da cartilagem lesada nas áreas de erosão mais profunda.",
    },
    {
      slug: "leg-press-parcial",
      order: 3,
      name: "Leg Press 45° (amplitude parcial)",
      category: "CADEIA_FECHADA",
      imageUrl: "/exercises/leg_press_parcial.png",
      sets: "3 séries",
      reps: "12-15 repetições",
      targetMuscles: "Quadríceps, glúteos e isquiotibiais em cadeia fechada",
      maxFlexionDeg: 60,
      isIsometric: false,
      holdSeconds: null,
      execution: [
        "Ajuste o encosto do leg press a 45°, pés na plataforma na largura dos ombros.",
        "Desça controladamente até o joelho atingir no máximo 45-60° de flexão.",
        "Empurre a plataforma de volta sem travar o joelho de forma brusca.",
        "Use carga moderada, priorizando o controle do movimento.",
      ],
      careNote:
        "Nunca ultrapasse 45-60° de flexão. Não deixe o joelho ultrapassar a linha da ponta do pé. Evite travar o joelho com impacto no topo.",
    },
    {
      slug: "ponte-gluteo",
      order: 4,
      name: "Ponte de Glúteo",
      category: "CADEIA_POSTERIOR",
      imageUrl: "/exercises/ponte_gluteo.png",
      sets: "3 séries",
      reps: "12-15 repetições",
      targetMuscles: "Glúteo máximo e isquiotibiais",
      maxFlexionDeg: null,
      isIsometric: false,
      holdSeconds: null,
      execution: [
        "Deite-se de costas, joelhos flexionados, pés apoiados no chão na largura do quadril.",
        "Eleve o quadril contraindo o glúteo, formando linha reta dos ombros aos joelhos.",
        "Segure 1-2 segundos no topo e desça controladamente.",
        "Evite arquear excessivamente a lombar.",
      ],
      careNote:
        "Exercício de baixíssimo impacto no joelho — ideal para fortalecer a cadeia posterior sem estressar a articulação patelofemoral.",
    },
    {
      slug: "elevacao-pelvica-unilateral",
      order: 5,
      name: "Elevação Pélvica Unilateral",
      category: "CADEIA_POSTERIOR",
      imageUrl: "/exercises/elevacao_pelvica_unilateral.png",
      sets: "2-3 séries",
      reps: "10-12 repetições por lado",
      targetMuscles: "Glúteo máximo, isquiotibiais e estabilizadores de quadril",
      maxFlexionDeg: null,
      isIsometric: false,
      holdSeconds: null,
      execution: [
        "A partir da ponte, estenda uma perna totalmente, alinhada com o tronco.",
        "Eleve e desça o quadril apoiando-se apenas na perna de base.",
        "Realize todas as repetições de um lado antes de trocar.",
      ],
      careNote:
        "Movimento controlado e sem pressa. A perna de apoio deve permanecer estável, sem compensações no joelho.",
    },
    {
      slug: "cadeira-flexora",
      order: 6,
      name: "Cadeira Flexora (Leg Curl)",
      category: "CADEIA_POSTERIOR",
      imageUrl: "/exercises/cadeira_flexora.png",
      sets: "3 séries",
      reps: "12-15 repetições",
      targetMuscles: "Isquiotibiais",
      maxFlexionDeg: null,
      isIsometric: false,
      holdSeconds: null,
      execution: [
        "Ajuste o encosto conforme sua altura, apoio na altura dos tornozelos.",
        "Flexione os joelhos trazendo o apoio em direção aos glúteos, de forma controlada.",
        "Retorne lentamente até extensão quase completa, sem travar o joelho com impacto.",
      ],
      careNote:
        "Use carga moderada. Fortalece a cadeia posterior, equilibrando forças ao redor do joelho e protegendo a patela.",
    },
    {
      slug: "abducao-quadril",
      order: 7,
      name: "Abdução de Quadril",
      category: "QUADRIL",
      imageUrl: "/exercises/abducao_quadril.png",
      sets: "3 séries",
      reps: "15 repetições por lado",
      targetMuscles: "Glúteo médio e glúteo mínimo",
      maxFlexionDeg: null,
      isIsometric: false,
      holdSeconds: null,
      execution: [
        "Em pé, deitado de lado, ou no aparelho de abdução.",
        "Afaste a perna lateralmente contra resistência leve a moderada, tronco estável.",
        "Retorne controladamente à posição inicial.",
      ],
      careNote:
        "O glúteo médio é essencial para o alinhamento do fêmur e da patela — fortalecê-lo reduz a pressão lateral sobre a cartilagem.",
    },
    {
      slug: "extensao-quadril-cabo",
      order: 8,
      name: "Extensão de Quadril no Cabo/Polia",
      category: "QUADRIL",
      imageUrl: "/exercises/extensao_quadril_cabo.png",
      sets: "3 séries",
      reps: "12-15 repetições por lado",
      targetMuscles: "Glúteo máximo e isquiotibiais",
      maxFlexionDeg: null,
      isIsometric: false,
      holdSeconds: null,
      execution: [
        "Prenda caneleira de cabo no tornozelo, de frente para o aparelho.",
        "Com joelho levemente flexionado (quase estendido), leve a perna para trás contraindo o glúteo.",
        "Retorne controladamente sem deixar o quadril compensar em excesso.",
      ],
      careNote: "Foco do movimento no quadril e no glúteo, não em flexionar o joelho. Mantenha o tronco estável.",
    },
    {
      slug: "wall-sit-parcial",
      order: 9,
      name: "Wall Sit Parcial (agachamento na parede)",
      category: "ISOMETRIA",
      imageUrl: "/exercises/wall_sit_parcial.png",
      sets: "2-3 séries",
      reps: "15-30 segundos de sustentação",
      targetMuscles: "Quadríceps e glúteos (isométrico)",
      maxFlexionDeg: 60,
      isIsometric: true,
      holdSeconds: 20,
      execution: [
        "Encoste as costas na parede e deslize para baixo até no máximo 45-60° de flexão de joelho.",
        "Pés afastados o suficiente da parede para o joelho não ultrapassar a ponta do pé.",
        "Sustente pelo tempo indicado, respirando normalmente, e suba controladamente.",
      ],
      careNote:
        "Nunca desça abaixo de 60° de flexão. Interrompa imediatamente se sentir dor anterior no joelho ou pressão na patela.",
    },
    {
      slug: "panturrilha",
      order: 10,
      name: "Elevação de Panturrilha",
      category: "PANTURRILHA",
      imageUrl: "/exercises/panturrilha.png",
      sets: "3 séries",
      reps: "15 repetições",
      targetMuscles: "Gastrocnêmio e sóleo",
      maxFlexionDeg: null,
      isIsometric: false,
      holdSeconds: null,
      execution: [
        "Em pé, apoiado em step ou no chão, eleve os calcanhares até a ponta dos pés.",
        "Segure brevemente no topo e desça controladamente.",
        "Pode ser feito bilateral ou unilateral, conforme tolerância.",
      ],
      careNote:
        "Baixo impacto — fortalece a base de sustentação da perna, contribuindo indiretamente para a estabilidade do joelho.",
    },
    {
      slug: "prancha",
      order: 11,
      name: "Prancha Abdominal",
      category: "CORE",
      imageUrl: "/exercises/prancha.png",
      sets: "3 séries",
      reps: "20-40 segundos de sustentação",
      targetMuscles: "Core (abdômen, lombar, estabilizadores de tronco)",
      maxFlexionDeg: null,
      isIsometric: true,
      holdSeconds: 30,
      execution: [
        "Apoie antebraços e pontas dos pés no chão, corpo alinhado dos ombros aos calcanhares.",
        "Contraia abdômen e glúteos, evitando que o quadril suba ou afunde.",
        "Mantenha respiração controlada durante toda a sustentação.",
      ],
      careNote:
        "Core forte melhora a estabilidade de todo o membro inferior, reduzindo compensações que sobrecarregam o joelho.",
    },
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: ex,
      create: ex,
    });
  }

  console.log("Seeding: alimentos...");
  const foods: Array<{
    listType: FoodListType;
    nutrient: string;
    sources: string;
    note: string;
    order: number;
  }> = [
    // Anti-inflamatórios
    { listType: "ANTI_INFLAMATORIO", order: 1, nutrient: "Ômega-3 (EPA/DHA)", sources: "Salmão, sardinha, atum, arenque, chia, linhaça moída, nozes", note: "3-4x por semana (peixes) + 1 colher de sopa/dia de linhaça ou chia moída" },
    { listType: "ANTI_INFLAMATORIO", order: 2, nutrient: "Curcumina + piperina", sources: "Cúrcuma em pó + pimenta-do-reino (sempre juntas) + gordura boa (azeite)", note: "1 colher de chá/dia; reforça diretamente o ativo do Along-C" },
    { listType: "ANTI_INFLAMATORIO", order: 3, nutrient: "Gengibre", sources: "Chá de gengibre fresco, ralado em sucos e pratos", note: "1-2x ao dia" },
    { listType: "ANTI_INFLAMATORIO", order: 4, nutrient: "Catequinas (chá verde)", sources: "Chá verde, matcha", note: "2-3 xícaras/dia, longe de suplementos de ferro" },
    { listType: "ANTI_INFLAMATORIO", order: 5, nutrient: "Azeite de oliva extravirgem cru", sources: "Uso a frio em saladas e pratos prontos (não fritar)", note: "2-3 colheres de sopa/dia" },
    { listType: "ANTI_INFLAMATORIO", order: 6, nutrient: "Antioxidantes (polifenóis)", sources: "Mirtilo, amora, morango, uva roxa, romã, beterraba, couve-roxa", note: "1-2 porções/dia" },
    // Sinergia com Along-C
    { listType: "SINERGIA_ALONG_C", order: 1, nutrient: "Vitamina C", sources: "Acerola, kiwi, laranja, limão, goiaba, pimentão cru", note: "Cofator obrigatório da síntese de colágeno" },
    { listType: "SINERGIA_ALONG_C", order: 2, nutrient: "Enxofre orgânico (MSM natural)", sources: "Alho, cebola, ovo, brócolis, couve-flor, couve", note: "Matéria-prima para glicosaminoglicanos da cartilagem e líquido sinovial" },
    { listType: "SINERGIA_ALONG_C", order: 3, nutrient: "Colágeno e glicosamina naturais", sources: "Caldo de ossos (bone broth), gelatina sem açúcar", note: "Reforça a suplementação de colágeno tipo II já em uso" },
    { listType: "SINERGIA_ALONG_C", order: 4, nutrient: "Manganês", sources: "Castanhas (moderação), abacaxi, grãos integrais, aveia", note: "Cofator enzimático direto do manganês presente no Along-C" },
    { listType: "SINERGIA_ALONG_C", order: 5, nutrient: "Silício e boro", sources: "Aveia, banana, cevada, grão-de-bico", note: "Apoiam mineralização e integridade do tecido conjuntivo" },
    { listType: "SINERGIA_ALONG_C", order: 6, nutrient: "Água e eletrólitos", sources: "Água, água de coco, frutas ricas em água", note: "Hidratação adequada mantém a viscosidade do líquido sinovial" },
    // Evitar
    { listType: "EVITAR", order: 1, nutrient: "Frituras e gordura trans", sources: "Salgadinhos industrializados, fast-food, margarina, padaria industrial", note: "Potente gatilho pró-inflamatório" },
    { listType: "EVITAR", order: 2, nutrient: "Açúcar refinado e farinha branca", sources: "Refrigerantes, doces, pão branco, massas refinadas", note: "Picos de glicose aumentam a inflamação" },
    { listType: "EVITAR", order: 3, nutrient: "Excesso de óleos ricos em ômega-6", sources: "Óleo de soja, milho e girassol em grande quantidade", note: "Sem equilíbrio com ômega-3, favorece inflamação" },
    { listType: "EVITAR", order: 4, nutrient: "Álcool", sources: "Qualquer bebida alcoólica", note: "Agrava inflamação sinovial e interage com anti-inflamatórios em uso" },
    { listType: "EVITAR", order: 5, nutrient: "Excesso de sódio e embutidos", sources: "Salsicha, presunto, salgados prontos, temperos industrializados", note: "Favorece retenção de líquido e pode piorar o derrame articular" },
    { listType: "EVITAR", order: 6, nutrient: "Ultraprocessados em geral", sources: "Aditivos e conservantes diversos", note: "Associados a maior atividade inflamatória sistêmica" },
  ];

  for (const f of foods) {
    await prisma.foodItem.create({ data: f });
  }

  console.log("Seeding: lista de mercado...");
  const marketCategories: Array<{ name: string; isAvoidList: boolean; order: number; items: string[] }> = [
    { name: "Peixaria / Proteínas", isAvoidList: false, order: 1, items: ["Salmão fresco ou congelado", "Sardinha (fresca ou em lata, em água/azeite)", "Atum fresco ou em lata (sem óleo de soja)", "Ovos caipiras", "Frango (peito, sem pele)", "Carne vermelha magra (1-2x/semana)"] },
    { name: "Hortifruti — vegetais", isAvoidList: false, order: 2, items: ["Brócolis", "Couve-flor", "Couve manteiga", "Espinafre", "Alho e cebola", "Pimentão vermelho/amarelo (cru)", "Beterraba", "Gengibre fresco", "Cúrcuma fresca ou em pó"] },
    { name: "Hortifruti — frutas", isAvoidList: false, order: 3, items: ["Mirtilo (blueberry)", "Amora", "Morango", "Uva roxa", "Romã", "Kiwi", "Laranja", "Acerola (in natura ou polpa)", "Abacaxi", "Banana"] },
    { name: "Grãos, sementes e cereais", isAvoidList: false, order: 4, items: ["Chia", "Linhaça (em grão, moer na hora)", "Aveia em flocos", "Castanha-do-pará", "Nozes", "Amêndoas", "Grão-de-bico", "Cevada"] },
    { name: "Óleos, temperos e outros", isAvoidList: false, order: 5, items: ["Azeite de oliva extravirgem (uso a frio)", "Pimenta-do-reino moída", "Chá verde ou matcha", "Água de coco", "Ossos para caldo (bone broth)", "Gelatina incolor sem açúcar (opcional)"] },
    { name: "Evitar no carrinho", isAvoidList: true, order: 6, items: ["Refrigerantes e sucos industrializados", "Salgadinhos e frituras industrializadas", "Margarina e gorduras trans", "Embutidos (salsicha, presunto, mortadela)", "Pão branco e massas refinadas em excesso", "Molhos prontos com excesso de sódio/açúcar"] },
  ];

  for (const cat of marketCategories) {
    const created = await prisma.shoppingCategory.create({
      data: { name: cat.name, isAvoidList: cat.isAvoidList, order: cat.order },
    });
    let i = 0;
    for (const itemName of cat.items) {
      i++;
      await prisma.shoppingItem.create({
        data: { categoryId: created.id, name: itemName, order: i, userId: user.id },
      });
    }
  }

  console.log("Seed concluído ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
