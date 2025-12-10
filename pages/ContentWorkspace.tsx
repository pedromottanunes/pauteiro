import React, { useState, useEffect } from 'react';
import { Post, PipelineStatus, ContentType, ClientWorkspaceCard } from '../types';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import { ApiKeyStatus } from '../components/ApiKeyStatus';
import { 
  Sparkles, Edit2, Copy, Check, Info, RefreshCw, X, ChevronRight, Hash, 
  Image as ImageIcon, BrainCircuit, Settings, Zap, TrendingUp, Target,
  AlertTriangle, Clock, BarChart3, Lightbulb, FileText, Layers, ArrowRight,
  ThumbsUp, ThumbsDown, RotateCcw, Shuffle, Eye, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
import { usePautas } from '../hooks/usePautas';
import { PautaCompleta } from '../services/pautaGenerationService';
import { canUseAI } from '../utils/aiService';

interface Props {
  client: ClientWorkspaceCard;
  onUpdatePosts?: (posts: Post[]) => void;
}

export const ContentWorkspace: React.FC<Props> = ({ client, onUpdatePosts }) => {
  const {
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
    initForClient,
    generatePautas,
    selectPauta,
    approvePauta,
    rejectPauta,
    deletePauta,
    deleteAllPautas,
    editPauta,
    regeneratePauta,
    selectVariant,
    setConfig,
    convertToLegacyPosts,
    clearLogs,
  } = usePautas();

  const [showConfig, setShowConfig] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [copyVersion, setCopyVersion] = useState<'curta' | 'media' | 'longa'>('media');
  const [expandedVariants, setExpandedVariants] = useState(false);

  // Inicializa pautas quando o cliente muda
  useEffect(() => {
    if (client?.id) {
      initForClient(client);
    }
  }, [client?.id, initForClient]);

  // Sincroniza com o sistema legado quando pautas mudam
  useEffect(() => {
    if (onUpdatePosts && pautas.length > 0) {
      onUpdatePosts(convertToLegacyPosts());
    }
  }, [pautas, onUpdatePosts, convertToLegacyPosts]);

  const handleGenerate = async () => {
    const check = canUseAI(client.selectedModel);
    if (!check.canUse) {
      alert(check.message);
      return;
    }
    await generatePautas(client);
  };

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case ContentType.EDUCATIONAL: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ContentType.PROMOTION: return 'bg-green-100 text-green-700 border-green-200';
      case ContentType.BEHIND_THE_SCENES: return 'bg-purple-100 text-purple-700 border-purple-200';
      case ContentType.SOCIAL_PROOF: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ContentType.INSTITUTIONAL: return 'bg-slate-100 text-slate-700 border-slate-200';
      case ContentType.QUICK_TIP: return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'publicar': return 'bg-green-100 text-green-700 border-green-300';
      case 'revisar': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'descartar': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="text-indigo-600" size={24} />
            Geração Avançada de Pautas
          </h1>
          <p className="text-slate-500 mt-1">
            Pipeline multi-agente para: <span className="font-semibold text-slate-700">{client.name}</span>
          </p>
        </div>
        
        <div className="flex gap-3">
          {pautas.length > 0 && (
            <button 
              onClick={() => {
                if (confirm('Descartar todas as pautas?')) {
                  deleteAllPautas();
                }
              }}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Limpar Todas
            </button>
          )}
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Settings size={16} />
            Configurações
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-violet-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} />
            {isGenerating ? 'Gerando...' : 'Gerar Pautas Avançadas'}
          </button>
        </div>
      </div>

      <ApiKeyStatus model={client.selectedModel} className="mb-4" />

      {/* Config Panel */}
      {showConfig && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 animate-in slide-in-from-top duration-200">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Settings size={18} className="text-slate-500" />
            Configurações de Geração
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm text-slate-600 font-medium block mb-2">
                Quantidade de Pautas
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={config.count}
                onChange={(e) => setConfig({ count: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="text-sm text-slate-600 font-medium block mb-2">
                Criatividade: {config.creativity}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={config.creativity}
                onChange={(e) => setConfig({ creativity: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Seguro</span>
                <span>Experimental</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 font-medium block mb-2">
                Profundidade: {config.depth}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={config.depth}
                onChange={(e) => setConfig({ depth: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Resumido</span>
                <span>Detalhado</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-slate-600 font-medium block mb-2">
                Variantes A/B
              </label>
              <select
                value={config.variants}
                onChange={(e) => setConfig({ variants: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={0}>Nenhuma</option>
                <option value={1}>1 variante</option>
                <option value={2}>2 variantes</option>
                <option value={3}>3 variantes</option>
              </select>
            </div>
          </div>
          
          {/* Foco dos Agentes */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
              <BrainCircuit size={16} className="text-indigo-500" />
              Foco dos Agentes (balanço de estratégia)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-slate-600 font-medium block mb-2">
                  Engajamento: {config.focusEngagement}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={config.focusEngagement}
                  onChange={(e) => setConfig({ focusEngagement: parseInt(e.target.value) })}
                  className="w-full accent-pink-500"
                />
                <p className="text-xs text-slate-400 mt-1">Conteúdo viral, curtidas, compartilhamentos</p>
              </div>
              
              <div>
                <label className="text-sm text-slate-600 font-medium block mb-2">
                  Autoridade: {config.focusAuthority}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={config.focusAuthority}
                  onChange={(e) => setConfig({ focusAuthority: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
                <p className="text-xs text-slate-400 mt-1">Conteúdo educativo, expertise, confiança</p>
              </div>
              
              <div>
                <label className="text-sm text-slate-600 font-medium block mb-2">
                  Conversão: {config.focusConversion}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={config.focusConversion}
                  onChange={(e) => setConfig({ focusConversion: parseInt(e.target.value) })}
                  className="w-full accent-green-500"
                />
                <p className="text-xs text-slate-400 mt-1">Vendas, leads, ação direta</p>
              </div>
            </div>
          </div>
          
          {/* Opções de Geração */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-4">Opções de Geração</h4>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeHashtags}
                  onChange={(e) => setConfig({ includeHashtags: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600">Gerar hashtags</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeVisualDirective}
                  onChange={(e) => setConfig({ includeVisualDirective: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600">Diretriz visual</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeCTA}
                  onChange={(e) => setConfig({ includeCTA: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600">Call to Action</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeRisks}
                  onChange={(e) => setConfig({ includeRisks: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600">Análise de riscos</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.appendMode}
                  onChange={(e) => setConfig({ appendMode: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600">Adicionar às existentes</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar (during generation) */}
      {isGenerating && (
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-indigo-700">{currentPhase}</span>
            <span className="text-sm text-indigo-500">{progress}%</span>
          </div>
          <div className="w-full bg-indigo-100 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Mini logs during generation */}
          <div className="mt-4 max-h-32 overflow-y-auto space-y-1">
            {logs.slice(-5).map((log, idx) => (
              <div key={idx} className="text-xs text-indigo-600/80 flex items-center gap-2">
                <Clock size={10} />
                <span className="opacity-60">{log.timestamp.toLocaleTimeString()}</span>
                <span>{log.mensagem}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights Panel */}
      {insights?.tendencias?.length > 0 && (
        <div className="mb-6">
          <button 
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
          >
            {showInsights ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <Lightbulb size={16} />
            Ver Insights da Geração
          </button>
          
          {showInsights && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top duration-200">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-2 mb-2">
                  <TrendingUp size={14} />
                  Tendências
                </h4>
                <ul className="text-xs text-blue-600 space-y-1">
                  {insights.tendencias.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-700 flex items-center gap-2 mb-2">
                  <Target size={14} />
                  Oportunidades
                </h4>
                <ul className="text-xs text-green-600 space-y-1">
                  {insights.oportunidades.map((o, i) => (
                    <li key={i}>• {o}</li>
                  ))}
                </ul>
              </div>
              
              {insights?.alertas?.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} />
                    Alertas
                  </h4>
                  <ul className="text-xs text-amber-600 space-y-1">
                    {insights.alertas.map((a, i) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Métricas */}
      {metricas.pautasGeradas > 0 && !isGenerating && (
        <div className="flex items-center gap-6 mb-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} />
            <span>{metricas.pautasGeradas} pautas geradas</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{(metricas.tempoTotal / 1000).toFixed(1)}s</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {pautas.length === 0 && !isGenerating && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <BrainCircuit size={48} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Pipeline Multi-Agente</h2>
            <p className="text-slate-500 mb-6">
              Clique em <strong>Gerar Pautas Avançadas</strong> para criar conteúdo estratégico usando IA com sistema de ensemble e scoring automático.
            </p>
            <div className="flex flex-wrap gap-2 justify-center text-xs">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">3 agentes especializados</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Variantes A/B</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Scoring automático</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Pautas */}
      {pautas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pautas.map(pauta => (
            <div 
              key={pauta.id} 
              onClick={() => selectPauta(pauta)}
              className={`group bg-white rounded-xl border-2 p-5 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden ${
                pauta.status === 'aprovado' 
                  ? 'border-green-300 shadow-green-100' 
                  : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              {/* Score Badge */}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold border ${getScoreColor(pauta.scoring?.total || 50)}`}>
                {pauta.scoring?.total || 50}
              </div>

              {/* Type & Date */}
              <div className="flex justify-between items-start mb-3 pr-12">
                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getTypeColor(pauta.tipo)}`}>
                  {pauta.tipo}
                </span>
                <span className="text-xs text-slate-400">{pauta.data}</span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-lg text-slate-800 mb-2 leading-tight line-clamp-2">
                {pauta.titulo}
              </h3>
              
              {/* Hook */}
              <p className="text-sm text-indigo-600 font-medium mb-2 line-clamp-1">
                "{pauta.gancho}"
              </p>
              
              {/* Concept */}
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{pauta.conceito}</p>

              {/* Metrics Preview */}
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <div className="flex items-center gap-1">
                  <TrendingUp size={12} className="text-green-500" />
                  <span>Eng: {pauta.metricsTarget?.engagementEstimado || 0}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target size={12} className="text-blue-500" />
                  <span>Alcance: {pauta.metricsTarget?.alcanceEstimado || 'N/A'}</span>
                </div>
              </div>

              {/* Recommendation Badge */}
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getRecommendationBadge(pauta.scoring?.recomendacao || 'revisar')}`}>
                {(pauta.scoring?.recomendacao || 'revisar') === 'publicar' && '✓ Recomendado'}
                {(pauta.scoring?.recomendacao || 'revisar') === 'revisar' && '⚠ Revisar'}
                {(pauta.scoring?.recomendacao || 'revisar') === 'descartar' && '✕ Não recomendado'}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 mt-4 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <FileText size={14} className={pauta.copy.media ? "text-green-500" : "text-slate-300"} />
                    <span>Copy</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash size={14} className={(pauta.hashtags ? Object.values(pauta.hashtags).flat().length : 0) > 0 ? "text-green-500" : "text-slate-300"} />
                    <span>{pauta.hashtags ? Object.values(pauta.hashtags).flat().length : 0} tags</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers size={14} className={(pauta.variantes?.length || 0) > 0 ? "text-purple-500" : "text-slate-300"} />
                    <span>{pauta.variantes?.length || 0} vars</span>
                  </div>
                </div>
                
                {/* Ações rápidas */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      regeneratePauta(pauta.id, client);
                    }}
                    disabled={isRegenerating === pauta.id}
                    className="p-1.5 hover:bg-indigo-100 rounded text-indigo-600 transition-colors disabled:opacity-50"
                    title="Regenerar pauta"
                  >
                    <RotateCcw size={14} className={isRegenerating === pauta.id ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePauta(pauta.id);
                    }}
                    className="p-1.5 hover:bg-red-100 rounded text-red-500 transition-colors"
                    title="Deletar pauta"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {/* Regenerating overlay */}
              {isRegenerating === pauta.id && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <RotateCcw size={24} className="animate-spin text-indigo-600 mx-auto mb-2" />
                    <span className="text-sm text-indigo-600 font-medium">Regenerando...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Drawer */}
      {pautaSelecionada && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => selectPauta(null)}></div>
          <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getTypeColor(pautaSelecionada.tipo)}`}>
                      {pautaSelecionada.tipo}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold border ${getScoreColor(pautaSelecionada.scoring?.total || 50)}`}>
                      Score: {pautaSelecionada.scoring?.total || 50}/100
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">{pautaSelecionada.titulo}</h2>
                  <p className="text-sm text-indigo-600 mt-1">"{pautaSelecionada.gancho}"</p>
                </div>
                <button onClick={() => selectPauta(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Scoring Breakdown */}
              {pautaSelecionada.scoring?.criterios && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <BarChart3 size={16} />
                  Análise de Qualidade
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(pautaSelecionada.scoring.criterios).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${value >= 70 ? 'bg-green-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-700 w-8">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* AI Reasoning */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <BrainCircuit size={64} className="text-indigo-600" />
                </div>
                <h4 className="flex items-center gap-2 text-indigo-900 font-semibold mb-3">
                  <Sparkles size={16} className="text-indigo-600" />
                  Estratégia & Justificativa
                </h4>
                <p className="text-indigo-800/80 text-sm leading-relaxed mb-4">
                  {pautaSelecionada.justificativa}
                </p>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-indigo-700">Objetivo:</span>
                    <span className="text-xs text-indigo-600 ml-2">{pautaSelecionada.objetivo}</span>
                  </div>
                  {pautaSelecionada.basesEstrategicas?.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-indigo-700">Bases:</span>
                      <span className="text-xs text-indigo-600 ml-2">{pautaSelecionada.basesEstrategicas.join(', ')}</span>
                    </div>
                  )}
                  {pautaSelecionada.riscos?.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-amber-700">Riscos:</span>
                      <span className="text-xs text-amber-600 ml-2">{pautaSelecionada.riscos.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Directive */}
              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ImageIcon size={14} /> Diretriz Visual
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                  <p className="text-slate-700 text-sm">{pautaSelecionada.diretrizVisual.descricao}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {pautaSelecionada.diretrizVisual.cores.map((cor, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs bg-white border border-slate-200 px-2 py-1 rounded">
                        <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: cor }} />
                        <span>{cor}</span>
                      </div>
                    ))}
                  </div>
                  
                  {pautaSelecionada.diretrizVisual.promptMidjourney && (
                    <div className="bg-slate-100 p-3 rounded text-xs font-mono text-slate-600">
                      <span className="text-slate-400">Midjourney:</span> {pautaSelecionada.diretrizVisual.promptMidjourney}
                    </div>
                  )}
                </div>
              </div>

              {/* Copy Editor */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Edit2 size={14} /> Legenda
                  </h4>
                  <div className="flex gap-1">
                    {(['curta', 'media', 'longa'] as const).map(version => (
                      <button
                        key={version}
                        onClick={() => setCopyVersion(version)}
                        className={`px-3 py-1 text-xs rounded ${
                          copyVersion === version 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {version.charAt(0).toUpperCase() + version.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea 
                  className="w-full h-48 p-4 border border-slate-200 rounded-lg text-slate-800 text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  value={pautaSelecionada.copy[copyVersion]}
                  onChange={(e) => editPauta(pautaSelecionada.id, {
                    copy: { ...pautaSelecionada.copy, [copyVersion]: e.target.value }
                  })}
                />
                <div className="flex justify-end mt-2 gap-2">
                  <button className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100">
                    <RefreshCw size={12} /> Reescrever
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(pautaSelecionada.copy[copyVersion])}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100"
                  >
                    <Copy size={12} /> Copiar
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ArrowRight size={14} /> Call to Action
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                    <span className="text-xs text-indigo-500 block mb-1">Principal</span>
                    <p className="text-sm text-indigo-700 font-medium">{pautaSelecionada.cta.principal}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span className="text-xs text-slate-500 block mb-1">Alternativo</span>
                    <p className="text-sm text-slate-700">{pautaSelecionada.cta.alternativo}</p>
                  </div>
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Hash size={14} /> Estratégia de Hashtags
                </h4>
                <div className="space-y-3">
                  {[
                    { key: 'obrigatorias', label: 'Marca', color: 'slate' },
                    { key: 'nicho', label: 'Nicho', color: 'blue' },
                    { key: 'tendencia', label: 'Tendência', color: 'green' },
                    { key: 'experimentais', label: 'Experimental', color: 'purple' },
                  ].map(({ key, label, color }) => {
                    const tags = pautaSelecionada.hashtags?.[key as keyof typeof pautaSelecionada.hashtags] || [];
                    if (tags.length === 0) return null;
                    return (
                      <div key={key} className="flex items-start gap-3">
                        <span className={`text-xs font-semibold text-${color}-600 w-24 pt-1`}>{label}</span>
                        <div className="flex flex-wrap gap-1 flex-1">
                          {tags.map((tag: string) => (
                            <span key={tag} className={`px-2 py-1 bg-${color}-50 text-${color}-700 border border-${color}-100 rounded text-xs`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Variantes */}
              {pautaSelecionada.variantes?.length > 0 && (
                <div>
                  <button 
                    onClick={() => setExpandedVariants(!expandedVariants)}
                    className="w-full flex items-center justify-between text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3"
                  >
                    <span className="flex items-center gap-2">
                      <Shuffle size={14} /> Variantes para Teste A/B ({pautaSelecionada.variantes?.length || 0})
                    </span>
                    {expandedVariants ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedVariants && (
                    <div className="space-y-3 animate-in slide-in-from-top duration-200">
                      {pautaSelecionada.variantes.map((variante, idx) => (
                        <div key={variante.id} className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-purple-800 text-sm">{variante.nome}</h5>
                            <button 
                              onClick={() => selectVariant(pautaSelecionada.id, variante.id)}
                              className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded hover:bg-purple-300"
                            >
                              Aplicar
                            </button>
                          </div>
                          <p className="text-xs text-purple-600 mb-2">
                            <strong>Hipótese:</strong> {variante.hipotese}
                          </p>
                          <div className="bg-white/50 rounded p-2 text-xs text-purple-700">
                            <p><strong>Título:</strong> {variante.titulo}</p>
                            <p className="mt-1"><strong>Gancho:</strong> {variante.gancho}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 sticky bottom-0 flex justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={() => rejectPauta(pautaSelecionada.id)}
                  className="px-4 py-2 text-red-600 text-sm hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ThumbsDown size={16} /> Descartar
                </button>
                <button 
                  onClick={() => regeneratePauta(pautaSelecionada.id, client)}
                  className="px-4 py-2 text-slate-600 text-sm hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Regenerar
                </button>
              </div>
              <button 
                onClick={() => {
                  approvePauta(pautaSelecionada.id);
                  selectPauta(null);
                }}
                className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <ThumbsUp size={16} /> Aprovar Pauta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Panel (toggleable) */}
      {logs.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <button 
            onClick={() => setShowLogs(!showLogs)}
            className="bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2"
          >
            <FileText size={14} />
            {showLogs ? 'Ocultar Logs' : `Ver Logs (${logs.length})`}
          </button>
          
          {showLogs && (
            <div className="absolute bottom-12 right-0 w-96 max-h-80 bg-slate-900 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
              <div className="flex justify-between items-center px-4 py-2 border-b border-slate-700">
                <span className="text-xs text-slate-400 font-medium">Pipeline Logs</span>
                <button onClick={clearLogs} className="text-xs text-slate-500 hover:text-white">Limpar</button>
              </div>
              <div className="p-3 space-y-1 overflow-y-auto max-h-64 font-mono text-xs">
                {logs.map((log, idx) => (
                  <div key={idx} className={`flex items-start gap-2 ${
                    log.tipo === 'error' ? 'text-red-400' :
                    log.tipo === 'success' ? 'text-green-400' :
                    log.tipo === 'warning' ? 'text-amber-400' :
                    'text-slate-400'
                  }`}>
                    <span className="text-slate-600 shrink-0">{log.timestamp.toLocaleTimeString()}</span>
                    <span>{log.mensagem}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
