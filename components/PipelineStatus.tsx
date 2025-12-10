/**
 * Research Pipeline Status Component
 * 
 * Componente para exibir o progresso em tempo real do pipeline de pesquisa
 */

import React from 'react';
import { ResearchPipelineStatus } from '../types/research';

interface PipelineStatusProps {
  status: ResearchPipelineStatus;
  onCancel?: () => void;
}

const phaseNames: Record<string, string> = {
  idle: 'Aguardando',
  webSearch: 'Pesquisa na Web',
  socialScraping: 'Coleta de Redes Sociais',
  imageAnalysis: 'Análise de Imagens',
  dataProcessing: 'Processamento de Dados',
  recommendations: 'Gerando Recomendações',
};

const phaseIcons: Record<string, string> = {
  idle: '⏸️',
  webSearch: '🔍',
  socialScraping: '📱',
  imageAnalysis: '🖼️',
  dataProcessing: '⚙️',
  recommendations: '💡',
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-200 dark:bg-gray-700',
  running: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

const statusTextColors: Record<string, string> = {
  pending: 'text-gray-500',
  running: 'text-blue-600',
  completed: 'text-green-600',
  failed: 'text-red-600',
};

export const PipelineStatus: React.FC<PipelineStatusProps> = ({ status, onCancel }) => {
  const elapsedTime = status.startTime 
    ? Math.floor((Date.now() - new Date(status.startTime).getTime()) / 1000)
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const phases = [
    { key: 'webSearch', name: 'Pesquisa na Web', icon: '🔍' },
    { key: 'socialScraping', name: 'Redes Sociais', icon: '📱' },
    { key: 'imageAnalysis', name: 'Análise Visual', icon: '🖼️' },
    { key: 'dataProcessing', name: 'Processamento', icon: '⚙️' },
    { key: 'recommendations', name: 'Recomendações', icon: '💡' },
  ] as const;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl animate-pulse">
            {phaseIcons[status.currentPhase] || '🔄'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {status.currentPhase === 'idle' 
                ? 'Pesquisa em andamento...' 
                : phaseNames[status.currentPhase]
              }
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tempo decorrido: {formatTime(elapsedTime)}
            </p>
          </div>
        </div>
        
        {onCancel && status.currentPhase !== 'idle' && (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Progress bar geral */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progresso geral</span>
          <span>{Math.round(status.progress)}%</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${status.progress}%` }}
          />
        </div>
      </div>

      {/* Fases */}
      <div className="space-y-4">
        {phases.map(({ key, name, icon }) => {
          const phase = status.phases[key];
          const isActive = status.currentPhase === key;
          
          return (
            <div 
              key={key}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500' 
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${
                    phase.status === 'running' ? 'text-blue-600 dark:text-blue-400' :
                    phase.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                    phase.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    phase.status === 'running' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    phase.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    phase.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {phase.status === 'running' ? 'Em progresso' :
                     phase.status === 'completed' ? 'Concluído' :
                     phase.status === 'failed' ? 'Falhou' :
                     'Pendente'}
                  </span>
                </div>
                
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      phase.status === 'running' ? 'bg-blue-500' :
                      phase.status === 'completed' ? 'bg-green-500' :
                      phase.status === 'failed' ? 'bg-red-500' :
                      'bg-gray-300'
                    }`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
                
                {phase.message && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {phase.message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs (últimos 5) */}
      {status.logs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Logs recentes
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {status.logs.slice(-5).map((log, index) => (
              <div 
                key={index}
                className={`text-xs font-mono p-2 rounded ${
                  log.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  log.type === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  log.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {status.error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
          <p className="text-red-700 dark:text-red-400 font-medium">
            ❌ Erro: {status.error}
          </p>
        </div>
      )}

      {/* Estimated time */}
      {status.currentPhase !== 'idle' && status.progress < 100 && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          ⏱️ Tempo estimado restante: {Math.ceil((100 - status.progress) / 10)} min
        </div>
      )}
    </div>
  );
};

export default PipelineStatus;
