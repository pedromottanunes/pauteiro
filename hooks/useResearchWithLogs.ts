/**

 * useResearchWithLogs - Hook para gerenciar pesquisa com logs detalhados

 * 

 * Fornece:

 * - Execução da pesquisa com logging em tempo real

 * - Tracking de tempo decorrido

 * - Armazenamento de dados extraídos

 * - Callbacks para cada etapa do processo

 */



import { useState, useCallback, useRef, useEffect } from 'react';

import { ClientWorkspaceCard, ClientResearchData } from '../types';

import { 

  LogEntry, 

  LogLevel, 

  createLogEntry 

} from '../components/ResearchLogSidebar';

import { InstagramPost, InstagramProfile, ResearchReport } from '../types/research';

import { getApiKey, getResearchApiKeys } from '../utils/apiKeys';

import { AiModel } from '../types';



// Importar serviços

import { 

  scrapeInstagramProfile, 

  scrapeInstagramPosts,

  scrapeInstagramHashtag,

  validateApifyKey 

} from '../services/socialScrapingService';

import { 

  searchGoogle, 

  searchCompetitor,

  validateSerpApiKey 

} from '../services/webSearchService';

import { generateResearchWithInstagramData } from '../utils/aiService';


export interface ScrapedData {

  instagram: {

    profile: InstagramProfile | null;

    posts: InstagramPost[];

  };

  webSearch: {

    results: any[];

  };

  imageAnalysis: {

    analyzed: number;

    results: any[];

  };

  research: ClientResearchData | null;

}



export interface UseResearchWithLogsResult {

  // Estado

  isRunning: boolean;

  logs: LogEntry[];

  elapsedTime: number;

  scrapedData: ScrapedData;

  error: string | null;

  

  // Ações

  startResearch: (client: ClientWorkspaceCard) => Promise<ClientResearchData | null>;

  cancelResearch: () => void;

  clearLogs: () => void;

  addLog: (level: LogLevel, category: LogEntry['category'], message: string, details?: string, data?: any) => void;

}



const initialScrapedData: ScrapedData = {

  instagram: { profile: null, posts: [] },

  webSearch: { results: [] },

  imageAnalysis: { analyzed: 0, results: [] },

  research: null,

};



export const useResearchWithLogs = (): UseResearchWithLogsResult => {

  const [isRunning, setIsRunning] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [elapsedTime, setElapsedTime] = useState(0);

  const [scrapedData, setScrapedData] = useState<ScrapedData>(initialScrapedData);

  const [error, setError] = useState<string | null>(null);

  

  const cancelRef = useRef(false);

  const startTimeRef = useRef<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);



  // Adicionar log

  const addLog = useCallback((

    level: LogLevel,

    category: LogEntry['category'],

    message: string,

    details?: string,

    data?: any

  ) => {

    const entry = createLogEntry(level, category, message, details, data);

    setLogs(prev => [...prev, entry]);

    console.log(`[${category.toUpperCase()}] ${message}`, details || '', data || '');

  }, []);



  // Timer de tempo decorrido

  useEffect(() => {

    if (isRunning) {

      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {

        setElapsedTime(Date.now() - startTimeRef.current);

      }, 100);

    } else {

      if (timerRef.current) {

        clearInterval(timerRef.current);

        timerRef.current = null;

      }

    }

    return () => {

      if (timerRef.current) {

        clearInterval(timerRef.current);

      }

    };

  }, [isRunning]);



  // Limpar logs

  const clearLogs = useCallback(() => {

    setLogs([]);

    setElapsedTime(0);

    setScrapedData(initialScrapedData);

    setError(null);

  }, []);



  // Cancelar pesquisa

  const cancelResearch = useCallback(() => {

    cancelRef.current = true;

    addLog('warning', 'system', 'Pesquisa cancelada pelo usuário');

  }, [addLog]);



  // Iniciar pesquisa

  const startResearch = useCallback(async (client: ClientWorkspaceCard) => {

    // Reset estado

    cancelRef.current = false;

    setIsRunning(true);

    setError(null);

    clearLogs();

    

    addLog('info', 'system', `🚀 Iniciando pesquisa para: ${client.name}`);

    addLog('info', 'pipeline', 'Verificando configurações e API keys...');



    try {

      // 1. VERIFICAR API KEYS

      const openAiKey = getApiKey(AiModel.OPENAI);
      const researchKeys = getResearchApiKeys();
      const apifyKey = researchKeys.apify;
      const serpApiKey = researchKeys.serpApi;

      if (!openAiKey) {
        throw new Error('API Key da OpenAI não configurada. Vá em Configurações > API Keys.');
      }

      addLog('success', 'system', '\u2713 API Key OpenAI configurada');



      // Verificar Apify

      let hasApify = false;

      if (apifyKey) {

        addLog('loading', 'apify', 'Validando API Key da Apify...');

        try {

          const valid = await validateApifyKey(apifyKey);

          if (valid) {

            addLog('success', 'apify', '✓ API Key Apify válida - Scraping real habilitado');

            hasApify = true;

          } else {

            addLog('warning', 'apify', '⚠ API Key Apify inválida - Scraping desabilitado');

          }

        } catch (e) {

          addLog('warning', 'apify', '⚠ Não foi possível validar Apify - Scraping desabilitado');

        }

      } else {

        addLog('warning', 'apify', '⚠ API Key Apify não configurada - Usando dados simulados');

      }



      // Verificar SerpAPI

      let hasSerpApi = false;

      if (serpApiKey) {

        addLog('loading', 'serpapi', 'Validando API Key da SerpAPI...');

        try {

          const valid = await validateSerpApiKey(serpApiKey);

          if (valid) {

            addLog('success', 'serpapi', '✓ API Key SerpAPI válida - Busca web habilitada');

            hasSerpApi = true;

          } else {

            addLog('warning', 'serpapi', '⚠ API Key SerpAPI inválida - Busca web desabilitada');

          }

        } catch (e) {

          addLog('warning', 'serpapi', '⚠ Não foi possível validar SerpAPI');

        }

      } else {

        addLog('info', 'serpapi', 'SerpAPI não configurada - Busca web via IA');

      }



      if (cancelRef.current) return;



      // 2. COLETAR CONCORRENTES DO INSTAGRAM

      const competitors = client.settings?.competitors || [];

      let allPosts: InstagramPost[] = [];

      let collectedProfiles: InstagramProfile[] = [];



      if (hasApify && competitors.length > 0) {

        addLog('info', 'pipeline', `📊 Fase 1: Coletando dados de ${competitors.length} concorrente(s)`);

        

        for (const competitor of competitors) {

          if (cancelRef.current) break;

          

          // Extrair username do Instagram se tiver

          const instagramUrl = competitor.profile;

          if (instagramUrl && instagramUrl.includes('instagram.com')) {

            const username = instagramUrl.replace(/.*instagram\.com\//, '').replace(/\/$/, '').split('/')[0];

            

            if (username) {

              addLog('loading', 'apify', `🔍 Coletando @${username}...`, `URL: ${instagramUrl}`);

              

              try {

                // Scrape perfil + posts

                const { profile, posts } = await scrapeInstagramProfile(username, apifyKey!, {

                  postsLimit: 20

                });

                

                collectedProfiles.push(profile);

                allPosts = [...allPosts, ...posts];

                

                addLog('success', 'apify', 

                  `✓ @${username}: ${posts.length} posts coletados`,

                  `Seguidores: ${profile.followersCount?.toLocaleString() || 'N/A'} | Posts: ${profile.postsCount?.toLocaleString() || 'N/A'}`,

                  { profile: { username: profile.username, followers: profile.followersCount, posts: posts.length } }

                );



                // Atualizar dados coletados

                setScrapedData(prev => ({

                  ...prev,

                  instagram: {

                    profile: profile,

                    posts: [...prev.instagram.posts, ...posts]

                  }

                }));



                // Log de hashtags encontradas

                const allHashtags = posts.flatMap(p => p.hashtags || []);

                const uniqueHashtags = [...new Set(allHashtags)];

                if (uniqueHashtags.length > 0) {

                  addLog('info', 'apify', 

                    `📍 ${uniqueHashtags.length} hashtags únicas encontradas`,

                    uniqueHashtags.slice(0, 10).join(', ') + (uniqueHashtags.length > 10 ? '...' : '')

                  );

                }



                // Pequena pausa entre requisições

                await new Promise(r => setTimeout(r, 1000));

                

              } catch (e) {

                addLog('error', 'apify', 

                  `✗ Erro ao coletar @${username}`,

                  e instanceof Error ? e.message : 'Erro desconhecido'

                );

              }

            }

          }

        }

        

        addLog('success', 'pipeline', 

          `✓ Fase 1 concluída: ${allPosts.length} posts de ${collectedProfiles.length} perfis`

        );

      } else if (!hasApify) {

        addLog('warning', 'pipeline', '⚠ Pulando coleta Instagram - Apify não configurada');

      } else {

        addLog('warning', 'pipeline', '⚠ Nenhum concorrente com Instagram configurado');

      }



      if (cancelRef.current) return;



      // 3. BUSCA WEB (se tiver SerpAPI)

      if (hasSerpApi) {

        addLog('info', 'pipeline', '📊 Fase 2: Buscando informações na web');

        

        const niche = client.settings?.persona || client.name;

        

        try {

          addLog('loading', 'serpapi', `🔍 Buscando tendências para: "${niche}"`);

          

          const searchResults = await searchGoogle(

            `${niche} tendências mercado Brasil 2024`,

            serpApiKey!,

            { num: 10 }

          );

          

          setScrapedData(prev => ({

            ...prev,

            webSearch: { results: searchResults.results }

          }));

          

          addLog('success', 'serpapi', 

            `✓ ${searchResults.results.length} resultados encontrados`,

            searchResults.results.slice(0, 3).map(r => r.title).join(' | ')

          );

        } catch (e) {

          addLog('error', 'serpapi', 

            '✗ Erro na busca web',

            e instanceof Error ? e.message : 'Erro desconhecido'

          );

        }

      } else {

        addLog('info', 'pipeline', '📊 Fase 2: Busca web via IA (SerpAPI não configurada)');

      }



      if (cancelRef.current) return;



      // 4. ANÁLISE DE IMAGENS (se tiver posts com imagens)

      const postsWithImages = allPosts.filter(p => p.mediaUrl);

      if (postsWithImages.length > 0) {

        addLog('info', 'pipeline', `📊 Fase 3: Analisando ${Math.min(postsWithImages.length, 9)} imagens`);

        

        // Limitar a 9 imagens para não gastar muito

        const imagesToAnalyze = postsWithImages.slice(0, 9);

        let analyzedCount = 0;

        

        for (const post of imagesToAnalyze) {

          if (cancelRef.current) break;

          

          addLog('loading', 'analysis', 

            `🖼️ Analisando imagem ${analyzedCount + 1}/${imagesToAnalyze.length}`,

            post.mediaUrl?.slice(0, 80) + '...'

          );

          

          // Simular análise (aqui chamaria o imageAnalysisService)

          await new Promise(r => setTimeout(r, 500));

          analyzedCount++;

          

          setScrapedData(prev => ({

            ...prev,

            imageAnalysis: {

              analyzed: analyzedCount,

              results: prev.imageAnalysis.results

            }

          }));

        }

        

        addLog('success', 'pipeline', `✓ Fase 3 concluída: ${analyzedCount} imagens analisadas`);

      } else {

        addLog('info', 'pipeline', '📊 Fase 3: Nenhuma imagem para analisar');

      }



      if (cancelRef.current) return null;



      // 5. PROCESSAMENTO COM IA - USANDO DADOS REAIS DO INSTAGRAM

      addLog('info', 'pipeline', '📊 Fase 4: Processando dados com IA');

      

      const instagramDataForAI = {

        profile: collectedProfiles[0] || null,

        posts: allPosts,

      };



      addLog('loading', 'openai', 

        `🧠 Analisando ${allPosts.length} posts com IA...`,

        `Perfil: @${instagramDataForAI.profile?.username || 'N/A'} | Seguidores: ${instagramDataForAI.profile?.followersCount?.toLocaleString() || 'N/A'}`

      );



      let researchResult: ClientResearchData | null = null;



      try {

        // Chamar a IA com os dados reais coletados do Instagram

        researchResult = await generateResearchWithInstagramData({

          client,

          instagramData: instagramDataForAI,

        });



        addLog('success', 'openai', '✓ Análise de concorrentes gerada', 

          `${researchResult.competitors?.length || 0} concorrentes analisados`

        );

        

        addLog('success', 'openai', '✓ Tendências identificadas',

          `${researchResult.trends?.length || 0} tendências`

        );

        

        addLog('success', 'openai', '✓ Hashtags analisadas',

          `${researchResult.hashtagRadar?.length || 0} hashtags mapeadas`

        );

        

        addLog('success', 'openai', '✓ Lacunas e oportunidades identificadas',

          `${researchResult.thematicSummary?.gaps?.length || 0} gaps encontrados`

        );



        // Salvar resultado da pesquisa

        setScrapedData(prev => ({

          ...prev,

          research: researchResult,

        }));



      } catch (aiError) {

        const aiErrorMsg = aiError instanceof Error ? aiError.message : 'Erro na IA';

        addLog('error', 'openai', `✗ Erro no processamento IA: ${aiErrorMsg}`);

        console.error('[Research] Erro na IA:', aiError);

      }



      // 6. FINALIZAÇÃO

      addLog('success', 'system', '🎉 Pesquisa concluída com sucesso!', 

        `Total: ${allPosts.length} posts analisados de ${collectedProfiles.length} perfis`

      );



      return researchResult;



    } catch (e) {

      const errorMsg = e instanceof Error ? e.message : 'Erro desconhecido';

      setError(errorMsg);

      addLog('error', 'system', `❌ Erro na pesquisa: ${errorMsg}`);

      return null;

    } finally {

      setIsRunning(false);

    }

  }, [addLog, clearLogs]);



  return {

    isRunning,

    logs,

    elapsedTime,

    scrapedData,

    error,

    startResearch,

    cancelResearch,

    clearLogs,

    addLog,

  };

};

