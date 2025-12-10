/**
 * Web Search Service - Integração com SerpAPI
 * 
 * Este serviço realiza buscas reais no Google para coletar informações
 * sobre concorrentes, tendências de mercado e presença online.
 */

import { WebSearchResult, WebSearchResponse } from '../types/research';
import { getProxyToken } from '../utils/apiKeys';


const SERP_API_BASE = 'https://serpapi.com/search';
const GOOGLE_CSE_BASE = 'https://www.googleapis.com/customsearch/v1';
const BING_SEARCH_BASE = 'https://api.bing.microsoft.com/v7.0/search';

// If a local proxy is available at /api/search, prefer it to avoid exposing keys in the browser.
const PROXY_PATH = '/api/search';

const tryProxySearch = async (body: any) => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = getProxyToken();
      if (token) headers['x-proxy-token'] = token;
    } catch {}

    const resp = await fetch(PROXY_PATH, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      return null;
    }
    const json = await resp.json();
    // proxy returns { cached, data }
    return json.data || json;
  } catch (err) {
    console.warn('[WebSearch] proxy unavailable', err);
    return null;
  }
};

export interface SerpApiConfig {
  apiKey: string;
}

export interface GoogleCseConfig {
  apiKey: string;
  cx: string;
}

export interface BingSearchConfig {
  apiKey: string;
}

/**
 * Realiza uma busca no Google via SerpAPI
 */
export const searchGoogle = async (
  query: string,
  apiKey: string,
  options: {
    num?: number;
    location?: string;
    language?: string;
  } = {}
): Promise<WebSearchResponse> => {
  const { num = 10, location = 'Brazil', language = 'pt-br' } = options;

  console.log(`[WebSearch] 🔍 Buscando: "${query}"`);

  // Prefer proxy if available
  const proxyResp = await tryProxySearch({ provider: 'serpapi', query, num, location, language });
  if (proxyResp) {
    const data = proxyResp;
    return {
      query,
      totalResults: data.search_information?.total_results || 0,
      results: (data.organic_results || []).map((result: any, index: number) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet || '',
        position: index + 1,
        source: result.source || (result.link ? new URL(result.link).hostname : ''),
      })),
      relatedSearches: data.related_searches?.map((r: any) => r.query) || [],
      knowledgeGraph: data.knowledge_graph ? {
        title: data.knowledge_graph.title,
        description: data.knowledge_graph.description,
        website: data.knowledge_graph.website,
        socialProfiles: data.knowledge_graph.profiles?.map((p: any) => ({
          platform: p.name,
          url: p.link,
        })),
      } : undefined,
    };
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    q: query,
    location,
    hl: language,
    gl: 'br',
    num: num.toString(),
    engine: 'google',
  });

  try {
    const response = await fetch(`${SERP_API_BASE}?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `SerpAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`[WebSearch] ✅ Encontrados ${data.organic_results?.length || 0} resultados`);

    return {
      query,
      totalResults: data.search_information?.total_results || 0,
      results: (data.organic_results || []).map((result: any, index: number) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet || '',
        position: index + 1,
        source: result.source || new URL(result.link).hostname,
      })),
      relatedSearches: data.related_searches?.map((r: any) => r.query) || [],
      knowledgeGraph: data.knowledge_graph ? {
        title: data.knowledge_graph.title,
        description: data.knowledge_graph.description,
        website: data.knowledge_graph.website,
        socialProfiles: data.knowledge_graph.profiles?.map((p: any) => ({
          platform: p.name,
          url: p.link,
        })),
      } : undefined,
    };
  } catch (error) {
    console.error('[WebSearch] ❌ Erro:', error);
    throw error;
  }
};

/**
 * Realiza uma busca usando Google Custom Search (CSE)
 */
export const searchGoogleCse = async (
  query: string,
  config: GoogleCseConfig,
  options: { num?: number; language?: string } = {}
): Promise<WebSearchResponse> => {
  const { num = 10, language = 'pt-BR' } = options;
  console.log(`[WebSearch] 🔍 (CSE) Buscando: "${query}"`);

  const params = new URLSearchParams({
    key: config.apiKey,
    cx: config.cx,
    q: query,
    num: num.toString(),
  });

  if (language) {
    params.set('lr', `lang_${language.split('-')[0]}`);
  }

  try {
    const proxyResp = await tryProxySearch({ provider: 'googlecse', query, num, cx: config.cx });
    if (proxyResp) {
      const data = proxyResp;
      const items = data.items || [];
      return {
        query,
        totalResults: Number(data.searchInformation?.totalResults || 0),
        results: items.map((item: any, index: number) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet || item.htmlSnippet || '',
          position: index + 1,
          source: item.link ? new URL(item.link).hostname : '',
        })),
        relatedSearches: data.queries?.relatedSearches?.map((r: any) => r.query) || [],
      };
    }

    const response = await fetch(`${GOOGLE_CSE_BASE}?${params}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Google CSE error: ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || [];

    return {
      query,
      totalResults: Number(data.searchInformation?.totalResults || 0),
      results: items.map((item: any, index: number) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet || item.htmlSnippet || '',
        position: index + 1,
        source: new URL(item.link).hostname,
      })),
      relatedSearches: data.queries?.relatedSearches?.map((r: any) => r.query) || [],
    };
  } catch (error) {
    console.error('[WebSearch] ❌ Erro CSE:', error);
    throw error;
  }
};

/**
 * Realiza uma busca usando Bing Web Search
 */
export const searchBingWeb = async (
  query: string,
  config: BingSearchConfig,
  options: { count?: number; market?: string } = {}
): Promise<WebSearchResponse> => {
  const { count = 10, market = 'pt-BR' } = options;
  console.log(`[WebSearch] 🔍 (Bing) Buscando: "${query}"`);

  const params = new URLSearchParams({
    q: query,
    count: count.toString(),
    mkt: market,
    responseFilter: 'Webpages,News',
    textDecorations: 'false',
  });

  try {
    const proxyResp = await tryProxySearch({ provider: 'bing', query, num: count });
    if (proxyResp) {
      const data = proxyResp;
      const webResults = data.webPages?.value || [];
      const newsResults = data.news?.value || [];
      const merged = [...webResults, ...newsResults].slice(0, count);
      return {
        query,
        totalResults: Number(data.webPages?.totalEstimatedMatches || merged.length),
        results: merged.map((item: any, index: number) => ({
          title: item.name || item.title,
          link: item.url || item.webSearchUrl,
          snippet: item.snippet || item.description || '',
          position: index + 1,
          source: item.displayUrl ? new URL(`https://${item.displayUrl}`).hostname : (item.url ? new URL(item.url).hostname : 'bing'),
        })),
        relatedSearches: data.relatedSearches?.map((r: any) => r.text) || [],
      };
    }

    const response = await fetch(`${BING_SEARCH_BASE}?${params}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Bing Search error: ${response.status}`);
    }

    const data = await response.json();
    const webResults = data.webPages?.value || [];
    const newsResults = data.news?.value || [];
    const merged = [...webResults, ...newsResults].slice(0, count);

    return {
      query,
      totalResults: Number(data.webPages?.totalEstimatedMatches || merged.length),
      results: merged.map((item: any, index: number) => ({
        title: item.name || item.title,
        link: item.url || item.webSearchUrl,
        snippet: item.snippet || item.description || '',
        position: index + 1,
        source: item.displayUrl ? new URL(`https://${item.displayUrl}`).hostname : (item.url ? new URL(item.url).hostname : 'bing'),
      })),
      relatedSearches: data.relatedSearches?.map((r: any) => r.text) || [],
    };
  } catch (error) {
    console.error('[WebSearch] ❌ Erro Bing:', error);
    throw error;
  }
};

/**
 * Busca informações sobre um concorrente
 */
export const searchCompetitor = async (
  competitorName: string,
  niche: string,
  apiKey: string
): Promise<{
  general: WebSearchResponse;
  instagram: WebSearchResponse;
  news: WebSearchResponse;
}> => {
  console.log(`[WebSearch] 🏢 Pesquisando concorrente: ${competitorName}`);

  // Executa múltiplas buscas em paralelo
  const [general, instagram, news] = await Promise.all([
    // Busca geral sobre a empresa
    searchGoogle(`${competitorName} ${niche}`, apiKey, { num: 10 }),
    
    // Busca específica para Instagram
    searchGoogle(`${competitorName} instagram`, apiKey, { num: 5 }),
    
    // Busca por notícias recentes
    searchGoogle(`${competitorName} notícias recentes`, apiKey, { num: 5 }),
  ]);

  return { general, instagram, news };
};

/**
 * Busca tendências de um nicho
 */
export const searchNicheTrends = async (
  niche: string,
  apiKey: string
): Promise<{
  trends: WebSearchResponse;
  hashtags: WebSearchResponse;
  content: WebSearchResponse;
}> => {
  console.log(`[WebSearch] 📈 Pesquisando tendências do nicho: ${niche}`);

  const [trends, hashtags, content] = await Promise.all([
    searchGoogle(`${niche} tendências 2024 2025`, apiKey, { num: 10 }),
    searchGoogle(`${niche} melhores hashtags instagram`, apiKey, { num: 10 }),
    searchGoogle(`${niche} ideias de conteúdo redes sociais`, apiKey, { num: 10 }),
  ]);

  return { trends, hashtags, content };
};

/**
 * Extrai perfis de redes sociais dos resultados de busca
 */
export const extractSocialProfiles = (searchResults: WebSearchResult[]): {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
} => {
  const profiles: Record<string, string> = {};

  for (const result of searchResults) {
    const url = result.link.toLowerCase();
    
    if (url.includes('instagram.com') && !profiles.instagram) {
      profiles.instagram = result.link;
    }
    if (url.includes('facebook.com') && !profiles.facebook) {
      profiles.facebook = result.link;
    }
    if (url.includes('linkedin.com') && !profiles.linkedin) {
      profiles.linkedin = result.link;
    }
    if (url.includes('tiktok.com') && !profiles.tiktok) {
      profiles.tiktok = result.link;
    }
    if (url.includes('youtube.com') && !profiles.youtube) {
      profiles.youtube = result.link;
    }
  }

  return profiles;
};

/**
 * Verifica se a API key do SerpAPI é válida
 */
export const validateSerpApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Faz uma busca simples para testar
    const params = new URLSearchParams({
      api_key: apiKey,
      q: 'test',
      num: '1',
      engine: 'google',
    });

    const response = await fetch(`${SERP_API_BASE}?${params}`);
    return response.ok;
  } catch {
    return false;
  }
};
