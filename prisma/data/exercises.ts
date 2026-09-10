import type { ExerciseCategory, SessionBlock, PfjLoad } from "@prisma/client";

/**
 * CONTEÚDO CLÍNICO DO PROTOCOLO
 * ===========================================================================
 *
 * Base: RM do joelho esquerdo (25/08/2026) — condropatia patelofemoral.
 *
 * O que o laudo diz, e o que isso muda no desenho do protocolo:
 *
 * 1. A lesão está CONFINADA à articulação patelofemoral (patela + tróclea).
 *    Meniscos, cruzados e colaterais íntegros; demais superfícies condrais
 *    regulares. Consequência prática: exercício de quadril, cadeia posterior,
 *    panturrilha e core praticamente não toca a área lesionada — é onde dá para
 *    treinar forte com segurança, e é justamente onde a evidência para dor
 *    patelofemoral é mais forte (quadril + joelho supera joelho isolado).
 *
 * 2. As erosões estão nos terços MÉDIO e INFERIOR do vértice da patela e no
 *    terço SUPERIOR da tróclea. Na mecânica patelofemoral, essas duas
 *    superfícies se encontram entre ~10° e ~30° de flexão, faixa em que a área
 *    de contato é a MENOR de toda a amplitude (~168 mm² a 20° contra ~334 mm² a
 *    60°) — ou seja, mesma força, tensão bem maior.
 *    Por isso a extensão terminal de arco curto (0-30°, cadeia aberta com
 *    carga) saiu do plano automático e virou item com `needsClearance`: é
 *    exatamente o arco do mapa de lesão dele. Quem decide isso é o
 *    fisioterapeuta, não o app — então o app pergunta em vez de escolher.
 *
 * 3. Derrame moderado com espessamento sinovial. Derrame articular inibe o
 *    quadríceps por via reflexa (inibição muscular artrogênica): enquanto o
 *    derrame não cede, ganho de força fica limitado por neurologia, não por
 *    esforço. Controlar o derrame é pré-requisito, não detalhe.
 *
 * 4. Leve tendinopatia distal do quadríceps. Tendinopatia responde bem a
 *    isometria (analgesia de curto prazo) evoluindo para carga lenta e pesada —
 *    o que o agachamento espanhol e a isometria de quadríceps cobrem.
 *
 * 5. Osteófito plano de 1,1 x 0,5 cm no terço superior do sulco troclear e
 *    esboços osteofitários na patela: sinal de que a articulação já está
 *    remodelando. Reforça a escolha por volume moderado e progressão lenta.
 *
 * ---------------------------------------------------------------------------
 * ESTRUTURA DA SEMANA — 3 sessões, cada uma com foco próprio:
 *
 *   Sessão A (segunda) — quadríceps e controle patelar, em cadeia fechada
 *                        controlada, que é a faixa de menor compressão.
 *   Sessão B (quarta)  — quadril e cadeia posterior: carga alta possível,
 *                        risco patelofemoral praticamente nulo.
 *   Sessão C (sexta)   — controle motor, integração e panturrilha.
 *
 * Âncoras (isometria de quadríceps + prancha) entram em toda sessão.
 * Cada sessão tem blocos: MOBILIDADE → ATIVACAO → PRINCIPAL → CORE → FINALIZACAO.
 *
 * FASES: 1 (semanas 1-2, controle de dor/derrame), 2 (3-6, fortalecimento),
 * 3 (7+, unilateral/funcional). A fase muda volume e quais exercícios entram —
 * NUNCA a amplitude máxima de flexão.
 */

export type ExInput = {
  slug: string;
  order: number;
  name: string;
  category: ExerciseCategory;
  imageUrl: string | null;
  sets: string;
  reps: string;
  targetMuscles: string;
  maxFlexionDeg: number | null;
  isIsometric: boolean;
  holdSeconds: number | null;
  execution: string[];
  careNote: string;
  rationale: string;
  anchor: boolean;
  templateGroup: "A" | "B" | "C" | null;
  block: SessionBlock;
  pfjLoad: PfjLoad;
  equipment: string[];
  phaseMin: number;
  needsClearance: boolean;
  clearanceNote: string | null;
  progression: Record<string, { sets: number; reps: string; hold: number | null }>;
  wgerExerciseId: number | null;
  wgerSearchTerm: string | null;
};

export const exercises: ExInput[] = [
  // =========================================================================
  // ÂNCORAS — toda sessão
  // =========================================================================
  {
    slug: "isometria-quadriceps",
    order: 1,
    name: "Isometria de Quadríceps",
    category: "ISOMETRIA",
    imageUrl: "/exercises/isometria_quadriceps.png",
    sets: "3 séries",
    reps: "10-15 segundos de contração",
    targetMuscles: "Quadríceps (ênfase no vasto medial oblíquo)",
    maxFlexionDeg: 0,
    isIsometric: true,
    holdSeconds: 12,
    execution: [
      "Sente-se ou deite com a perna totalmente estendida, apoiada no chão ou numa cadeira.",
      "Contraia o quadríceps com força, como se empurrasse a parte de trás do joelho contra o apoio, sem mover a perna.",
      "Mantenha a contração pelo tempo indicado, respirando normalmente.",
      "Relaxe completamente por 5 segundos e repita.",
    ],
    careNote:
      "Não flexione o joelho. Com a perna reta a patela fica acima da tróclea e quase não comprime a cartilagem — é a forma mais segura de ativar o quadríceps no seu caso.",
    rationale:
      "Combate a inibição do quadríceps causada pelo derrame articular (o laudo descreve derrame moderado) e dá analgesia na tendinopatia distal do quadríceps, sem gerar compressão patelofemoral.",
    anchor: true,
    templateGroup: null,
    block: "ATIVACAO",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 3, reps: "8-10 rep.", hold: 8 },
      "2": { sets: 3, reps: "10-15 rep.", hold: 15 },
      "3": { sets: 4, reps: "15 rep.", hold: 20 },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "prancha",
    order: 2,
    name: "Prancha Abdominal",
    category: "CORE",
    imageUrl: "/exercises/prancha.png",
    sets: "3 séries",
    reps: "sustentações",
    targetMuscles: "Core (transverso, reto abdominal, oblíquos)",
    maxFlexionDeg: null,
    isIsometric: true,
    holdSeconds: 30,
    execution: [
      "Apoie os antebraços e as pontas dos pés no chão, corpo alinhado dos ombros aos calcanhares.",
      "Contraia abdômen e glúteos, evitando que o quadril suba ou afunde.",
      "Mantenha a respiração controlada durante toda a sustentação.",
    ],
    careNote:
      "Apoio nos pés, nunca nos joelhos: joelho no chão significa pressão direta sobre a patela lesionada. Se precisar regredir, faça a prancha com as mãos numa bancada, não ajoelhado.",
    rationale:
      "Core estável reduz o colapso do quadril durante a marcha, que é um dos mecanismos que aumentam a carga sobre a articulação patelofemoral.",
    anchor: true,
    templateGroup: null,
    block: "CORE",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "3 sustentações", hold: 15 },
      "2": { sets: 3, reps: "3-4 sustentações", hold: 30 },
      "3": { sets: 3, reps: "4 sustentações", hold: 45 },
    },
    wgerExerciseId: 458,
    wgerSearchTerm: "Plank",
  },

  // =========================================================================
  // SESSÃO A — SEGUNDA: quadríceps e controle patelar
  // =========================================================================
  {
    slug: "mobilizacao-patelar",
    order: 10,
    name: "Mobilização Patelar",
    category: "MOBILIDADE",
    imageUrl: null,
    sets: "2 séries",
    reps: "10 deslizamentos em cada direção",
    targetMuscles: "Articulação patelofemoral (mobilidade passiva)",
    maxFlexionDeg: 0,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Sente-se com a perna totalmente estendida e o quadríceps RELAXADO — se o músculo estiver contraído a patela trava e não desliza.",
      "Segure a patela entre o polegar e o indicador das duas mãos.",
      "Deslize-a suavemente para dentro e para fora, depois para cima e para baixo.",
      "Movimentos pequenos e lentos, sem forçar contra resistência.",
    ],
    careNote:
      "É mobilização, não massagem: nada de pressionar a patela contra o fêmur. Se doer, você está empurrando para dentro em vez de deslizar para o lado.",
    rationale:
      "Mantém a mobilidade da patela num joelho com derrame e espessamento sinovial, condição que costuma enrijecer os retináculos e piorar o trajeto da patela sobre a tróclea já lesionada.",
    anchor: false,
    templateGroup: "A",
    block: "MOBILIDADE",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "10 em cada direção", hold: null },
      "2": { sets: 2, reps: "10 em cada direção", hold: null },
      "3": { sets: 1, reps: "10 em cada direção", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "alongamento-panturrilha",
    order: 11,
    name: "Alongamento de Panturrilha",
    category: "MOBILIDADE",
    imageUrl: null,
    sets: "2 séries",
    reps: "30 segundos cada perna",
    targetMuscles: "Gastrocnêmio e sóleo",
    maxFlexionDeg: null,
    isIsometric: true,
    holdSeconds: 30,
    execution: [
      "De frente para a parede, apoie as mãos na altura dos ombros.",
      "Leve uma perna para trás, joelho estendido e calcanhar no chão, até sentir o alongamento na panturrilha.",
      "Para o sóleo, repita com o joelho de trás levemente flexionado.",
      "Mantenha 30 segundos, sem balançar.",
    ],
    careNote: "Nada de forçar o joelho da frente a dobrar muito — mantenha a flexão dele pequena.",
    rationale:
      "Panturrilha encurtada limita a dorsiflexão do tornozelo, e essa limitação empurra o joelho para dentro no apoio — aumentando exatamente a carga lateral sobre a articulação patelofemoral.",
    anchor: false,
    templateGroup: "A",
    block: "MOBILIDADE",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "30s cada perna", hold: 30 },
      "2": { sets: 2, reps: "30s cada perna", hold: 30 },
      "3": { sets: 2, reps: "40s cada perna", hold: 40 },
    },
    wgerExerciseId: 1239,
    wgerSearchTerm: "Standing Calf Stretch",
  },
  {
    slug: "elevacao-perna-estendida",
    order: 12,
    name: "Elevação da Perna Estendida",
    category: "ISOMETRIA",
    imageUrl: null,
    sets: "3 séries",
    reps: "10-12 repetições",
    targetMuscles: "Quadríceps (reto femoral) e flexores do quadril",
    maxFlexionDeg: 0,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Deitado de costas, dobre a perna saudável com o pé apoiado no chão.",
      "Na perna do joelho afetado, contraia o quadríceps e TRAVE o joelho em extensão total.",
      "Suba a perna reta até a altura do joelho oposto, em 2 segundos.",
      "Desça em 3 segundos, controlado, sem deixar o joelho dobrar em nenhum momento.",
    ],
    careNote:
      "O joelho não pode dobrar durante o movimento. Se ele ceder, a carga passa a comprimir a patela — reduza a altura ou volte à isometria pura.",
    rationale:
      "Fortalece o quadríceps com o joelho a 0°, ângulo em que a patela mal encosta na tróclea: é ganho de força sem tocar na cartilagem lesionada. É o exercício de escolha enquanto houver derrame.",
    anchor: false,
    templateGroup: "A",
    block: "ATIVACAO",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "10 rep.", hold: null },
      "2": { sets: 3, reps: "12 rep.", hold: null },
      "3": { sets: 3, reps: "15 rep. com caneleira leve", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "leg-press-parcial",
    order: 13,
    name: "Leg Press Parcial",
    category: "CADEIA_FECHADA",
    imageUrl: "/exercises/leg_press_parcial.png",
    sets: "3 séries",
    reps: "12-15 repetições",
    targetMuscles: "Quadríceps, glúteos e isquiotibiais",
    maxFlexionDeg: 60,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Ajuste o banco de modo que os joelhos NÃO passem de 60° de flexão em nenhum momento.",
      "Pés na largura do quadril, na parte alta da plataforma (reduz a exigência do joelho).",
      "Empurre a plataforma até quase estender os joelhos, sem travá-los.",
      "Volte devagar, respeitando o limite de amplitude.",
    ],
    careNote:
      "Amplitude máxima de 60° é limite do laudo, não sugestão. Carga leve com amplitude curta é sempre melhor que carga pesada com amplitude grande neste caso.",
    rationale:
      "Cadeia fechada: a compressão patelofemoral cresce com a flexão, então ficar abaixo de 60° mantém a carga na faixa segura enquanto ainda treina quadríceps e glúteos juntos.",
    anchor: false,
    templateGroup: "A",
    block: "PRINCIPAL",
    pfjLoad: "MODERADA",
    equipment: ["Leg press"],
    phaseMin: 2,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "12 rep. sem carga", hold: null },
      "2": { sets: 3, reps: "12-15 rep.", hold: null },
      "3": { sets: 4, reps: "12-15 rep.", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "agachamento-espanhol",
    order: 14,
    name: "Agachamento Espanhol (isométrico)",
    category: "CADEIA_FECHADA",
    imageUrl: null,
    sets: "3 séries",
    reps: "sustentações",
    targetMuscles: "Quadríceps (com tração posterior que alivia o joelho)",
    maxFlexionDeg: 60,
    isIsometric: true,
    holdSeconds: 30,
    execution: [
      "Prenda uma faixa elástica resistente num ponto fixo baixo e passe-a atrás dos dois joelhos.",
      "Afaste-se até a faixa ficar tensionada, puxando os joelhos para trás.",
      "Agache mantendo o TRONCO ERETO e a canela vertical, sem passar de 60° de flexão.",
      "Sustente na posição pelo tempo indicado e volte devagar.",
    ],
    careNote:
      "O tronco fica ereto e a canela vertical — se o joelho avançar sobre o pé, a compressão na patela sobe muito. A faixa existe para permitir isso.",
    rationale:
      "A tração posterior da faixa reduz o momento no joelho e permite carga isométrica no quadríceps com menos compressão que um agachamento comum — protocolo consagrado para tendinopatia do aparelho extensor, que é justamente o que o laudo aponta.",
    anchor: false,
    templateGroup: "A",
    block: "PRINCIPAL",
    pfjLoad: "MODERADA",
    equipment: ["Faixa elástica resistente"],
    phaseMin: 2,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "3 sustentações", hold: 20 },
      "2": { sets: 3, reps: "4 sustentações", hold: 30 },
      "3": { sets: 4, reps: "5 sustentações", hold: 45 },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "wall-sit-parcial",
    order: 15,
    name: "Wall Sit Parcial",
    category: "CADEIA_FECHADA",
    imageUrl: "/exercises/wall_sit_parcial.png",
    sets: "3 séries",
    reps: "sustentações",
    targetMuscles: "Quadríceps e glúteos",
    maxFlexionDeg: 45,
    isIsometric: true,
    holdSeconds: 20,
    execution: [
      "Encoste as costas na parede e afaste os pés cerca de meio passo à frente.",
      "Deslize para baixo APENAS até 45° de flexão de joelho — bem longe de um agachamento completo.",
      "Mantenha os joelhos alinhados com os pés, sem deixar cair para dentro.",
      "Sustente e suba devagar.",
    ],
    careNote:
      "45° é o teto aqui, mais raso que o leg press. Se aparecer dor na frente do joelho durante a sustentação, suba alguns graus imediatamente.",
    rationale:
      "Isometria em cadeia fechada num ângulo raso: recruta quadríceps com o corpo estabilizado pela parede, sem o pico de compressão que aparece em flexões maiores.",
    anchor: false,
    templateGroup: "A",
    block: "PRINCIPAL",
    pfjLoad: "MODERADA",
    equipment: [],
    phaseMin: 2,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "3 sustentações", hold: 15 },
      "2": { sets: 3, reps: "3 sustentações", hold: 25 },
      "3": { sets: 3, reps: "4 sustentações", hold: 40 },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "alongamento-isquiotibiais",
    order: 16,
    name: "Alongamento de Isquiotibiais",
    category: "MOBILIDADE",
    imageUrl: null,
    sets: "2 séries",
    reps: "30 segundos cada perna",
    targetMuscles: "Isquiotibiais",
    maxFlexionDeg: null,
    isIsometric: true,
    holdSeconds: 30,
    execution: [
      "Deite de costas e passe uma faixa ou toalha na planta do pé.",
      "Suba a perna com o JOELHO ESTENDIDO, puxando a faixa até sentir alongamento atrás da coxa.",
      "Mantenha a lombar apoiada no chão e a outra perna estendida.",
      "Sustente 30 segundos, sem balançar.",
    ],
    careNote: "Alongamento é na parte de trás da coxa, não no joelho. Se sentir puxar no joelho, reduza a amplitude.",
    rationale:
      "Isquiotibiais encurtados aumentam a flexão de joelho durante a marcha, o que mantém a patela comprimida contra a tróclea por mais tempo a cada passo.",
    anchor: false,
    templateGroup: "A",
    block: "FINALIZACAO",
    pfjLoad: "BAIXA",
    equipment: ["Faixa ou toalha"],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "30s cada perna", hold: 30 },
      "2": { sets: 2, reps: "30s cada perna", hold: 30 },
      "3": { sets: 2, reps: "40s cada perna", hold: 40 },
    },
    wgerExerciseId: 1870,
    wgerSearchTerm: "Lying Hamstring Stretch with Band",
  },

  // =========================================================================
  // SESSÃO B — QUARTA: quadril e cadeia posterior
  // Compartimento tibiofemoral está íntegro no laudo, então aqui dá para
  // treinar com carga de verdade sem tocar na área lesionada. É também onde a
  // evidência é mais forte: quadril + joelho supera joelho isolado na dor
  // patelofemoral.
  // =========================================================================
  {
    slug: "liberacao-tfl-banda-it",
    order: 20,
    name: "Liberação de Tensor da Fáscia Lata",
    category: "MOBILIDADE",
    imageUrl: null,
    sets: "1 série",
    reps: "60-90 segundos de cada lado",
    targetMuscles: "Tensor da fáscia lata e face lateral da coxa",
    maxFlexionDeg: null,
    isIsometric: false,
    holdSeconds: 60,
    execution: [
      "Deite de lado sobre o rolo de liberação, apoiado na parte de fora da coxa, logo abaixo do quadril.",
      "Role devagar da região do quadril até um pouco acima do joelho.",
      "Pare 20-30 segundos nos pontos mais sensíveis, respirando.",
      "NÃO passe o rolo sobre o joelho nem sobre a parte da frente da coxa.",
    ],
    careNote:
      "O rolo para antes do joelho. Passar por cima da articulação com dor e derrame só aumenta a irritação.",
    rationale:
      "A tensão lateral da coxa puxa a patela para fora, agravando o contato justamente nas facetas descritas como erodidas no laudo.",
    anchor: false,
    templateGroup: "B",
    block: "MOBILIDADE",
    pfjLoad: "BAIXA",
    equipment: ["Rolo de liberação"],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 1, reps: "60s cada lado", hold: 60 },
      "2": { sets: 1, reps: "90s cada lado", hold: 90 },
      "3": { sets: 1, reps: "90s cada lado", hold: 90 },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "alongamento-flexor-quadril-em-pe",
    order: 21,
    name: "Alongamento de Flexor do Quadril (em pé)",
    category: "MOBILIDADE",
    imageUrl: null,
    sets: "2 séries",
    reps: "30 segundos cada lado",
    targetMuscles: "Iliopsoas e reto femoral",
    maxFlexionDeg: null,
    isIsometric: true,
    holdSeconds: 30,
    execution: [
      "Em pé, dê um passo à frente com a perna saudável, mão apoiada numa parede ou cadeira.",
      "Mantenha a perna de trás estendida e o calcanhar apontando para cima do chão.",
      "Contraia o glúteo do lado de trás e leve o quadril à frente, sem arquear a lombar.",
      "Sustente 30 segundos e troque.",
    ],
    careNote:
      "Versão EM PÉ de propósito: a variação ajoelhada, que é a mais comum na internet, apoia a patela no chão — exatamente o que você deve evitar.",
    rationale:
      "Flexor de quadril encurtado inclina a pelve à frente e aumenta a tensão do reto femoral sobre a patela, somando compressão a uma articulação já sobrecarregada.",
    anchor: false,
    templateGroup: "B",
    block: "MOBILIDADE",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "30s cada lado", hold: 30 },
      "2": { sets: 2, reps: "30s cada lado", hold: 30 },
      "3": { sets: 2, reps: "40s cada lado", hold: 40 },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "concha-clamshell",
    order: 22,
    name: "Concha (Clamshell)",
    category: "QUADRIL",
    imageUrl: null,
    sets: "3 séries",
    reps: "15 repetições cada lado",
    targetMuscles: "Glúteo médio e rotadores externos do quadril",
    maxFlexionDeg: null,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Deite de lado com quadris e joelhos dobrados a cerca de 45°, pés juntos e alinhados com o tronco.",
      "Mantendo os pés encostados, gire o joelho de cima para fora, abrindo como uma concha.",
      "Não deixe a pelve rolar para trás — o movimento vem do quadril, não do tronco.",
      "Volte devagar, controlando.",
    ],
    careNote: "Nenhuma carga passa pelo joelho aqui. Se sentir algo no joelho, provavelmente está girando o tronco junto.",
    rationale:
      "Glúteo médio fraco ou com ativação atrasada é achado consistente na dor patelofemoral: sem ele, o fêmur roda para dentro no apoio e joga a patela contra a faceta lateral.",
    anchor: false,
    templateGroup: "B",
    block: "ATIVACAO",
    pfjLoad: "BAIXA",
    equipment: ["Mini band (opcional)"],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "12 rep. cada lado", hold: null },
      "2": { sets: 3, reps: "15 rep. cada lado", hold: null },
      "3": { sets: 3, reps: "20 rep. com mini band", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "ponte-gluteo",
    order: 23,
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
      "Deite de costas com os joelhos flexionados e os pés apoiados no chão, na largura do quadril.",
      "Eleve o quadril contraindo o glúteo, formando uma linha reta dos ombros aos joelhos.",
      "Segure 1-2 segundos no topo e desça controladamente.",
      "Mantenha os joelhos alinhados com os pés durante todo o movimento.",
    ],
    careNote:
      "Exercício de baixíssimo impacto no joelho — o trabalho é do quadril. Se sentir a coxa da frente assumindo, aproxime mais os pés do quadril.",
    rationale:
      "Fortalece glúteo máximo em posição deitada, sem descarga de peso no joelho: ganho de força do quadril com risco patelofemoral praticamente nulo, útil já na fase 1.",
    anchor: false,
    templateGroup: "B",
    block: "PRINCIPAL",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "12 rep.", hold: null },
      "2": { sets: 3, reps: "15 rep.", hold: null },
      "3": { sets: 4, reps: "15 rep. com mini band", hold: null },
    },
    wgerExerciseId: 265,
    wgerSearchTerm: "Glute Bridge",
  },
  {
    slug: "cadeira-flexora",
    order: 24,
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
      "Ajuste o encosto e o apoio na altura dos tornozelos.",
      "Flexione os joelhos puxando o apoio, sem tirar o quadril do banco.",
      "Volte devagar, em 3 segundos, sem deixar o peso bater.",
      "Carga moderada: o objetivo é controle, não força máxima.",
    ],
    careNote:
      "Flexão de joelho contra resistência trabalha a parte de trás e não empurra a patela contra a tróclea — é seguro no seu caso, ao contrário da cadeira EXTENSORA, que está contraindicada.",
    rationale:
      "Isquiotibiais fortes equilibram o par de forças do joelho e reduzem a translação anterior da tíbia, aliviando a demanda do quadríceps.",
    anchor: false,
    templateGroup: "B",
    block: "PRINCIPAL",
    pfjLoad: "BAIXA",
    equipment: ["Cadeira flexora"],
    phaseMin: 2,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "12 rep. carga leve", hold: null },
      "2": { sets: 3, reps: "12-15 rep.", hold: null },
      "3": { sets: 4, reps: "12-15 rep.", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "abducao-quadril",
    order: 25,
    name: "Abdução de Quadril",
    category: "QUADRIL",
    imageUrl: "/exercises/abducao_quadril.png",
    sets: "3 séries",
    reps: "15 repetições cada lado",
    targetMuscles: "Glúteo médio e mínimo",
    maxFlexionDeg: null,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Deitado de lado, pernas estendidas e alinhadas com o tronco.",
      "Eleve a perna de cima mantendo o joelho estendido e a ponta do pé apontando levemente para baixo.",
      "Suba até cerca de 45°, sem rolar o quadril para trás.",
      "Desça devagar, sem encostar a perna completamente entre as repetições.",
    ],
    careNote: "Movimento vem do quadril. Também pode ser feito no aparelho de abdução, sentado, com carga leve.",
    rationale:
      "Abdutores respondem por manter o joelho alinhado no apoio unipodal — é a alavanca mais eficaz para reduzir carga patelofemoral sem carregar o joelho.",
    anchor: false,
    templateGroup: "B",
    block: "PRINCIPAL",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 2,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "12 rep. cada lado", hold: null },
      "2": { sets: 3, reps: "15 rep. cada lado", hold: null },
      "3": { sets: 3, reps: "15 rep. com caneleira", hold: null },
    },
    wgerExerciseId: 1748,
    wgerSearchTerm: "Machine Hip Abduction",
  },
  {
    slug: "caminhada-lateral-miniband",
    order: 26,
    name: "Caminhada Lateral com Mini Band",
    category: "QUADRIL",
    imageUrl: null,
    sets: "3 séries",
    reps: "10 passos para cada lado",
    targetMuscles: "Glúteo médio (em descarga de peso)",
    maxFlexionDeg: 30,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Coloque a mini band logo acima dos joelhos ou nos tornozelos.",
      "Fique em pé com uma flexão MUITO leve de joelhos, tronco ereto.",
      "Dê passos laterais mantendo a tensão na faixa, sem deixar os joelhos caírem para dentro.",
      "Passos curtos e controlados, 10 para um lado e 10 de volta.",
    ],
    careNote:
      "Flexão de joelho pequena, quase em pé. Não é agachamento caminhando — se as coxas queimarem mais que o quadril, você está agachando demais.",
    rationale:
      "Treina o glúteo médio já em descarga de peso, que é a situação em que ele falha na vida real (escada, marcha), mas com o joelho quase estendido, fora da faixa de contato lesionada.",
    anchor: false,
    templateGroup: "B",
    block: "PRINCIPAL",
    pfjLoad: "BAIXA",
    equipment: ["Mini band"],
    phaseMin: 2,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "8 passos cada lado", hold: null },
      "2": { sets: 3, reps: "10 passos cada lado", hold: null },
      "3": { sets: 3, reps: "15 passos cada lado", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "stiff-halteres",
    order: 27,
    name: "Stiff com Halteres (Levantamento Romeno)",
    category: "CADEIA_POSTERIOR",
    imageUrl: null,
    sets: "3 séries",
    reps: "10-12 repetições",
    targetMuscles: "Isquiotibiais, glúteo máximo e eretores da espinha",
    maxFlexionDeg: 20,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Em pé, halteres à frente das coxas, joelhos com flexão leve e FIXA (cerca de 20°).",
      "Empurre o quadril para trás descendo os halteres rentes às pernas, coluna neutra.",
      "Desça até sentir o alongamento atrás das coxas — não precisa chegar ao chão.",
      "Suba contraindo o glúteo, sem hiperestender a lombar no topo.",
    ],
    careNote:
      "O movimento é do QUADRIL, não do joelho: a flexão do joelho fica travada em ~20° do começo ao fim. Se o joelho dobrar mais, virou agachamento.",
    rationale:
      "Carga alta na cadeia posterior sem praticamente nenhuma flexão de joelho: é como treinar força de verdade num joelho que não tolera compressão patelofemoral.",
    anchor: false,
    templateGroup: "B",
    block: "PRINCIPAL",
    pfjLoad: "BAIXA",
    equipment: ["Halteres"],
    phaseMin: 2,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "10 rep. sem carga", hold: null },
      "2": { sets: 3, reps: "10-12 rep.", hold: null },
      "3": { sets: 4, reps: "10-12 rep.", hold: null },
    },
    wgerExerciseId: 507,
    wgerSearchTerm: "Romanian Deadlift",
  },
  {
    slug: "extensao-quadril-cabo",
    order: 28,
    name: "Extensão de Quadril no Cabo",
    category: "QUADRIL",
    imageUrl: "/exercises/extensao_quadril_cabo.png",
    sets: "3 séries",
    reps: "12-15 repetições cada lado",
    targetMuscles: "Glúteo máximo",
    maxFlexionDeg: 20,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Prenda a caneleira do cabo no tornozelo e fique de frente para o aparelho, apoiando as mãos.",
      "Com o joelho quase estendido, leve a perna para trás partindo do quadril.",
      "Contraia o glúteo no fim do movimento, sem arquear a lombar.",
      "Volte devagar, controlando a carga.",
    ],
    careNote: "Tronco firme: se a lombar arquear, o glúteo saiu do exercício.",
    rationale:
      "Extensão de quadril em pé, com o joelho quase reto: fortalece o glúteo máximo na posição funcional da marcha sem carga na articulação patelofemoral.",
    anchor: false,
    templateGroup: "B",
    block: "PRINCIPAL",
    pfjLoad: "BAIXA",
    equipment: ["Polia/cabo com caneleira"],
    phaseMin: 3,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "12 rep. cada lado", hold: null },
      "2": { sets: 3, reps: "12 rep. cada lado", hold: null },
      "3": { sets: 3, reps: "15 rep. cada lado", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "prancha-lateral",
    order: 29,
    name: "Prancha Lateral",
    category: "CORE",
    imageUrl: null,
    sets: "3 séries",
    reps: "sustentações cada lado",
    targetMuscles: "Oblíquos, quadrado lombar e glúteo médio",
    maxFlexionDeg: null,
    isIsometric: true,
    holdSeconds: 20,
    execution: [
      "Deite de lado apoiado no antebraço, cotovelo abaixo do ombro.",
      "Eleve o quadril até o corpo formar uma linha reta da cabeça aos pés.",
      "Apoie nos PÉS, empilhados ou levemente escalonados.",
      "Sustente e desça devagar.",
    ],
    careNote:
      "Apoio nos pés, nunca no joelho de baixo. Para regredir, apoie os joelhos SÓ do lado saudável ou reduza o tempo.",
    rationale:
      "É o exercício de core que mais recruta glúteo médio ao mesmo tempo — dois alvos do protocolo numa posição sem nenhuma carga no joelho.",
    anchor: false,
    templateGroup: "B",
    block: "CORE",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 2,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "2 sustentações cada lado", hold: 15 },
      "2": { sets: 3, reps: "3 sustentações cada lado", hold: 20 },
      "3": { sets: 3, reps: "3 sustentações cada lado", hold: 35 },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "alongamento-gluteo",
    order: 30,
    name: "Alongamento de Glúteo (figura 4)",
    category: "MOBILIDADE",
    imageUrl: null,
    sets: "2 séries",
    reps: "30 segundos cada lado",
    targetMuscles: "Glúteo máximo e piriforme",
    maxFlexionDeg: null,
    isIsometric: true,
    holdSeconds: 30,
    execution: [
      "Deite de costas com os dois joelhos dobrados e os pés no chão.",
      "Cruze o tornozelo de um lado sobre o joelho oposto, formando um '4'.",
      "Puxe a coxa de apoio em direção ao peito até sentir o alongamento na nádega.",
      "Sustente 30 segundos e troque.",
    ],
    careNote:
      "Puxe pela COXA, nunca pela canela do joelho afetado — puxar pela canela força a articulação do joelho.",
    rationale:
      "Glúteo e piriforme tensos limitam a rotação do quadril e transferem a compensação para o joelho durante a marcha.",
    anchor: false,
    templateGroup: "B",
    block: "FINALIZACAO",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "30s cada lado", hold: 30 },
      "2": { sets: 2, reps: "30s cada lado", hold: 30 },
      "3": { sets: 2, reps: "40s cada lado", hold: 40 },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },

  // =========================================================================
  // SESSÃO C — SEXTA: controle motor, integração e panturrilha
  // =========================================================================
  {
    slug: "slr-rotacao-externa",
    order: 40,
    name: "Elevação da Perna com Rotação Externa",
    category: "ISOMETRIA",
    imageUrl: null,
    sets: "3 séries",
    reps: "12 repetições",
    targetMuscles: "Quadríceps com ênfase no vasto medial oblíquo",
    maxFlexionDeg: 0,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Deitado de costas, gire a perna afetada para FORA cerca de 30° (ponta do pé apontando para fora).",
      "Trave o joelho em extensão total contraindo o quadríceps.",
      "Eleve a perna reta até a altura do joelho oposto e desça em 3 segundos.",
      "Mantenha a rotação externa durante todo o movimento.",
    ],
    careNote: "Se o joelho dobrar em qualquer momento, pare a série: a proteção do exercício vem de manter a extensão total.",
    rationale:
      "A rotação externa aumenta o recrutamento do vasto medial oblíquo, que é o estabilizador que puxa a patela para dentro — relevante porque o laudo descreve erosão no início de ambas as facetas.",
    anchor: false,
    templateGroup: "C",
    block: "ATIVACAO",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "10 rep.", hold: null },
      "2": { sets: 3, reps: "12 rep.", hold: null },
      "3": { sets: 3, reps: "15 rep. com caneleira leve", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "mini-agachamento-bola",
    order: 41,
    name: "Mini Agachamento com Bola entre os Joelhos",
    category: "CADEIA_FECHADA",
    imageUrl: null,
    sets: "3 séries",
    reps: "12 repetições",
    targetMuscles: "Quadríceps, adutores e vasto medial oblíquo",
    maxFlexionDeg: 40,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Em pé, costas na parede, com uma bola macia ou almofada entre os joelhos.",
      "Aperte a bola de leve e mantenha a pressão durante todo o exercício.",
      "Deslize para baixo no MÁXIMO até 40° de flexão e volte.",
      "Movimento lento: 3 segundos para descer, 2 para subir.",
    ],
    careNote:
      "Amplitude curta (40°) e apertando a bola do início ao fim. Se soltar a bola, o exercício vira um agachamento comum e perde o objetivo.",
    rationale:
      "A adução isométrica recruta o vasto medial junto do agachamento raso, trabalhando o controle medial da patela numa amplitude que ainda não entra na faixa de maior tensão do contato lesionado.",
    anchor: false,
    templateGroup: "C",
    block: "PRINCIPAL",
    pfjLoad: "MODERADA",
    equipment: ["Bola macia ou almofada"],
    phaseMin: 2,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "10 rep.", hold: null },
      "2": { sets: 3, reps: "12 rep.", hold: null },
      "3": { sets: 3, reps: "15 rep.", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "equilibrio-unipodal",
    order: 42,
    name: "Equilíbrio Unipodal",
    category: "CONTROLE_MOTOR",
    imageUrl: null,
    sets: "3 séries",
    reps: "sustentações cada perna",
    targetMuscles: "Glúteo médio, estabilizadores do tornozelo e controle proprioceptivo",
    maxFlexionDeg: 20,
    isIsometric: true,
    holdSeconds: 30,
    execution: [
      "Fique em pé apoiado numa perna só, com o joelho levemente flexionado (não travado).",
      "Mantenha o joelho ALINHADO com o segundo dedo do pé — não deixe cair para dentro.",
      "Sustente pelo tempo indicado, olhando para um ponto fixo à frente.",
      "Para progredir: feche os olhos, ou fique sobre uma almofada.",
    ],
    careNote:
      "Fique perto de uma parede para se apoiar. O critério de sucesso é o joelho não cair para dentro — se cair, pare e reduza o tempo.",
    rationale:
      "A perda de controle do joelho no apoio de uma perna só é o mecanismo diário que sobrecarrega a patela (escada, calçada, levantar da cadeira). Treinar isso é mais específico que qualquer exercício de máquina.",
    anchor: false,
    templateGroup: "C",
    block: "PRINCIPAL",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 2,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "3 sustentações cada perna", hold: 20 },
      "2": { sets: 3, reps: "3 sustentações cada perna", hold: 30 },
      "3": { sets: 3, reps: "3 sustentações com olhos fechados", hold: 40 },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "step-up-baixo",
    order: 43,
    name: "Step-Up Baixo (10-15 cm)",
    category: "CONTROLE_MOTOR",
    imageUrl: null,
    sets: "3 séries",
    reps: "10 repetições cada perna",
    targetMuscles: "Quadríceps, glúteo máximo e médio",
    maxFlexionDeg: 45,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Use um degrau BAIXO, de 10 a 15 cm — nunca na altura do joelho.",
      "Suba apoiando a perna afetada, empurrando pelo calcanhar, sem impulso da perna de trás.",
      "No topo, estenda o quadril contraindo o glúteo.",
      "Desça em 3 segundos, controlando, com o joelho alinhado ao pé.",
    ],
    careNote:
      "A altura do degrau é o que define a segurança: 10-15 cm mantém a flexão perto de 45°. Degrau alto leva a flexão profunda sob carga, que é contraindicado no seu caso.",
    rationale:
      "Reproduz o gesto de subir escada em amplitude controlada, treinando a descida excêntrica que é justamente a tarefa em que a dor patelofemoral aparece.",
    anchor: false,
    templateGroup: "C",
    block: "PRINCIPAL",
    pfjLoad: "MODERADA",
    equipment: ["Step baixo (10-15 cm)"],
    phaseMin: 3,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "8 rep. cada perna", hold: null },
      "2": { sets: 3, reps: "10 rep. cada perna", hold: null },
      "3": { sets: 3, reps: "12 rep. cada perna", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "elevacao-pelvica-unilateral",
    order: 44,
    name: "Elevação Pélvica Unilateral",
    category: "CADEIA_POSTERIOR",
    imageUrl: "/exercises/elevacao_pelvica_unilateral.png",
    sets: "3 séries",
    reps: "10 repetições cada lado",
    targetMuscles: "Glúteo máximo e isquiotibiais (unilateral)",
    maxFlexionDeg: null,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "A partir da posição de ponte, estenda uma perna, mantendo-a alinhada com o tronco.",
      "Eleve o quadril apoiando apenas na perna de apoio, sem deixar a pelve cair de um lado.",
      "Segure 1-2 segundos no topo.",
      "Desça devagar e repita antes de trocar de lado.",
    ],
    careNote: "Se a pelve cair para o lado, o glúteo médio ainda não está pronto — volte à ponte bilateral por mais algumas semanas.",
    rationale:
      "Progressão unilateral da ponte: exige do glúteo o mesmo controle da pelve que a marcha exige, ainda sem descarga de peso no joelho.",
    anchor: false,
    templateGroup: "C",
    block: "PRINCIPAL",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 3,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "8 rep. cada lado", hold: null },
      "2": { sets: 3, reps: "10 rep. cada lado", hold: null },
      "3": { sets: 3, reps: "12 rep. cada lado", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
  {
    slug: "panturrilha",
    order: 45,
    name: "Elevação de Panturrilha",
    category: "PANTURRILHA",
    imageUrl: "/exercises/panturrilha.png",
    sets: "3 séries",
    reps: "15-20 repetições",
    targetMuscles: "Gastrocnêmio e sóleo",
    maxFlexionDeg: null,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Em pé, apoiado em step ou no chão, eleve os calcanhares até a ponta dos pés.",
      "Segure 1 segundo no topo, sentindo a contração da panturrilha.",
      "Desça devagar, controlando a descida.",
      "Apoie a mão numa parede para o equilíbrio, se precisar.",
    ],
    careNote: "Joelhos estendidos durante o movimento — nenhuma carga chega à patela.",
    rationale:
      "Panturrilha forte amortece o impacto na marcha antes que ele chegue ao joelho, e o exercício não gera nenhuma compressão patelofemoral.",
    anchor: false,
    templateGroup: "C",
    block: "PRINCIPAL",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "15 rep.", hold: null },
      "2": { sets: 3, reps: "15-20 rep.", hold: null },
      "3": { sets: 4, reps: "20 rep. unilateral", hold: null },
    },
    wgerExerciseId: 622,
    wgerSearchTerm: "Standing Calf Raises",
  },
  {
    slug: "dead-bug",
    order: 46,
    name: "Dead Bug (Inseto Morto)",
    category: "CORE",
    imageUrl: null,
    sets: "3 séries",
    reps: "10 repetições alternadas",
    targetMuscles: "Core profundo (transverso do abdômen)",
    maxFlexionDeg: null,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Deite de costas com braços apontando para o teto e quadris e joelhos a 90°.",
      "Pressione a lombar contra o chão e mantenha assim o tempo todo.",
      "Estenda devagar o braço direito e a perna esquerda, sem encostar no chão.",
      "Volte ao centro e alterne os lados.",
    ],
    careNote:
      "Escolhido no lugar do 'bird dog' justamente por ser deitado: a versão de quatro apoios coloca o peso do corpo sobre a patela lesionada.",
    rationale:
      "Treina o core profundo em posição deitada, com carga zero no joelho — o que mantém o trabalho de estabilidade acontecendo mesmo nas semanas de derrame.",
    anchor: false,
    templateGroup: "C",
    block: "CORE",
    pfjLoad: "BAIXA",
    equipment: [],
    phaseMin: 1,
    needsClearance: false,
    clearanceNote: null,
    progression: {
      "1": { sets: 2, reps: "8 alternadas", hold: null },
      "2": { sets: 3, reps: "10 alternadas", hold: null },
      "3": { sets: 3, reps: "14 alternadas", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },

  // =========================================================================
  // AGUARDANDO LIBERAÇÃO DO FISIOTERAPEUTA
  // Não entra no plano automático. Fica visível, com o motivo, para ser levado
  // à consulta — o app não tem autoridade para incluir nem para descartar.
  // =========================================================================
  {
    slug: "extensao-terminal",
    order: 90,
    name: "Extensão Terminal de Joelho (arco curto)",
    category: "ISOMETRIA",
    imageUrl: "/exercises/extensao_terminal.png",
    sets: "3 séries",
    reps: "12-15 repetições",
    targetMuscles: "Quadríceps (últimos 30° de extensão)",
    maxFlexionDeg: 30,
    isIsometric: false,
    holdSeconds: null,
    execution: [
      "Sentado, com uma toalha enrolada sob o joelho, mantendo-o a cerca de 30° de flexão.",
      "Estenda o joelho até a extensão completa, contraindo o quadríceps.",
      "Segure 2 segundos na extensão total.",
      "Volte devagar até apoiar novamente sobre a toalha.",
    ],
    careNote:
      "Só faça se o fisioterapeuta liberar. Ver a observação de liberação abaixo.",
    rationale:
      "É um exercício clássico e eficaz de quadríceps — mas, no mapa de lesão específico deste laudo, ele trabalha exatamente no arco em que as superfícies erodidas se encontram.",
    anchor: false,
    templateGroup: null,
    block: "PRINCIPAL",
    pfjLoad: "MODERADA",
    equipment: ["Toalha", "Caneleira (opcional)"],
    phaseMin: 2,
    needsClearance: true,
    clearanceNote:
      "Motivo da retenção: o laudo aponta erosão no terço INFERIOR do vértice da patela e no terço SUPERIOR da tróclea. Essas duas superfícies se encontram entre ~10° e ~30° de flexão, faixa em que a área de contato patelofemoral é a menor de toda a amplitude — a mesma força se concentra em menos cartilagem. Este exercício trabalha justamente nesse arco, em cadeia aberta. Pode ser exatamente o exercício certo para você, ou o pior: quem tem os dados do exame físico para decidir é o fisioterapeuta. Leve esta tela na consulta.",
    progression: {
      "1": { sets: 2, reps: "12 rep.", hold: null },
      "2": { sets: 3, reps: "12-15 rep.", hold: null },
      "3": { sets: 3, reps: "15 rep.", hold: null },
    },
    wgerExerciseId: null,
    wgerSearchTerm: null,
  },
];
