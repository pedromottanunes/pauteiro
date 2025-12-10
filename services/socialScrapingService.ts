/**
 * Social Media Scraping Service - Integração Real com Apify Instagram Scraper
 * 
 * Este serviço integra com o Instagram Scraper oficial da Apify.
 * Actor ID: apify/instagram-scraper
 * 
 * Documentação: https://apify.com/apify/instagram-scraper
 * 
 * Capacidades:
 * - Scrape posts de perfis
 * - Scrape detalhes de perfis
 * - Scrape hashtags
 * - Scrape comentários
 * - Scrape posts com tagged mentions
 * 
 * Preço: $2.30 para 1,000 posts (pay-per-result)
 * Plano recomendado: $49/mês (21,000 posts/mês)
 */

import {
  InstagramPost,
  InstagramProfile,
  FacebookPost,
  FacebookPage,
  SocialMediaData,
} from '../types/research';

const APIFY_API_BASE = 'https://api.apify.com/v2';

// Instagram Scraper oficial da Apify
// Pode ser usado tanto o formato username~actorname quanto o actorId direto
export const INSTAGRAM_SCRAPER_ACTOR = 'apify/instagram-scraper';
export const INSTAGRAM_SCRAPER_ACTOR_ALT = 'shu8hvrXbJbY3Eb9W'; // Actor ID alternativo

export interface ApifyConfig {
  apiKey: string;
}

// Tipos retornados pela API Apify Instagram Scraper
interface ApifyInstagramPost {
  type: 'Image' | 'Video' | 'Sidecar';
  shortCode: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  url: string;
  commentsCount: number;
  dimensionsHeight: number;
  dimensionsWidth: number;
  displayUrl: string;
  images: string[];
  videoUrl?: string;
  alt: string;
  likesCount: number;
  timestamp: string;
  locationName?: string;
  ownerFullName?: string;
  ownerUsername: string;
  ownerId: string;
  productType?: string;
  videoDuration?: number;
  videoViewCount?: number;
}

interface ApifyInstagramProfile {
  id: string;
  username: string;
  fullName: string;
  biography: string;
  externalUrl?: string;
  externalUrlShimmed?: string;
  followersCount: number;
  followsCount: number;
  hasChannel: boolean;
  highlightReelCount: number;
  isBusinessAccount: boolean;
  joinedRecently: boolean;
  businessCategoryName?: string;
  private: boolean;
  verified: boolean;
  profilePicUrl: string;
  profilePicUrlHD: string;
  facebookPage?: string;
  igtvVideoCount: number;
  relatedProfiles: any[];
  latestIgtvVideos: any[];
  postsCount: number;
  latestPosts?: ApifyInstagramPost[];
}

type InstagramResultsType = 'posts' | 'details' | 'comments';

interface InstagramInputOptions {
  username?: string;
  resultsType: InstagramResultsType;
  limit: number;
  searchType?: 'hashtag' | 'user';
  searchQuery?: string;
}

const buildInstagramInput = ({
  username,
  resultsType,
  limit,
  searchType,
  searchQuery,
}: InstagramInputOptions) => {
  // Input para busca (hashtag ou user)
  if (searchType && searchQuery) {
    return {
      directUrls: [],
      resultsType,
      resultsLimit: limit,
      search: searchQuery,
      searchType,
      searchLimit: 5,
      addParentData: false,
    };
  }

  // Input para URL direta
  if (!username) {
    throw new Error('username é obrigatório para o input direto do Instagram');
  }

  // Formato de URL que funciona melhor com o scraper
  const instagramUrl = `https://www.instagram.com/${username.replace('@', '')}/`;
  
  return {
    directUrls: [instagramUrl],
    resultsType,
    resultsLimit: limit,
    search: '',
    searchType: '',
    searchLimit: 0,
    addParentData: false,
  };
};

const tryInstagramRun = async <T>(
  username: string,
  apiKey: string,
  options: {
    resultsType: InstagramResultsType;
    limit: number;
    timeout?: number;
    allowSearchFallback?: boolean;
  }
): Promise<T[]> => {
  const { resultsType, limit, timeout = 240000, allowSearchFallback = true } = options;
  const cleanUsername = username.replace('@', '');

  // Tentativa 1: URL direta
  try {
    console.log(`[Apify] 🎯 Tentativa 1: URL direta para @${cleanUsername} (${resultsType})`);
    const directInput = buildInstagramInput({ username: cleanUsername, resultsType, limit });
    
    const results = await runApifyActor<T>(INSTAGRAM_SCRAPER_ACTOR, directInput, apiKey, { timeout });
    
    if (results.length === 0) {
      console.warn(`[Apify] ⚠️ URL direta retornou 0 resultados para @${cleanUsername}`);
      throw new Error(`No results from direct URL for @${cleanUsername}`);
    }
    
    console.log(`[Apify] ✅ URL direta funcionou: ${results.length} resultados`);
    return results;
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[Apify] ⚠️ Erro na URL direta para @${cleanUsername}:`, errorMsg);

    if (!allowSearchFallback) {
      console.error(`[Apify] ❌ Fallback desabilitado, abortando`);
      throw error;
    }

    // Tentativa 2: Busca por usuário
    console.log(`[Apify] 🔁 Tentativa 2: Busca por usuário "${cleanUsername}"`);
    
    try {
      const searchInput = buildInstagramInput({
        resultsType,
        limit,
        searchType: 'user',
        searchQuery: cleanUsername,
      });
      
      const searchResults = await runApifyActor<T>(INSTAGRAM_SCRAPER_ACTOR, searchInput, apiKey, { timeout });
      
      if (searchResults.length === 0) {
        console.error(`[Apify] ❌ Busca também retornou 0 resultados`);
        throw new Error(`No results from search either for @${cleanUsername}`);
      }
      
      console.log(`[Apify] ✅ Busca funcionou: ${searchResults.length} resultados`);
      return searchResults;
      
    } catch (searchError) {
      const searchErrorMsg = searchError instanceof Error ? searchError.message : String(searchError);
      console.error(`[Apify] ❌ Ambas tentativas falharam para @${cleanUsername}`);
      console.error(`[Apify]    - URL direta: ${errorMsg}`);
      console.error(`[Apify]    - Busca: ${searchErrorMsg}`);
      
      throw new Error(
        `Failed to scrape @${cleanUsername} with both methods. ` +
        `Direct URL: ${errorMsg}. Search: ${searchErrorMsg}`
      );
    }
  }
};

/**
 * Executa um actor do Apify e aguarda o resultado usando polling
 * 
 * Esta versão usa polling ao invés de waitForFinish para evitar timeouts do navegador.
 * O navegador tem limites de timeout mais curtos que o waitForFinish da Apify.
 */
export const runApifyActor = async <T>(
  actorId: string,
  input: Record<string, any>,
  apiKey: string,
  options: {
    timeout?: number;
    pollInterval?: number;
  } = {}
): Promise<T[]> => {
  const { timeout = 300000, pollInterval = 3000 } = options; // 5 min timeout, poll a cada 3s

  // Validação de parâmetros
  if (!actorId) throw new Error('actorId é obrigatório');
  if (!apiKey) throw new Error('apiKey é obrigatório');
  if (!input) throw new Error('input é obrigatório');

  console.log(`[Apify] 🚀 Iniciando actor: ${actorId}`);
  console.log(`[Apify] 🔑 API Key: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`[Apify] 📋 Input:`, JSON.stringify(input, null, 2));

  let startResponse: Response;

  try {
    // 1. INICIAR O RUN (sem waitForFinish para evitar timeout do navegador)
    const startUrl = `${APIFY_API_BASE}/acts/${encodeURIComponent(actorId)}/runs?token=${encodeURIComponent(apiKey)}`;
    
    console.log(`[Apify] 📤 Iniciando run...`);
    console.log(`[Apify] 🔗 URL (masked): ${APIFY_API_BASE}/acts/${actorId}/runs?token=HIDDEN`);
    
    try {
      startResponse = await fetch(startUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(input),
      });
    } catch (fetchError) {
      // Erro de rede específico
      console.error(`[Apify] ❌ ERRO DE REDE ao fazer fetch:`, fetchError);
      console.error(`[Apify] 💡 Possíveis causas:`);
      console.error(`[Apify]    - Sem conexão com internet`);
      console.error(`[Apify]    - Bloqueio de firewall/proxy`);
      console.error(`[Apify]    - Extensão do navegador bloqueando requests`);
      console.error(`[Apify]    - API Key com caracteres inválidos`);
      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
    }

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { error: { message: errorText } };
      }
      console.error(`[Apify] ❌ Erro ao iniciar run (${startResponse.status}):`, errorJson);
      throw new Error(`Apify start error (${startResponse.status}): ${errorJson.error?.message || errorText}`);
    }

    const startData = await startResponse.json();
    const runId = startData.data?.id;
    
    if (!runId) {
      console.error(`[Apify] ❌ Resposta inválida - sem Run ID:`, startData);
      throw new Error('Apify não retornou Run ID');
    }

    console.log(`[Apify] 📝 Run ID: ${runId}`);
    console.log(`[Apify] 🔗 Console: https://console.apify.com/actors/runs/${runId}`);
    console.log(`[Apify] ⏳ Aguardando conclusão... (timeout: ${timeout/1000}s, poll: ${pollInterval/1000}s)`);

    // 2. POLLING PARA VERIFICAR STATUS
    const startTime = Date.now();
    let lastStatus = '';
    let runData: any = null;

    while (Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusUrl = `${APIFY_API_BASE}/actor-runs/${runId}?token=${encodeURIComponent(apiKey)}`;
      const statusResponse = await fetch(statusUrl, {
        headers: { 'Accept': 'application/json' },
      });
      
      if (!statusResponse.ok) {
        console.warn(`[Apify] ⚠️ Erro ao checar status (${statusResponse.status}), tentando novamente...`);
        continue;
      }

      runData = await statusResponse.json();
      const status = runData.data?.status;

      if (status !== lastStatus) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`[Apify] 📊 Status: ${status} (${elapsed}s)`);
        lastStatus = status;
      }

      // Verifica se terminou
      if (status === 'SUCCEEDED') {
        console.log(`[Apify] ✅ Run concluído com sucesso!`);
        break;
      }

      if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        console.error(`[Apify] ❌ Run falhou: ${status}`);
        console.error(`[Apify] 🔗 Logs: https://console.apify.com/actors/runs/${runId}`);
        throw new Error(`Actor run ${status}. Run ID: ${runId}`);
      }
    }

    // Timeout do nosso lado
    if (!runData || runData.data?.status !== 'SUCCEEDED') {
      console.error(`[Apify] ❌ Timeout após ${timeout/1000}s. Status: ${runData?.data?.status || 'UNKNOWN'}`);
      throw new Error(`Timeout aguardando Apify. Run ID: ${runId}`);
    }

    // 3. BUSCAR RESULTADOS DO DATASET
    const datasetId = runData.data?.defaultDatasetId;
    
    if (!datasetId) {
      console.warn(`[Apify] ⚠️ Nenhum dataset ID`);
      return [];
    }

    console.log(`[Apify] 🗄️ Dataset ID: ${datasetId}`);
    
    const resultsUrl = `${APIFY_API_BASE}/datasets/${datasetId}/items?token=${encodeURIComponent(apiKey)}`;
    const resultsResponse = await fetch(resultsUrl, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (!resultsResponse.ok) {
      const errorText = await resultsResponse.text();
      console.error(`[Apify] ❌ Erro ao buscar resultados (${resultsResponse.status}):`, errorText);
      throw new Error(`Failed to fetch results: ${resultsResponse.status}`);
    }

    const results = await resultsResponse.json();
    console.log(`[Apify] ✅ Coletados ${results.length} itens`);
    
    if (results.length > 0) {
      console.log(`[Apify] 🔍 Amostra:`, JSON.stringify(results[0], null, 2).substring(0, 300));
    } else {
      console.warn(`[Apify] ⚠️ Dataset vazio`);
    }
    
    return results as T[];
    
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`[Apify] ❌ Erro de rede/CORS:`, error);
      throw new Error('Falha de conexão com Apify. Verifique sua conexão de internet.');
    }
    console.error(`[Apify] ❌ Erro:`, error);
    throw error;
  }
};

/**
 * Coleta perfil completo do Instagram com posts
 */
export const scrapeInstagramProfile = async (
  username: string,
  apiKey: string,
  options: {
    postsLimit?: number;
  } = {}
): Promise<{ profile: InstagramProfile; posts: InstagramPost[] }> => {
  const { postsLimit = 12 } = options;

  console.log(`[Apify] 📸 Coletando perfil Instagram: @${username}`);

  const detailResults = await tryInstagramRun<ApifyInstagramProfile>(
    username,
    apiKey,
    {
      resultsType: 'details',
      limit: postsLimit,
      timeout: 180000,
    }
  );

  if (detailResults.length === 0) {
    throw new Error(`Perfil @${username} não encontrado ou é privado`);
  }

  const data = detailResults[0];

  // Converte para nosso formato
  const profile: InstagramProfile = {
    username: data.username,
    fullName: data.fullName || '',
    bio: data.biography || '',
    followersCount: data.followersCount || 0,
    followingCount: data.followsCount || 0,
    postsCount: data.postsCount || 0,
    profilePicUrl: data.profilePicUrl || data.profilePicUrlHD || '',
    isVerified: data.verified || false,
    isBusinessAccount: data.isBusinessAccount || false,
    category: data.businessCategoryName,
    website: data.externalUrl,
  };

  let postsSource: ApifyInstagramPost[] = data.latestPosts || [];

  // Se vieram poucos posts nos detalhes, faz uma coleta específica
  if (postsSource.length < postsLimit) {
    try {
      const postsResults = await tryInstagramRun<ApifyInstagramPost>(
        username,
        apiKey,
        {
          resultsType: 'posts',
          limit: postsLimit,
          timeout: 240000,
        }
      );
      if (postsResults.length > 0) {
        postsSource = postsResults;
      }
    } catch (postError) {
      console.warn(`[Apify] ⚠️ Não foi possível coletar posts extras de @${username}:`, postError);
    }
  }

  const posts: InstagramPost[] = postsSource.map((post: ApifyInstagramPost) => ({
    id: post.shortCode,
    shortcode: post.shortCode,
    caption: post.caption || '',
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    timestamp: post.timestamp,
    mediaType: post.type === 'Video' ? 'video' : post.type === 'Sidecar' ? 'carousel' : 'image',
    mediaUrl: post.displayUrl || post.url,
    thumbnailUrl: post.displayUrl,
    hashtags: post.hashtags || extractHashtags(post.caption || ''),
    mentions: post.mentions || extractMentions(post.caption || ''),
    ownerUsername: post.ownerUsername,
  }));

  console.log(`[Apify] ✅ Perfil coletado: ${posts.length} posts`);

  return { profile, posts };
};

/**
 * Coleta posts do Instagram de um perfil
 */
export const scrapeInstagramPosts = async (
  username: string,
  apiKey: string,
  options: {
    limit?: number;
  } = {}
): Promise<InstagramPost[]> => {
  const { limit = 20 } = options;

  console.log(`[Apify] 📷 Coletando posts de @${username} (limite: ${limit})`);

  const results = await tryInstagramRun<ApifyInstagramPost>(
    username,
    apiKey,
    {
      resultsType: 'posts',
      limit,
      timeout: 240000,
    }
  );

  return results.map((post) => ({
    id: post.shortCode,
    shortcode: post.shortCode,
    caption: post.caption || '',
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    timestamp: post.timestamp,
    mediaType: post.type === 'Video' ? 'video' : post.type === 'Sidecar' ? 'carousel' : 'image',
    mediaUrl: post.displayUrl || post.url,
    thumbnailUrl: post.displayUrl,
    hashtags: post.hashtags || extractHashtags(post.caption || ''),
    mentions: post.mentions || extractMentions(post.caption || ''),
    ownerUsername: post.ownerUsername,
  }));
};

/**
 * Coleta posts de uma hashtag no Instagram
 */
export const scrapeInstagramHashtag = async (
  hashtag: string,
  apiKey: string,
  options: {
    limit?: number;
  } = {}
): Promise<InstagramPost[]> => {
  const { limit = 30 } = options;
  const cleanHashtag = hashtag.replace('#', '');

  console.log(`[Apify] #️⃣ Coletando hashtag: #${cleanHashtag} (limite: ${limit})`);

  const input = {
    search: cleanHashtag,
    searchType: 'hashtag',
    searchLimit: limit,
    resultsType: 'posts',
    resultsLimit: limit,
    directUrls: [],
  };

  const results = await runApifyActor<ApifyInstagramPost>(
    INSTAGRAM_SCRAPER_ACTOR,
    input,
    apiKey,
    { timeout: 300000 } // 5 minutos para hashtags
  );

  return results.map((post) => ({
    id: post.shortCode,
    shortcode: post.shortCode,
    caption: post.caption || '',
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    timestamp: post.timestamp,
    mediaType: post.type === 'Video' ? 'video' : post.type === 'Sidecar' ? 'carousel' : 'image',
    mediaUrl: post.displayUrl || post.url,
    thumbnailUrl: post.displayUrl,
    hashtags: post.hashtags || extractHashtags(post.caption || ''),
    mentions: post.mentions || extractMentions(post.caption || ''),
    ownerUsername: post.ownerUsername,
  }));
};

/**
 * Coleta página do Facebook (NOT IMPLEMENTED - requer outro Actor da Apify)
 */
export const scrapeFacebookPage = async (
  pageUrl: string,
  apiKey: string
): Promise<FacebookPage> => {
  console.log(`[Apify] 📘 Facebook scraping não implementado nesta versão`);
  
  // Facebook requer outro actor específico da Apify
  // Usuário deve configurar qual actor usar para Facebook
  throw new Error('Facebook scraping não implementado. Configure o Actor do Facebook na Apify Store.');
};

/**
 * Coleta posts de uma página do Facebook (NOT IMPLEMENTED)
 */
export const scrapeFacebookPosts = async (
  pageUrl: string,
  apiKey: string,
  options: {
    limit?: number;
  } = {}
): Promise<FacebookPost[]> => {
  console.log(`[Apify] 📝 Facebook scraping não implementado nesta versão`);
  throw new Error('Facebook scraping não implementado. Configure o Actor do Facebook na Apify Store.');
};

/**
 * Coleta dados completos de um concorrente nas redes sociais
 */
export const scrapeCompetitorSocial = async (
  competitorName: string,
  socialProfiles: {
    instagram?: string;
    facebook?: string;
  },
  apiKey: string,
  options: {
    instagramPostsLimit?: number;
    facebookPostsLimit?: number;
  } = {}
): Promise<SocialMediaData> => {
  const { instagramPostsLimit = 20 } = options;

  console.log(`[Apify] 🔍 Coletando dados sociais de: ${competitorName}`);

  const result: SocialMediaData = {};

  // Coleta Instagram se tiver o perfil
  if (socialProfiles.instagram) {
    const username = extractInstagramUsername(socialProfiles.instagram);
    if (username) {
      try {
        const { profile, posts } = await scrapeInstagramProfile(username, apiKey, {
          postsLimit: instagramPostsLimit
        });
        result.instagram = { profile, posts };
      } catch (error) {
        console.warn(`[Apify] ⚠️ Erro ao coletar Instagram @${username}:`, error);
      }
    }
  }

  // Facebook não implementado nesta versão
  if (socialProfiles.facebook) {
    console.log(`[Apify] 📘 Facebook scraping será adicionado em versão futura`);
  }

  return result;
};

/**
 * Valida a API key do Apify
 */
export const validateApifyKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${APIFY_API_BASE}/users/me?token=${apiKey}`
    );
    return response.ok;
  } catch {
    return false;
  }
};

// --- Funções utilitárias ---

/**
 * Extrai username do Instagram de uma URL
 */
export const extractInstagramUsername = (url: string): string | null => {
  const match = url.match(/instagram\.com\/([^/?]+)/);
  return match ? match[1] : null;
};

/**
 * Extrai hashtags de um texto
 */
export const extractHashtags = (text: string): string[] => {
  const matches = text.match(/#[\w\u00C0-\u017F]+/g);
  return matches ? matches.map(h => h.toLowerCase()) : [];
};

/**
 * Extrai menções de um texto
 */
export const extractMentions = (text: string): string[] => {
  const matches = text.match(/@[\w.]+/g);
  return matches ? matches.map(m => m.toLowerCase()) : [];
};

/**
 * Calcula engajamento médio de posts do Instagram
 */
export const calculateInstagramEngagement = (
  posts: InstagramPost[],
  followersCount: number
): number => {
  if (posts.length === 0 || followersCount === 0) return 0;

  const totalEngagement = posts.reduce(
    (sum, post) => sum + post.likesCount + post.commentsCount,
    0
  );
  const avgEngagement = totalEngagement / posts.length;
  return (avgEngagement / followersCount) * 100;
};

/**
 * Analisa frequência de postagem
 */
export const analyzePostingFrequency = (
  posts: (InstagramPost | FacebookPost)[]
): {
  postsPerWeek: number;
  postsPerMonth: number;
  mostActiveDay?: string;
  mostActiveHour?: number;
} => {
  if (posts.length < 2) {
    return { postsPerWeek: 0, postsPerMonth: 0 };
  }

  const timestamps = posts
    .filter(p => p.timestamp)
    .map(p => new Date(p.timestamp!).getTime())
    .sort((a, b) => b - a);

  if (timestamps.length < 2) {
    return { postsPerWeek: 0, postsPerMonth: 0 };
  }

  const newestPost = timestamps[0];
  const oldestPost = timestamps[timestamps.length - 1];
  const daysSpan = (newestPost - oldestPost) / (1000 * 60 * 60 * 24);

  const postsPerDay = posts.length / (daysSpan || 1);
  const postsPerWeek = postsPerDay * 7;
  const postsPerMonth = postsPerDay * 30;

  // Analisa dias mais ativos
  const dayCount: Record<string, number> = {};
  const hourCount: Record<number, number> = {};
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  for (const ts of timestamps) {
    const date = new Date(ts);
    const day = days[date.getDay()];
    const hour = date.getHours();

    dayCount[day] = (dayCount[day] || 0) + 1;
    hourCount[hour] = (hourCount[hour] || 0) + 1;
  }

  const mostActiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostActiveHour = parseInt(
    Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '0'
  );

  return {
    postsPerWeek: Math.round(postsPerWeek * 10) / 10,
    postsPerMonth: Math.round(postsPerMonth * 10) / 10,
    mostActiveDay,
    mostActiveHour,
  };
};
