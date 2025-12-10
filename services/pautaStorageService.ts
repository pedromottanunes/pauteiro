/**
 * Serviço de Persistência de Pautas
 * Salva e recupera pautas geradas do localStorage por cliente
 */

import { PautaCompleta } from './pautaGenerationService';

const STORAGE_KEY_PREFIX = 'gencontent_pautas_';

export interface PautasSalvas {
  clientId: string;
  pautas: PautaCompleta[];
  lastUpdated: string;
  insights?: {
    tendencias: string[];
    oportunidades: string[];
    alertas: string[];
  };
}

/**
 * Salva pautas de um cliente
 */
export const savePautas = (clientId: string, pautas: PautaCompleta[], insights?: PautasSalvas['insights']): void => {
  try {
    const data: PautasSalvas = {
      clientId,
      pautas,
      lastUpdated: new Date().toISOString(),
      insights,
    };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${clientId}`, JSON.stringify(data));
    console.log(`[Pautas Storage] 💾 ${pautas.length} pautas salvas para cliente ${clientId}`);
  } catch (error) {
    console.error('[Pautas Storage] Erro ao salvar:', error);
  }
};

/**
 * Carrega pautas de um cliente
 */
export const loadPautas = (clientId: string): PautasSalvas | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${clientId}`);
    if (!stored) return null;
    
    const data = JSON.parse(stored) as PautasSalvas;
    console.log(`[Pautas Storage] 📂 ${data.pautas.length} pautas carregadas para cliente ${clientId}`);
    return data;
  } catch (error) {
    console.error('[Pautas Storage] Erro ao carregar:', error);
    return null;
  }
};

/**
 * Remove uma pauta específica
 */
export const removePauta = (clientId: string, pautaId: string): PautaCompleta[] => {
  const data = loadPautas(clientId);
  if (!data) return [];
  
  const pautasAtualizadas = data.pautas.filter(p => p.id !== pautaId);
  savePautas(clientId, pautasAtualizadas, data.insights);
  
  console.log(`[Pautas Storage] 🗑️ Pauta ${pautaId} removida`);
  return pautasAtualizadas;
};

/**
 * Atualiza uma pauta específica
 */
export const updatePauta = (clientId: string, pautaId: string, updates: Partial<PautaCompleta>): PautaCompleta[] => {
  const data = loadPautas(clientId);
  if (!data) return [];
  
  const pautasAtualizadas = data.pautas.map(p => 
    p.id === pautaId ? { ...p, ...updates } : p
  );
  savePautas(clientId, pautasAtualizadas, data.insights);
  
  return pautasAtualizadas;
};

/**
 * Adiciona novas pautas (mantendo as existentes)
 */
export const addPautas = (clientId: string, novasPautas: PautaCompleta[], insights?: PautasSalvas['insights']): PautaCompleta[] => {
  const data = loadPautas(clientId);
  const pautasExistentes = data?.pautas || [];
  
  // Evita duplicatas por ID
  const idsExistentes = new Set(pautasExistentes.map(p => p.id));
  const pautasNovas = novasPautas.filter(p => !idsExistentes.has(p.id));
  
  const todasPautas = [...pautasExistentes, ...pautasNovas];
  savePautas(clientId, todasPautas, insights || data?.insights);
  
  console.log(`[Pautas Storage] ➕ ${pautasNovas.length} novas pautas adicionadas`);
  return todasPautas;
};

/**
 * Limpa todas as pautas de um cliente
 */
export const clearPautas = (clientId: string): void => {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${clientId}`);
  console.log(`[Pautas Storage] 🧹 Pautas do cliente ${clientId} removidas`);
};

/**
 * Lista todos os clientes com pautas salvas
 */
export const listClientesComPautas = (): string[] => {
  const clientes: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      clientes.push(key.replace(STORAGE_KEY_PREFIX, ''));
    }
  }
  return clientes;
};

/**
 * Obtém estatísticas das pautas
 */
export const getPautasStats = (clientId: string): {
  total: number;
  aprovadas: number;
  rascunhos: number;
  mediaScore: number;
} => {
  const data = loadPautas(clientId);
  if (!data || data.pautas.length === 0) {
    return { total: 0, aprovadas: 0, rascunhos: 0, mediaScore: 0 };
  }
  
  const aprovadas = data.pautas.filter(p => p.status === 'aprovado').length;
  const rascunhos = data.pautas.filter(p => p.status === 'rascunho').length;
  const mediaScore = data.pautas.reduce((acc, p) => acc + (p.scoring?.total || 0), 0) / data.pautas.length;
  
  return {
    total: data.pautas.length,
    aprovadas,
    rascunhos,
    mediaScore: Math.round(mediaScore),
  };
};
