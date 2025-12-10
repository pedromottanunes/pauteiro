/**
 * Competitor Analysis Display Component
 * 
 * Componente para exibir análise detalhada de cada concorrente
 */

import React, { useState } from 'react';
import { CompetitorFullAnalysis } from '../types/research';

interface CompetitorAnalysisDisplayProps {
  competitors: CompetitorFullAnalysis[];
}

export const CompetitorAnalysisDisplay: React.FC<CompetitorAnalysisDisplayProps> = ({
  competitors,
}) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<number>(0);

  if (competitors.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
        <span className="text-4xl mb-4 block">🔍</span>
        <p className="text-gray-600 dark:text-gray-400">
          Nenhum concorrente analisado ainda
        </p>
      </div>
    );
  }

  const competitor = competitors[selectedCompetitor];

  return (
    <div className="space-y-6">
      {/* Seletor de Concorrentes */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {competitors.map((c, index) => (
          <button
            key={index}
            onClick={() => setSelectedCompetitor(index)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCompetitor === index
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Card Principal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header com métricas principais */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="text-white">
              <h3 className="text-2xl font-bold">{competitor.name}</h3>
              {competitor.website && (
                <a 
                  href={competitor.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white text-sm"
                >
                  {competitor.website} ↗
                </a>
              )}
            </div>
          </div>

          {/* Métricas em destaque */}
          {competitor.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/70 text-xs">Seguidores</p>
                <p className="text-white text-xl font-bold">
                  {(competitor.metrics.instagramFollowers || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/70 text-xs">Engajamento</p>
                <p className="text-white text-xl font-bold">
                  {(competitor.metrics.instagramEngagementRate || 0).toFixed(2)}%
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/70 text-xs">Posts/semana</p>
                <p className="text-white text-xl font-bold">
                  {competitor.metrics.postingFrequency?.postsPerWeek?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/70 text-xs">Total de Posts</p>
                <p className="text-white text-xl font-bold">
                  {(competitor.metrics.instagramPosts || 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Perfis sociais */}
          {competitor.socialProfiles && Object.keys(competitor.socialProfiles).length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">🔗 Redes Sociais</h4>
              <div className="flex flex-wrap gap-2">
                {competitor.socialProfiles.instagram && (
                  <a
                    href={competitor.socialProfiles.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm hover:opacity-90"
                  >
                    📸 Instagram
                  </a>
                )}
                {competitor.socialProfiles.facebook && (
                  <a
                    href={competitor.socialProfiles.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:opacity-90"
                  >
                    📘 Facebook
                  </a>
                )}
                {competitor.socialProfiles.linkedin && (
                  <a
                    href={competitor.socialProfiles.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded-lg text-sm hover:opacity-90"
                  >
                    💼 LinkedIn
                  </a>
                )}
                {competitor.socialProfiles.tiktok && (
                  <a
                    href={competitor.socialProfiles.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-sm hover:opacity-90"
                  >
                    🎵 TikTok
                  </a>
                )}
                {competitor.socialProfiles.youtube && (
                  <a
                    href={competitor.socialProfiles.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:opacity-90"
                  >
                    ▶️ YouTube
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Análise Visual */}
          {competitor.visualAnalysis && (
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">🎨 Análise Visual</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Qualidade */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Qualidade Visual</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        style={{ width: `${(competitor.visualAnalysis.averageQualityScore || 0) * 10}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                      {competitor.visualAnalysis.averageQualityScore?.toFixed(1)}/10
                    </span>
                  </div>
                </div>

                {/* Paleta de cores */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Paleta de Cores</p>
                  <div className="flex gap-2">
                    {competitor.visualAnalysis.dominantColorPalette?.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Estilos */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Estilos Preferidos</p>
                  <div className="flex flex-wrap gap-1">
                    {competitor.visualAnalysis.preferredStyles?.map((style, i) => (
                      <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Composições */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Composições Comuns</p>
                  <div className="flex flex-wrap gap-1">
                    {competitor.visualAnalysis.commonCompositions?.map((comp, i) => (
                      <span key={i} className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas visuais */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {competitor.visualAnalysis.textUsagePercentage?.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Uso de Texto</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {competitor.visualAnalysis.productPresencePercentage?.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Produtos Visíveis</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {competitor.visualAnalysis.personPresencePercentage?.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pessoas nas Fotos</p>
                </div>
              </div>

              {/* Recomendações visuais */}
              {competitor.visualAnalysis.recommendations && competitor.visualAnalysis.recommendations.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h5 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">💡 Insights Visuais</h5>
                  <ul className="space-y-1">
                    {competitor.visualAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                        → {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Frequência de postagem */}
          {competitor.metrics?.postingFrequency && (
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">📅 Padrão de Postagem</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {competitor.metrics.postingFrequency.postsPerWeek?.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Posts/semana</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {competitor.metrics.postingFrequency.postsPerMonth?.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Posts/mês</p>
                </div>
                {competitor.metrics.postingFrequency.mostActiveDay && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {competitor.metrics.postingFrequency.mostActiveDay}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dia mais ativo</p>
                  </div>
                )}
                {competitor.metrics.postingFrequency.mostActiveHour !== undefined && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {competitor.metrics.postingFrequency.mostActiveHour}:00
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Horário mais ativo</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resultados de busca */}
          {competitor.webPresence?.searchResults && competitor.webPresence.searchResults.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">🔍 Presença na Web</h4>
              <div className="space-y-2">
                {competitor.webPresence.searchResults.slice(0, 5).map((result, i) => (
                  <a
                    key={i}
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <p className="font-medium text-blue-600 dark:text-blue-400 text-sm hover:underline">
                      {result.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {result.snippet}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {result.source}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysisDisplay;
