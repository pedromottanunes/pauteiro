/**
 * useResearchPipeline Hook
 * 
 * Hook customizado para gerenciar o pipeline de pesquisa profissional
 */

import { useState, useCallback, useRef } from 'react';
import { ResearchPipeline, executeResearch } from '../services/researchPipeline';
import { generateCompleteRecommendations } from '../services/strategicRecommendations';
import { 
  ResearchReport, 
  ResearchPipelineStatus, 
  ResearchConfig 
} from '../types/research';
import { getResearchApiKeys } from '../utils/apiKeys';
import { ClientWorkspaceCard } from '../types';

interface UseResearchPipelineOptions {
  config?: Partial<ResearchConfig>;
}

interface UseResearchPipelineResult {
  // Estado
  isRunning: boolean;
  status: ResearchPipelineStatus | null;
  report: ResearchReport | null;
  error: string | null;
  
  // Ações
  startResearch: (client: ClientWorkspaceCard) => Promise<ResearchReport | null>;
  cancelResearch: () => void;
  clearResults: () => void;
  
  // Verificações
  hasRequiredKeys: () => { valid: boolean; missing: string[] };
}

const createInitialStatus = (): ResearchPipelineStatus => ({
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
});

export const useResearchPipeline = (
  options: UseResearchPipelineOptions = {}
): UseResearchPipelineResult => {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<ResearchPipelineStatus | null>(null);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const pipelineRef = useRef<ResearchPipeline | null>(null);

  /**
   * Verifica se as API keys necessárias estão configuradas
   */
  const hasRequiredKeys = useCallback(() => {
    const keys = getResearchApiKeys();
    const missing: string[] = [];

    // OpenAI é obrigatório para processamento e recomendações
    if (!keys.openAi) {
      missing.push('OpenAI (obrigatório)');
    }

    // SerpAPI é opcional mas recomendado
    if (!keys.serpApi) {
      missing.push('SerpAPI (opcional - para busca real)');
    }

    // Apify é opcional mas recomendado
    if (!keys.apify) {
      missing.push('Apify (opcional - para scraping de redes sociais)');
    }

    return {
      valid: !!keys.openAi, // Só precisa de OpenAI como obrigatório
      missing,
    };
  }, []);

  /**
   * Inicia o pipeline de pesquisa
   */
  const startResearch = useCallback(async (
    client: ClientWorkspaceCard
  ): Promise<ResearchReport | null> => {
    // Verifica keys
    const keyCheck = hasRequiredKeys();
    if (!keyCheck.valid) {
      setError(`API Keys necessárias não configuradas: ${keyCheck.missing.filter(m => m.includes('obrigatório')).join(', ')}`);
      return null;
    }

    // Extrai informações do cliente
    const clientName = client.name;
    const niche = client.settings?.persona || 'não especificado';
    const competitors = client.settings?.competitors || [];

    if (competitors.length === 0) {
      setError('Configure pelo menos um concorrente nas configurações do cliente');
      return null;
    }
    
    // Converte concorrentes para o formato esperado pelo pipeline
    const competitorNames = competitors.map(c => c.name);

    // Reseta estado
    setIsRunning(true);
    setError(null);
    setReport(null);
    setStatus(createInitialStatus());

    try {
      const apiKeys = getResearchApiKeys();
      
      // Cria e executa o pipeline
      const pipeline = new ResearchPipeline(
        {
          openAi: apiKeys.openAi,
          serpApi: apiKeys.serpApi,
          apify: apiKeys.apify,
        },
        options.config,
        (newStatus) => {
          setStatus({ ...newStatus });
        }
      );

      pipelineRef.current = pipeline;

      // Executa a pesquisa
      const result = await pipeline.execute(clientName, niche, competitorNames);

      // Adiciona recomendações estratégicas detalhadas
      result.strategicRecommendations = generateCompleteRecommendations(result);

      setReport(result);
      setIsRunning(false);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setIsRunning(false);
      return null;
    }
  }, [options.config, hasRequiredKeys]);

  /**
   * Cancela a pesquisa em andamento
   */
  const cancelResearch = useCallback(() => {
    if (pipelineRef.current) {
      pipelineRef.current.abort();
    }
    setIsRunning(false);
    setStatus(prev => prev ? { ...prev, currentPhase: 'idle', error: 'Cancelado pelo usuário' } : null);
  }, []);

  /**
   * Limpa os resultados
   */
  const clearResults = useCallback(() => {
    setReport(null);
    setStatus(null);
    setError(null);
  }, []);

  return {
    isRunning,
    status,
    report,
    error,
    startResearch,
    cancelResearch,
    clearResults,
    hasRequiredKeys,
  };
};

/**
 * Converte ResearchReport para o formato legado de dados de pesquisa
 * Para manter compatibilidade com a UI existente
 */
export const convertReportToLegacyFormat = (report: ResearchReport) => {
  // Converte concorrentes
  const competitors = report.competitors.map(c => ({
    name: c.name,
    followers: c.metrics?.instagramFollowers?.toString() || 'N/A',
    engagement: c.metrics?.instagramEngagementRate 
      ? `${c.metrics.instagramEngagementRate.toFixed(2)}%` 
      : 'N/A',
    posts_week: c.metrics?.postingFrequency?.postsPerWeek?.toFixed(1) || 'N/A',
    top_content: c.socialData?.instagram?.posts?.[0]?.caption?.substring(0, 50) || 'Não disponível',
  }));

  // Converte tendências
  const trends = report.nicheAnalysis.trends.map((trend, i) => ({
    name: trend,
    volume: Math.floor(Math.random() * 1000) + 500,
    growth: Math.floor(Math.random() * 30) + 5,
    opportunity: ['alta', 'media', 'baixa'][i % 3] as 'alta' | 'media' | 'baixa',
    saturation: ['baixa', 'media', 'alta'][i % 3] as 'baixa' | 'media' | 'alta',
  }));

  // Converte lacunas de conteúdo
  const thematicSummary = report.nicheAnalysis.contentGaps.map((gap, i) => ({
    topic: gap,
    coverage: ['baixa', 'media'][i % 2] as 'baixa' | 'media',
    recommendation: report.strategicRecommendations.contentRecommendations[i % report.strategicRecommendations.contentRecommendations.length]?.exampleIdeas[0] || 'Criar conteúdo sobre este tema',
  }));

  // Converte hashtags
  const hashtagRadar = report.nicheAnalysis.popularHashtags.slice(0, 8).map((tag, i) => ({
    hashtag: tag,
    volume: Math.floor(Math.random() * 50000) + 10000,
    usage: ['nicho', 'concorrente', 'cliente'][i % 3] as 'nicho' | 'concorrente' | 'cliente',
    competition: ['baixa', 'media', 'alta'][i % 3] as 'baixa' | 'media' | 'alta',
  }));

  return {
    competitors,
    trends,
    thematicSummary,
    hashtagRadar,
    // Dados expandidos do novo sistema
    fullReport: report,
  };
};

export default useResearchPipeline;
