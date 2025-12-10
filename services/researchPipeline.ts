/**
 * Research Pipeline Orchestrator
 * 
 * Este é o orquestrador principal que coordena todas as etapas
 * da pesquisa profissional: Web Search, Social Scraping, Image Analysis
 * e geração de recomendações estratégicas.
 */

import {
  ResearchApiKeys,
  ResearchConfig,
  ResearchPipelineStatus,
  ResearchReport,
  CompetitorFullAnalysis,
  SocialMediaData,
  VisualAnalysisReport,
  StrategicRecommendations,
  DEFAULT_RESEARCH_CONFIG,
} from '../types/research';

import {
  searchCompetitor,
  searchNicheTrends,
  extractSocialProfiles,
} from './webSearchService';

import {
  scrapeCompetitorSocial,
  calculateInstagramEngagement,
  analyzePostingFrequency,
} from './socialScrapingService';

import {
  analyzeCompetitorVisuals,
  compareCompetitorVisuals,
} from './imageAnalysisService';

import { getPrompt } from '../utils/promptLoader';

type StatusUpdateCallback = (status: ResearchPipelineStatus) => void;

/**
 * Classe principal do Pipeline de Pesquisa
 */
export class ResearchPipeline {
  private apiKeys: ResearchApiKeys;
  private config: ResearchConfig;
  private status: ResearchPipelineStatus;
  private onStatusUpdate?: StatusUpdateCallback;
  private abortController: AbortController;

  constructor(
    apiKeys: ResearchApiKeys,
    config: Partial<ResearchConfig> = {},
    onStatusUpdate?: StatusUpdateCallback
  ) {
    this.apiKeys = apiKeys;
    this.config = { ...DEFAULT_RESEARCH_CONFIG, ...config };
    this.onStatusUpdate = onStatusUpdate;
    this.abortController = new AbortController();
    this.status = this.createInitialStatus();
  }

  private createInitialStatus(): ResearchPipelineStatus {
    return {
      currentPhase: 'idle',
      progress: 0,
      phases: {
        webSearch: { status: 'pending', progress: 0 },
        socialScraping: { status: 'pending', progress: 0 },
        imageAnalysis: { status: 'pending', progress: 0 },
        dataProcessing: { status: 'pending', progress: 0 },
        recommendations: { status: 'pending', progress: 0 },
      },
      startTime: new Date(),
      logs: [],
    };
  }

  private updateStatus(updates: Partial<ResearchPipelineStatus>) {
    this.status = { ...this.status, ...updates };
    this.onStatusUpdate?.(this.status);
  }

  private updatePhaseStatus(
    phase: keyof ResearchPipelineStatus['phases'],
    updates: Partial<ResearchPipelineStatus['phases'][typeof phase]>
  ) {
    this.status.phases[phase] = { ...this.status.phases[phase], ...updates };
    this.onStatusUpdate?.(this.status);
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const logEntry = { timestamp: new Date(), message, type };
    this.status.logs.push(logEntry);
    console.log(`[Pipeline] ${type.toUpperCase()}: ${message}`);
    this.onStatusUpdate?.(this.status);
  }

  /**
   * Cancela a pesquisa em andamento
   */
  public abort() {
    this.abortController.abort();
    this.log('Pesquisa cancelada pelo usuário', 'warning');
    this.updateStatus({ currentPhase: 'idle' });
  }

  /**
   * Executa o pipeline completo de pesquisa
   */
  public async execute(
    clientName: string,
    niche: string,
    competitors: string[]
  ): Promise<ResearchReport> {
    this.status = this.createInitialStatus();
    this.abortController = new AbortController();

    this.log(`Iniciando pesquisa para: ${clientName} (${niche})`);
    this.log(`Concorrentes a analisar: ${competitors.join(', ')}`);

    const report: ResearchReport = {
      clientName,
      niche,
      generatedAt: new Date(),
      competitors: [],
      nicheAnalysis: {
        trends: [],
        popularHashtags: [],
        contentGaps: [],
        marketSize: 'médio',
      },
      strategicRecommendations: {
        clientName,
        generatedAt: new Date(),
        currentSituation: '',
        strategicPaths: [],
        contentRecommendations: [],
        urgentActions: [],
        longTermGoals: [],
      },
    };

    try {
      // FASE 1: Web Search
      this.updateStatus({ currentPhase: 'webSearch', progress: 10 });
      this.updatePhaseStatus('webSearch', { status: 'running', progress: 0 });
      await this.executeWebSearchPhase(niche, competitors, report);
      this.updatePhaseStatus('webSearch', { status: 'completed', progress: 100 });

      // FASE 2: Social Scraping (se Apify configurado)
      this.updateStatus({ currentPhase: 'socialScraping', progress: 30 });
      this.updatePhaseStatus('socialScraping', { status: 'running', progress: 0 });
      await this.executeSocialScrapingPhase(report);
      this.updatePhaseStatus('socialScraping', { status: 'completed', progress: 100 });

      // FASE 3: Image Analysis (se OpenAI configurado e há imagens)
      this.updateStatus({ currentPhase: 'imageAnalysis', progress: 50 });
      this.updatePhaseStatus('imageAnalysis', { status: 'running', progress: 0 });
      await this.executeImageAnalysisPhase(report);
      this.updatePhaseStatus('imageAnalysis', { status: 'completed', progress: 100 });

      // FASE 4: Data Processing
      this.updateStatus({ currentPhase: 'dataProcessing', progress: 70 });
      this.updatePhaseStatus('dataProcessing', { status: 'running', progress: 0 });
      await this.executeDataProcessingPhase(report);
      this.updatePhaseStatus('dataProcessing', { status: 'completed', progress: 100 });

      // FASE 5: Strategic Recommendations
      this.updateStatus({ currentPhase: 'recommendations', progress: 85 });
      this.updatePhaseStatus('recommendations', { status: 'running', progress: 0 });
      await this.executeRecommendationsPhase(report);
      this.updatePhaseStatus('recommendations', { status: 'completed', progress: 100 });

      // Finalização
      this.updateStatus({ currentPhase: 'idle', progress: 100 });
      this.status.endTime = new Date();
      this.log('Pesquisa concluída com sucesso!', 'success');

      return report;
    } catch (error) {
      this.log(`Erro durante a pesquisa: ${error}`, 'error');
      this.status.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  /**
   * FASE 1: Web Search usando SerpAPI
   */
  private async executeWebSearchPhase(
    niche: string,
    competitors: string[],
    report: ResearchReport
  ): Promise<void> {
    this.log('Fase 1: Pesquisa na Web (SerpAPI)');

    if (!this.apiKeys.serpApi) {
      this.log('SerpAPI não configurado - usando dados simulados', 'warning');
      await this.simulateWebSearch(niche, competitors, report);
      return;
    }

    // Pesquisa tendências do nicho
    this.log(`Buscando tendências do nicho: ${niche}`);
    try {
      const nicheTrends = await searchNicheTrends(niche, this.apiKeys.serpApi);
      report.nicheAnalysis.trends = nicheTrends.trends.results
        .slice(0, 5)
        .map(r => r.title);
      this.updatePhaseStatus('webSearch', { progress: 20 });
    } catch (error) {
      this.log(`Erro ao buscar tendências: ${error}`, 'warning');
    }

    // Pesquisa cada concorrente
    for (let i = 0; i < competitors.length; i++) {
      const competitor = competitors[i];
      this.log(`Pesquisando concorrente: ${competitor}`);

      try {
        const searchResults = await searchCompetitor(competitor, niche, this.apiKeys.serpApi);
        
        // Extrai perfis sociais dos resultados de busca
        const socialProfiles = extractSocialProfiles([
          ...searchResults.general.results,
          ...searchResults.instagram.results,
        ]);

        const competitorAnalysis: CompetitorFullAnalysis = {
          name: competitor,
          website: searchResults.general.knowledgeGraph?.website,
          socialProfiles,
          webPresence: {
            searchResults: searchResults.general.results.slice(0, 5),
            newsResults: searchResults.news.results.slice(0, 3),
            knowledgeGraph: searchResults.general.knowledgeGraph,
          },
        };

        report.competitors.push(competitorAnalysis);
        this.updatePhaseStatus('webSearch', { 
          progress: 20 + ((i + 1) / competitors.length) * 80 
        });
      } catch (error) {
        this.log(`Erro ao pesquisar ${competitor}: ${error}`, 'warning');
        report.competitors.push({ name: competitor });
      }
    }
  }

  /**
   * Simula Web Search quando SerpAPI não está configurado
   */
  private async simulateWebSearch(
    niche: string,
    competitors: string[],
    report: ResearchReport
  ): Promise<void> {
    // Simula delay de busca
    await new Promise(resolve => setTimeout(resolve, 1000));

    report.nicheAnalysis.trends = [
      `Tendência 1 para ${niche} - Reels dominando engajamento`,
      `Tendência 2 para ${niche} - UGC em alta`,
      `Tendência 3 para ${niche} - Stories interativos`,
      `Tendência 4 para ${niche} - Carrosséis educativos`,
      `Tendência 5 para ${niche} - Live commerce`,
    ];

    for (const competitor of competitors) {
      report.competitors.push({
        name: competitor,
        socialProfiles: {
          instagram: `https://instagram.com/${competitor.toLowerCase().replace(/\s/g, '')}`,
        },
        webPresence: {
          searchResults: [
            {
              title: `${competitor} - Site Oficial`,
              link: `https://${competitor.toLowerCase().replace(/\s/g, '')}.com.br`,
              snippet: `Informações sobre ${competitor} no nicho de ${niche}`,
              position: 1,
              source: 'site oficial',
            },
          ],
        },
      });
    }

    this.updatePhaseStatus('webSearch', { progress: 100 });
  }

  /**
   * FASE 2: Social Media Scraping usando Apify
   */
  private async executeSocialScrapingPhase(report: ResearchReport): Promise<void> {
    this.log('Fase 2: Coleta de Dados das Redes Sociais (Apify)');

    if (!this.apiKeys.apify) {
      this.log('Apify não configurado - pulando coleta de redes sociais', 'warning');
      this.updatePhaseStatus('socialScraping', { progress: 100, message: 'Apify não configurado' });
      return;
    }

    for (let i = 0; i < report.competitors.length; i++) {
      const competitor = report.competitors[i];
      this.log(`Coletando dados sociais de: ${competitor.name}`);

      if (!competitor.socialProfiles?.instagram && !competitor.socialProfiles?.facebook) {
        this.log(`Nenhum perfil social encontrado para ${competitor.name}`, 'warning');
        continue;
      }

      try {
        const socialData = await scrapeCompetitorSocial(
          competitor.name,
          competitor.socialProfiles || {},
          this.apiKeys.apify,
          {
            instagramPostsLimit: this.config.maxPostsPerCompetitor,
            facebookPostsLimit: this.config.maxPostsPerCompetitor,
          }
        );

        competitor.socialData = socialData;

        // Calcula métricas do Instagram
        if (socialData.instagram) {
          const { profile, posts } = socialData.instagram;
          competitor.metrics = {
            instagramFollowers: profile.followersCount,
            instagramPosts: profile.postsCount,
            instagramEngagementRate: calculateInstagramEngagement(posts, profile.followersCount),
            postingFrequency: analyzePostingFrequency(posts),
          };
        }

        this.updatePhaseStatus('socialScraping', {
          progress: ((i + 1) / report.competitors.length) * 100,
        });
      } catch (error) {
        this.log(`Erro ao coletar dados de ${competitor.name}: ${error}`, 'warning');
      }
    }
  }

  /**
   * FASE 3: Image Analysis usando GPT-4 Vision
   */
  private async executeImageAnalysisPhase(report: ResearchReport): Promise<void> {
    this.log('Fase 3: Análise Visual (GPT-4 Vision)');

    if (!this.apiKeys.openAi) {
      this.log('OpenAI não configurado - pulando análise de imagens', 'warning');
      this.updatePhaseStatus('imageAnalysis', { progress: 100, message: 'OpenAI não configurado' });
      return;
    }

    if (!this.config.enableImageAnalysis) {
      this.log('Análise de imagens desabilitada nas configurações');
      this.updatePhaseStatus('imageAnalysis', { progress: 100, message: 'Desabilitado' });
      return;
    }

    const visualReports: VisualAnalysisReport[] = [];

    for (let i = 0; i < report.competitors.length; i++) {
      const competitor = report.competitors[i];
      const posts = competitor.socialData?.instagram?.posts || [];

      if (posts.length === 0) {
        this.log(`Sem posts para analisar de ${competitor.name}`, 'warning');
        continue;
      }

      this.log(`Analisando imagens de ${competitor.name} (${posts.length} posts)`);

      try {
        const visualReport = await analyzeCompetitorVisuals(
          competitor.name,
          posts,
          this.apiKeys.openAi,
          {
            maxImages: this.config.maxImagesPerCompetitor,
            onProgress: (completed, total) => {
              const baseProgress = (i / report.competitors.length) * 100;
              const competitorProgress = (completed / total) * (100 / report.competitors.length);
              this.updatePhaseStatus('imageAnalysis', {
                progress: baseProgress + competitorProgress,
              });
            },
          }
        );

        competitor.visualAnalysis = visualReport;
        visualReports.push(visualReport);
      } catch (error) {
        this.log(`Erro ao analisar imagens de ${competitor.name}: ${error}`, 'warning');
      }
    }

    // Comparação visual entre concorrentes
    if (visualReports.length > 1) {
      report.visualComparison = compareCompetitorVisuals(visualReports);
    }
  }

  /**
   * FASE 4: Processamento e Análise dos Dados
   */
  private async executeDataProcessingPhase(report: ResearchReport): Promise<void> {
    this.log('Fase 4: Processamento e Análise dos Dados');

    // Identifica lacunas de conteúdo
    report.nicheAnalysis.contentGaps = this.identifyContentGaps(report);
    this.updatePhaseStatus('dataProcessing', { progress: 33 });

    // Analisa hashtags populares
    report.nicheAnalysis.popularHashtags = this.analyzeHashtags(report);
    this.updatePhaseStatus('dataProcessing', { progress: 66 });

    // Estima tamanho do mercado baseado nos dados
    report.nicheAnalysis.marketSize = this.estimateMarketSize(report);
    this.updatePhaseStatus('dataProcessing', { progress: 100 });
  }

  /**
   * FASE 5: Geração de Recomendações Estratégicas
   */
  private async executeRecommendationsPhase(report: ResearchReport): Promise<void> {
    this.log('Fase 5: Geração de Recomendações Estratégicas');

    if (!this.apiKeys.openAi) {
      this.log('OpenAI não configurado - gerando recomendações básicas', 'warning');
      report.strategicRecommendations = this.generateBasicRecommendations(report);
      return;
    }

    try {
      report.strategicRecommendations = await this.generateAIRecommendations(report);
    } catch (error) {
      this.log(`Erro ao gerar recomendações com IA: ${error}`, 'warning');
      report.strategicRecommendations = this.generateBasicRecommendations(report);
    }
  }

  /**
   * Identifica lacunas de conteúdo baseado nos concorrentes
   */
  private identifyContentGaps(report: ResearchReport): string[] {
    const gaps: string[] = [];

    // Analisa tipos de conteúdo dos concorrentes
    const contentTypes: Record<string, number> = {};
    const allHashtags: string[] = [];

    for (const competitor of report.competitors) {
      const posts = competitor.socialData?.instagram?.posts || [];
      for (const post of posts) {
        if (post.hashtags) {
          allHashtags.push(...post.hashtags);
        }
        if (post.mediaType) {
          contentTypes[post.mediaType] = (contentTypes[post.mediaType] || 0) + 1;
        }
      }
    }

    // Identifica tipos de conteúdo sub-explorados
    const totalPosts = Object.values(contentTypes).reduce((a, b) => a + b, 0) || 1;
    if ((contentTypes.carousel || 0) / totalPosts < 0.2) {
      gaps.push('Carrosséis educativos - formato sub-explorado pelos concorrentes');
    }
    if ((contentTypes.video || 0) / totalPosts < 0.3) {
      gaps.push('Conteúdo em vídeo/Reels - oportunidade de diferenciação');
    }

    // Analisa horários de postagem
    const hasWeekendContent = report.competitors.some(c => {
      const posts = c.socialData?.instagram?.posts || [];
      return posts.some(p => {
        if (!p.timestamp) return false;
        const day = new Date(p.timestamp).getDay();
        return day === 0 || day === 6;
      });
    });
    if (!hasWeekendContent) {
      gaps.push('Conteúdo aos fins de semana - nicho pouco explorado');
    }

    // Analisa presença de Stories e Lives (inferido)
    gaps.push('Stories interativos - aumentam engajamento mas poucos usam bem');
    gaps.push('Lives e conteúdo ao vivo - oportunidade de conexão direta');

    return gaps.slice(0, 5);
  }

  /**
   * Analisa hashtags mais usadas pelos concorrentes
   */
  private analyzeHashtags(report: ResearchReport): string[] {
    const hashtagCount: Record<string, number> = {};

    for (const competitor of report.competitors) {
      const posts = competitor.socialData?.instagram?.posts || [];
      for (const post of posts) {
        for (const hashtag of post.hashtags || []) {
          hashtagCount[hashtag] = (hashtagCount[hashtag] || 0) + 1;
        }
      }
    }

    return Object.entries(hashtagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([hashtag]) => hashtag);
  }

  /**
   * Estima tamanho do mercado baseado nos dados coletados
   */
  private estimateMarketSize(report: ResearchReport): 'pequeno' | 'médio' | 'grande' {
    const totalFollowers = report.competitors.reduce(
      (sum, c) => sum + (c.metrics?.instagramFollowers || 0),
      0
    );

    if (totalFollowers > 1000000) return 'grande';
    if (totalFollowers > 100000) return 'médio';
    return 'pequeno';
  }

  /**
   * Gera recomendações básicas sem IA
   */
  private generateBasicRecommendations(report: ResearchReport): StrategicRecommendations {
    const competitors = report.competitors;
    const bestEngagement = competitors.reduce((best, c) => {
      const rate = c.metrics?.instagramEngagementRate || 0;
      return rate > (best?.rate || 0) ? { name: c.name, rate } : best;
    }, null as { name: string; rate: number } | null);

    return {
      clientName: report.clientName,
      generatedAt: new Date(),
      currentSituation: `Análise de ${competitors.length} concorrentes no nicho de ${report.niche}. ${bestEngagement ? `Maior taxa de engajamento: ${bestEngagement.name} (${bestEngagement.rate.toFixed(2)}%)` : ''}`,
      strategicPaths: [
        {
          name: 'Diferenciação Visual',
          description: 'Criar identidade visual única que se destaque dos concorrentes',
          difficulty: 'medium',
          timeToResults: '2-3 meses',
          requiredResources: ['Designer gráfico', 'Paleta de cores única', 'Templates personalizados'],
          expectedOutcomes: ['Reconhecimento de marca', 'Consistência visual', 'Profissionalismo percebido'],
          actionSteps: [
            'Definir paleta de cores exclusiva',
            'Criar templates de posts padronizados',
            'Desenvolver guia de estilo visual',
            'Implementar em todas as publicações',
          ],
        },
        {
          name: 'Domínio de Vídeo',
          description: 'Focar em conteúdo em vídeo (Reels/TikTok) para maximizar alcance',
          difficulty: 'medium',
          timeToResults: '1-2 meses',
          requiredResources: ['Equipamento de gravação', 'Editor de vídeo', 'Roteiros semanais'],
          expectedOutcomes: ['Aumento de alcance', 'Maior engajamento', 'Viralização potencial'],
          actionSteps: [
            'Criar calendário de Reels (3-5 por semana)',
            'Definir formatos que funcionam (tutorial, antes/depois, etc)',
            'Usar trends de áudio populares',
            'Otimizar legendas e hashtags para descoberta',
          ],
        },
        {
          name: 'Autoridade e Educação',
          description: 'Posicionar-se como especialista através de conteúdo educativo',
          difficulty: 'hard',
          timeToResults: '3-6 meses',
          requiredResources: ['Conhecimento especializado', 'Pesquisa contínua', 'Carrosséis educativos'],
          expectedOutcomes: ['Autoridade no nicho', 'Seguidores qualificados', 'Oportunidades de parceria'],
          actionSteps: [
            'Criar série de carrosséis "Como fazer"',
            'Compartilhar estudos de caso',
            'Responder dúvidas nos comentários',
            'Fazer lives educativas semanais',
          ],
        },
      ],
      contentRecommendations: [
        {
          type: 'reels',
          theme: 'Tutorial rápido',
          frequency: '3-4x por semana',
          bestTimes: ['12:00', '18:00', '21:00'],
          hashtags: report.nicheAnalysis.popularHashtags.slice(0, 10),
          exampleIdeas: [
            `Tutorial de 30 segundos sobre ${report.niche}`,
            'Antes e depois com transição',
            'Top 3 erros mais comuns',
            'Dica rápida do dia',
          ],
        },
        {
          type: 'carousel',
          theme: 'Conteúdo educativo',
          frequency: '2-3x por semana',
          bestTimes: ['09:00', '13:00', '19:00'],
          hashtags: report.nicheAnalysis.popularHashtags.slice(0, 10),
          exampleIdeas: [
            '5 passos para...',
            'Guia completo de...',
            'O que fazer vs O que não fazer',
            'Checklist essencial',
          ],
        },
        {
          type: 'stories',
          theme: 'Bastidores e interação',
          frequency: 'Diário',
          bestTimes: ['08:00', '12:00', '17:00', '21:00'],
          hashtags: [],
          exampleIdeas: [
            'Enquetes sobre preferências',
            'Caixinha de perguntas',
            'Bastidores do trabalho',
            'Contagem regressiva para lançamentos',
          ],
        },
      ],
      urgentActions: [
        'Auditar perfil atual e otimizar bio',
        'Criar primeiros 3 Reels esta semana',
        'Definir paleta de cores e fontes',
        'Pesquisar e listar 30 hashtags relevantes',
      ],
      longTermGoals: [
        'Alcançar 10k seguidores em 6 meses',
        'Estabelecer parcerias com 3 marcas do nicho',
        'Criar produto digital (ebook, curso)',
        'Lançar newsletter ou comunidade',
      ],
    };
  }

  /**
   * Gera recomendações usando IA (OpenAI)
   */
  private async generateAIRecommendations(report: ResearchReport): Promise<StrategicRecommendations> {
    this.log('Gerando recomendações estratégicas com IA...');

    // Prepara contexto para a IA
    const competitorsContext = report.competitors.map(c => ({
      nome: c.name,
      seguidores: c.metrics?.instagramFollowers || 'desconhecido',
      engajamento: c.metrics?.instagramEngagementRate?.toFixed(2) || 'desconhecido',
      frequenciaPostagem: c.metrics?.postingFrequency?.postsPerWeek || 'desconhecida',
      estilo: c.visualAnalysis?.preferredStyles?.join(', ') || 'não analisado',
      qualidadeVisual: c.visualAnalysis?.averageQualityScore?.toFixed(1) || 'não analisada',
    }));

    const visualLeaderText = report.visualComparison 
      ? `- Líder visual: ${report.visualComparison.visualLeader}` 
      : '';

    const prompt = await getPrompt('research-pipeline-recommendations', {
      CLIENT_NAME: report.clientName,
      NICHO: report.niche,
      COMPETITORS_CONTEXT: JSON.stringify(competitorsContext, null, 2),
      TRENDS: report.nicheAnalysis.trends.join(', '),
      CONTENT_GAPS: report.nicheAnalysis.contentGaps.join(', '),
      POPULAR_HASHTAGS: report.nicheAnalysis.popularHashtags.slice(0, 10).join(', '),
      VISUAL_LEADER: visualLeaderText
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKeys.openAi}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Você é um estrategista de marketing digital expert. Responda apenas em JSON válido.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = JSON.parse(data.choices[0].message.content);

    return {
      clientName: report.clientName,
      generatedAt: new Date(),
      ...recommendations,
    };
  }
}

/**
 * Função helper para executar pesquisa com configuração simples
 */
export const executeResearch = async (
  clientName: string,
  niche: string,
  competitors: string[],
  apiKeys: ResearchApiKeys,
  config?: Partial<ResearchConfig>,
  onStatusUpdate?: StatusUpdateCallback
): Promise<ResearchReport> => {
  const pipeline = new ResearchPipeline(apiKeys, config, onStatusUpdate);
  return pipeline.execute(clientName, niche, competitors);
};
