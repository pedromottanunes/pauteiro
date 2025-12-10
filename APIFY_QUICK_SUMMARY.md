# 🎯 Resumo Executivo - Implementação Apify

**Documento Curto para Quick Reference**

---

## O Que Foi Feito?

Uma integração **completa e produção** da Apify API v2 para fazer web scraping do Instagram em tempo real. Sistema está testado, debugado e funcionando.

---

## Arquivos Críticos

```
📁 Seu Projeto
├── types/research.ts              ← Definir interfaces de dados
├── utils/apiKeys.ts               ← Sistema de API Key (localStorage)
├── services/socialScrapingService.ts ← ⭐⭐⭐ CORE (740 linhas)
├── utils/aiService.ts             ← Integração com pipeline IA
└── hooks/useResearchWithLogs.ts   ← Captura de logs em tempo real
```

---

## O Que Precisa Ser Feito (Passo a Passo)

### 1. Criar Tipos TypeScript (types/research.ts)
```typescript
interface InstagramPost {
  id: string;
  shortcode: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timestamp?: string;
  mediaType: 'image' | 'video' | 'carousel';
  mediaUrl?: string;
  hashtags: string[];
  mentions: string[];
}

interface InstagramProfile {
  username: string;
  fullName: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  profilePicUrl: string;
  isVerified: boolean;
  isBusinessAccount: boolean;
}
```

**Por que:** Define a estrutura de dados que vem da Apify para seu programa entender.

---

### 2. Implementar Gerencimento de API Keys (utils/apiKeys.ts)
```typescript
const APIFY_KEY_STORAGE = 'your_app_api_keys';

export const saveApifyKey = (key: string) => {
  localStorage.setItem(APIFY_KEY_STORAGE, key);
};

export const getApifyKey = (): string | null => {
  return localStorage.getItem(APIFY_KEY_STORAGE);
};

export const hasApifyKey = (): boolean => {
  return !!getApifyKey();
};
```

**Por que:** A API Key precisa ser armazenada de forma segura no navegador/cliente.

---

### 3. Implementar o Core Service (services/socialScrapingService.ts) ⭐⭐⭐

**Este é o arquivo mais importante!** ~740 linhas de código.

```typescript
const APIFY_BASE = 'https://api.apify.com/v2';
const INSTAGRAM_ACTOR = 'apify/instagram-scraper';

// A FUNÇÃO PRINCIPAL
export const runApifyActor = async <T>(
  actorId: string,
  input: Record<string, any>,
  apiKey: string,
  options: { timeout?: number; pollInterval?: number } = {}
): Promise<T[]> => {
  
  // PASSO 1: Iniciar o run
  // POST para https://api.apify.com/v2/acts/{actorId}/runs
  // Retorna: { data: { id: "run-123", ... } }
  
  // PASSO 2: Fazer polling até terminar
  // GET para https://api.apify.com/v2/actor-runs/{runId}
  // Esperar até status === 'SUCCEEDED'
  
  // PASSO 3: Buscar os resultados
  // GET para https://api.apify.com/v2/datasets/{datasetId}/items
  // Retorna: array de dados
  
  return results as T[];
};

// Construir input correto
const buildInstagramInput = (username: string, resultsType: 'posts' | 'details') => {
  return {
    directUrls: [`https://www.instagram.com/${username}/`],
    resultsType,
    resultsLimit: 20,
    search: '',
    searchType: '',
    searchLimit: 0,
    addParentData: false,
  };
};

// Função de fallback
const tryInstagramRun = async <T>(
  username: string,
  apiKey: string,
  options: { resultsType: 'posts' | 'details'; limit: number }
): Promise<T[]> => {
  try {
    // Tentativa 1: URL direta
    const input = buildInstagramInput(username, options.resultsType);
    return await runApifyActor(INSTAGRAM_ACTOR, input, apiKey);
  } catch (error) {
    // Tentativa 2: Busca por username
    const searchInput = {
      directUrls: [],
      search: username,
      searchType: 'user',
      searchLimit: 5,
      resultsType: options.resultsType,
      resultsLimit: options.limit,
    };
    return await runApifyActor(INSTAGRAM_ACTOR, searchInput, apiKey);
  }
};

// Exports públicos
export const scrapeInstagramProfile = async (
  username: string,
  apiKey: string,
  options: { postsLimit?: number } = {}
) => {
  const { postsLimit = 12 } = options;
  
  const detailResults = await tryInstagramRun(username, apiKey, {
    resultsType: 'details',
    limit: postsLimit,
  });
  
  if (detailResults.length === 0) {
    throw new Error(`Profile @${username} not found or private`);
  }
  
  const data = detailResults[0];
  
  // Converter de formato Apify para seu formato
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
  };
  
  const posts: InstagramPost[] = (data.latestPosts || []).map(post => ({
    id: post.shortCode,
    shortcode: post.shortCode,
    caption: post.caption || '',
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    timestamp: post.timestamp,
    mediaType: post.type === 'Video' ? 'video' : 'image',
    mediaUrl: post.displayUrl || post.url,
    hashtags: post.hashtags || [],
    mentions: post.mentions || [],
  }));
  
  return { profile, posts };
};
```

**Por que:** Este é o "motor" que chama a Apify e processa os resultados.

**Detalhes técnicos importantes:**
- Usa **polling manual** ao invés de `waitForFinish` para evitar timeout do navegador
- **Fallback automático**: URL direta → Busca por username
- **Logging verboso** em cada etapa
- **Timeout robusto**: aguarda até 5 minutos
- **Tratamento de erro detalhado**

---

### 4. Integrar com seu Pipeline (utils/aiService.ts ou similar)

```typescript
// Sua função de pesquisa/análise
export const generateResearch = async (client) => {
  // ... seu código existente ...
  
  // Adicionar: Coleta Instagram
  let instagramData = null;
  const apiKey = getApifyKey();
  
  if (apiKey && client.instagramUsername) {
    try {
      const { profile, posts } = await scrapeInstagramProfile(
        client.instagramUsername,
        apiKey,
        { postsLimit: 20 }
      );
      
      instagramData = {
        profile,
        posts,
        hashtags: [...new Set(posts.flatMap(p => p.hashtags))],
        engagementRate: calculateEngagement(posts, profile.followersCount),
      };
    } catch (error) {
      console.error('Instagram scraping failed:', error);
      // Continua sem Instagram data
    }
  }
  
  return {
    ...researchData,
    instagramData, // ← Adiciona ao resultado
  };
};
```

---

### 5. Criar UI para Logs (optional mas recomendado)

```typescript
// Capturar logs da Apify
const originalLog = console.log;
console.log = (...args) => {
  const message = args.join(' ');
  // Adicionar ao array de logs na UI
  setLogs(prev => [...prev, {
    timestamp: new Date(),
    message,
    type: 'info'
  }]);
  originalLog(...args);
};
```

---

## 🔑 Configuração Necessária

1. **Conta Apify** (https://apify.com)
   - Grátis ou paga
   - Actor: `apify/instagram-scraper`

2. **API Key**
   - Formato: `apify_api_...`
   - Armazenar em `localStorage`

3. **Timeout Generoso**
   - 240-300 segundos (4-5 minutos)
   - Instagram é lento às vezes

---

## ⚡ Quick Checklist de Implementação

- [ ] Tipos TypeScript criados (InstagramPost, InstagramProfile)
- [ ] Gerenciamento de API Key implementado
- [ ] `runApifyActor()` implementado (polling + error handling)
- [ ] `buildInstagramInput()` criado
- [ ] `tryInstagramRun()` com fallback criado
- [ ] `scrapeInstagramProfile()` exportado
- [ ] Integração com seu pipeline
- [ ] UI para exibir logs (console.log intercept)
- [ ] Testado com perfil público real
- [ ] Validação de API Key funcionando

---

## 🧪 Teste Mínimo

```javascript
// No console do navegador
const apiKey = 'apify_api_...';
const username = 'instagram'; // Perfil público famoso

// Importar a função (depende de como seu projeto está estruturado)
const { scrapeInstagramProfile } = await import('./services/socialScrapingService.ts');

// Testar
try {
  const { profile, posts } = await scrapeInstagramProfile(username, apiKey);
  console.log('Profile:', profile);
  console.log('Posts:', posts);
} catch (error) {
  console.error('Error:', error);
}
```

---

## 🆘 Debugging

Se não funcionar, procure no console do navegador por:

1. **`[Apify] 🚀 Iniciando actor`** ← Significa que enviou para Apify
2. **`[Apify] 📝 Run ID: ...`** ← ID para investigar em apify.com
3. **`[Apify] ✅ Coletados X itens`** ← Sucesso!
4. **`[Apify] ❌ ...`** ← Erro (veja a mensagem específica)

Se vir um erro, acesse: `https://console.apify.com/actors/runs/{RUN_ID}` para ver logs detalhados da Apify.

---

## 📊 Dados Esperados

```json
{
  "profile": {
    "username": "instagram",
    "followers": 600000000,
    "posts": 15000,
    "verified": true
  },
  "posts": [
    {
      "caption": "Beautiful photo...",
      "likes": 500000,
      "comments": 25000,
      "hashtags": ["#instagram", "#photo"]
    }
  ]
}
```

---

## 🚨 Problemas Comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| "API Key não configurada" | Key não foi salva | Verifique localStorage |
| "0 resultados" | Perfil privado | Use perfil público |
| "Timeout" | Apify demorando | Aumentar timeout para 300s |
| "CORS error" | Bloqueio do navegador | Verificar DevTools network |
| "Actor run FAILED" | Input inválido | Ver logs em apify.com |

---

**Fim do Resumo Executivo**
