import { searchGoogle, searchGoogleCse, searchBingWeb } from './webSearchService';
import { getResearchApiKeys } from '../utils/apiKeys';
import { WebSearchResponse } from '../types/research';

export interface AgentWebResearchOptions {
  niche: string;
  topics?: string[];
  competitors?: string[];
  limit?: number;
  language?: string;
  preferredProviders?: Array<'serpapi' | 'googlecse' | 'bing'>;
}

export interface AgentWebResearchResult {
  enabled: boolean;
  usedKey?: 'serpapi' | 'googlecse' | 'bing';
  searches: Array<{ query: string; results: WebSearchResponse }>;
}

/**
 * Executa pesquisa web básica usando SerpAPI (prioridade), com fallback para nada se não houver key.
 * Mantém interface simples: uma lista de queries e resultados estruturados.
 */
export const runAgentWebResearch = async (opts: AgentWebResearchOptions): Promise<AgentWebResearchResult> => {
  const { niche, topics = [], competitors = [], limit = 5, language = 'pt-br' } = opts;
  const keys = getResearchApiKeys();
  const hasSerp = !!keys.serpApi;
  const hasCse = !!keys.googleCseKey && !!keys.googleCseCx;
  const hasBing = !!keys.bingApiKey;

  // Determine provider order: prefer user-provided order, else default SerpAPI -> Google CSE -> Bing
  const order = opts.preferredProviders && opts.preferredProviders.length > 0
    ? opts.preferredProviders
    : ['serpapi', 'googlecse', 'bing'];

  const pickProvider = (): 'serpapi' | 'googlecse' | 'bing' | null => {
    for (const p of order) {
      if (p === 'serpapi' && hasSerp) return 'serpapi';
      if (p === 'googlecse' && hasCse) return 'googlecse';
      if (p === 'bing' && hasBing) return 'bing';
    }
    return null;
  };

  const provider = pickProvider();
  if (!provider) return { enabled: false, searches: [] };

  const search = async (query: string): Promise<WebSearchResponse> => {
    if (provider === 'serpapi' && keys.serpApi) {
      return searchGoogle(query, keys.serpApi, { num: limit, language });
    }
    if (provider === 'googlecse' && keys.googleCseKey && keys.googleCseCx) {
      return searchGoogleCse(query, { apiKey: keys.googleCseKey, cx: keys.googleCseCx }, { num: limit, language });
    }
    if (provider === 'bing' && keys.bingApiKey) {
      const market = language.includes('-') ? language.split('-').map((s, i) => i === 0 ? s.toLowerCase() : s.toUpperCase()).join('-') : language;
      return searchBingWeb(query, { apiKey: keys.bingApiKey }, { count: limit, market });
    }
    throw new Error('Nenhum provedor de busca configurado');
  };

  const baseQueries = new Set<string>();
  baseQueries.add(`${niche} novidades 2025`);
  baseQueries.add(`${niche} tendências 2025`);
  baseQueries.add(`${niche} melhores práticas`);

  topics.slice(0, 4).forEach(t => baseQueries.add(`${niche} ${t}`));
  competitors.slice(0, 4).forEach(c => baseQueries.add(`${c} novidades`));

  const queries = Array.from(baseQueries).slice(0, 6);

  const searches: Array<{ query: string; results: WebSearchResponse }> = [];
  for (const query of queries) {
    const results = await search(query);
    searches.push({ query, results });
  }

  return {
    enabled: true,
    usedKey: provider,
    searches,
  };
};

/**
 * Concatena resultados em texto curto para injeção em prompt.
 */
export const summarizeSearchResults = (payload: AgentWebResearchResult, maxPerQuery = 3): string => {
  if (!payload.enabled || payload.searches.length === 0) return '';
  const lines: string[] = [];
  lines.push(`Fonte: web search (${payload.usedKey || 'desconhecida'})`);
  payload.searches.forEach(({ query, results }) => {
    const top = (results.results || []).slice(0, maxPerQuery);
    lines.push(`\nQuery: ${query}`);
    top.forEach(r => {
      lines.push(`- ${r.title} (${r.source || r.link}): ${r.snippet || ''}`);
    });
  });
  return lines.join('\n');
};
