import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from 'recharts';
import { COMPETITORS, TREND_DATA, THEMATIC_SUMMARY, HASHTAG_RADAR } from '../mockData';
import { Globe, Users, TrendingUp, AlertTriangle, Sparkles, Target, Hash, FileText, Database, X } from 'lucide-react';
import { ClientWorkspaceCard, PipelineStatus } from '../types';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import { ApiKeyStatus } from '../components/ApiKeyStatus';
import { InfoTooltip } from '../components/InfoTooltip';
import {
  VolumeTopicoExplanation,
  PostsConcorrentesExplanation,
  LacunasConteudoExplanation,
  ResumoTematicoExplanation,
  MapaConcorrenciaExplanation,
  RadarHashtagsExplanation,
  GraficoSaturacaoExplanation,
} from '../components/MetricExplanations';
import { generateResearch, canUseAI } from '../utils/aiService';
import { ResearchLogSidebar } from '../components/ResearchLogSidebar';
import { ScrapedDataViewer } from '../components/ScrapedDataViewer';
import { useResearchWithLogs } from '../hooks/useResearchWithLogs';

const levelClasses = {
  saturation: {
    alta: 'bg-rose-50 text-rose-700 border-rose-200',
    media: 'bg-amber-50 text-amber-700 border-amber-200',
    baixa: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  opportunity: {
    alta: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    media: 'bg-amber-50 text-amber-700 border-amber-200',
    baixa: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

const usageClasses: Record<string, string> = {
  concorrente: 'bg-amber-50 text-amber-700 border-amber-200',
  nicho: 'bg-blue-50 text-blue-700 border-blue-200',
  cliente: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const renderLevelBadge = (value: 'alta' | 'media' | 'baixa', type: 'saturation' | 'opportunity') => (
  <span className={`text-[11px] px-2 py-1 rounded-full border font-semibold uppercase ${levelClasses[type][value]}`}>
    {type === 'saturation' ? 'Saturacao ' : 'Oportunidade '}
    {value}
  </span>
);

interface Props {
  client?: ClientWorkspaceCard;
  onUpdateResearch?: (researchData: ClientWorkspaceCard['researchData']) => void;
}

export const Research: React.FC<Props> = ({ client, onUpdateResearch }) => {
  const clientName = client?.name ?? 'seu cliente';
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>(PipelineStatus.IDLE);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Novos estados para logs e dados extraídos
  const [showLogs, setShowLogs] = useState(false);
  const [showScrapedData, setShowScrapedData] = useState(false);
  
  // Hook de pesquisa com logs
  const {
    isRunning,
    logs,
    elapsedTime,
    scrapedData,
    error,
    startResearch,
    cancelResearch,
    clearLogs,
  } = useResearchWithLogs();
  
  // Usa dados do cliente se existirem, caso contrário usa arrays vazios
  const competitors = client?.researchData?.competitors || COMPETITORS;
  const trendData = client?.researchData?.trends || TREND_DATA;
  const thematicSummary = client?.researchData?.thematicSummary || THEMATIC_SUMMARY;
  const hashtagRadar = client?.researchData?.hashtagRadar || HASHTAG_RADAR;
  
  const hasData = competitors.length > 0 || trendData.length > 0 || hashtagRadar.length > 0;
  
  // Verifica se há dados extraídos para mostrar
  const hasScrapedData = scrapedData.instagram.posts.length > 0 || scrapedData.instagram.profile !== null;

  const handleGenerateResearch = async () => {
    if (!client) return;

    // Verifica se pode usar IA
    const check = canUseAI(client.selectedModel);
    if (!check.canUse) {
      alert(check.message);
      return;
    }

    // Abre a sidebar de logs automaticamente
    setShowLogs(true);
    setIsGenerating(true);
    setPipelineStatus(PipelineStatus.COLLECTING);
    
    // Simula as fases do pipeline visual
    const stages = [
      PipelineStatus.COLLECTING,
      PipelineStatus.ANALYZING,
      PipelineStatus.PLANNING,
      PipelineStatus.COMPLETE
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage++;
      if (currentStage < stages.length) {
        setPipelineStatus(stages[currentStage]);
      }
    }, 8000); // Mais lento para dar tempo real da pesquisa

    try {
      // Inicia pesquisa com logs E processamento IA integrado
      // Esta função agora coleta dados do Instagram E gera análise com IA
      const researchResult = await startResearch(client);
      
      clearInterval(interval);
      setPipelineStatus(PipelineStatus.COMPLETE);
      
      // Atualiza os dados de pesquisa do cliente com resultado REAL
      if (onUpdateResearch && researchResult) {
        onUpdateResearch(researchResult);
      }
      
      setTimeout(() => {
        setPipelineStatus(PipelineStatus.IDLE);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      setPipelineStatus(PipelineStatus.IDLE);
      setIsGenerating(false);
      alert(`Erro ao gerar pesquisa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };
  
  if (!hasData) {
    return (
      <div className="p-8 h-full overflow-y-auto flex flex-col">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pesquisa & Inteligencia</h1>
            <p className="text-slate-500">Analise de mercado para {clientName} baseada nas fontes coletadas.</p>
          </div>
          
          {/* Botões de controle */}
          <div className="flex items-center gap-2">
            {hasScrapedData && (
              <button
                onClick={() => setShowScrapedData(true)}
                className="px-3 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium hover:bg-pink-100 transition-all flex items-center gap-2 border border-pink-200"
              >
                <Database size={16} />
                Ver Dados Extraídos
              </button>
            )}
            <button
              onClick={() => setShowLogs(!showLogs)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border ${
                showLogs 
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-300' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText size={16} />
              {logs.length > 0 && (
                <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] rounded-full">
                  {logs.length}
                </span>
              )}
              Logs
            </button>
          </div>
        </div>
        
        {client && <ApiKeyStatus model={client.selectedModel} className="mb-4" />}

        <PipelineVisualizer status={pipelineStatus} />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Globe size={48} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Nenhuma pesquisa disponível</h2>
            <p className="text-slate-500 mb-6">
              Configure as fontes e concorrentes em <strong>Configurações</strong> e depois clique em <strong>Gerar Pesquisa</strong> para iniciar a análise de mercado.
            </p>
            <button
              onClick={handleGenerateResearch}
              disabled={isGenerating || isRunning}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={18} />
              {isGenerating || isRunning ? 'Gerando Pesquisa...' : 'Gerar Pesquisa de Mercado'}
            </button>
            
            {isRunning && (
              <button
                onClick={cancelResearch}
                className="mt-3 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-200 transition-all flex items-center gap-2 mx-auto"
              >
                <X size={16} />
                Cancelar
              </button>
            )}
          </div>
        </div>
        
        {/* Sidebar de Logs */}
        <ResearchLogSidebar
          isOpen={showLogs}
          onClose={() => setShowLogs(false)}
          logs={logs}
          isRunning={isRunning}
          elapsedTime={elapsedTime}
        />
        
        {/* Visualizador de Dados Extraídos */}
        <ScrapedDataViewer
          isOpen={showScrapedData}
          onClose={() => setShowScrapedData(false)}
          profile={scrapedData.instagram.profile}
          posts={scrapedData.instagram.posts}
        />
      </div>
    );
  }
  
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pesquisa & Inteligencia</h1>
          <p className="text-slate-500">Analise de mercado para {clientName} baseada nas fontes coletadas.</p>
        </div>
        
        {/* Botões de ação */}
        <div className="flex items-center gap-2">
          {hasScrapedData && (
            <button
              onClick={() => setShowScrapedData(true)}
              className="px-3 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium hover:bg-pink-100 transition-all flex items-center gap-2 border border-pink-200"
            >
              <Database size={16} />
              Dados Extraídos
            </button>
          )}
          
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border ${
              showLogs 
                ? 'bg-indigo-100 text-indigo-700 border-indigo-300' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileText size={16} />
            {logs.length > 0 && (
              <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] rounded-full">
                {logs.length}
              </span>
            )}
          </button>
          
          <button
            onClick={handleGenerateResearch}
            disabled={isGenerating || isRunning}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} />
            {isGenerating || isRunning ? 'Atualizando...' : 'Atualizar Pesquisa'}
          </button>
        </div>
      </div>
      
      {client && <ApiKeyStatus model={client.selectedModel} className="mb-4" />}

      <PipelineVisualizer status={pipelineStatus} />
      
      {/* Sidebar de Logs */}
      <ResearchLogSidebar
        isOpen={showLogs}
        onClose={() => setShowLogs(false)}
        logs={logs}
        isRunning={isRunning}
        elapsedTime={elapsedTime}
      />
      
      {/* Visualizador de Dados Extraídos */}
      <ScrapedDataViewer
        isOpen={showScrapedData}
        onClose={() => setShowScrapedData(false)}
        profile={scrapedData.instagram.profile}
        posts={scrapedData.instagram.posts}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Volume do Tópico */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Globe size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-500 font-medium">Volume do tópico</p>
              <InfoTooltip
                title="Volume do Tópico"
                shortDescription="Quantidade de menções e interesse no seu nicho"
              >
                <VolumeTopicoExplanation />
              </InfoTooltip>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">1.2k</h3>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> +12% vs semana anterior
            </p>
          </div>
        </div>

        {/* Posts dos Concorrentes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
            <Users size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-500 font-medium">Posts dos concorrentes</p>
              <InfoTooltip
                title="Posts dos Concorrentes"
                shortDescription="Quantidade de publicações dos concorrentes nos últimos 7 dias"
              >
                <PostsConcorrentesExplanation />
              </InfoTooltip>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{competitors.reduce((acc, c) => acc + (c.topTopics?.length || 0), 0) || 48}</h3>
            <p className="text-xs text-slate-400 mt-1">Analisados nos últimos 7 dias</p>
          </div>
        </div>

        {/* Lacunas de Conteúdo */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer group">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-500 font-medium">Lacunas de conteúdo</p>
              <InfoTooltip
                title="Lacunas de Conteúdo"
                shortDescription="Oportunidades temáticas que os concorrentes não exploram"
              >
                <LacunasConteudoExplanation gaps={thematicSummary.gaps} />
              </InfoTooltip>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{thematicSummary.gaps?.length || 5}</h3>
            <p className="text-xs text-slate-400 mt-1">Oportunidades de alto potencial detectadas</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-indigo-600" />
          <h3 className="font-bold text-slate-800">Resumo temático</h3>
          <InfoTooltip
            title="Resumo Temático"
            shortDescription="Visão geral dos temas, perguntas frequentes e lacunas do mercado"
          >
            <ResumoTematicoExplanation 
              themes={thematicSummary.themes} 
              faqs={thematicSummary.faqs} 
              gaps={thematicSummary.gaps} 
            />
          </InfoTooltip>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <p className="text-xs text-indigo-600 font-semibold uppercase mb-2">Principais temas</p>
            <ul className="space-y-2 text-sm text-indigo-900">
              {thematicSummary.themes.map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-600 font-semibold uppercase mb-2">FAQs detectadas</p>
            <ul className="space-y-2 text-sm text-slate-800">
              {thematicSummary.faqs.map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <p className="text-xs text-amber-700 font-semibold uppercase mb-2">Lacunas</p>
            <ul className="space-y-2 text-sm text-amber-900">
              {thematicSummary.gaps.map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Mapa de Concorrência */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-slate-900" />
            <h3 className="font-bold text-slate-800">Mapa de concorrência</h3>
            <InfoTooltip
              title="Mapa de Concorrência"
              shortDescription="Análise detalhada de cada concorrente monitorado"
            >
              <MapaConcorrenciaExplanation competitors={competitors} />
            </InfoTooltip>
          </div>
          <div className="space-y-3">
            {competitors.map((comp, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{comp.name}</p>
                    <p className="text-xs text-slate-500">Tópicos: {comp.topTopics.join(', ')}</p>
                  </div>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${
                    comp.engagementScore >= 70 ? 'bg-emerald-100 text-emerald-700' :
                    comp.engagementScore >= 40 ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>{comp.engagementScore}/100</span>
                </div>
                <p className="text-xs text-rose-600 mt-2 font-medium">🎯 Gap: {comp.gap}</p>
                <div className="text-xs text-slate-600 mt-2 flex flex-wrap gap-2">
                  {comp.copyStyle && <span className="px-2 py-1 bg-slate-100 rounded-full">Copy: {comp.copyStyle}</span>}
                  {comp.hashtags?.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar de Hashtags */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Hash size={18} className="text-indigo-600" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">Radar de hashtags</h3>
                <InfoTooltip
                  title="Radar de Hashtags"
                  shortDescription="Análise de saturação e oportunidade das hashtags do nicho"
                >
                  <RadarHashtagsExplanation hashtags={hashtagRadar} />
                </InfoTooltip>
              </div>
              <p className="text-xs text-slate-500">Saturação x oportunidade para o cliente e concorrência.</p>
            </div>
          </div>
          <div className="space-y-3">
            {hashtagRadar.map(entry => (
              <div key={entry.tag} className="border border-slate-200 rounded-lg p-4 flex justify-between gap-3 hover:border-indigo-200 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 flex items-center gap-2">
                    <Hash size={14} className="text-slate-400" />
                    {entry.tag}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{entry.note}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-[11px] px-2 py-1 rounded-full border font-semibold uppercase ${usageClasses[entry.usage]}`}>
                      {entry.usage}
                    </span>
                    {renderLevelBadge(entry.saturation, 'saturation')}
                    {renderLevelBadge(entry.opportunity, 'opportunity')}
                  </div>
                </div>
                {entry.opportunity === 'alta' && (
                  <span className="text-[11px] bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold h-fit">
                    Priorizar
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Saturação vs Oportunidade */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800">Saturação de tópico vs. oportunidade</h3>
              <InfoTooltip
                title="Gráfico Saturação vs Oportunidade"
                shortDescription="Visualize onde investir seu esforço de conteúdo"
              >
                <GraficoSaturacaoExplanation />
              </InfoTooltip>
            </div>
            <p className="text-sm text-slate-400">Alta oportunidade + baixa saturação = melhor estratégia.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="saturation"
                  name="Saturação"
                  unit="%"
                  label={{ value: 'Saturação de mercado', position: 'insideBottom', offset: -10 }}
                />
                <YAxis
                  type="number"
                  dataKey="opportunity"
                  name="Oportunidade"
                  unit="%"
                  label={{ value: 'Pontuação de oportunidade', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis type="number" dataKey="volume" range={[60, 400]} name="Volume de busca" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs">
                          <p className="font-bold mb-1">{data.topic}</p>
                          <p>Oport: {data.opportunity}%</p>
                          <p>Satur: {data.saturation}%</p>
                          <p className="text-slate-400">Vol: {data.volume}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Topics" data={trendData} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engajamento dos Concorrentes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800">Engajamento dos concorrentes</h3>
              <InfoTooltip
                title="Engajamento dos Concorrentes"
                shortDescription="Ranking de performance dos concorrentes"
              >
                <MapaConcorrenciaExplanation competitors={competitors} />
              </InfoTooltip>
            </div>
            <p className="text-sm text-slate-400">Pontuação média de engajamento por concorrente identificado.</p>
          </div>
          <div className="space-y-4">
            {competitors.map((comp, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  {comp.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{comp.name}</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                      comp.engagementScore >= 70 ? 'bg-emerald-100 text-emerald-700' :
                      comp.engagementScore >= 40 ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>{comp.engagementScore}/100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        comp.engagementScore >= 70 ? 'bg-emerald-500' :
                        comp.engagementScore >= 40 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`} 
                      style={{ width: `${comp.engagementScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-rose-500">🎯 Gap:</span> {comp.gap}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
