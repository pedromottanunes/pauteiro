/**
 * Strategic Paths Display Component
 * 
 * Componente para exibir os caminhos estratégicos de forma visual e interativa
 */

import React, { useState } from 'react';
import { StrategicPath, ContentRecommendation } from '../types/research';

interface StrategicPathsProps {
  paths: StrategicPath[];
  contentRecommendations: ContentRecommendation[];
  urgentActions: string[];
  longTermGoals: string[];
  currentSituation?: string;
}

const difficultyConfig = {
  easy: { label: 'Fácil', color: 'bg-green-100 text-green-700', icon: '🟢' },
  medium: { label: 'Médio', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
  hard: { label: 'Difícil', color: 'bg-red-100 text-red-700', icon: '🔴' },
};

const contentTypeConfig = {
  reels: { icon: '🎬', color: 'border-pink-500 bg-pink-50' },
  carousel: { icon: '📑', color: 'border-blue-500 bg-blue-50' },
  stories: { icon: '📱', color: 'border-purple-500 bg-purple-50' },
  feed: { icon: '📷', color: 'border-orange-500 bg-orange-50' },
};

export const StrategicPathsDisplay: React.FC<StrategicPathsProps> = ({
  paths,
  contentRecommendations,
  urgentActions,
  longTermGoals,
  currentSituation,
}) => {
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'paths' | 'content' | 'actions'>('paths');

  return (
    <div className="space-y-8">
      {/* Situação Atual */}
      {currentSituation && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            📊 Situação do Mercado
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {currentSituation}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'paths', label: 'Caminhos Estratégicos', icon: '🎯' },
          { key: 'content', label: 'Recomendações de Conteúdo', icon: '📝' },
          { key: 'actions', label: 'Ações e Metas', icon: '✅' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Caminhos Estratégicos */}
      {activeTab === 'paths' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all transform hover:scale-[1.02] ${
                selectedPath === index ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedPath(selectedPath === index ? null : index)}
            >
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-blue-500 to-purple-600">
                <h4 className="text-white font-bold text-lg">{path.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${difficultyConfig[path.difficulty].color}`}>
                    {difficultyConfig[path.difficulty].icon} {difficultyConfig[path.difficulty].label}
                  </span>
                  <span className="text-xs text-white/80">
                    ⏱️ {path.timeToResults}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {path.description}
                </p>

                {selectedPath === index && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Recursos necessários */}
                    <div>
                      <h5 className="font-semibold text-gray-800 dark:text-white text-sm mb-2">
                        📦 Recursos Necessários
                      </h5>
                      <ul className="space-y-1">
                        {path.requiredResources.map((resource, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resultados esperados */}
                    <div>
                      <h5 className="font-semibold text-gray-800 dark:text-white text-sm mb-2">
                        🎯 Resultados Esperados
                      </h5>
                      <ul className="space-y-1">
                        {path.expectedOutcomes.map((outcome, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Passos de ação */}
                    <div>
                      <h5 className="font-semibold text-gray-800 dark:text-white text-sm mb-2">
                        📋 Passos de Ação
                      </h5>
                      <ol className="space-y-1">
                        {path.actionSteps.map((step, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-purple-500 font-bold">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                <button className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                  {selectedPath === index ? 'Ver menos ↑' : 'Ver detalhes →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Recomendações de Conteúdo */}
      {activeTab === 'content' && (
        <div className="grid md:grid-cols-2 gap-6">
          {contentRecommendations.map((rec, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 ${
                contentTypeConfig[rec.type]?.color || 'border-gray-500 bg-gray-50'
              } shadow-lg`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{contentTypeConfig[rec.type]?.icon || '📝'}</span>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white capitalize">
                    {rec.type}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{rec.theme}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-500">📅</span>
                  <span className="text-gray-600 dark:text-gray-300">{rec.frequency}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-orange-500">⏰</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    Melhores horários: {rec.bestTimes.join(', ')}
                  </span>
                </div>

                {rec.hashtags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Hashtags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rec.hashtags.slice(0, 5).map((tag, i) => (
                        <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {rec.hashtags.length > 5 && (
                        <span className="text-xs text-gray-500">+{rec.hashtags.length - 5}</span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">💡 Ideias:</span>
                  <ul className="mt-2 space-y-1">
                    {rec.exampleIdeas.map((idea, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-purple-500">→</span>
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Ações e Metas */}
      {activeTab === 'actions' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ações Urgentes */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <h4 className="font-bold text-red-700 dark:text-red-400 text-lg mb-4 flex items-center gap-2">
              🚨 Ações Urgentes (Esta Semana)
            </h4>
            <ul className="space-y-3">
              {urgentActions.map((action, index) => (
                <li key={index} className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    className="mt-1 h-5 w-5 rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Metas de Longo Prazo */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <h4 className="font-bold text-green-700 dark:text-green-400 text-lg mb-4 flex items-center gap-2">
              🎯 Metas de Longo Prazo
            </h4>
            <ul className="space-y-3">
              {longTermGoals.map((goal, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* CTA para escolher caminho */}
      {activeTab === 'paths' && selectedPath !== null && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 border border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-300">
            Caminho selecionado: <strong>{paths[selectedPath].name}</strong>
          </span>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
            Gerar Plano de Ação →
          </button>
        </div>
      )}
    </div>
  );
};

export default StrategicPathsDisplay;
