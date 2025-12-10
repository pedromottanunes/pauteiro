/**
 * Hook para gerenciamento avançado de pautas
 * Integra com o serviço de geração multi-agente e persistência
 */

import { useState, useCallback, useEffect } from 'react';
import { Post, ClientWorkspaceCard } from '../types';
import { 
  generatePautasAvancadas, 
  convertPautaToPost,
  PautaCompleta,
  PautaGenerationContext,
} from '../services/pautaGenerationService';
import {
  savePautas,
  loadPautas,
  removePauta,
  updatePauta,
  clearPautas,
  addPautas,
  getPautasStats,
} from '../services/pautaStorageService';

export interface PautaLog {
  timestamp: Date;
  fase: string;
  mensagem: string;
  tipo: 'info' | 'success' | 'error' | 'warning';
}

export interface PautaConfig {
  // Quantidade
  count: number;
  
  // Criatividade e estilo
  creativity: number;      // 0-100: baixo = seguro, alto = experimental
  depth: number;           // 0-100: baixo = resumido, alto = detalhado
  
  // Variantes
  variants: number;        // 0-5: quantidade de variantes A/B
  
  // Foco do conteúdo (pesos para os agentes)
  focusEngagement: number; // 0-100: peso para conteúdo viral/engajamento
  focusAuthority: number;  // 0-100: peso para conteúdo educativo/autoridade
  focusConversion: number; // 0-100: peso para conteúdo de conversão/vendas
  
  // Opções de geração
  includeHashtags: boolean;
  includeVisualDirective: boolean;
  includeCTA: boolean;
  includeRisks: boolean;
  
  // Modo de adição
  appendMode: boolean;     // true = adiciona às existentes, false = substitui
}

export interface UsePautasState {
  // Estado principal
  pautas: PautaCompleta[];
  pautaSelecionada: PautaCompleta | null;
  
  // Estado de processamento
  isGenerating: boolean;
  isRegenerating: string | null; // ID da pauta sendo regenerada
  currentPhase: string;
  progress: number;
  
  // Logs e métricas
  logs: PautaLog[];
  metricas: {
    tempoTotal: number;
    tokensUsados: number;
    pautasGeradas: number;
  };
  
  // Insights
  insights: {
    tendencias: string[];
    oportunidades: string[];
    alertas: string[];
  };
  
  // Estatísticas
  stats: {
    total: number;
    aprovadas: number;
    rascunhos: number;
    mediaScore: number;
  };
  
  // Configurações
  config: PautaConfig;
  
  // Cliente atual
  currentClientId: string | null;
}

export interface UsePautasActions {
  // Inicialização
  initForClient: (client: ClientWorkspaceCard) => void;
  
  // Geração
  generatePautas: (client: ClientWorkspaceCard) => Promise<void>;
  regeneratePauta: (pautaId: string, client: ClientWorkspaceCard) => Promise<void>;
  regenerateAllPautas: (client: ClientWorkspaceCard) => Promise<void>;
  
  // Seleção
  selectPauta: (pauta: PautaCompleta | null) => void;
  
  // Ações individuais
  approvePauta: (pautaId: string) => void;
  rejectPauta: (pautaId: string) => void;
  deletePauta: (pautaId: string) => void;
  editPauta: (pautaId: string, updates: Partial<PautaCompleta>) => void;
  
  // Variantes
  selectVariant: (pautaId: string, variantId: string) => void;
  
  // Ações em lote
  approveAllPautas: () => void;
  deleteAllPautas: () => void;
  deleteSelectedPautas: (pautaIds: string[]) => void;
  
  // Configurações
  setConfig: (config: Partial<PautaConfig>) => void;
  resetConfig: () => void;
  
  // Utilidades
  convertToLegacyPosts: () => Post[];
  clearLogs: () => void;
  exportPautas: () => string;
  importPautas: (json: string) => boolean;
}

const DEFAULT_CONFIG: PautaConfig = {
  count: 5,
  creativity: 70,
  depth: 80,
  variants: 2,
  focusEngagement: 40,
  focusAuthority: 30,
  focusConversion: 30,
  includeHashtags: true,
  includeVisualDirective: true,
  includeCTA: true,
  includeRisks: true,
  appendMode: false,
};

const PHASES = [
  { id: 'analise', label: 'Analisando contexto...', progress: 15 },
  { id: 'ideacao', label: 'Gerando ideias multi-agente...', progress: 35 },
  { id: 'refinamento', label: 'Refinando pautas...', progress: 55 },
  { id: 'variantes', label: 'Criando variantes A/B...', progress: 75 },
  { id: 'scoring', label: 'Avaliando qualidade...', progress: 90 },
  { id: 'completo', label: 'Pautas prontas!', progress: 100 },
];

export const usePautas = (): UsePautasState & UsePautasActions => {
  const [pautas, setPautas] = useState<PautaCompleta[]>([]);
  const [pautaSelecionada, setPautaSelecionada] = useState<PautaCompleta | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState('');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<PautaLog[]>([]);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [metricas, setMetricas] = useState({
    tempoTotal: 0,
    tokensUsados: 0,
    pautasGeradas: 0,
  });
  const [insights, setInsights] = useState({
    tendencias: [] as string[],
    oportunidades: [] as string[],
    alertas: [] as string[],
  });
  const [stats, setStats] = useState({
    total: 0,
    aprovadas: 0,
    rascunhos: 0,
    mediaScore: 0,
  });
  const [config, setConfigState] = useState<PautaConfig>(DEFAULT_CONFIG);

  // Atualiza estatísticas quando pautas mudam
  useEffect(() => {
    if (currentClientId) {
      const newStats = getPautasStats(currentClientId);
      setStats(newStats);
    }
  }, [pautas, currentClientId]);

  const addLog = useCallback((fase: string, mensagem: string, tipo: PautaLog['tipo'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date(),
      fase,
      mensagem,
      tipo,
    }]);
  }, []);

  // Inicializa para um cliente (carrega pautas salvas)
  const initForClient = useCallback((client: ClientWorkspaceCard) => {
    setCurrentClientId(client.id);
    const saved = loadPautas(client.id);
    if (saved) {
      setPautas(saved.pautas);
      if (saved.insights) {
        setInsights({
          tendencias: saved.insights.tendencias || [],
          oportunidades: saved.insights.oportunidades || [],
          alertas: saved.insights.alertas || [],
        });
      }
      addLog('init', `📂 ${saved.pautas.length} pautas carregadas do armazenamento`, 'info');
    } else {
      setPautas([]);
      setInsights({ tendencias: [], oportunidades: [], alertas: [] });
    }
  }, [addLog]);

  // Gera pautas
  const generatePautas = useCallback(async (client: ClientWorkspaceCard) => {
    setIsGenerating(true);
    setProgress(0);
    setLogs([]);
    setCurrentClientId(client.id);
    
    addLog('inicio', `🚀 Iniciando geração de ${config.count} pautas para ${client.name}`, 'info');

    let currentPhaseIndex = 0;
    const progressInterval = setInterval(() => {
      if (currentPhaseIndex < PHASES.length) {
        const phase = PHASES[currentPhaseIndex];
        setCurrentPhase(phase.label);
        setProgress(phase.progress);
        addLog(phase.id, phase.label, 'info');
        currentPhaseIndex++;
      }
    }, 2000);

    try {
      const context: PautaGenerationContext = {
        client,
        researchData: client.researchData,
        preferences: {
          creativity: config.creativity,
          depth: config.depth,
          variants: config.variants,
        },
      };

      addLog('contexto', `📊 Contexto preparado - ${client.researchData?.competitors?.length || 0} concorrentes`, 'info');

      const result = await generatePautasAvancadas(context, config.count);

      clearInterval(progressInterval);
      setProgress(100);
      setCurrentPhase('Pautas prontas!');

      const newInsights = {
        tendencias: result.insights?.tendenciasIdentificadas || [],
        oportunidades: result.insights?.oportunidadesDetectadas || [],
        alertas: result.insights?.alertas || [],
      };

      // Decide se adiciona ou substitui
      let finalPautas: PautaCompleta[];
      if (config.appendMode) {
        finalPautas = addPautas(client.id, result.pautas, newInsights);
      } else {
        savePautas(client.id, result.pautas, newInsights);
        finalPautas = result.pautas;
      }

      setPautas(finalPautas);
      setInsights(newInsights);
      setMetricas({
        tempoTotal: result.metricas.tempoProcessamento,
        tokensUsados: result.metricas.tokensUsados,
        pautasGeradas: result.pautas.length,
      });

      addLog('sucesso', `✅ ${result.pautas.length} pautas geradas em ${(result.metricas.tempoProcessamento / 1000).toFixed(1)}s`, 'success');
      
      result.pautas.forEach((pauta, idx) => {
        addLog('pauta', `📝 Pauta ${idx + 1}: "${pauta.titulo}" - Score: ${pauta.scoring?.total || 50}/100`, 
          (pauta.scoring?.recomendacao || 'revisar') === 'publicar' ? 'success' : 'warning');
      });

    } catch (error) {
      clearInterval(progressInterval);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog('erro', `❌ Erro na geração: ${errorMessage}`, 'error');
      setCurrentPhase('Erro na geração');
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setCurrentPhase('');
        setProgress(0);
      }, 3000);
    }
  }, [config, addLog]);

  // Regenera uma pauta específica
  const regeneratePauta = useCallback(async (pautaId: string, client: ClientWorkspaceCard) => {
    setIsRegenerating(pautaId);
    addLog('regeneracao', `🔄 Regenerando pauta...`, 'info');
    
    try {
      const context: PautaGenerationContext = {
        client,
        researchData: client.researchData,
        preferences: {
          creativity: Math.min(config.creativity + 15, 100),
          depth: config.depth,
          variants: 0,
        },
      };

      const result = await generatePautasAvancadas(context, 1);
      
      if (result.pautas.length > 0) {
        const novaPauta = { ...result.pautas[0], id: pautaId };
        const pautasAtualizadas = pautas.map(p => p.id === pautaId ? novaPauta : p);
        
        setPautas(pautasAtualizadas);
        savePautas(client.id, pautasAtualizadas, insights);
        
        if (pautaSelecionada?.id === pautaId) {
          setPautaSelecionada(novaPauta);
        }
        
        addLog('regeneracao', `✅ Pauta regenerada: "${novaPauta.titulo}"`, 'success');
      }
    } catch (error) {
      addLog('regeneracao', `❌ Erro ao regenerar: ${error instanceof Error ? error.message : 'Erro'}`, 'error');
    } finally {
      setIsRegenerating(null);
    }
  }, [config, pautas, pautaSelecionada, insights, addLog]);

  // Regenera todas as pautas
  const regenerateAllPautas = useCallback(async (client: ClientWorkspaceCard) => {
    await generatePautas(client);
  }, [generatePautas]);

  const selectPauta = useCallback((pauta: PautaCompleta | null) => {
    setPautaSelecionada(pauta);
  }, []);

  // Aprova uma pauta
  const approvePauta = useCallback((pautaId: string) => {
    if (!currentClientId) return;
    
    const pautasAtualizadas = updatePauta(currentClientId, pautaId, { status: 'aprovado' });
    setPautas(pautasAtualizadas);
    
    if (pautaSelecionada?.id === pautaId) {
      setPautaSelecionada(prev => prev ? { ...prev, status: 'aprovado' } : null);
    }
    
    addLog('aprovacao', `✅ Pauta aprovada`, 'success');
  }, [currentClientId, pautaSelecionada, addLog]);

  // Rejeita uma pauta (volta para rascunho)
  const rejectPauta = useCallback((pautaId: string) => {
    if (!currentClientId) return;
    
    const pautasAtualizadas = updatePauta(currentClientId, pautaId, { status: 'rascunho' });
    setPautas(pautasAtualizadas);
    
    if (pautaSelecionada?.id === pautaId) {
      setPautaSelecionada(prev => prev ? { ...prev, status: 'rascunho' } : null);
    }
    
    addLog('rejeicao', `↩️ Pauta voltou para rascunho`, 'info');
  }, [currentClientId, pautaSelecionada, addLog]);

  // Deleta uma pauta
  const deletePauta = useCallback((pautaId: string) => {
    if (!currentClientId) return;
    
    const pautasAtualizadas = removePauta(currentClientId, pautaId);
    setPautas(pautasAtualizadas);
    
    if (pautaSelecionada?.id === pautaId) {
      setPautaSelecionada(null);
    }
    
    addLog('delete', `🗑️ Pauta removida`, 'warning');
  }, [currentClientId, pautaSelecionada, addLog]);

  // Edita uma pauta
  const editPauta = useCallback((pautaId: string, updates: Partial<PautaCompleta>) => {
    if (!currentClientId) return;
    
    const pautasAtualizadas = updatePauta(currentClientId, pautaId, updates);
    setPautas(pautasAtualizadas);
    
    if (pautaSelecionada?.id === pautaId) {
      setPautaSelecionada(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentClientId, pautaSelecionada]);

  // Seleciona uma variante
  const selectVariant = useCallback((pautaId: string, variantId: string) => {
    if (!currentClientId) return;
    
    const pauta = pautas.find(p => p.id === pautaId);
    if (!pauta) return;
    
    const variante = pauta.variantes?.find(v => v.id === variantId);
    if (!variante) return;

    const updates = {
      titulo: variante.titulo,
      gancho: variante.gancho,
      copy: {
        ...pauta.copy,
        media: variante.copy,
      },
    };

    const pautasAtualizadas = updatePauta(currentClientId, pautaId, updates);
    setPautas(pautasAtualizadas);
    
    if (pautaSelecionada?.id === pautaId) {
      setPautaSelecionada(prev => prev ? { ...prev, ...updates } : null);
    }
    
    addLog('variante', `🔀 Variante "${variante.nome}" aplicada`, 'info');
  }, [currentClientId, pautas, pautaSelecionada, addLog]);

  // Aprova todas as pautas
  const approveAllPautas = useCallback(() => {
    if (!currentClientId) return;
    
    const pautasAprovadas = pautas.map(p => ({ ...p, status: 'aprovado' as const }));
    savePautas(currentClientId, pautasAprovadas, insights);
    setPautas(pautasAprovadas);
    
    addLog('aprovacao', `✅ Todas as ${pautas.length} pautas foram aprovadas`, 'success');
  }, [currentClientId, pautas, insights, addLog]);

  // Deleta todas as pautas
  const deleteAllPautas = useCallback(() => {
    if (!currentClientId) return;
    
    clearPautas(currentClientId);
    setPautas([]);
    setPautaSelecionada(null);
    
    addLog('delete', `🗑️ Todas as pautas foram removidas`, 'warning');
  }, [currentClientId, addLog]);

  // Deleta pautas selecionadas
  const deleteSelectedPautas = useCallback((pautaIds: string[]) => {
    if (!currentClientId) return;
    
    let pautasAtualizadas = pautas;
    pautaIds.forEach(id => {
      pautasAtualizadas = pautasAtualizadas.filter(p => p.id !== id);
    });
    
    savePautas(currentClientId, pautasAtualizadas, insights);
    setPautas(pautasAtualizadas);
    
    if (pautaSelecionada && pautaIds.includes(pautaSelecionada.id)) {
      setPautaSelecionada(null);
    }
    
    addLog('delete', `🗑️ ${pautaIds.length} pautas removidas`, 'warning');
  }, [currentClientId, pautas, pautaSelecionada, insights, addLog]);

  // Atualiza configurações
  const setConfig = useCallback((newConfig: Partial<PautaConfig>) => {
    setConfigState(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Reset configurações
  const resetConfig = useCallback(() => {
    setConfigState(DEFAULT_CONFIG);
  }, []);

  // Converte para formato legado
  const convertToLegacyPosts = useCallback((): Post[] => {
    return pautas.map(convertPautaToPost);
  }, [pautas]);

  // Limpa logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Exporta pautas como JSON
  const exportPautas = useCallback((): string => {
    return JSON.stringify({
      pautas,
      insights,
      config,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }, [pautas, insights, config]);

  // Importa pautas de JSON
  const importPautas = useCallback((json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.pautas && Array.isArray(data.pautas)) {
        if (currentClientId) {
          savePautas(currentClientId, data.pautas, data.insights);
        }
        setPautas(data.pautas);
        if (data.insights) {
          setInsights(data.insights);
        }
        addLog('import', `📥 ${data.pautas.length} pautas importadas`, 'success');
        return true;
      }
      return false;
    } catch (error) {
      addLog('import', `❌ Erro ao importar: JSON inválido`, 'error');
      return false;
    }
  }, [currentClientId, addLog]);

  return {
    // Estado
    pautas,
    pautaSelecionada,
    isGenerating,
    isRegenerating,
    currentPhase,
    progress,
    logs,
    metricas,
    insights,
    stats,
    config,
    currentClientId,
    
    // Ações
    initForClient,
    generatePautas,
    regeneratePauta,
    regenerateAllPautas,
    selectPauta,
    approvePauta,
    rejectPauta,
    deletePauta,
    editPauta,
    selectVariant,
    approveAllPautas,
    deleteAllPautas,
    deleteSelectedPautas,
    setConfig,
    resetConfig,
    convertToLegacyPosts,
    clearLogs,
    exportPautas,
    importPautas,
  };
};
