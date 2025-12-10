/**
 * Serviço Avançado de Geração de Pautas - Pipeline Multi-Agente
 * 
 * Este serviço implementa um sistema robusto de geração de pautas usando:
 * - Ensemble de múltiplos prompts especializados
 * - Validação e scoring automático
 * - Geração de variantes para teste A/B
 * - Integração com dados reais (pesquisa de mercado, Instagram, etc.)
 */

import { 
  Post, 
  ContentType, 
  ClientWorkspaceCard, 
  ClientResearchData,
  CompetitorData,
  HashtagRadarEntry
} from '../types';
import { getApiKey } from '../utils/apiKeys';
import { runAgentWebResearch, summarizeSearchResults } from './agentWebResearch';
import { getPrompt } from '../utils/promptLoader';

// ============================================
// TIPOS E INTERFACES AVANÇADAS
// ============================================

/**
 * Schema estruturado para uma pauta completa
 */
export interface PautaCompleta {
  id: string;
  
  // Metadados básicos
  titulo: string;
  tipo: ContentType;
  data: string;
  
  // Estratégia
  objetivo: string;
  metricsTarget: {
    engagementEstimado: number; // 0-100
    alcanceEstimado: 'baixo' | 'medio' | 'alto';
    probabilidadeViral: number; // 0-100
  };
  
  // Conteúdo principal
  conceito: string;
  gancho: string; // Hook inicial para capturar atenção
  copy: {
    curta: string;  // Para stories/reels
    media: string;  // Padrão
    longa: string;  // Para carrossel/LinkedIn
  };
  
  // Visual
  diretrizVisual: {
    descricao: string;
    estilo: string;
    cores: string[];
    elementos: string[];
    referencias: string[];
    promptMidjourney: string;
    promptDalle: string;
  };
  
  // CTA e conversão
  cta: {
    principal: string;
    alternativo: string;
    urgencia: 'baixa' | 'media' | 'alta';
  };
  
  // Hashtags estratégicas
  hashtags: {
    obrigatorias: string[];    // Da marca
    nicho: string[];           // Alto volume, baixa saturação
    tendencia: string[];       // Trending agora
    experimentais: string[];   // Teste de novos públicos
  };
  
  // Inteligência
  justificativa: string;
  basesEstrategicas: string[];
  diferenciais: string[];
  riscos: string[];
  
  // Variantes para teste
  variantes: PautaVariante[];
  
  // Métricas e scoring
  scoring: PautaScoring;
  
  // Metadata
  status: 'rascunho' | 'revisao' | 'aprovado' | 'agendado' | 'publicado';
  criadoEm: string;
  fonte: 'ia' | 'manual' | 'hibrido';
}

/**
 * Variante de uma pauta para teste A/B
 */
export interface PautaVariante {
  id: string;
  nome: string;
  diferencas: string[];
  titulo: string;
  gancho: string;
  copy: string;
  hipotese: string;
  metricsAlvo: string;
}

/**
 * Sistema de scoring para avaliar qualidade
 */
export interface PautaScoring {
  total: number; // 0-100
  criterios: {
    relevanciaAudiencia: number;
    clarezaMensagem: number;
    apeloeVisual: number;
    potencialEngajamento: number;
    alinhamentoMarca: number;
    originalidade: number;
    ctaEfetividade: number;
  };
  confianca: number; // 0-100
  recomendacao: 'publicar' | 'revisar' | 'descartar';
}

/**
 * Contexto rico para geração de pautas
 */
export interface PautaGenerationContext {
  client: ClientWorkspaceCard;
  researchData?: ClientResearchData;
  instagramInsights?: {
    topPostsByEngagement: any[];
    bestPostingTimes: string[];
    audienceInterests: string[];
    competitorTopPosts: any[];
  };
  calendarContext?: {
    datasEspeciais: string[];
    campanhasAtivas: string[];
    postRecentes: Post[];
  };
  preferences?: {
    creativity: number; // 0-100 (baixo = seguro, alto = experimental)
    depth: number;      // 0-100 (quantidade de detalhes)
    variants: number;   // Quantas variantes gerar
  };
}

/**
 * Resultado do pipeline de geração
 */
export interface PautaGenerationResult {
  pautas: PautaCompleta[];
  metricas: {
    tempoProcessamento: number;
    tokensUsados: number;
    modelosUsados: string[];
  };
  insights: {
    tendenciasIdentificadas: string[];
    oportunidadesDetectadas: string[];
    alertas: string[];
  };
}

// ============================================
// CONFIGURAÇÕES DO PIPELINE
// ============================================

const PIPELINE_CONFIG = {
  // Temperaturas para diferentes etapas
  temperatures: {
    analise: 0.3,      // Mais determinístico para análise
    criacao: 0.8,      // Mais criativo para ideação
    variantes: 0.9,    // Máxima criatividade para variantes
    validacao: 0.2,    // Muito determinístico para validação
  },
  
  // Limites
  limits: {
    maxHashtags: 30,
    minHashtags: 5,
    maxCopyLength: 2200, // Limite Instagram
    minCopyLength: 100,
    maxVariantes: 5,
  },
  
  // Pesos para scoring
  scoringWeights: {
    relevanciaAudiencia: 0.2,
    clarezaMensagem: 0.15,
    apeloeVisual: 0.1,
    potencialEngajamento: 0.2,
    alinhamentoMarca: 0.15,
    originalidade: 0.1,
    ctaEfetividade: 0.1,
  },
};

// ============================================
// PIPELINE PRINCIPAL
// ============================================

/**
 * Pipeline principal de geração de pautas
 * Executa múltiplos agentes especializados em sequência/paralelo
 */
export const generatePautasAvancadas = async (
  context: PautaGenerationContext,
  count: number = 5
): Promise<PautaGenerationResult> => {
  const startTime = Date.now();
  const apiKey = getApiKey(context.client.selectedModel);
  
  if (!apiKey) {
    throw new Error('API Key não configurada');
  }

  console.log('[Pauta Pipeline] 🚀 Iniciando geração avançada de pautas');
  console.log(`[Pauta Pipeline] 📊 Cliente: ${context.client.name}`);
  console.log(`[Pauta Pipeline] 🎯 Pautas solicitadas: ${count}`);

  // FASE 1: Análise de contexto e oportunidades
  console.log('[Pauta Pipeline] 📈 Fase 1: Análise de contexto...');
  const analiseContexto = await analisarContexto(context, apiKey);

  // FASE 2: Geração de ideias brutas (múltiplos prompts em paralelo)
  console.log('[Pauta Pipeline] 💡 Fase 2: Ideação multi-agente...');
  const ideiasRaw = await gerarIdeiasMultiAgente(context, analiseContexto, count, apiKey);

  // FASE 3: Refinamento e estruturação
  console.log('[Pauta Pipeline] ✨ Fase 3: Refinamento...');
  const pautasRefinadas = await refinarPautas(ideiasRaw, context, apiKey);

  // FASE 4: Geração de variantes
  console.log('[Pauta Pipeline] 🔄 Fase 4: Gerando variantes...');
  const pautasComVariantes = await gerarVariantes(pautasRefinadas, context, apiKey);

  // FASE 5: Scoring e validação
  console.log('[Pauta Pipeline] ✅ Fase 5: Scoring e validação...');
  const pautasFinais = await scoringEValidacao(pautasComVariantes, context, apiKey);

  // FASE 6: Ordenação por qualidade e limita à quantidade solicitada
  pautasFinais.sort((a, b) => b.scoring.total - a.scoring.total);
  const pautasLimitadas = pautasFinais.slice(0, count);

  const tempoTotal = Date.now() - startTime;
  console.log(`[Pauta Pipeline] 🎉 Pipeline completo em ${tempoTotal}ms`);
  console.log(`[Pauta Pipeline] 📝 ${pautasLimitadas.length} pautas finais (solicitadas: ${count})`);

  return {
    pautas: pautasLimitadas,
    metricas: {
      tempoProcessamento: tempoTotal,
      tokensUsados: 0, // Seria calculado se tivéssemos tracking
      modelosUsados: [context.client.selectedModel],
    },
    insights: {
      tendenciasIdentificadas: analiseContexto.tendencias,
      oportunidadesDetectadas: analiseContexto.oportunidades,
      alertas: analiseContexto.alertas,
    },
  };
};

// ============================================
// FASE 1: ANÁLISE DE CONTEXTO
// ============================================

interface AnaliseContexto {
  tendencias: string[];
  oportunidades: string[];
  alertas: string[];
  temasSugeridos: string[];
  melhoresHorarios: string[];
  hashtagsRecomendadas: string[];
  tomsRecomendados: string[];
}

const analisarContexto = async (
  context: PautaGenerationContext,
  apiKey: string
): Promise<AnaliseContexto> => {
  const { client, researchData, instagramInsights } = context;

  // Monta contexto rico com todos os dados disponíveis
  let dadosContexto = `
CLIENTE: ${client.name}
NICHO: ${client.nicho}
PERSONA: ${client.settings.persona}
OBJETIVOS: ${client.settings.objectives.join(', ')}
TOM DE VOZ: ${client.settings.tone.join(', ')}
`;

  if (researchData) {
    dadosContexto += `
DADOS DE PESQUISA DISPONÍVEIS:
- Concorrentes analisados: ${researchData.competitors.length}
- Top concorrente: ${researchData.competitors[0]?.name || 'N/A'}
- Score de engajamento médio: ${researchData.competitors.reduce((a, b) => a + b.engagementScore, 0) / (researchData.competitors.length || 1)}
- Tendências identificadas: ${researchData.trends.map(t => t.topic).join(', ')}
- Temas recorrentes: ${researchData.thematicSummary.themes.join(', ')}
- Lacunas identificadas: ${researchData.thematicSummary.gaps.join(', ')}
- Hashtags de oportunidade: ${researchData.hashtagRadar.filter(h => h.opportunity === 'alta').map(h => h.tag).join(', ')}
`;
  }

  if (instagramInsights?.topPostsByEngagement?.length) {
    dadosContexto += `
INSIGHTS DO INSTAGRAM:
- Posts com maior engajamento: ${instagramInsights.topPostsByEngagement.slice(0, 3).map(p => p.caption?.substring(0, 50)).join(' | ')}
- Melhores horários: ${instagramInsights.bestPostingTimes.join(', ')}
- Interesses da audiência: ${instagramInsights.audienceInterests.join(', ')}
`;
  }

  // Pesquisa web opcional (agente)
  let webSearchSummary = '';
  if (client.settings.searchWeb) {
    try {
      const searchTopics = client.settings.priorityTopics || researchData?.trends.map(t => t.topic) || [];
      const searchCompetitors = client.settings.competitors.map(c => c.name) || [];
      const preferred: Array<'serpapi' | 'googlecse' | 'bing'> = [];
      const sp = client.settings.searchProviders || {};
      if (sp.serpapi) preferred.push('serpapi');
      if (sp.googlecse) preferred.push('googlecse');
      if (sp.bing) preferred.push('bing');

      const web = await runAgentWebResearch({
        niche: client.nicho,
        topics: searchTopics,
        competitors: searchCompetitors,
        limit: 5,
        language: 'pt-BR',
        preferredProviders: preferred,
      });
      webSearchSummary = summarizeSearchResults(web, 3);
      if (webSearchSummary) {
        dadosContexto += `\nWEB SEARCH (agente):\n${webSearchSummary}\n`;
      }
    } catch (err) {
      console.warn('[Pauta Pipeline] Falha na pesquisa web:', err);
    }
  }

  const prompt = await getPrompt('analise-contexto', {
    CONTEXT_DATA: dadosContexto
  });

  try {
    const response = await callAI(prompt, apiKey, PIPELINE_CONFIG.temperatures.analise, 'analise-contexto');
    return JSON.parse(cleanJson(response));
  } catch (error) {
    console.error('[Análise Contexto] Erro:', error);
    return {
      tendencias: [],
      oportunidades: [],
      alertas: [],
      temasSugeridos: client.settings.priorityTopics || [],
      melhoresHorarios: ['09:00', '12:00', '18:00'],
      hashtagsRecomendadas: client.settings.baseHashtags || [],
      tomsRecomendados: client.settings.tone || ['profissional'],
    };
  }
};

// ============================================
// FASE 2: IDEAÇÃO MULTI-AGENTE
// ============================================

interface IdeiaRaw {
  titulo: string;
  tipo: string;
  conceito: string;
  gancho: string;
  angulo: string;
  fonte: string;
}

const gerarIdeiasMultiAgente = async (
  context: PautaGenerationContext,
  analise: AnaliseContexto,
  count: number,
  apiKey: string
): Promise<IdeiaRaw[]> => {
  const { client, researchData } = context;

  // Prompts especializados para diferentes ângulos
  const prompts = await Promise.all([
    // Agente 1: Foco em engajamento e virais
    buildPromptEngajamento(client, analise, Math.ceil(count * 0.4)),
    // Agente 2: Foco em autoridade e educação
    buildPromptAutoridade(client, analise, Math.ceil(count * 0.3)),
    // Agente 3: Foco em conversão e vendas
    buildPromptConversao(client, analise, Math.ceil(count * 0.3)),
  ]);

  // Executa em paralelo
  const resultados = await Promise.all(
    prompts.map((prompt, idx) => 
      callAI(prompt, apiKey, PIPELINE_CONFIG.temperatures.criacao, `ideacao-agente-${idx + 1}`)
        .then(r => JSON.parse(cleanJson(r)))
        .catch(e => ({ ideias: [] }))
    )
  );

  // Combina e deduplica ideias
  const todasIdeias: IdeiaRaw[] = [];
  resultados.forEach((r, idx) => {
    const fontes = ['engajamento', 'autoridade', 'conversao'];
    const ideias = r.ideias || r.ideas || [];
    ideias.forEach((ideia: any) => {
      todasIdeias.push({
        titulo: ideia.titulo || ideia.title || 'Sem título',
        tipo: ideia.tipo || ideia.type || 'Educativo',
        conceito: ideia.conceito || ideia.concept || '',
        gancho: ideia.gancho || ideia.hook || '',
        angulo: ideia.angulo || ideia.angle || '',
        fonte: fontes[idx],
      });
    });
  });

  console.log(`[Ideação] Geradas ${todasIdeias.length} ideias de ${prompts.length} agentes`);
  
  // Retorna exatamente a quantidade solicitada
  return todasIdeias.slice(0, count);
};

const buildPromptEngajamento = async (client: ClientWorkspaceCard, analise: AnaliseContexto, count: number): Promise<string> => {
  return await getPrompt('engajamento', {
    CLIENT_NAME: client.name,
    NICHO: client.nicho,
    PERSONA: client.settings.persona,
    TENDENCIAS: analise.tendencias.join(', '),
    OPORTUNIDADES: analise.oportunidades.join(', '),
    COUNT: count
  });
};

const buildPromptAutoridade = async (client: ClientWorkspaceCard, analise: AnaliseContexto, count: number): Promise<string> => {
  return await getPrompt('autoridade', {
    CLIENT_NAME: client.name,
    NICHO: client.nicho,
    PERSONA: client.settings.persona,
    TEMAS_SUGERIDOS: analise.temasSugeridos.join(', '),
    TONS_RECOMENDADOS: analise.tomsRecomendados.join(', '),
    COUNT: count
  });
};

const buildPromptConversao = async (client: ClientWorkspaceCard, analise: AnaliseContexto, count: number): Promise<string> => {
  return await getPrompt('conversao', {
    CLIENT_NAME: client.name,
    NICHO: client.nicho,
    PERSONA: client.settings.persona,
    CTAS_PREFERIDOS: client.settings.ctas.join(', ') || 'Saiba mais, Entre em contato',
    OBJECTIVES: client.settings.objectives.join(', '),
    COUNT: count
  });
};

// ============================================
// FASE 3: REFINAMENTO
// ============================================

const refinarPautas = async (
  ideias: IdeiaRaw[],
  context: PautaGenerationContext,
  apiKey: string
): Promise<Partial<PautaCompleta>[]> => {
  const { client } = context;

  // Refina cada ideia individualmente para maior qualidade
  const refinamentos = await Promise.all(
    ideias.map(ideia => refinarIdeiaIndividual(ideia, client, apiKey))
  );

  // Filtra resultados válidos (todos devem ser válidos agora devido ao fallback)
  return refinamentos.filter(r => r && r.titulo) as Partial<PautaCompleta>[];
};

const refinarIdeiaIndividual = async (
  ideia: IdeiaRaw,
  client: ClientWorkspaceCard,
  apiKey: string
): Promise<Partial<PautaCompleta> | null> => {
  const prompt = await getPrompt('refinamento', {
    TITULO_ORIGINAL: ideia.titulo,
    TIPO_ORIGINAL: ideia.tipo,
    CONCEITO_ORIGINAL: ideia.conceito,
    GANCHO_ORIGINAL: ideia.gancho,
    CLIENT_NAME: client.name,
    TONE: client.settings.tone.join(', '),
    FORBIDDEN_WORDS: client.settings.forbiddenWords || 'Nenhuma',
    REQUIRED_WORDS: client.settings.requiredWords || 'Nenhuma'
  });

  try {
    const response = await callAI(prompt, apiKey, PIPELINE_CONFIG.temperatures.criacao, 'refinamento');
    const data = JSON.parse(cleanJson(response));
    
    return {
      id: `pauta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      titulo: data.titulo || ideia.titulo,
      tipo: mapContentType(data.tipo || ideia.tipo),
      data: new Date().toISOString().split('T')[0],
      objetivo: data.objetivo || '',
      conceito: data.conceito || ideia.conceito,
      gancho: data.gancho || ideia.gancho,
      copy: data.copy || { curta: '', media: ideia.conceito, longa: '' },
      diretrizVisual: data.diretrizVisual || {
        descricao: '',
        estilo: '',
        cores: [],
        elementos: [],
        referencias: [],
        promptMidjourney: '',
        promptDalle: '',
      },
      cta: data.cta || { principal: '', alternativo: '', urgencia: 'media' as const },
      hashtags: data.hashtags || { obrigatorias: [], nicho: [], tendencia: [], experimentais: [] },
      justificativa: data.justificativa || ideia.angulo || '',
      basesEstrategicas: data.basesEstrategicas || [],
      diferenciais: data.diferenciais || [],
      riscos: data.riscos || [],
      status: 'rascunho',
      criadoEm: new Date().toISOString(),
      fonte: 'ia',
    };
  } catch (error) {
    console.error('[Refinamento] Erro ao refinar, usando fallback:', error);
    // Retorna um fallback básico baseado na ideia original
    return {
      id: `pauta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      titulo: ideia.titulo,
      tipo: mapContentType(ideia.tipo),
      data: new Date().toISOString().split('T')[0],
      objetivo: ideia.angulo || '',
      conceito: ideia.conceito,
      gancho: ideia.gancho,
      copy: { curta: ideia.gancho, media: ideia.conceito, longa: ideia.conceito },
      diretrizVisual: {
        descricao: `Imagem representando: ${ideia.titulo}`,
        estilo: 'profissional',
        cores: [],
        elementos: [],
        referencias: [],
        promptMidjourney: '',
        promptDalle: '',
      },
      cta: { principal: 'Saiba mais', alternativo: 'Entre em contato', urgencia: 'media' as const },
      hashtags: { obrigatorias: [], nicho: [], tendencia: [], experimentais: [] },
      justificativa: ideia.angulo || 'Gerado automaticamente',
      basesEstrategicas: [],
      diferenciais: [],
      riscos: [],
      status: 'rascunho',
      criadoEm: new Date().toISOString(),
      fonte: 'ia',
    };
  }
};

// ============================================
// FASE 4: GERAÇÃO DE VARIANTES
// ============================================

const gerarVariantes = async (
  pautas: Partial<PautaCompleta>[],
  context: PautaGenerationContext,
  apiKey: string
): Promise<Partial<PautaCompleta>[]> => {
  const numVariantes = context.preferences?.variants || 2;

  const pautasComVariantes = await Promise.all(
    pautas.map(async (pauta) => {
      const variantes = await gerarVariantesPauta(pauta, numVariantes, apiKey);
      return { ...pauta, variantes };
    })
  );

  return pautasComVariantes;
};

const gerarVariantesPauta = async (
  pauta: Partial<PautaCompleta>,
  count: number,
  apiKey: string
): Promise<PautaVariante[]> => {
  const prompt = await getPrompt('variantes', {
    TITULO_PAUTA: pauta.titulo || '',
    GANCHO_PAUTA: pauta.gancho || '',
    COPY_PAUTA: pauta.copy?.media || '',
    COUNT: count
  });

  try {
    const response = await callAI(prompt, apiKey, PIPELINE_CONFIG.temperatures.variantes, 'variantes');
    const data = JSON.parse(cleanJson(response));
    
    return (data.variantes || []).map((v: any, idx: number) => ({
      id: `var-${Date.now()}-${idx}`,
      nome: v.nome || `Variante ${idx + 1}`,
      diferencas: v.diferencas || [],
      titulo: v.titulo || pauta.titulo,
      gancho: v.gancho || pauta.gancho,
      copy: v.copy || pauta.copy?.media,
      hipotese: v.hipotese || 'Sem hipótese definida',
      metricsAlvo: v.metricsAlvo || 'Engajamento',
    }));
  } catch (error) {
    console.error('[Variantes] Erro:', error);
    return [];
  }
};

// ============================================
// FASE 5: SCORING E VALIDAÇÃO
// ============================================

const scoringEValidacao = async (
  pautas: Partial<PautaCompleta>[],
  context: PautaGenerationContext,
  apiKey: string
): Promise<PautaCompleta[]> => {
  const pautasComScore = await Promise.all(
    pautas.map(async (pauta) => {
      // Valida campos obrigatórios
      const pautaValidada = validarCampos(pauta);
      
      // Gera scoring via IA
      const scoring = await calcularScoring(pautaValidada, context, apiKey);
      
      return {
        ...pautaValidada,
        scoring,
        metricsTarget: {
          engagementEstimado: scoring.criterios.potencialEngajamento,
          alcanceEstimado: scoring.total > 70 ? 'alto' : scoring.total > 50 ? 'medio' : 'baixo',
          probabilidadeViral: Math.min(scoring.criterios.originalidade + scoring.criterios.potencialEngajamento, 100) / 2,
        },
      } as PautaCompleta;
    })
  );

  return pautasComScore;
};

const validarCampos = (pauta: Partial<PautaCompleta>): Partial<PautaCompleta> => {
  // Garante que todos os campos necessários existem com valores seguros
  const copyDefault = { curta: '', media: '', longa: '' };
  const diretrizVisualDefault = {
    descricao: '',
    estilo: '',
    cores: [] as string[],
    elementos: [] as string[],
    referencias: [] as string[],
    promptMidjourney: '',
    promptDalle: '',
  };
  const ctaDefault = { principal: '', alternativo: '', urgencia: 'media' as const };
  const scoringDefault: PautaScoring = {
    total: 50,
    criterios: {
      relevanciaAudiencia: 50,
      clarezaMensagem: 50,
      apeloeVisual: 50,
      potencialEngajamento: 50,
      alinhamentoMarca: 50,
      originalidade: 50,
      ctaEfetividade: 50,
    },
    confianca: 50,
    recomendacao: 'revisar',
  };

  return {
    ...pauta,
    id: pauta.id || `pauta-${Date.now()}`,
    titulo: pauta.titulo || 'Sem título',
    tipo: pauta.tipo || ContentType.EDUCATIONAL,
    data: pauta.data || new Date().toISOString().split('T')[0],
    objetivo: pauta.objetivo || '',
    conceito: pauta.conceito || '',
    gancho: pauta.gancho || '',
    copy: {
      curta: pauta.copy?.curta || copyDefault.curta,
      media: pauta.copy?.media || copyDefault.media,
      longa: pauta.copy?.longa || copyDefault.longa,
    },
    diretrizVisual: {
      descricao: pauta.diretrizVisual?.descricao || diretrizVisualDefault.descricao,
      estilo: pauta.diretrizVisual?.estilo || diretrizVisualDefault.estilo,
      cores: pauta.diretrizVisual?.cores || diretrizVisualDefault.cores,
      elementos: pauta.diretrizVisual?.elementos || diretrizVisualDefault.elementos,
      referencias: pauta.diretrizVisual?.referencias || diretrizVisualDefault.referencias,
      promptMidjourney: pauta.diretrizVisual?.promptMidjourney || diretrizVisualDefault.promptMidjourney,
      promptDalle: pauta.diretrizVisual?.promptDalle || diretrizVisualDefault.promptDalle,
    },
    cta: {
      principal: pauta.cta?.principal || ctaDefault.principal,
      alternativo: pauta.cta?.alternativo || ctaDefault.alternativo,
      urgencia: pauta.cta?.urgencia || ctaDefault.urgencia,
    },
    hashtags: {
      obrigatorias: pauta.hashtags?.obrigatorias || [],
      nicho: pauta.hashtags?.nicho || [],
      tendencia: pauta.hashtags?.tendencia || [],
      experimentais: pauta.hashtags?.experimentais || [],
    },
    justificativa: pauta.justificativa || '',
    basesEstrategicas: Array.isArray(pauta.basesEstrategicas) ? pauta.basesEstrategicas : [],
    diferenciais: Array.isArray(pauta.diferenciais) ? pauta.diferenciais : [],
    riscos: Array.isArray(pauta.riscos) ? pauta.riscos : [],
    variantes: Array.isArray(pauta.variantes) ? pauta.variantes : [],
    metricsTarget: pauta.metricsTarget || {
      engagementEstimado: 50,
      alcanceEstimado: 'medio',
      probabilidadeViral: 25,
    },
    scoring: pauta.scoring || scoringDefault,
    status: 'rascunho',
    criadoEm: pauta.criadoEm || new Date().toISOString(),
    fonte: pauta.fonte || 'ia',
  };
};

const calcularScoring = async (
  pauta: Partial<PautaCompleta>,
  context: PautaGenerationContext,
  apiKey: string
): Promise<PautaScoring> => {
  const prompt = await getPrompt('scoring', {
    TITULO_POST: pauta.titulo || '',
    TIPO_POST: pauta.tipo || '',
    CONCEITO_POST: pauta.conceito || '',
    COPY_POST: pauta.copy?.media || '',
    CTA_POST: pauta.cta?.principal || '',
    JUSTIFICATIVA_POST: pauta.justificativa || '',
    CLIENT_NAME: context.client.name,
    NICHO: context.client.nicho,
    OBJECTIVES: context.client.settings.objectives.join(', ')
  });

  try {
    const response = await callAI(prompt, apiKey, PIPELINE_CONFIG.temperatures.validacao, 'scoring');
    const data = JSON.parse(cleanJson(response));
    
    const criterios = data.criterios || {};
    
    // Calcula score total ponderado
    const total = Math.round(
      (criterios.relevanciaAudiencia || 50) * PIPELINE_CONFIG.scoringWeights.relevanciaAudiencia +
      (criterios.clarezaMensagem || 50) * PIPELINE_CONFIG.scoringWeights.clarezaMensagem +
      (criterios.apeloeVisual || 50) * PIPELINE_CONFIG.scoringWeights.apeloeVisual +
      (criterios.potencialEngajamento || 50) * PIPELINE_CONFIG.scoringWeights.potencialEngajamento +
      (criterios.alinhamentoMarca || 50) * PIPELINE_CONFIG.scoringWeights.alinhamentoMarca +
      (criterios.originalidade || 50) * PIPELINE_CONFIG.scoringWeights.originalidade +
      (criterios.ctaEfetividade || 50) * PIPELINE_CONFIG.scoringWeights.ctaEfetividade
    );

    return {
      total,
      criterios: {
        relevanciaAudiencia: criterios.relevanciaAudiencia || 50,
        clarezaMensagem: criterios.clarezaMensagem || 50,
        apeloeVisual: criterios.apeloeVisual || 50,
        potencialEngajamento: criterios.potencialEngajamento || 50,
        alinhamentoMarca: criterios.alinhamentoMarca || 50,
        originalidade: criterios.originalidade || 50,
        ctaEfetividade: criterios.ctaEfetividade || 50,
      },
      confianca: 80,
      recomendacao: total >= 70 ? 'publicar' : total >= 50 ? 'revisar' : 'descartar',
    };
  } catch (error) {
    console.error('[Scoring] Erro:', error);
    return {
      total: 60,
      criterios: {
        relevanciaAudiencia: 60,
        clarezaMensagem: 60,
        apeloeVisual: 60,
        potencialEngajamento: 60,
        alinhamentoMarca: 60,
        originalidade: 60,
        ctaEfetividade: 60,
      },
      confianca: 50,
      recomendacao: 'revisar',
    };
  }
};

// ============================================
// UTILIDADES
// ============================================

const callAI = async (
  prompt: string, 
  apiKey: string, 
  temperature: number,
  context: string
): Promise<string> => {
  console.log(`[AI ${context}] Chamando API (temp: ${temperature})...`);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em marketing digital e criação de conteúdo. Responda SEMPRE e SOMENTE com JSON válido, sem markdown, sem explicações adicionais, sem blocos de código.'
        },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`[AI ${context}] Erro:`, error);
    throw new Error(error.error?.message || 'Erro na API');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log(`[AI ${context}] Resposta (${content.length} chars)`);
  
  return content;
};

const cleanJson = (response: string): string => {
  let cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  // Encontra o JSON
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  // Tenta corrigir problemas comuns de JSON
  // Remove trailing commas antes de } ou ]
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  
  // Remove caracteres de controle que podem quebrar o parse
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, (char) => {
    if (char === '\n' || char === '\r' || char === '\t') return char;
    return '';
  });
  
  // Tenta corrigir aspas não escapadas dentro de strings (problema comum)
  // Isso é uma heurística - pode não funcionar em todos os casos
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch (e) {
    // Tenta uma limpeza mais agressiva
    console.warn('[cleanJson] JSON inválido, tentando correção...');
    
    // Remove quebras de linha dentro de strings (que podem quebrar o JSON)
    cleaned = cleaned.replace(/"([^"]*)\n([^"]*)"/g, '"$1 $2"');
    
    // Tenta novamente
    try {
      JSON.parse(cleaned);
      return cleaned;
    } catch (e2) {
      console.error('[cleanJson] Não foi possível corrigir o JSON');
      // Retorna o que temos e deixa o erro propagar
      return cleaned;
    }
  }
};

const mapContentType = (tipo: string): ContentType => {
  const mapping: Record<string, ContentType> = {
    'educativo': ContentType.EDUCATIONAL,
    'educational': ContentType.EDUCATIONAL,
    'institucional': ContentType.INSTITUTIONAL,
    'institutional': ContentType.INSTITUTIONAL,
    'prova social': ContentType.SOCIAL_PROOF,
    'social proof': ContentType.SOCIAL_PROOF,
    'oferta/promo': ContentType.PROMOTION,
    'promotion': ContentType.PROMOTION,
    'bastidores': ContentType.BEHIND_THE_SCENES,
    'behind the scenes': ContentType.BEHIND_THE_SCENES,
    'dica rápida': ContentType.QUICK_TIP,
    'quick tip': ContentType.QUICK_TIP,
  };
  
  return mapping[tipo?.toLowerCase()] || ContentType.EDUCATIONAL;
};

// ============================================
// FUNÇÃO DE COMPATIBILIDADE
// ============================================

/**
 * Converte PautaCompleta para o formato Post existente
 * Para manter compatibilidade com o sistema atual
 */
export const convertPautaToPost = (pauta: PautaCompleta): Post => {
  return {
    id: pauta.id,
    title: pauta.titulo,
    type: pauta.tipo,
    concept: pauta.conceito,
    imagePrompt: pauta.diretrizVisual.promptDalle || pauta.diretrizVisual.descricao,
    copy: pauta.copy.media,
    hashtags: {
      core: [...pauta.hashtags.obrigatorias, ...pauta.hashtags.nicho],
      opportunity: pauta.hashtags.tendencia,
      experimental: pauta.hashtags.experimentais,
    },
    cta: pauta.cta.principal,
    justification: pauta.justificativa,
    references: pauta.basesEstrategicas,
    status: 'draft',
    date: pauta.data,
  };
};
