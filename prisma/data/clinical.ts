/**
 * Dados clínicos do paciente — transcritos da RM de 25/08/2026 (joelho esquerdo,
 * Neuroimagem, Dr. João Dehon Rebouças Junior, CRM-PE 22874) e das medicações
 * em uso.
 */

export const clinicalProfile = {
  diagnosis: "Condropatia patelofemoral avançada — joelho esquerdo",
  mriFindings: [
    "Edema difuso do revestimento condral da patela, com erosões profundas nos terços médio e inferior do vértice e início de ambas as facetas",
    "Foco de edema subcondral no terço inferior do vértice da patela",
    "Erosões condrais profundas no terço superior da tróclea femoral, sem edema subcondral associado",
    "Osteófito plano no terço superior do sulco troclear, medindo 1,1 x 0,5 cm, e esboços osteofitários na patela",
    "Leve tendinopatia distal do quadríceps, sem roturas",
    "Moderado derrame articular com espessamento sinovial",
    "Meniscos, ligamentos cruzados e colaterais íntegros; demais superfícies condrais regulares",
  ],
  contraindications: [
    "Agachamento profundo",
    "Leg press além de 60° de flexão",
    "Passadas / afundos profundos",
    "Exercícios de alto impacto (saltos, corrida)",
    "Cadeira extensora com carga nos últimos graus de extensão",
    "Ajoelhar-se diretamente no chão (pressão direta sobre a patela lesionada)",
    "Degraus e step-ups na altura do joelho",
  ],
  /**
   * O que este app NÃO tem autoridade para decidir. Vai visível no perfil para
   * ser levado à consulta — é melhor perguntar do que escolher errado.
   */
  openQuestions: [
    "Extensão terminal de joelho (arco curto 0-30°) está liberada? As superfícies erodidas descritas no laudo (terço inferior da patela e terço superior da tróclea) se encontram justamente entre 10° e 30° de flexão, onde a área de contato é a menor de toda a amplitude. O exercício está retido no app aguardando sua avaliação.",
    "O limite de 60° no leg press continua adequado depois deste laudo, ou deve ser mais conservador?",
    "Qual a conduta para o derrame moderado com espessamento sinovial antes de progredir carga? Enquanto houver derrame, o quadríceps fica inibido por reflexo e o ganho de força é limitado.",
    "Bicicleta ergométrica com selim alto e carga leve está liberada como trabalho aeróbico?",
    "Com que frequência devo repetir a avaliação para liberar a progressão de fase?",
  ],
};

export type MedicationInput = {
  name: string;
  activeName: string;
  kind: string;
  purpose: string;
  dosage: string;
  cautionNote: string | null;
  order: number;
};

export const medications: MedicationInput[] = [
  {
    name: "Mytro",
    activeName: "Trometamol cetorolaco 10 mg — comprimidos sublinguais",
    kind: "Medicamento",
    purpose:
      "Anti-inflamatório não esteroidal (AINE) potente, para controle de crises de dor e do processo inflamatório articular.",
    dosage: "Conforme prescrição médica. Uso sublingual, adulto.",
    cautionNote:
      "O cetorolaco é um AINE de uso CURTO por definição: a bula limita o uso a até 5 dias no total e diz expressamente que não é indicado para dores crônicas. Não é remédio de tomar todo dia por meses. Além disso, AINE mascara dor durante o exercício — e a dor é justamente o sinal que segura a progressão de carga neste protocolo. Confirme com quem prescreveu por quantos dias você deve usar e o que fazer quando esse prazo acabar.",
    order: 1,
  },
  {
    name: "Along-C",
    activeName: "Cúrcuma + ácido hialurônico + colágeno tipo II + manganês — 450 mg por cápsula",
    kind: "Suplemento",
    purpose:
      "Suporte à manutenção da função articular. O colágeno tipo II não desnaturado atua na cartilagem; o manganês é cofator enzimático e antioxidante; a cúrcuma tem ação anti-inflamatória.",
    dosage: "1 cápsula ao dia, conforme o rótulo.",
    cautionNote:
      "Suplemento, não medicamento: o efeito é lento e cumulativo, medido em meses, não em dias. A absorção da cúrcuma melhora bastante junto de pimenta-do-reino e de uma gordura boa — é por isso que a aba de Nutrição insiste nessa combinação.",
    order: 2,
  },
  {
    name: "Proflam",
    activeName: "Anti-inflamatório de uso tópico (creme)",
    kind: "Uso tópico",
    purpose: "Alívio local da dor e da inflamação na região anterior do joelho.",
    dosage: "Aplicação local conforme prescrição.",
    cautionNote:
      "Uso tópico tem menos efeito sistêmico que o comprimido, mas continua sendo anti-inflamatório: conta no total quando somado a AINE por via oral.",
    order: 3,
  },
];
