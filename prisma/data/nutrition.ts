import type { FoodListType } from "@prisma/client";

export type FoodInput = { listType: FoodListType; nutrient: string; sources: string; note: string; order: number };

/** Nutrição anti-inflamatória e em sinergia com os ativos do Along-C. */
export const foods: FoodInput[] = [
  { listType: "ANTI_INFLAMATORIO", order: 1, nutrient: "Ômega-3 (EPA/DHA)", sources: "Salmão, sardinha, atum, arenque, chia, linhaça moída, nozes", note: "3-4x por semana (peixes) + 1 colher de sopa/dia de linhaça ou chia moída" },
  { listType: "ANTI_INFLAMATORIO", order: 2, nutrient: "Curcumina + piperina", sources: "Cúrcuma em pó + pimenta-do-reino (sempre juntas) + gordura boa (azeite)", note: "1 colher de chá/dia; reforça diretamente o ativo do Along-C" },
  { listType: "ANTI_INFLAMATORIO", order: 3, nutrient: "Gengibre", sources: "Chá de gengibre fresco, ralado em sucos e pratos", note: "1-2x ao dia" },
  { listType: "ANTI_INFLAMATORIO", order: 4, nutrient: "Catequinas (chá verde)", sources: "Chá verde, matcha", note: "2-3 xícaras/dia, longe de suplementos de ferro" },
  { listType: "ANTI_INFLAMATORIO", order: 5, nutrient: "Azeite de oliva extravirgem cru", sources: "Uso a frio em saladas e pratos prontos (não fritar)", note: "2-3 colheres de sopa/dia" },
  { listType: "ANTI_INFLAMATORIO", order: 6, nutrient: "Antioxidantes (polifenóis)", sources: "Mirtilo, amora, morango, uva roxa, romã, beterraba, couve-roxa", note: "1-2 porções/dia" },
  { listType: "SINERGIA_ALONG_C", order: 1, nutrient: "Vitamina C", sources: "Acerola, kiwi, laranja, limão, goiaba, pimentão cru", note: "Cofator obrigatório da síntese de colágeno" },
  { listType: "SINERGIA_ALONG_C", order: 2, nutrient: "Enxofre orgânico (MSM natural)", sources: "Alho, cebola, ovo, brócolis, couve-flor, couve", note: "Matéria-prima para glicosaminoglicanos da cartilagem e líquido sinovial" },
  { listType: "SINERGIA_ALONG_C", order: 3, nutrient: "Colágeno e glicosamina naturais", sources: "Caldo de ossos (bone broth), gelatina sem açúcar", note: "Reforça a suplementação de colágeno tipo II já em uso" },
  { listType: "SINERGIA_ALONG_C", order: 4, nutrient: "Manganês", sources: "Castanhas (moderação), abacaxi, grãos integrais, aveia", note: "Cofator enzimático direto do manganês presente no Along-C" },
  { listType: "SINERGIA_ALONG_C", order: 5, nutrient: "Silício e boro", sources: "Aveia, banana, cevada, grão-de-bico", note: "Apoiam mineralização e integridade do tecido conjuntivo" },
  { listType: "SINERGIA_ALONG_C", order: 6, nutrient: "Água e eletrólitos", sources: "Água, água de coco, frutas ricas em água", note: "Hidratação adequada mantém a viscosidade do líquido sinovial" },
  { listType: "EVITAR", order: 1, nutrient: "Frituras e gordura trans", sources: "Salgadinhos industrializados, fast-food, margarina, padaria industrial", note: "Potente gatilho pró-inflamatório" },
  { listType: "EVITAR", order: 2, nutrient: "Açúcar refinado e farinha branca", sources: "Refrigerantes, doces, pão branco, massas refinadas", note: "Picos de glicose aumentam a inflamação" },
  { listType: "EVITAR", order: 3, nutrient: "Excesso de óleos ricos em ômega-6", sources: "Óleo de soja, milho e girassol em grande quantidade", note: "Sem equilíbrio com ômega-3, favorece inflamação" },
  { listType: "EVITAR", order: 4, nutrient: "Álcool", sources: "Qualquer bebida alcoólica", note: "Agrava inflamação sinovial e interage com anti-inflamatórios em uso" },
  { listType: "EVITAR", order: 5, nutrient: "Excesso de sódio e embutidos", sources: "Salsicha, presunto, salgados prontos, temperos industrializados", note: "Favorece retenção de líquido e pode piorar o derrame articular" },
  { listType: "EVITAR", order: 6, nutrient: "Ultraprocessados em geral", sources: "Aditivos e conservantes diversos", note: "Associados a maior atividade inflamatória sistêmica" },
];
  // upsert (e não create) para o seed poder rodar quantas vezes for necessário:
  // a versão anterior duplicava a lista inteira de nutrição a cada execução.

export type MarketCategory = { name: string; isAvoidList: boolean; order: number; items: string[] };

/** Lista de mercado derivada das recomendações de nutrição acima. */
export const marketCategories: MarketCategory[] = [
  { name: "Peixaria / Proteínas", isAvoidList: false, order: 1, items: ["Salmão fresco ou congelado", "Sardinha (fresca ou em lata, em água/azeite)", "Atum fresco ou em lata (sem óleo de soja)", "Ovos caipiras", "Frango (peito, sem pele)", "Carne vermelha magra (1-2x/semana)"] },
  { name: "Hortifruti — vegetais", isAvoidList: false, order: 2, items: ["Brócolis", "Couve-flor", "Couve manteiga", "Espinafre", "Alho e cebola", "Pimentão vermelho/amarelo (cru)", "Beterraba", "Gengibre fresco", "Cúrcuma fresca ou em pó"] },
  { name: "Hortifruti — frutas", isAvoidList: false, order: 3, items: ["Mirtilo (blueberry)", "Amora", "Morango", "Uva roxa", "Romã", "Kiwi", "Laranja", "Acerola (in natura ou polpa)", "Abacaxi", "Banana"] },
  { name: "Grãos, sementes e cereais", isAvoidList: false, order: 4, items: ["Chia", "Linhaça (comprar em grão e moer na hora)", "Aveia em flocos", "Castanha-do-pará", "Nozes", "Amêndoas", "Grão-de-bico", "Cevada"] },
  { name: "Óleos, temperos e outros", isAvoidList: false, order: 5, items: ["Azeite de oliva extravirgem (uso a frio)", "Pimenta-do-reino moída", "Chá verde ou matcha", "Água de coco", "Ossos para caldo (bone broth)", "Gelatina incolor sem açúcar (opcional)"] },
  { name: "Evitar no carrinho", isAvoidList: true, order: 6, items: ["Refrigerantes e sucos industrializados", "Salgadinhos e frituras industrializadas", "Margarina e gorduras trans", "Embutidos (salsicha, presunto, mortadela)", "Pão branco e massas refinadas em excesso", "Molhos prontos com excesso de sódio/açúcar"] },
];
  // Idempotente e NÃO-DESTRUTIVO: o `update` do item não toca em `checked`, então
  // rodar o seed de novo não desmarca o que já foi comprado.
