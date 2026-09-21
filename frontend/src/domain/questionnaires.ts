/**
 * Questionários profissionais de cada análise.
 * Cada análise tem uma seção de dados de nascimento + seções específicas.
 * Os rótulos são chaves i18n (`questionnaire.*`).
 */

export type QFieldType = "text" | "date" | "time" | "textarea" | "select";

export interface QField {
  name: string;
  type: QFieldType;
  labelKey: string;
  hintKey?: string;
  required?: boolean;
  /** Valores das opções para `select` (mapeiam para `questionnaire.opt.<valor>`). */
  options?: string[];
  /** Rótulo da seção onde o campo aparece. */
  sectionKey?: string;
}

/** Opções de select reutilizadas (valores → i18n `questionnaire.opt.<valor>`). */
export const LIFE_AREAS = [
  "carreira",
  "amor",
  "financas",
  "espiritualidade",
  "saude",
  "geral",
];

export const RELATION_TYPES = ["amor", "amizade", "trabalho", "familiar"];

/** Dados de nascimento comuns a quase todas as análises. */
const BIRTH_SECTION = "questionnaire.section.birth";

const birthFields: QField[] = [
  {
    name: "nome_completo",
    type: "text",
    labelKey: "questionnaire.f.nome_completo",
    required: true,
    sectionKey: BIRTH_SECTION,
  },
  {
    name: "data_nascimento",
    type: "date",
    labelKey: "questionnaire.f.data_nascimento",
    required: true,
    sectionKey: BIRTH_SECTION,
  },
  {
    name: "hora_nascimento",
    type: "time",
    labelKey: "questionnaire.f.hora_nascimento",
    hintKey: "questionnaire.hint.hora",
    sectionKey: BIRTH_SECTION,
  },
  {
    name: "cidade_nascimento",
    type: "text",
    labelKey: "questionnaire.f.cidade_nascimento",
    hintKey: "questionnaire.hint.cidade",
    sectionKey: BIRTH_SECTION,
  },
];

export const QUESTIONNAIRES: Record<string, QField[]> = {
  // s1 — Mapa Natal
  s1: [
    ...birthFields,
    {
      name: "foco_vida",
      type: "select",
      labelKey: "questionnaire.f.foco_vida",
      hintKey: "questionnaire.hint.foco_vida",
      required: true,
      options: LIFE_AREAS,
      sectionKey: "questionnaire.section.mapa",
    },
    {
      name: "pergunta_principal",
      type: "textarea",
      labelKey: "questionnaire.f.pergunta_principal",
      hintKey: "questionnaire.hint.pergunta_principal",
      sectionKey: "questionnaire.section.mapa",
    },
  ],

  // s2 — Numerologia
  s2: [
    {
      name: "nome_completo",
      type: "text",
      labelKey: "questionnaire.f.nome_completo",
      required: true,
      sectionKey: BIRTH_SECTION,
    },
    {
      name: "nome_nascimento",
      type: "text",
      labelKey: "questionnaire.f.nome_nascimento",
      hintKey: "questionnaire.hint.nome_nascimento",
      sectionKey: BIRTH_SECTION,
    },
    {
      name: "data_nascimento",
      type: "date",
      labelKey: "questionnaire.f.data_nascimento",
      required: true,
      sectionKey: BIRTH_SECTION,
    },
    {
      name: "nome_atual",
      type: "text",
      labelKey: "questionnaire.f.nome_atual",
      hintKey: "questionnaire.hint.nome_atual",
      sectionKey: "questionnaire.section.numerologia",
    },
    {
      name: "observacoes",
      type: "textarea",
      labelKey: "questionnaire.f.observacoes",
      sectionKey: "questionnaire.section.numerologia",
    },
  ],

  // s3 — Eneagrama: dados básicos + teste de 27 perguntas (renderizado à parte)
  s3: [
    {
      name: "nome_completo",
      type: "text",
      labelKey: "questionnaire.f.nome_completo",
      required: true,
      sectionKey: BIRTH_SECTION,
    },
    {
      name: "data_nascimento",
      type: "date",
      labelKey: "questionnaire.f.data_nascimento",
      sectionKey: BIRTH_SECTION,
    },
    {
      name: "observacoes",
      type: "textarea",
      labelKey: "questionnaire.f.observacoes",
      sectionKey: "questionnaire.section.eneagrama",
    },
  ],

  // s4 — Compatibilidade: dados das duas pessoas + contexto da relação
  s4: [
    {
      name: "nome_completo",
      type: "text",
      labelKey: "questionnaire.f.nome_completo",
      required: true,
      sectionKey: "questionnaire.section.pessoa1",
    },
    {
      name: "data_nascimento",
      type: "date",
      labelKey: "questionnaire.f.data_nascimento",
      required: true,
      sectionKey: "questionnaire.section.pessoa1",
    },
    {
      name: "hora_nascimento",
      type: "time",
      labelKey: "questionnaire.f.hora_nascimento",
      hintKey: "questionnaire.hint.hora",
      sectionKey: "questionnaire.section.pessoa1",
    },
    {
      name: "cidade_nascimento",
      type: "text",
      labelKey: "questionnaire.f.cidade_nascimento",
      hintKey: "questionnaire.hint.cidade",
      sectionKey: "questionnaire.section.pessoa1",
    },
    {
      name: "parceiro_nome",
      type: "text",
      labelKey: "questionnaire.f.parceiro_nome",
      required: true,
      sectionKey: "questionnaire.section.pessoa2",
    },
    {
      name: "parceiro_data_nascimento",
      type: "date",
      labelKey: "questionnaire.f.parceiro_data_nascimento",
      required: true,
      sectionKey: "questionnaire.section.pessoa2",
    },
    {
      name: "parceiro_hora_nascimento",
      type: "time",
      labelKey: "questionnaire.f.parceiro_hora_nascimento",
      hintKey: "questionnaire.hint.hora",
      sectionKey: "questionnaire.section.pessoa2",
    },
    {
      name: "parceiro_cidade_nascimento",
      type: "text",
      labelKey: "questionnaire.f.parceiro_cidade_nascimento",
      hintKey: "questionnaire.hint.cidade",
      sectionKey: "questionnaire.section.pessoa2",
    },
    {
      name: "tipo_relacao",
      type: "select",
      labelKey: "questionnaire.f.tipo_relacao",
      required: true,
      options: RELATION_TYPES,
      sectionKey: "questionnaire.section.relacao",
    },
    {
      name: "tempo_relacao",
      type: "text",
      labelKey: "questionnaire.f.tempo_relacao",
      hintKey: "questionnaire.hint.tempo_relacao",
      sectionKey: "questionnaire.section.relacao",
    },
    {
      name: "observacoes",
      type: "textarea",
      labelKey: "questionnaire.f.observacoes",
      sectionKey: "questionnaire.section.relacao",
    },
  ],

  // s5 — Conselho dos Mestres
  s5: [
    {
      name: "nome_completo",
      type: "text",
      labelKey: "questionnaire.f.nome_completo",
      required: true,
      sectionKey: BIRTH_SECTION,
    },
    {
      name: "data_nascimento",
      type: "date",
      labelKey: "questionnaire.f.data_nascimento",
      sectionKey: BIRTH_SECTION,
    },
    {
      name: "area_vida",
      type: "select",
      labelKey: "questionnaire.f.area_vida",
      required: true,
      options: LIFE_AREAS,
      sectionKey: "questionnaire.section.conselho",
    },
    {
      name: "pergunta",
      type: "textarea",
      labelKey: "questionnaire.f.pergunta",
      hintKey: "questionnaire.hint.pergunta",
      required: true,
      sectionKey: "questionnaire.section.conselho",
    },
    {
      name: "observacoes",
      type: "textarea",
      labelKey: "questionnaire.f.observacoes",
      sectionKey: "questionnaire.section.conselho",
    },
  ],
};
