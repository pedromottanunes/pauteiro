import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, AlertCircle, Search, Database } from 'lucide-react';
import { AiModel } from '../types';
import { 
  saveApiKey, 
  getApiKey, 
  hasApiKey, 
  maskApiKey, 
  validateApiKey, 
  getApiKeysStatus,
  saveExternalApiKey,
  getExternalApiKey,
  hasExternalApiKey,
  loadExternalApiKeys,
  saveProxyToken,
  getProxyToken,
  removeProxyToken,
} from '../utils/apiKeys';

export const ApiKeysManager: React.FC = () => {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [externalKeys, setExternalKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState('');
  const [proxyToken, setProxyToken] = useState('');
  const [showProxyToken, setShowProxyToken] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'research'>('ai');

  useEffect(() => {
    loadKeys();
    loadExternalKeys();
    const t = getProxyToken();
    if (t) setProxyToken(t);
  }, []);

  const loadKeys = () => {
    const loadedKeys: Record<string, string> = {};
    Object.values(AiModel).forEach(model => {
      const key = getApiKey(model);
      if (key) {
        loadedKeys[model] = key;
      }
    });
    setKeys(loadedKeys);
  };

  const loadExternalKeys = () => {
    const loaded = loadExternalApiKeys();
    setExternalKeys({
      serpApi: loaded.serpApi || '',
      apify: loaded.apify || '',
      googleCseKey: loaded.googleCseKey || '',
      googleCseCx: loaded.googleCseCx || '',
      bingApiKey: loaded.bingApiKey || '',
    });
  };

  const handleSaveKey = (model: AiModel) => {
    const validation = validateApiKey(tempKey, model);
    
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.message || 'API Key inválida' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      saveApiKey(model, tempKey);
      setKeys(prev => ({ ...prev, [model]: tempKey }));
      setEditingKey(null);
      setTempKey('');
      setMessage({ type: 'success', text: `API Key de ${model} salva com sucesso!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar API Key' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSaveExternalKey = (service: 'serpApi' | 'apify' | 'googleCseKey' | 'googleCseCx' | 'bingApiKey') => {
    if (!tempKey.trim()) {
      setMessage({ type: 'error', text: 'API Key não pode estar vazia' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      saveExternalApiKey(service, tempKey);
      setExternalKeys(prev => ({ ...prev, [service]: tempKey }));
      setEditingKey(null);
      setTempKey('');
      const serviceNameMap: Record<string, string> = {
        serpApi: 'SerpAPI',
        apify: 'Apify',
        googleCseKey: 'Google CSE Key',
        googleCseCx: 'Google CSE CX',
        bingApiKey: 'Bing Web Search',
      };
      const serviceName = serviceNameMap[service] || 'Serviço externo';
      setMessage({ type: 'success', text: `API Key de ${serviceName} salva com sucesso!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar API Key' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEditKey = (model: AiModel) => {
    setEditingKey(model);
    setTempKey(keys[model] || '');
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setTempKey('');
  };

  const toggleShowKey = (model: string) => {
    setShowKeys(prev => ({ ...prev, [model]: !prev[model] }));
  };

  const modelDescriptions: Record<AiModel, string> = {
    [AiModel.OPENAI]: 'GPT-4o - Modelo mais avançado da OpenAI',
    [AiModel.GEMINI]: 'Gemini 1.5 Pro - Modelo do Google',
    [AiModel.SONET]: 'Claude 3.5 Sonnet - Modelo da Anthropic',
    [AiModel.DEEPSEEK]: 'DeepSeek R1 - Modelo de raciocínio profundo',
    [AiModel.MANUS]: 'Manus - Modelo especializado',
  };

  const externalServiceDescriptions = {
    serpApi: {
      name: 'SerpAPI',
      description: 'Busca no Google para pesquisa de concorrentes e tendências',
      icon: <Search size={18} className="text-green-600" />,
      url: 'https://serpapi.com/manage-api-key',
    },
    apify: {
      name: 'Apify',
      description: 'Scraping de Instagram e Facebook para análise de redes sociais',
      icon: <Database size={18} className="text-purple-600" />,
      url: 'https://console.apify.com/account/integrations',
    },
    googleCseKey: {
      name: 'Google CSE Key',
      description: 'Chave de API do Google Custom Search (CSE)',
      icon: <Search size={18} className="text-amber-600" />,
      url: 'https://developers.google.com/custom-search/v1/introduction',
    },
    googleCseCx: {
      name: 'Google CSE CX',
      description: 'ID do mecanismo de busca (cx) do Google CSE',
      icon: <Search size={18} className="text-amber-600" />,
      url: 'https://programmablesearchengine.google.com/',
    },
    bingApiKey: {
      name: 'Bing Web Search',
      description: 'Chave do Bing Web Search (Azure Cognitive Services)',
      icon: <Search size={18} className="text-blue-600" />,
      url: 'https://portal.azure.com/',
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Key size={18} className="text-indigo-600" />
        <div>
          <h3 className="font-bold text-slate-800">API Keys</h3>
          <p className="text-xs text-slate-500">Configure as chaves de API para IA e serviços de pesquisa</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'ai'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          🤖 Modelos de IA
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'research'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          🔍 Serviços de Pesquisa
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Tab de Modelos de IA */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          {Object.values(AiModel).map(model => {
            const isConfigured = hasApiKey(model);
            const isEditing = editingKey === model;
            const currentKey = keys[model];

            return (
              <div
                key={model}
                className={`border rounded-lg p-4 transition-colors ${
                  isConfigured ? 'border-green-200 bg-green-50/30' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-800">{model}</h4>
                      {isConfigured && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          CONFIGURADA
                        </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{modelDescriptions[model]}</p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      placeholder="Cole sua API Key aqui"
                      className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveKey(model)}
                      disabled={!tempKey.trim()}
                      className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-3">
                  {isConfigured && currentKey ? (
                    <>
                      <div className="flex-1 bg-slate-100 rounded-md px-3 py-2 text-sm font-mono text-slate-600">
                        {showKeys[model] ? currentKey : maskApiKey(currentKey)}
                      </div>
                      <button
                        onClick={() => toggleShowKey(model)}
                        className="p-2 hover:bg-slate-100 rounded-md text-slate-500"
                        title={showKeys[model] ? 'Ocultar' : 'Mostrar'}
                      >
                        {showKeys[model] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleEditKey(model)}
                        className="px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
                      >
                        Editar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditKey(model)}
                      className="w-full px-4 py-2 border border-indigo-200 text-indigo-600 text-sm rounded-md hover:bg-indigo-50"
                    >
                      + Adicionar API Key
                    </button>
                  )}
                </div>
              )}
            </div>
          );
          })}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Sobre as API Keys:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>As keys são salvas localmente no seu navegador</li>
                  <li>OpenAI: Obtenha em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a></li>
                  <li>Gemini: Obtenha em <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                  <li>Configure apenas as keys dos modelos que você usa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab de Serviços de Pesquisa */}
      {activeTab === 'research' && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Proxy (opcional)</h4>
            <p className="text-xs text-slate-500 mb-2">Se estiver usando o proxy local, você pode salvar o token aqui para que o cliente envie automaticamente.</p>
            <div className="flex gap-2">
              <input
                type={showProxyToken ? 'text' : 'password'}
                value={proxyToken}
                onChange={e => setProxyToken(e.target.value)}
                placeholder="Proxy token (opcional)"
                className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm font-mono"
              />
              <button
                onClick={() => setShowProxyToken(s => !s)}
                className="px-3 py-2 bg-slate-100 rounded-md"
              >
                {showProxyToken ? 'Ocultar' : 'Mostrar'}
              </button>
              <button
                onClick={() => {
                  if (!proxyToken.trim()) return;
                  saveProxyToken(proxyToken.trim());
                  setMessage({ type: 'success', text: 'Proxy token salvo localmente' });
                  setTimeout(() => setMessage(null), 2500);
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md"
              >Salvar</button>
              <button
                onClick={() => { removeProxyToken(); setProxyToken(''); setMessage({ type: 'success', text: 'Proxy token removido' }); setTimeout(() => setMessage(null), 2500); }}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-md border border-red-100"
              >Remover</button>
            </div>
          </div>
          {(['serpApi', 'apify', 'googleCseKey', 'googleCseCx', 'bingApiKey'] as const).map(service => {
            const serviceInfo = externalServiceDescriptions[service];
            const isConfigured = !!externalKeys[service];
            const isEditing = editingKey === service;
            const currentKey = externalKeys[service];

            return (
              <div
                key={service}
                className={`border rounded-lg p-4 transition-colors ${
                  isConfigured ? 'border-green-200 bg-green-50/30' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {serviceInfo.icon}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-800">{serviceInfo.name}</h4>
                        {isConfigured && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            CONFIGURADA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{serviceInfo.description}</p>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempKey}
                        onChange={(e) => setTempKey(e.target.value)}
                        placeholder="Cole sua API Key aqui"
                        className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveExternalKey(service)}
                        disabled={!tempKey.trim()}
                        className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-3">
                    {isConfigured && currentKey ? (
                      <>
                        <div className="flex-1 bg-slate-100 rounded-md px-3 py-2 text-sm font-mono text-slate-600">
                          {showKeys[service] ? currentKey : maskApiKey(currentKey)}
                        </div>
                        <button
                          onClick={() => toggleShowKey(service)}
                          className="p-2 hover:bg-slate-100 rounded-md text-slate-500"
                          title={showKeys[service] ? 'Ocultar' : 'Mostrar'}
                        >
                          {showKeys[service] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingKey(service);
                            setTempKey(currentKey);
                          }}
                          className="px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
                        >
                          Editar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingKey(service);
                          setTempKey('');
                        }}
                        className="w-full px-4 py-2 border border-indigo-200 text-indigo-600 text-sm rounded-md hover:bg-indigo-50"
                      >
                        + Adicionar API Key
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-purple-800">
                <p className="font-semibold mb-1">Sobre os Serviços de Pesquisa:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>SerpAPI</strong>: Permite buscar dados reais do Google. <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="underline">Obter key</a> (~$50/mês)</li>
                  <li><strong>Apify</strong>: Permite coletar dados de Instagram e Facebook. <a href="https://apify.com" target="_blank" rel="noopener noreferrer" className="underline">Obter key</a> (plano gratuito disponível)</li>
                  <li><strong>Google CSE</strong>: Alternativa nativa do Google (use Key + CX). <a href="https://developers.google.com/custom-search/v1/overview" target="_blank" rel="noopener noreferrer" className="underline">Documentação</a></li>
                  <li><strong>Bing Web Search</strong>: Opcional para maior cobertura. <a href="https://learn.microsoft.com/azure/cognitive-services/bing-web-search/" target="_blank" rel="noopener noreferrer" className="underline">Documentação</a></li>
                  <li>Sem essas keys, a pesquisa usará análise por IA (menos precisa)</li>
                  <li>Com as keys, você terá dados reais e profundos dos concorrentes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
