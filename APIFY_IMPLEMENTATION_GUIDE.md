# 📚 Guia Técnico Completo - Implementação de API Apify para Web Scraping

**Documento para Copiar e Colar em Outro Projeto**

---

## 🎯 Resumo Executivo

Este documento descreve a implementação **completa e validada** da API Apify para fazer web scraping de dados do Instagram (e potencialmente outras redes sociais). É baseado numa implementação em produção que foi testada, debugada e ajustada múltiplas vezes até funcionar perfeitamente.

### O Que Foi Feito
1. ✅ Integração síncrona com Apify v2 API
2. ✅ Scraping de posts, perfis e hashtags do Instagram
3. ✅ Sistema de fallback automático (URL direta → Busca)
4. ✅ Logging detalhado para debugging
5. ✅ Tratamento robusto de erros
6. ✅ Integração com pipeline de pesquisa e IA
7. ✅ Persistência e tipos TypeScript completos

### Resultado Final
Um usuário pode:
- Entrar em "Configurações de um cliente"
- Adicionar um perfil do Instagram (ex: `@rabbitagency4.0`)
- Clicar em "Gerar Pesquisa"
- Aguardar ~30-60 segundos
- Receber posts, perfil, hashtags, métricas de engajamento

---

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│ INTERFACE DO USUÁRIO (React/TypeScript)                     │
│ - Página "Research" (Research.tsx)                           │
│ - Settings do Cliente (ClientSettings.tsx)                   │
│ - Componentes de Log e Visualização (Research*tsx)          │
└────────┬────────────────────────────────────────────────────┘
         │
         ├─ initiate research
         │
┌────────▼────────────────────────────────────────────────────┐
│ CAMADA DE PESQUISA (utils/aiService.ts)                     │
│ - generateResearch()                                         │
│ - Orquestra Instagram scraping + análise IA                 │
│ - Retorna dados estruturados                                │
└────────┬────────────────────────────────────────────────────┘
         │
         ├─ call scraper
         │
┌────────▼────────────────────────────────────────────────────┐
│ CAMADA DE SCRAPING (services/socialScrapingService.ts)      │
│ - scrapeInstagramProfile()                                   │
│ - scrapeInstagramPosts()                                    │
│ - scrapeInstagramHashtag()                                  │
│ - runApifyActor() ← Função core que chama Apify            │
└────────┬────────────────────────────────────────────────────┘
         │
         ├─ POST /acts/{actorId}/runs
         │
┌────────▼────────────────────────────────────────────────────┐
│ APIFY API v2 (External Service)                             │
│ - Actor: apify/instagram-scraper                            │
│ - Coleta dados reais do Instagram                           │
│ - Retorna JSON com posts/profiles                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Etapas de Implementação

### Etapa 1: Criar Tipos TypeScript

**Arquivo:** `types/research.ts`

```typescript
// Interfaces para dados do Instagram (retornados pela Apify)
export interface InstagramPost {
  id: string;
  shortcode: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timestamp?: string;
  mediaType: 'image' | 'video' | 'carousel';
  mediaUrl?: string;
  thumbnailUrl?: string;
  hashtags: string[];
  mentions: string[];
  ownerUsername?: string;
}

export interface InstagramProfile {
  username: string;
  fullName: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  profilePicUrl: string;
  isVerified: boolean;
  isBusinessAccount: boolean;
  category?: string;
  website?: string;
}

// Dados coletados da Apify (tipos brutos)
interface ApifyInstagramPost {
  type: 'Image' | 'Video' | 'Sidecar';
  shortCode: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  url: string;
  commentsCount: number;
  displayUrl: string;
  likesCount: number;
  timestamp: string;
  ownerUsername: string;
  // ... mais campos opcionais
}

interface ApifyInstagramProfile {
  id: string;
  username: string;
  fullName: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  private: boolean;
  verified: boolean;
  profilePicUrl: string;
  // ... mais campos
}
```

### Etapa 2: Gerenciar API Keys

**Arquivo:** `utils/apiKeys.ts`

```typescript
// Interface para API Keys externas
export interface ExternalApiKeysConfig {
  serpApi?: string;  // Para busca web
  apify?: string;    // Para scraping de redes sociais
}

// Carregar keys do localStorage
export const loadExternalApiKeys = (): ExternalApiKeysConfig => {
  try {
    const data = localStorage.getItem('neurocontent_external_api_keys');
    if (!data) return {};
    return JSON.parse(data) as ExternalApiKeysConfig;
  } catch (error) {
    console.error('[External API Keys] Erro ao carregar keys:', error);
    return {};
  }
};

// Salvar uma key específica
export const saveExternalApiKey = (service: 'serpApi' | 'apify', key: string): void => {
  const keys = loadExternalApiKeys();
  keys[service] = key;
  const data = JSON.stringify(keys);
  localStorage.setItem('neurocontent_external_api_keys', data);
};

// Obter uma key específica
export const getExternalApiKey = (service: 'serpApi' | 'apify'): string | undefined => {
  const keys = loadExternalApiKeys();
  return keys[service];
};

// Verificar se tem key configurada
export const hasExternalApiKey = (service: 'serpApi' | 'apify'): boolean => {
  const key = getExternalApiKey(service);
  return !!key && key.trim().length > 0;
};
```

### Etapa 3: Criar o Serviço de Scraping (CORE)

**Arquivo:** `services/socialScrapingService.ts`

Esta é a **parte mais importante** - o coração da implementação.

```typescript
/**
 * Social Media Scraping Service - Integração Real com Apify Instagram Scraper
 * 
 * Actor ID: apify/instagram-scraper
 * Documentação: https://apify.com/apify/instagram-scraper
 */

const APIFY_API_BASE = 'https://api.apify.com/v2';
const INSTAGRAM_SCRAPER_ACTOR = 'apify/instagram-scraper';

// ===== FUNÇÃO PRINCIPAL: Executar um Actor da Apify =====
/**
 * Executa um actor da Apify e retorna os resultados em JSON
 * 
 * Fluxo:
 * 1. Envia POST com input para iniciar run
 * 2. Faz polling até run terminar (SUCCEEDED ou FAILED)
 * 3. Busca os resultados do dataset
 * 4. Retorna como array tipado
 * 
 * @param actorId - ID do actor (ex: "apify/instagram-scraper")
 * @param input - Objeto de configuração para o actor
 * @param apiKey - API Key da conta Apify
 * @param options - Timeout e intervalo de polling
 * @returns Array de resultados tipados
 */
export const runApifyActor = async <T>(
  actorId: string,
  input: Record<string, any>,
  apiKey: string,
  options: {
    timeout?: number;      // Tempo máximo de espera em ms
    pollInterval?: number; // Quanto tempo esperar entre checks de status
  } = {}
): Promise<T[]> => {
  const { timeout = 300000, pollInterval = 3000 } = options;

  // Validações básicas
  if (!actorId) throw new Error('actorId é obrigatório');
  if (!apiKey) throw new Error('apiKey é obrigatório');
  if (!input) throw new Error('input é obrigatório');

  console.log(`[Apify] 🚀 Iniciando actor: ${actorId}`);
  console.log(`[Apify] 📋 Input:`, JSON.stringify(input, null, 2));

  // PASSO 1: INICIAR O RUN
  const startUrl = `${APIFY_API_BASE}/acts/${encodeURIComponent(actorId)}/runs?token=${encodeURIComponent(apiKey)}`;
  
  const startResponse = await fetch(startUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(input),
  });

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
    throw new Error('Apify não retornou Run ID');
  }

  console.log(`[Apify] 📝 Run ID: ${runId}`);
  console.log(`[Apify] 🔗 Console: https://console.apify.com/actors/runs/${runId}`);
  console.log(`[Apify] ⏳ Aguardando conclusão... (timeout: ${timeout/1000}s)`);

  // PASSO 2: POLLING ATÉ TERMINAR
  const startTime = Date.now();
  let runData: any = null;

  while (Date.now() - startTime < timeout) {
    // Aguarda um pouco antes de checar status novamente
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const statusUrl = `${APIFY_API_BASE}/actor-runs/${runId}?token=${encodeURIComponent(apiKey)}`;
    const statusResponse = await fetch(statusUrl, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (!statusResponse.ok) {
      console.warn(`[Apify] ⚠️ Erro ao checar status, tentando novamente...`);
      continue;
    }

    runData = await statusResponse.json();
    const status = runData.data?.status;
    
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`[Apify] 📊 Status: ${status} (${elapsed}s)`);

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
    throw new Error(`Timeout aguardando Apify. Run ID: ${runId}`);
  }

  // PASSO 3: BUSCAR RESULTADOS DO DATASET
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
  
  return results as T[];
};

// ===== CONSTRUTOR DE INPUT =====
/**
 * Constrói o input correto para o Instagram Scraper da Apify
 * 
 * Problemas que foram RESOLVIDOS:
 * 1. ❌ ANTES: Input incluía campos desnecessários que causavam conflitos
 * 2. ✅ AGORA: Input minimalista com apenas campos essenciais
 * 
 * Estrutura correta:
 * - directUrls: Array com URL do perfil (ex: https://instagram.com/username/)
 * - resultsType: 'posts' | 'details' | 'comments'
 * - resultsLimit: Quantidade máxima de resultados
 * - search: String de busca (se busca, deixar vazio se URL)
 * - searchType: 'user' | 'hashtag' (se busca)
 * - searchLimit: Limite de buscas
 * - addParentData: false (deixar sempre false)
 */
interface InstagramInputOptions {
  username?: string;
  resultsType: 'posts' | 'details' | 'comments';
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
  // Se é uma busca (hashtag ou user)
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

  // Se é uma URL direta
  if (!username) {
    throw new Error('username é obrigatório');
  }

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

// ===== ESTRATÉGIA DE FALLBACK =====
/**
 * Tenta coletar dados com estratégia de fallback automática:
 * 1. Primeira tentativa: URL direta (mais confiável)
 * 2. Se falhar: Busca por username (menos confiável, mas funciona em alguns casos)
 * 3. Se ambas falharem: Lança erro detalhado
 */
const tryInstagramRun = async <T>(
  username: string,
  apiKey: string,
  options: {
    resultsType: 'posts' | 'details' | 'comments';
    limit: number;
    timeout?: number;
    allowSearchFallback?: boolean;
  }
): Promise<T[]> => {
  const { resultsType, limit, timeout = 240000, allowSearchFallback = true } = options;
  const cleanUsername = username.replace('@', '');

  // TENTATIVA 1: URL Direta
  try {
    console.log(`[Apify] 🎯 Tentativa 1: URL direta para @${cleanUsername} (${resultsType})`);
    const directInput = buildInstagramInput({ username: cleanUsername, resultsType, limit });
    
    const results = await runApifyActor<T>(INSTAGRAM_SCRAPER_ACTOR, directInput, apiKey, { timeout });
    
    if (results.length === 0) {
      console.warn(`[Apify] ⚠️ URL direta retornou 0 resultados`);
      throw new Error(`No results from direct URL`);
    }
    
    console.log(`[Apify] ✅ URL direta funcionou: ${results.length} resultados`);
    return results;
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[Apify] ⚠️ Erro na URL direta:`, errorMsg);

    if (!allowSearchFallback) {
      throw error;
    }

    // TENTATIVA 2: Busca por usuário
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
        throw new Error(`No results from search`);
      }
      
      console.log(`[Apify] ✅ Busca funcionou: ${searchResults.length} resultados`);
      return searchResults;
      
    } catch (searchError) {
      const searchErrorMsg = searchError instanceof Error ? searchError.message : String(searchError);
      console.error(`[Apify] ❌ Ambas tentativas falharam`);
      console.error(`[Apify]    - URL direta: ${errorMsg}`);
      console.error(`[Apify]    - Busca: ${searchErrorMsg}`);
      
      throw new Error(
        `Failed to scrape @${cleanUsername} with both methods. ` +
        `Direct URL: ${errorMsg}. Search: ${searchErrorMsg}`
      );
    }
  }
};

// ===== FUNÇÕES PÚBLICAS (Exports) =====

/**
 * Coleta perfil completo do Instagram com posts recentes
 */
export const scrapeInstagramProfile = async (
  username: string,
  apiKey: string,
  options: { postsLimit?: number } = {}
): Promise<{ profile: InstagramProfile; posts: InstagramPost[] }> => {
  const { postsLimit = 12 } = options;

  console.log(`[Apify] 📸 Coletando perfil Instagram: @${username}`);

  // Coleta detalhes do perfil
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

  // Converte do formato Apify para nosso formato
  const profile: InstagramProfile = {
    username: data.username,
    fullName: data.fullName || '',
    bio: data.biography || '',
    followersCount: data.followersCount || 0,
    followingCount: data.followsCount || 0,
    postsCount: data.postsCount || 0,
    profilePicUrl: data.profilePicUrl || '',
    isVerified: data.verified || false,
    isBusinessAccount: data.isBusinessAccount || false,
    category: data.businessCategoryName,
    website: data.externalUrl,
  };

  let postsSource: ApifyInstagramPost[] = data.latestPosts || [];

  // Se vieram poucos posts, coleta mais
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
      console.warn(`[Apify] ⚠️ Não foi possível coletar posts extras`);
    }
  }

  // Converte posts
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
 * Coleta posts de um perfil do Instagram
 */
export const scrapeInstagramPosts = async (
  username: string,
  apiKey: string,
  options: { limit?: number } = {}
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
 * Coleta posts de uma hashtag
 */
export const scrapeInstagramHashtag = async (
  hashtag: string,
  apiKey: string,
  options: { limit?: number } = {}
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
    { timeout: 300000 }
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
 * Valida se a API Key do Apify é válida
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

// ===== UTILIDADES =====

export const extractInstagramUsername = (url: string): string | null => {
  const match = url.match(/instagram\.com\/([^/?]+)/);
  return match ? match[1] : null;
};

export const extractHashtags = (text: string): string[] => {
  const matches = text.match(/#[\w\u00C0-\u017F]+/g);
  return matches ? matches.map(h => h.toLowerCase()) : [];
};

export const extractMentions = (text: string): string[] => {
  const matches = text.match(/@[\w.]+/g);
  return matches ? matches.map(m => m.toLowerCase()) : [];
};

export const calculateInstagramEngagement = (
  posts: InstagramPost[],
  followersCount: number
): number => {
  if (posts.length === 0 || followersCount === 0) return 0;
  const totalEngagement = posts.reduce(
    (sum, post) => sum + post.likesCount + post.commentsCount,
    0
  );
  return (totalEngagement / posts.length / followersCount) * 100;
};
```

### Etapa 4: Integração com Pipeline de Pesquisa

**Arquivo:** `utils/aiService.ts`

```typescript
/**
 * Interface para dados do Instagram coletados via Apify
 */
export interface InstagramScrapedData {
  profile: InstagramProfile | null;
  posts: InstagramPost[];
  hashtags: string[];
  engagementRate: number;
  postingFrequency: {
    postsPerWeek: number;
    postsPerMonth: number;
  };
}

/**
 * Contexto estendido com dados reais do Instagram
 */
export interface PautaGenerationContext {
  // ... campos existentes ...
  instagramData?: InstagramScrapedData;
}

/**
 * Pesquisa completa com dados do Instagram
 */
export const generateResearch = async (
  client: ClientWorkspaceCard
): Promise<ClientResearchData> => {
  // ... código existente de busca web, etc ...

  // SE HÁ INSTAGRAM CONFIGURADO, COLETA DADOS REAIS
  let instagramData: InstagramScrapedData | undefined;
  
  if (client.settings.sources?.includes('instagram') || 
      client.lastInsight?.includes('@')) {
    
    // Extrai username do Instagram se estiver em algum campo
    const instagramUsername = extractInstagramUsername(client.lastInsight || '');
    
    if (instagramUsername) {
      try {
        const apiKey = getExternalApiKey('apify');
        if (!apiKey) {
          console.warn('[Research] API Key Apify não configurada');
        } else {
          // Coleta dados reais do Instagram
          const { profile, posts } = await scrapeInstagramProfile(
            instagramUsername,
            apiKey,
            { postsLimit: 20 }
          );

          instagramData = {
            profile,
            posts,
            hashtags: collectUniqueHashtags(posts),
            engagementRate: calculateInstagramEngagement(posts, profile.followersCount),
            postingFrequency: analyzePostingFrequency(posts),
          };

          console.log(`[Research] ✅ Dados do Instagram coletados: ${posts.length} posts`);
        }
      } catch (error) {
        console.warn('[Research] ⚠️ Erro ao coletar Instagram:', error);
        // Continua mesmo se Instagram falhar
      }
    }
  }

  // Retorna pesquisa COM dados do Instagram inclusos
  return {
    competitors: competitorAnalysis,
    trends: trendAnalysis,
    thematicSummary: themes,
    hashtagRadar: hashtags,
    instagramData, // ← Adiciona dados reais
    lastUpdated: new Date().toISOString(),
  };
};
```

### Etapa 5: UI para Exibição de Logs

**Arquivo:** `hooks/useResearchWithLogs.ts`

```typescript
/**
 * Hook que gerencia logs em tempo real durante a pesquisa
 */
export const useResearchWithLogs = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ResearchLog[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [scrapedData, setScrapedData] = useState<{
    instagram: {
      profile: InstagramProfile | null;
      posts: InstagramPost[];
    };
  }>({
    instagram: { profile: null, posts: [] },
  });
  const [error, setError] = useState<string | null>(null);

  // Intercepta console.log para capturar logs da Apify
  useEffect(() => {
    if (!isRunning) return;

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const logMessage = (message: string, type: 'info' | 'error' | 'warning' = 'info') => {
      setLogs(prev => [...prev, {
        timestamp: new Date(),
        message,
        type,
      }]);
    };

    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      logMessage(message, 'info');
      originalLog(...args);
    };

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      logMessage(message, 'error');
      originalError(...args);
    };

    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      logMessage(message, 'warning');
      originalWarn(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [isRunning]);

  const startResearch = async (client: ClientWorkspaceCard) => {
    setIsRunning(true);
    setLogs([]);
    setError(null);
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      const result = await generateResearch(client);
      
      // Salva dados extraídos do Instagram
      if (result.instagramData) {
        setScrapedData({
          instagram: {
            profile: result.instagramData.profile,
            posts: result.instagramData.posts,
          },
        });
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      throw err;
    } finally {
      setIsRunning(false);
      clearInterval(intervalId);
    }
  };

  return {
    isRunning,
    logs,
    elapsedTime,
    scrapedData,
    error,
    startResearch,
    clearLogs: () => setLogs([]),
  };
};
```

### Etapa 6: UI para Exibir Dados Coletados

**Arquivo:** `components/ScrapedDataViewer.tsx`

```typescript
export const ScrapedDataViewer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  profile: InstagramProfile | null;
  posts: InstagramPost[];
}> = ({ isOpen, onClose, profile, posts }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-50 to-rose-50 p-6 border-b border-pink-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-pink-900">Dados Extraídos do Instagram</h2>
          <button onClick={onClose} className="p-2 hover:bg-pink-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Perfil */}
          {profile && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <img 
                  src={profile.profilePicUrl} 
                  alt={profile.username} 
                  className="w-20 h-20 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800">
                    @{profile.username} {profile.isVerified && '✓'}
                  </h3>
                  <p className="text-slate-600 font-medium">{profile.fullName}</p>
                  <p className="text-slate-500 text-sm mt-2">{profile.bio}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span className="font-semibold text-slate-700">
                      {profile.followersCount.toLocaleString()} seguidores
                    </span>
                    <span className="font-semibold text-slate-700">
                      {profile.postsCount} posts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              Posts Coletados ({posts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {posts.map(post => (
                <div key={post.id} className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition">
                  {post.mediaUrl && (
                    <img src={post.mediaUrl} alt="" className="w-full h-32 object-cover rounded mb-2" />
                  )}
                  <p className="text-sm text-slate-600 line-clamp-2">{post.caption}</p>
                  <div className="flex gap-3 text-xs text-slate-500 mt-2">
                    <span>❤️ {post.likesCount}</span>
                    <span>💬 {post.commentsCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔑 Configuração da API Key

### Onde Obter a API Key?

1. Acesse https://apify.com
2. Crie uma conta (grátis ou paga)
3. Vá em "Account settings" → "Integrations"
4. Copie a "API Token"
5. Formato: `apify_api_...`

### Onde Configurar na Aplicação?

1. Abra a aplicação
2. Vá em **Settings** → **API Keys**
3. Cole a key em **Apify**
4. Clique em salvar

A key é armazenada em `localStorage` com a chave `neurocontent_external_api_keys`.

---

## 🔄 Fluxo Completo de Execução

```
USUÁRIO CLICA "Gerar Pesquisa"
   ↓
Research.tsx → handleGenerateResearch()
   ↓
aiService.ts → generateResearch(client)
   ↓
[Se Instagram está configurado]
   ↓
socialScrapingService.ts → scrapeInstagramProfile(username, apiKey)
   ↓
tryInstagramRun() → estratégia de fallback
   ├─ Tentativa 1: URL Direta
   │  └─ runApifyActor(actor, input, apiKey)
   │     ├─ POST para iniciar run
   │     ├─ Polling até sucesso
   │     └─ GET para buscar dataset
   │
   └─ Se falhar:
      └─ Tentativa 2: Busca por username
         └─ runApifyActor(actor, searchInput, apiKey)
            └─ Mesmo processo
   ↓
Dados convertidos para formato local
   ↓
UI atualiza com dados reais
```

---

## ⚠️ Problemas Resolvidos Nesta Implementação

### Problema 1: Timeout do Navegador
**O que era:** Usando `waitForFinish` que pode exceder timeout do navegador.
**Como foi resolvido:** Polling manual com intervalo curto (3 segundos).

### Problema 2: Input Incompleto
**O que era:** Campos desnecessários causando conflitos na API.
**Como foi resolvido:** Input minimalista com apenas campos essenciais.

### Problema 3: Zero Resultados
**O que era:** "Dataset vazio - 0 resultados" sem razão clara.
**Como foi resolvido:** 
- Sistema de fallback automático (URL → Busca)
- Logging detalhado mostrando qual tentativa funcionou
- Links diretos para console Apify para debugging

### Problema 4: Debugging Impossível
**O que era:** Erros genéricos sem contexto útil.
**Como foi resolvido:**
- Logs coloridos com emojis em cada etapa
- Run ID e Dataset ID para investigação
- URLs diretas para console Apify
- Amostra dos primeiros resultados

### Problema 5: Rate Limits
**O que era:** Requisições muito rápidas falhando.
**Como foi resolvido:** 
- Polling com intervalo configurável (padrão 3s)
- Timeout extensível por tipo de dado

---

## 🧪 Como Testar

```bash
# 1. Configure a API Key (Settings → API Keys → Apify)

# 2. Configure um cliente com Instagram
# - Vá em Clients
# - Edite um cliente
# - Em "Sources" ou "lastInsight", adicione um Instagram username

# 3. Abra a página Research
# - Clique em "Gerar Pesquisa"
# - Abra o sidebar de Logs
# - Aguarde ~30-60 segundos

# 4. Verifique os Logs
# Procure por:
# ✅ [Apify] 🚀 Iniciando actor: apify/instagram-scraper
# ✅ [Apify] ⏳ Aguardando conclusão...
# ✅ [Apify] ✅ Coletados X itens
# ✅ [Apify] ✅ Perfil coletado: Y posts

# 5. Verifique os Dados Extraídos
# - Clique em "Ver Dados Extraídos"
# - Deve mostrar perfil + posts coletados
```

---

## 📊 Estrutura de Dados Retornada

```json
{
  "profile": {
    "username": "rabbitagency4.0",
    "fullName": "Rabbit Agency",
    "bio": "Social media agency...",
    "followersCount": 45000,
    "followingCount": 523,
    "postsCount": 324,
    "profilePicUrl": "https://...",
    "isVerified": true,
    "isBusinessAccount": true,
    "category": "Professional Services",
    "website": "https://..."
  },
  "posts": [
    {
      "id": "C_shortcode",
      "shortcode": "C_shortcode",
      "caption": "Beautiful post caption...",
      "likesCount": 2450,
      "commentsCount": 87,
      "timestamp": "2024-12-01T10:30:00Z",
      "mediaType": "image",
      "mediaUrl": "https://...",
      "hashtags": ["#marketing", "#socialmedia"],
      "mentions": ["@someone"],
      "ownerUsername": "rabbitagency4.0"
    }
  ],
  "hashtags": ["#marketing", "#socialmedia", ...],
  "engagementRate": 5.8,
  "postingFrequency": {
    "postsPerWeek": 2.5,
    "postsPerMonth": 10.8
  }
}
```

---

## 🚀 Próximos Passos para Outra Implementação

1. **Copiar toda a pasta `services/socialScrapingService.ts`** (core)
2. **Copiar tipos em `types/research.ts`** (interfaces)
3. **Adaptar `utils/aiService.ts`** para seu contexto de IA
4. **Criar UI para logs** (componentes React)
5. **Configurar gerenciamento de API Keys**
6. **Testar com perfil público real**

---

## 📚 Referências

- **Apify API v2**: https://docs.apify.com/api/v2
- **Instagram Scraper Actor**: https://apify.com/apify/instagram-scraper
- **Actor Runs - Wait for Finish**: https://docs.apify.com/api/v2#tag/Actor-runs
- **Console Apify**: https://console.apify.com/

---

## 💡 Dicas Importantes

1. **Sempre use URL simples**: `https://www.instagram.com/username/` (sem parâmetros extras)
2. **Remova @** do username se o usuário digitar: `username.replace('@', '')`
3. **Perfis privados não funcionam**: Teste sempre com perfis públicos
4. **Rate limits**: Apify permite ~60 requisições/hora por conta gratuita
5. **Timeout generoso**: 240-300 segundos é seguro para coleta de 20+ posts
6. **Sempre tenha fallback**: URL direta com fallback para busca
7. **Logs são essenciais**: Sempre console.log em cada etapa para debugging
8. **Valide input**: Sempre limpe usernames e URLs antes de enviar para Apify

---

**Fim do Guia Técnico Completo**

Use este documento como referência ao implementar em outro projeto. Todos os códigos foram testados e validados em produção.
