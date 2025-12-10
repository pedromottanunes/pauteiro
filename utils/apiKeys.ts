import { AiModel } from '../types';

/**
 * Sistema de gerenciamento de API Keys
 */

const API_KEYS_STORAGE_KEY = 'neurocontent_api_keys';
const EXTERNAL_KEYS_STORAGE_KEY = 'neurocontent_external_api_keys';

export interface ApiKeysConfig {
  [AiModel.OPENAI]?: string;
  [AiModel.GEMINI]?: string;
  [AiModel.SONET]?: string;
  [AiModel.DEEPSEEK]?: string;
  [AiModel.MANUS]?: string;
}

/**
 * Keys externas para serviços de pesquisa
 */
export interface ExternalApiKeysConfig {
  serpApi?: string;
  apify?: string;
  googleCseKey?: string;
  googleCseCx?: string;
  bingApiKey?: string;
}

/**
 * Salva as API Keys no localStorage
 */
export const saveApiKeys = (keys: ApiKeysConfig): void => {
  try {
    const data = JSON.stringify(keys);
    localStorage.setItem(API_KEYS_STORAGE_KEY, data);
    console.log('[API Keys] Keys salvas com sucesso');
  } catch (error) {
    console.error('[API Keys] Erro ao salvar keys:', error);
    throw new Error('Falha ao salvar API Keys');
  }
};

/**
 * Carrega as API Keys do localStorage
 */
export const loadApiKeys = (): ApiKeysConfig => {
  try {
    const data = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (!data) {
      console.log('[API Keys] Nenhuma key encontrada');
      return {};
    }
    const keys = JSON.parse(data) as ApiKeysConfig;
    console.log('[API Keys] Keys carregadas');
    return keys;
  } catch (error) {
    console.error('[API Keys] Erro ao carregar keys:', error);
    return {};
  }
};

/**
 * Salva uma API Key específica
 */
export const saveApiKey = (model: AiModel, key: string): void => {
  const keys = loadApiKeys();
  keys[model] = key;
  saveApiKeys(keys);
};

/**
 * Obtém uma API Key específica
 */
export const getApiKey = (model: AiModel): string | undefined => {
  const keys = loadApiKeys();
  return keys[model];
};

/**
 * Remove uma API Key específica
 */
export const removeApiKey = (model: AiModel): void => {
  const keys = loadApiKeys();
  delete keys[model];
  saveApiKeys(keys);
};

/**
 * Verifica se há uma API Key configurada para um modelo
 */
export const hasApiKey = (model: AiModel): boolean => {
  const key = getApiKey(model);
  return !!key && key.trim().length > 0;
};

/**
 * Limpa todas as API Keys
 */
export const clearAllApiKeys = (): void => {
  try {
    localStorage.removeItem(API_KEYS_STORAGE_KEY);
    console.log('[API Keys] Todas as keys foram removidas');
  } catch (error) {
    console.error('[API Keys] Erro ao limpar keys:', error);
  }
};

/**
 * Mascara uma API Key para exibição
 */
export const maskApiKey = (key: string): string => {
  if (!key || key.length < 8) return '••••••••';
  const start = key.substring(0, 4);
  const end = key.substring(key.length - 4);
  return `${start}${'•'.repeat(key.length - 8)}${end}`;
};

/**
 * Valida formato de API Key (básico)
 */
export const validateApiKey = (key: string, model: AiModel): { valid: boolean; message?: string } => {
  if (!key || key.trim().length === 0) {
    return { valid: false, message: 'API Key não pode estar vazia' };
  }

  // Validações específicas por modelo
  switch (model) {
    case AiModel.OPENAI:
      if (!key.startsWith('sk-')) {
        return { valid: false, message: 'API Key da OpenAI deve começar com "sk-"' };
      }
      if (key.length < 20) {
        return { valid: false, message: 'API Key da OpenAI parece estar incompleta' };
      }
      break;
    
    case AiModel.GEMINI:
      if (key.length < 20) {
        return { valid: false, message: 'API Key do Gemini parece estar incompleta' };
      }
      break;
    
    // Adicionar validações para outros modelos conforme necessário
  }

  return { valid: true };
};

/**
 * Obtém informações sobre as keys configuradas
 */
export const getApiKeysStatus = (): { model: AiModel; configured: boolean; masked?: string }[] => {
  const keys = loadApiKeys();
  return Object.values(AiModel).map(model => ({
    model,
    configured: hasApiKey(model),
    masked: keys[model] ? maskApiKey(keys[model]!) : undefined,
  }));
};

// ==========================================
// Gerenciamento de API Keys Externas
// ==========================================

/**
 * Salva as API Keys externas no localStorage
 */
export const saveExternalApiKeys = (keys: ExternalApiKeysConfig): void => {
  try {
    const data = JSON.stringify(keys);
    localStorage.setItem(EXTERNAL_KEYS_STORAGE_KEY, data);
    console.log('[External API Keys] Keys salvas com sucesso');
  } catch (error) {
    console.error('[External API Keys] Erro ao salvar keys:', error);
    throw new Error('Falha ao salvar API Keys externas');
  }
};

/**
 * Carrega as API Keys externas do localStorage
 */
export const loadExternalApiKeys = (): ExternalApiKeysConfig => {
  try {
    const data = localStorage.getItem(EXTERNAL_KEYS_STORAGE_KEY);
    if (!data) {
      console.log('[External API Keys] Nenhuma key encontrada');
      return {};
    }
    const keys = JSON.parse(data) as ExternalApiKeysConfig;
    console.log('[External API Keys] Keys carregadas');
    return keys;
  } catch (error) {
    console.error('[External API Keys] Erro ao carregar keys:', error);
    return {};
  }
};

/**
 * Salva uma API Key externa específica
 */
export const saveExternalApiKey = (service: 'serpApi' | 'apify' | 'googleCseKey' | 'googleCseCx' | 'bingApiKey', key: string): void => {
  const keys = loadExternalApiKeys();
  keys[service] = key;
  saveExternalApiKeys(keys);
};

/**
 * Obtém uma API Key externa específica
 */
export const getExternalApiKey = (service: 'serpApi' | 'apify' | 'googleCseKey' | 'googleCseCx' | 'bingApiKey'): string | undefined => {
  const keys = loadExternalApiKeys();
  return keys[service];
};

/**
 * Verifica se há uma API Key externa configurada
 */
export const hasExternalApiKey = (service: 'serpApi' | 'apify' | 'googleCseKey' | 'googleCseCx' | 'bingApiKey'): boolean => {
  const key = getExternalApiKey(service);
  return !!key && key.trim().length > 0;
};

/**
 * Obtém todas as API Keys para o pipeline de pesquisa
 */
export const getResearchApiKeys = (): {
  openAi?: string;
  serpApi?: string;
  apify?: string;
  googleCseKey?: string;
  googleCseCx?: string;
  bingApiKey?: string;
} => {
  const aiKeys = loadApiKeys();
  const externalKeys = loadExternalApiKeys();
  
  return {
    openAi: aiKeys[AiModel.OPENAI],
    serpApi: externalKeys.serpApi,
    apify: externalKeys.apify,
    googleCseKey: externalKeys.googleCseKey,
    googleCseCx: externalKeys.googleCseCx,
    bingApiKey: externalKeys.bingApiKey,
  };
};

/**
 * Obtém status de todas as API Keys externas
 */
export const getExternalApiKeysStatus = (): { service: string; configured: boolean; masked?: string }[] => {
  const keys = loadExternalApiKeys();
  return [
    {
      service: 'SerpAPI',
      configured: !!keys.serpApi,
      masked: keys.serpApi ? maskApiKey(keys.serpApi) : undefined,
    },
    {
      service: 'Apify',
      configured: !!keys.apify,
      masked: keys.apify ? maskApiKey(keys.apify) : undefined,
    },
    {
      service: 'Proxy Token',
      configured: !!localStorage.getItem('neurocontent_proxy_token'),
      masked: localStorage.getItem('neurocontent_proxy_token') ? maskApiKey(localStorage.getItem('neurocontent_proxy_token')!) : undefined,
    },
  ];
};

const PROXY_TOKEN_STORAGE = 'neurocontent_proxy_token';

export const saveProxyToken = (token: string): void => {
  try {
    localStorage.setItem(PROXY_TOKEN_STORAGE, token);
  } catch (err) {
    console.error('[Proxy Token] Erro ao salvar token', err);
    throw err;
  }
};

export const getProxyToken = (): string | null => {
  try {
    return localStorage.getItem(PROXY_TOKEN_STORAGE);
  } catch (err) {
    console.error('[Proxy Token] Erro ao ler token', err);
    return null;
  }
};

export const removeProxyToken = (): void => {
  try {
    localStorage.removeItem(PROXY_TOKEN_STORAGE);
  } catch (err) {
    console.error('[Proxy Token] Erro ao remover token', err);
  }
};
