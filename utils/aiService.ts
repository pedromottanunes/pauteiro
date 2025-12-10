import { AiModel, ClientWorkspaceCard, Post, ClientResearchData, CompetitorData, TrendData, HashtagRadarEntry, ThematicSummary } from '../types';
import { getApiKey, hasApiKey } from './apiKeys';
import { InstagramPost, InstagramProfile } from '../types/research';
import { getPrompt } from './promptLoader';

/**
 * Serviço de integração com APIs de IA - Pipeline Multi-Prompt Robusto
 * 
 * Este serviço implementa múltiplos prompts especializados que rodam em paralelo
 * para obter análises mais profundas e detalhadas sobre:
 * - Análise de redes sociais dos concorrentes
 * - Tendências de mercado
 * - Hashtags e saturação
 * - Lacunas de conteúdo
 */

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface GeneratePostsRequest {
  client: ClientWorkspaceCard;
  count: number;
}

export interface GenerateResearchRequest {
  client: ClientWorkspaceCard;
}

/**
 * Interface para dados reais coletados do Instagram via Apify
 */
export interface InstagramScrapedData {
  profile: InstagramProfile | null;
  posts: InstagramPost[];
}

export interface GenerateResearchWithDataRequest {
  client: ClientWorkspaceCard;
  instagramData?: InstagramScrapedData;
  webSearchResults?: any[];
}

// ============================================
// VERIFICAÇÕES
// ============================================

export const canUseAI = (model: AiModel): { canUse: boolean; message?: string } => {
  if (!hasApiKey(model)) {
    return {
      canUse: false,
      message: `Configure a API Key de ${model} nas Configurações antes de gerar conteúdo.`,
    };
  }
  return { canUse: true };
};

// ============================================
// FUNÇÃO PRINCIPAL DE PESQUISA (MULTI-PROMPT)
// ============================================

export const generateResearch = async (request: GenerateResearchRequest): Promise<ClientResearchData> => {
  const { client } = request;
  const model = client.selectedModel;

  const check = canUseAI(model);
  if (!check.canUse) {
    throw new Error(check.message);
  }

  const apiKey = getApiKey(model);
  
  console.log('[AI Service] 🚀 Iniciando pipeline de pesquisa multi-prompt para:', client.name);

  // Executa múltiplos prompts em paralelo para análise completa
  const [
    competitorAnalysis,
    trendAnalysis,
    hashtagAnalysis,
    thematicAnalysis
  ] = await Promise.all([
    analyzeCompetitorsSocial(client, apiKey!),
    analyzeTrends(client, apiKey!),
    analyzeHashtags(client, apiKey!),
    analyzeThematicContent(client, apiKey!),
  ]);

  console.log('[AI Service] ✅ Pipeline completo - fundindo resultados');

  return {
    competitors: competitorAnalysis,
    trends: trendAnalysis,
    hashtagRadar: hashtagAnalysis,
    thematicSummary: thematicAnalysis,
    lastUpdated: new Date().toISOString(),
  };
};

// ============================================
// FUNÇÃO DE PESQUISA COM DADOS REAIS DO INSTAGRAM
// ============================================

/**
 * Gera pesquisa usando dados REAIS coletados do Instagram via Apify
 * Esta versão envia os posts e perfis coletados como contexto para a IA
 */
export const generateResearchWithInstagramData = async (
  request: GenerateResearchWithDataRequest
): Promise<ClientResearchData> => {
  const { client, instagramData } = request;
  const model = client.selectedModel;

  const check = canUseAI(model);
  if (!check.canUse) {
    throw new Error(check.message);
  }

  const apiKey = getApiKey(model);
  
  console.log('[AI Service] 🚀 Iniciando pipeline com DADOS REAIS do Instagram');
  console.log(`[AI Service] 📊 Posts disponíveis: ${instagramData?.posts.length || 0}`);
  console.log(`[AI Service] 👤 Perfil: ${instagramData?.profile?.username || 'N/A'}`);

  // Se temos dados reais, usa prompts especializados com esses dados
  const hasRealData = instagramData && instagramData.posts.length > 0;

  const [
    competitorAnalysis,
    trendAnalysis,
    hashtagAnalysis,
    thematicAnalysis
  ] = await Promise.all([
    hasRealData 
      ? analyzeCompetitorsWithRealData(client, instagramData, apiKey!)
      : analyzeCompetitorsSocial(client, apiKey!),
    analyzeTrends(client, apiKey!),
    hasRealData
      ? analyzeHashtagsWithRealData(client, instagramData, apiKey!)
      : analyzeHashtags(client, apiKey!),
    hasRealData
      ? analyzeThematicWithRealData(client, instagramData, apiKey!)
      : analyzeThematicContent(client, apiKey!),
  ]);

  console.log('[AI Service] ✅ Pipeline com dados reais completo');

  return {
    competitors: competitorAnalysis,
    trends: trendAnalysis,
    hashtagRadar: hashtagAnalysis,
    thematicSummary: thematicAnalysis,
    lastUpdated: new Date().toISOString(),
  };
};

// ============================================
// PROMPT 1: ANÁLISE DE REDES SOCIAIS DOS CONCORRENTES
// ============================================

const analyzeCompetitorsSocial = async (client: ClientWorkspaceCard, apiKey: string): Promise<CompetitorData[]> => {
  const { settings, nicho } = client;
  
  if (settings.competitors.length === 0) {
    console.log('[Competitors] Nenhum concorrente configurado, retornando análise genérica');
    return generateGenericCompetitorAnalysis(nicho, apiKey);
  }

  const competitorsList = settings.competitors.map(c => 
    `- ${c.name}${c.site ? ` (Site: ${c.site})` : ''}${c.profile ? ` (Instagram/Redes: ${c.profile})` : ''}`
  ).join('\n');

  const prompt = await getPrompt('competitors', {
    CLIENT_NAME: client.name,
    NICHO: nicho,
    PERSONA: settings.persona || 'Não definida',
    COMPETITORS_LIST: competitorsList
  });

  try {
    const response = await callOpenAI(prompt, apiKey, 'competitors');
    const data = JSON.parse(cleanJsonResponse(response));
    
    return (data.competitors || []).map((comp: any) => ({
      name: comp.name || 'Concorrente',
      engagementScore: Math.min(100, Math.max(0, comp.engagementScore || 50)),
      topTopics: comp.topTopics || [],
      gap: comp.gap || 'Gap não identificado',
      copyStyle: comp.copyStyle || 'Estilo não analisado',
      hashtags: comp.hashtags || [],
      socialPresence: comp.socialPresence || null,
    }));
  } catch (error) {
    console.error('[Competitors] Erro na análise:', error);
    return generateGenericCompetitorAnalysis(nicho, apiKey);
  }
};

const generateGenericCompetitorAnalysis = async (nicho: string, apiKey: string): Promise<CompetitorData[]> => {
  const prompt = await getPrompt('generic-competitors', {
    NICHO: nicho
  });

  try {
    const response = await callOpenAI(prompt, apiKey, 'generic-competitors');
    const data = JSON.parse(cleanJsonResponse(response));
    return data.competitors || [];
  } catch {
    return [{
      name: 'Concorrentes do Nicho',
      engagementScore: 50,
      topTopics: [nicho],
      gap: 'Configure seus concorrentes nas configurações para análise detalhada',
      copyStyle: 'Não analisado',
      hashtags: [],
    }];
  }
};

// ============================================
// PROMPT 2: ANÁLISE DE TENDÊNCIAS DE MERCADO
// ============================================

const analyzeTrends = async (client: ClientWorkspaceCard, apiKey: string): Promise<TrendData[]> => {
  const { nicho, settings } = client;
  
  const prompt = await getPrompt('trends', {
    NICHO: nicho,
    PERSONA: settings.persona || 'Público geral do nicho',
    OBJECTIVES: settings.objectives.join(', ') || 'Crescimento e engajamento'
  });

  try {
    const response = await callOpenAI(prompt, apiKey, 'trends');
    const data = JSON.parse(cleanJsonResponse(response));
    
    return (data.trends || []).map((trend: any) => ({
      topic: trend.topic || 'Tendência',
      volume: Math.max(100, trend.volume || 500),
      saturation: Math.min(100, Math.max(0, trend.saturation || 50)),
      opportunity: Math.min(100, Math.max(0, trend.opportunity || 50)),
      description: trend.description,
      contentSuggestion: trend.contentSuggestion,
    }));
  } catch (error) {
    console.error('[Trends] Erro na análise:', error);
    return [{
      topic: nicho,
      volume: 1000,
      saturation: 50,
      opportunity: 60,
    }];
  }
};

// ============================================
// PROMPT 3: ANÁLISE DE HASHTAGS
// ============================================

const analyzeHashtags = async (client: ClientWorkspaceCard, apiKey: string): Promise<HashtagRadarEntry[]> => {
  const { nicho, settings } = client;
  
  const existingHashtags = [
    ...settings.baseHashtags,
    ...settings.referenceHashtags,
    ...(settings.competitors.flatMap(c => c.name ? [`#${c.name.toLowerCase().replace(/\s/g, '')}`] : [])),
  ].filter(Boolean);

  const prompt = await getPrompt('hashtags', {
    NICHO: nicho,
    EXISTING_HASHTAGS: existingHashtags.join(', ') || 'Nenhuma',
    COMPETITORS: settings.competitors.map(c => c.name).join(', ') || 'Não especificados'
  });

  try {
    const response = await callOpenAI(prompt, apiKey, 'hashtags');
    const data = JSON.parse(cleanJsonResponse(response));
    
    return (data.hashtags || []).map((h: any) => ({
      tag: h.tag || '#hashtag',
      usage: validateUsage(h.usage),
      saturation: validateLevel(h.saturation),
      opportunity: validateLevel(h.opportunity),
      note: h.note || 'Sem observações',
      estimatedReach: h.estimatedReach,
      recommendation: h.recommendation,
    }));
  } catch (error) {
    console.error('[Hashtags] Erro na análise:', error);
    return [{
      tag: `#${nicho.toLowerCase().replace(/\s/g, '')}`,
      usage: 'nicho',
      saturation: 'media',
      opportunity: 'media',
      note: 'Hashtag base do nicho',
    }];
  }
};

// ============================================
// PROMPT 4: ANÁLISE TEMÁTICA E LACUNAS
// ============================================

const analyzeThematicContent = async (client: ClientWorkspaceCard, apiKey: string): Promise<ThematicSummary> => {
  const { nicho, settings } = client;
  
  const prompt = await getPrompt('thematic', {
    NICHO: nicho,
    PERSONA: settings.persona || 'Público geral',
    TONE: settings.tone.join(', ') || 'Profissional e amigável',
    OBJECTIVES: settings.objectives.join(', ') || 'Engajamento e conversão',
    COMPETITORS: settings.competitors.map(c => c.name).join(', ') || 'Não especificados'
  });

  try {
    const response = await callOpenAI(prompt, apiKey, 'thematic');
    const data = JSON.parse(cleanJsonResponse(response));
    const summary = data.thematicSummary || data;
    
    return {
      themes: Array.isArray(summary.themes) 
        ? summary.themes.map((t: any) => typeof t === 'string' ? t : t.name || t.theme || 'Tema')
        : [],
      faqs: Array.isArray(summary.faqs)
        ? summary.faqs.map((f: any) => typeof f === 'string' ? f : f.question || f.faq || 'FAQ')
        : [],
      gaps: Array.isArray(summary.gaps)
        ? summary.gaps.map((g: any) => typeof g === 'string' ? g : g.opportunity || g.gap || 'Lacuna')
        : [],
    };
  } catch (error) {
    console.error('[Thematic] Erro na análise:', error);
    return {
      themes: [nicho],
      faqs: [`Como começar em ${nicho}?`],
      gaps: ['Conteúdo educativo para iniciantes'],
    };
  }
};

// ============================================
// FUNÇÕES COM DADOS REAIS DO INSTAGRAM (APIFY)
// ============================================

/**
 * Analisa concorrentes usando DADOS REAIS coletados do Instagram
 */
const analyzeCompetitorsWithRealData = async (
  client: ClientWorkspaceCard,
  instagramData: InstagramScrapedData,
  apiKey: string
): Promise<CompetitorData[]> => {
  const { profile, posts } = instagramData;
  const { nicho } = client;

  // Prepara resumo dos posts para o prompt
  const postsSummary = posts.slice(0, 15).map((post, i) => ({
    index: i + 1,
    caption: post.caption?.substring(0, 300) || 'Sem legenda',
    likes: post.likesCount,
    comments: post.commentsCount,
    hashtags: post.hashtags?.slice(0, 8) || [],
    mediaType: post.mediaType,
    date: post.timestamp,
  }));

  const prompt = `Você é um analista de marketing digital especializado em Instagram.

DADOS REAIS DO CONCORRENTE (coletados automaticamente):

PERFIL:
- Username: @${profile?.username || 'desconhecido'}
- Nome: ${profile?.fullName || 'N/A'}
- Bio: ${profile?.bio || 'N/A'}
- Seguidores: ${profile?.followersCount?.toLocaleString() || 'N/A'}
- Seguindo: ${profile?.followingCount?.toLocaleString() || 'N/A'}
- Posts: ${profile?.postsCount?.toLocaleString() || 'N/A'}
- Conta Comercial: ${profile?.isBusinessAccount ? 'Sim' : 'Não'}
- Verificado: ${profile?.isVerified ? 'Sim' : 'Não'}
- Categoria: ${profile?.category || 'N/A'}
- Website: ${profile?.website || 'N/A'}

AMOSTRA DE ${postsSummary.length} POSTS RECENTES:
${JSON.stringify(postsSummary, null, 2)}

NICHO DO CLIENTE: ${nicho}

TAREFA: Com base nos DADOS REAIS acima, faça uma análise PROFUNDA deste concorrente.

Analise:
1. Taxa de engajamento real (likes+comments / seguidores)
2. Temas mais abordados nas legendas
3. Estilo de copywriting (tom, tamanho, estrutura)
4. Hashtags mais utilizadas
5. Tipos de conteúdo preferidos (imagem, vídeo, carrossel)
6. Frequência de postagem estimada
7. PONTOS FORTES (o que fazem bem)
8. PONTOS FRACOS/GAPS (oportunidades para o cliente)

Retorne APENAS JSON:
{
  "competitors": [
    {
      "name": "@${profile?.username || 'concorrente'}",
      "engagementScore": 75,
      "observacoes": @${profile?.username || 'concorrente'}",,
      "topTopics": ["tópico 1", "tópico 2", "tópico 3"],
      "gap": "Principal oportunidade que o cliente pode explorar",
      "copyStyle": "Descrição detalhada do estilo de copy",
      "hashtags": ["#tag1", "#tag2"],
      "realMetrics": {
        "followers": ${profile?.followersCount || 0},
        "avgLikes": 0,
        "avgComments": 0,
        "engagementRate": "X%"
      },
      "socialPresence": {
        "mainPlatform": "Instagram",
        "postFrequency": "X por semana",
        "contentTypes": ["tipo1", "tipo2"],
        "strongPoints": ["ponto forte 1"],
        "weakPoints": ["ponto fraco 1"]
      }
    }
  ]
}`;

  try {
    const response = await callOpenAI(prompt, apiKey, 'competitors-real-data');
    const data = JSON.parse(cleanJsonResponse(response));
    
    return (data.competitors || []).map((comp: any) => ({
      name: comp.name || `@${profile?.username}`,
      engagementScore: Math.min(100, Math.max(0, comp.engagementScore || 50)),
      topTopics: comp.topTopics || [],
      gap: comp.gap || 'Gap não identificado',
      copyStyle: comp.copyStyle || 'Estilo não analisado',
      hashtags: comp.hashtags || [],
      socialPresence: comp.socialPresence || null,
      realMetrics: comp.realMetrics || null,
    }));
  } catch (error) {
    console.error('[Competitors Real Data] Erro na análise:', error);
    return analyzeCompetitorsSocial(client, apiKey);
  }
};

/**
 * Analisa hashtags usando DADOS REAIS coletados do Instagram
 */
const analyzeHashtagsWithRealData = async (
  client: ClientWorkspaceCard,
  instagramData: InstagramScrapedData,
  apiKey: string
): Promise<HashtagRadarEntry[]> => {
  const { posts } = instagramData;
  const { nicho } = client;

  // Extrai todas as hashtags dos posts coletados
  const allHashtags = posts.flatMap(p => p.hashtags || []);
  const hashtagCount: Record<string, number> = {};
  
  allHashtags.forEach(tag => {
    const normalized = tag.toLowerCase().replace(/^#/, '');
    hashtagCount[normalized] = (hashtagCount[normalized] || 0) + 1;
  });

  // Ordena por frequência
  const sortedHashtags = Object.entries(hashtagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tag, count]) => ({ tag: `#${tag}`, count }));

  const prompt = await getPrompt('hashtags-real-data', {
    NICHO: nicho,
    POSTS_COUNT: posts.length,
    HASHTAGS_SORTED: sortedHashtags.map(h => `${h.tag}: usado ${h.count}x`).join('\n'),
    TOTAL_HASHTAGS: allHashtags.length,
    UNIQUE_HASHTAGS: Object.keys(hashtagCount).length
  });

  try {
    const response = await callOpenAI(prompt, apiKey, 'hashtags-real-data');
    const data = JSON.parse(cleanJsonResponse(response));
    
    return (data.hashtags || []).map((h: any) => ({
      tag: h.tag || '#hashtag',
      usage: validateUsage(h.usage),
      saturation: validateLevel(h.saturation),
      opportunity: validateLevel(h.opportunity),
      note: h.note || 'Sem observações',
      estimatedReach: h.estimatedReach,
      recommendation: h.recommendation,
      competitorUsage: h.competitorUsage,
    }));
  } catch (error) {
    console.error('[Hashtags Real Data] Erro na análise:', error);
    return analyzeHashtags(client, apiKey);
  }
};

/**
 * Analisa temas e lacunas usando DADOS REAIS coletados do Instagram
 */
const analyzeThematicWithRealData = async (
  client: ClientWorkspaceCard,
  instagramData: InstagramScrapedData,
  apiKey: string
): Promise<ThematicSummary> => {
  const { posts, profile } = instagramData;
  const { nicho, settings } = client;

  // Extrai temas das legendas
  const captions = posts
    .map(p => p.caption?.substring(0, 500) || '')
    .filter(c => c.length > 50);

  const captionsText = captions.slice(0, 10).map((c, i) => `\n[POST ${i + 1}]:\n${c}`).join('\n---');

  const prompt = await getPrompt('thematic-real-data', {
    PROFILE_USERNAME: profile?.username || 'desconhecido',
    PROFILE_BIO: profile?.bio || 'N/A',
    PROFILE_FOLLOWERS: profile?.followersCount?.toLocaleString() || 'N/A',
    PROFILE_POSTS_COUNT: profile?.postsCount || 'N/A',
    CAPTIONS_COUNT: captions.length,
    CAPTIONS_TEXT: captionsText,
    NICHO: nicho,
    PERSONA: settings.persona || 'Não definida',
    TONE: settings.tone.join(', ') || 'Profissional'
  });

  try {
    const response = await callOpenAI(prompt, apiKey, 'thematic-real-data');
    const data = JSON.parse(cleanJsonResponse(response));
    const summary = data.thematicSummary || data;
    
    return {
      themes: Array.isArray(summary.themes) 
        ? summary.themes.map((t: any) => typeof t === 'string' ? t : t.name || t.theme || 'Tema')
        : [],
      faqs: Array.isArray(summary.faqs)
        ? summary.faqs.map((f: any) => typeof f === 'string' ? f : f.question || f.faq || 'FAQ')
        : [],
      gaps: Array.isArray(summary.gaps)
        ? summary.gaps.map((g: any) => typeof g === 'string' ? g : g.opportunity || g.gap || 'Lacuna')
        : [],
    };
  } catch (error) {
    console.error('[Thematic Real Data] Erro na análise:', error);
    return analyzeThematicContent(client, apiKey);
  }
};

// ============================================
// GERAÇÃO DE POSTS
// ============================================

export const generatePosts = async (request: GeneratePostsRequest): Promise<Post[]> => {
  const { client, count } = request;
  const model = client.selectedModel;

  const check = canUseAI(model);
  if (!check.canUse) {
    throw new Error(check.message);
  }

  const apiKey = getApiKey(model);
  const prompt = await buildPostGenerationPrompt(client, count);

  console.log('[AI Service] Gerando', count, 'posts para:', client.name);

  try {
    const response = await callOpenAI(prompt, apiKey!, 'posts');
    let parsedData = JSON.parse(cleanJsonResponse(response));
    
    let posts = Array.isArray(parsedData) ? parsedData : (parsedData.posts || []);
    
    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error('Nenhum post foi gerado. Tente novamente.');
    }
    
    return posts.map((post: any, index: number) => ({
      id: `post-${Date.now()}-${index}`,
      title: post.title || post.titulo || 'Sem título',
      type: post.type || post.tipo || 'Educativo',
      concept: post.concept || post.conceito || '',
      imagePrompt: post.imagePrompt || post.promptImagem || post.image_prompt || '',
      copy: post.copy || '',
      hashtags: post.hashtags || { core: [], opportunity: [], experimental: [] },
      cta: post.cta || '',
      justification: post.justification || post.justificativa || '',
      references: post.references || post.referencias || [],
      status: 'draft' as const,
      date: new Date().toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('[Posts] Erro:', error);
    throw error;
  }
};

const buildPostGenerationPrompt = async (client: ClientWorkspaceCard, count: number): Promise<string> => {
  const { settings, nicho } = client;
  
  const priorityTopics = settings.priorityTopics.length > 0 
    ? `TÓPICOS PRIORITÁRIOS: ${settings.priorityTopics.join(', ')}` 
    : '';
  const forbiddenWords = settings.forbiddenWords 
    ? `PALAVRAS PROIBIDAS: ${settings.forbiddenWords}` 
    : '';
  const requiredWords = settings.requiredWords 
    ? `PALAVRAS OBRIGATÓRIAS: ${settings.requiredWords}` 
    : '';
  const preferredCtas = settings.ctas.length > 0 
    ? `CTAs PREFERIDOS: ${settings.ctas.join(', ')}` 
    : '';

  return await getPrompt('posts', {
    CLIENT_NAME: client.name,
    NICHO: nicho,
    PERSONA: settings.persona || 'Não especificada',
    TONE: settings.tone.join(', ') || 'Profissional',
    OBJECTIVES: settings.objectives.join(', ') || 'Engajamento',
    CONTENT_TYPES: settings.contentTypes.join(', '),
    ACTIVE_DAYS: settings.selectedDays.join(', '),
    PRIORITY_TOPICS: priorityTopics,
    FORBIDDEN_WORDS: forbiddenWords,
    REQUIRED_WORDS: requiredWords,
    PREFERRED_CTAS: preferredCtas,
    COUNT: count,
    FIRST_CONTENT_TYPE: settings.contentTypes[0] || 'Educativo'
  });
};

// ============================================
// UTILIDADES
// ============================================

const callOpenAI = async (prompt: string, apiKey: string, context: string): Promise<string> => {
  console.log(`[OpenAI ${context}] Chamando API...`);
  
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
          content: 'Você é um especialista em marketing digital e análise de redes sociais. Responda SEMPRE e SOMENTE com JSON válido, sem markdown, sem explicações adicionais, sem blocos de código.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`[OpenAI ${context}] Erro:`, error);
    throw new Error(error.error?.message || 'Erro ao chamar OpenAI API');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log(`[OpenAI ${context}] Resposta recebida (${content.length} chars)`);
  
  return content;
};

const cleanJsonResponse = (response: string): string => {
  // Remove markdown code blocks se existirem
  let cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  // Tenta encontrar o JSON válido se houver texto extra
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  return cleaned;
};

const validateUsage = (usage: string): 'concorrente' | 'nicho' | 'cliente' => {
  if (['concorrente', 'nicho', 'cliente'].includes(usage)) {
    return usage as 'concorrente' | 'nicho' | 'cliente';
  }
  return 'nicho';
};

const validateLevel = (level: string): 'alta' | 'media' | 'baixa' => {
  const normalized = level?.toLowerCase();
  if (['alta', 'high', 'alto'].includes(normalized)) return 'alta';
  if (['baixa', 'low', 'baixo'].includes(normalized)) return 'baixa';
  return 'media';
};
