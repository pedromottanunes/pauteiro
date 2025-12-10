import React from 'react';
import { InfoTooltip } from './InfoTooltip';
import { TrendingUp, Users, Lightbulb, Target, Hash, BarChart3, FileText, Sparkles } from 'lucide-react';

/**
 * Conteúdo explicativo detalhado para cada métrica
 * Esses componentes são exibidos nos modais quando o usuário clica para saber mais
 */

interface MetricExplanationProps {
  data?: any;
}

// ============================================
// VOLUME DO TÓPICO
// ============================================
export const VolumeTopicoExplanation: React.FC<MetricExplanationProps> = ({ data }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-blue-100 rounded-lg">
        <TrendingUp className="text-blue-600" size={24} />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">O que é Volume do Tópico?</h4>
        <p className="text-slate-600 text-sm mt-1">
          O Volume do Tópico representa a <strong>quantidade total de menções, buscas e interações</strong> relacionadas 
          ao seu nicho de mercado em um determinado período. É um indicador de <strong>interesse e demanda</strong> do público.
        </p>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <h5 className="font-semibold text-blue-800 mb-2">📊 Como Interpretar</h5>
      <ul className="space-y-2 text-sm text-blue-900">
        <li className="flex items-start gap-2">
          <span className="text-blue-500 mt-0.5">•</span>
          <span><strong>Volume Alto (acima de 5k):</strong> Mercado aquecido, muita concorrência, mas também muita demanda. Ideal para conteúdo de alto volume.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-500 mt-0.5">•</span>
          <span><strong>Volume Médio (1k-5k):</strong> Equilíbrio entre oportunidade e competição. Bom momento para posicionamento estratégico.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-500 mt-0.5">•</span>
          <span><strong>Volume Baixo (abaixo de 1k):</strong> Nicho pouco explorado. Pode ser oportunidade de pioneirismo ou sinal de baixa demanda.</span>
        </li>
      </ul>
    </div>

    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
      <h5 className="font-semibold text-emerald-800 mb-2">✨ Variação Semanal</h5>
      <p className="text-sm text-emerald-900">
        O percentual de variação (<strong>+12% vs semana anterior</strong>, por exemplo) indica a <strong>tendência de crescimento</strong>. 
        Variações positivas constantes sugerem um tópico em ascensão — o momento ideal para produzir conteúdo e surfar a onda de interesse.
      </p>
    </div>

    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h5 className="font-semibold text-amber-800 mb-2">💡 Exemplo Prático</h5>
      <p className="text-sm text-amber-900">
        Se você atua no nicho de <em>"marketing digital"</em> e o volume é 1.2k com +12% de crescimento, 
        significa que aproximadamente <strong>1.200 pessoas</strong> estão ativamente buscando, comentando ou 
        interagindo com conteúdo sobre marketing digital nesta semana — 12% a mais do que na semana passada. 
        <br/><br/>
        <strong>Ação recomendada:</strong> Publique conteúdo educativo sobre tendências atuais do nicho para capturar essa demanda crescente.
      </p>
    </div>
  </div>
);

// ============================================
// POSTS DOS CONCORRENTES
// ============================================
export const PostsConcorrentesExplanation: React.FC<MetricExplanationProps> = ({ data }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-purple-100 rounded-lg">
        <Users className="text-purple-600" size={24} />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">O que são Posts dos Concorrentes?</h4>
        <p className="text-slate-600 text-sm mt-1">
          Este número representa a <strong>quantidade de publicações</strong> que seus concorrentes fizeram 
          nos últimos 7 dias. É um indicador de <strong>atividade competitiva</strong> e ritmo de produção do mercado.
        </p>
      </div>
    </div>

    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
      <h5 className="font-semibold text-purple-800 mb-2">📈 Como Interpretar</h5>
      <ul className="space-y-2 text-sm text-purple-900">
        <li className="flex items-start gap-2">
          <span className="text-purple-500 mt-0.5">•</span>
          <span><strong>Acima de 50 posts:</strong> Concorrentes muito ativos. Você precisa de consistência e diferenciação para se destacar.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-purple-500 mt-0.5">•</span>
          <span><strong>Entre 20-50 posts:</strong> Atividade moderada. Há espaço para ganhar visibilidade com conteúdo de qualidade.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-purple-500 mt-0.5">•</span>
          <span><strong>Abaixo de 20 posts:</strong> Baixa concorrência de conteúdo. Oportunidade de dominar o feed com volume estratégico.</span>
        </li>
      </ul>
    </div>

    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
      <h5 className="font-semibold text-indigo-800 mb-2">🎯 O Que Analisamos</h5>
      <ul className="space-y-1 text-sm text-indigo-900">
        <li>• Frequência de postagem (quantos posts por dia)</li>
        <li>• Tipos de conteúdo mais usados (carrossel, reels, stories)</li>
        <li>• Horários de maior atividade</li>
        <li>• Temas e formatos que geram mais engajamento</li>
        <li>• Padrões de copywriting e CTAs utilizados</li>
      </ul>
    </div>

    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h5 className="font-semibold text-amber-800 mb-2">💡 Dica Estratégica</h5>
      <p className="text-sm text-amber-900">
        Não tente apenas igualar a quantidade de posts dos concorrentes. Analise <strong>quais posts performam melhor</strong> 
        e foque em criar conteúdo similar com seu diferencial. Qualidade supera quantidade quando bem direcionada.
        <br/><br/>
        <strong>Exemplo:</strong> Se um concorrente posta 10x por semana mas apenas 2 posts têm alto engajamento, 
        estude esses 2 posts profundamente e crie sua versão melhorada.
      </p>
    </div>
  </div>
);

// ============================================
// LACUNAS DE CONTEÚDO
// ============================================
export const LacunasConteudoExplanation: React.FC<MetricExplanationProps & { gaps?: string[] }> = ({ data, gaps }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-amber-100 rounded-lg">
        <Lightbulb className="text-amber-600" size={24} />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">O que são Lacunas de Conteúdo?</h4>
        <p className="text-slate-600 text-sm mt-1">
          Lacunas de conteúdo são <strong>oportunidades temáticas</strong> que seus concorrentes ainda não exploraram 
          adequadamente, mas que têm <strong>demanda comprovada</strong> pelo público. São "buracos" no mercado esperando serem preenchidos.
        </p>
      </div>
    </div>

    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h5 className="font-semibold text-amber-800 mb-2">🎯 Por Que São Valiosas?</h5>
      <ul className="space-y-2 text-sm text-amber-900">
        <li className="flex items-start gap-2">
          <span className="text-amber-500 mt-0.5">•</span>
          <span><strong>Menor Competição:</strong> Poucos concorrentes estão produzindo sobre esses temas.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-amber-500 mt-0.5">•</span>
          <span><strong>Demanda Existente:</strong> O público está buscando essas informações ativamente.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-amber-500 mt-0.5">•</span>
          <span><strong>Posicionamento de Autoridade:</strong> Ser o primeiro a abordar um tema te posiciona como referência.</span>
        </li>
      </ul>
    </div>

    {gaps && gaps.length > 0 && (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
        <h5 className="font-semibold text-emerald-800 mb-3">✨ Lacunas Detectadas Para Você</h5>
        <div className="space-y-2">
          {gaps.map((gap, index) => (
            <div key={index} className="flex items-start gap-3 bg-white/70 rounded-lg p-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <div>
                <p className="text-sm text-emerald-900 font-medium">{gap}</p>
                <p className="text-xs text-emerald-700 mt-1">
                  💡 Sugestão: Crie um carrossel educativo ou vídeo curto sobre este tema
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
      <h5 className="font-semibold text-indigo-800 mb-2">🚀 Como Explorar Essas Lacunas</h5>
      <ol className="space-y-2 text-sm text-indigo-900 list-decimal list-inside">
        <li>Escolha 1-2 lacunas que mais se alinham com sua expertise</li>
        <li>Pesquise profundamente o tema (perguntas frequentes, dúvidas comuns)</li>
        <li>Crie uma série de conteúdo (3-5 posts) explorando diferentes ângulos</li>
        <li>Use hashtags de nicho para alcançar quem busca esse conteúdo</li>
        <li>Monitore o engajamento e dobre a aposta no que funcionar</li>
      </ol>
    </div>
  </div>
);

// ============================================
// RESUMO TEMÁTICO
// ============================================
export const ResumoTematicoExplanation: React.FC<MetricExplanationProps & { 
  themes?: string[]; 
  faqs?: string[]; 
  gaps?: string[];
}> = ({ themes, faqs, gaps }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-indigo-100 rounded-lg">
        <FileText className="text-indigo-600" size={24} />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">O que é o Resumo Temático?</h4>
        <p className="text-slate-600 text-sm mt-1">
          O Resumo Temático é uma <strong>análise inteligente</strong> que identifica os principais temas discutidos no seu nicho, 
          as perguntas mais frequentes do público e as lacunas de conteúdo existentes.
        </p>
      </div>
    </div>

    {themes && themes.length > 0 && (
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <h5 className="font-semibold text-indigo-800 mb-3">📚 Principais Temas do Seu Nicho</h5>
        <p className="text-sm text-indigo-700 mb-3">
          Estes são os assuntos mais discutidos e relevantes para seu público-alvo:
        </p>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme, index) => (
            <span key={index} className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              {theme}
            </span>
          ))}
        </div>
        <p className="text-xs text-indigo-600 mt-3">
          💡 <strong>Dica:</strong> Use esses temas como pilares de conteúdo. Cada tema pode gerar uma série de 5-10 posts.
        </p>
      </div>
    )}

    {faqs && faqs.length > 0 && (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <h5 className="font-semibold text-purple-800 mb-3">❓ FAQs Detectadas</h5>
        <p className="text-sm text-purple-700 mb-3">
          Perguntas que seu público está fazendo ativamente — cada uma é uma oportunidade de conteúdo:
        </p>
        <ul className="space-y-2">
          {faqs.map((faq, index) => (
            <li key={index} className="flex items-start gap-2 bg-white/70 rounded-lg p-2">
              <span className="text-purple-500 mt-0.5">?</span>
              <span className="text-sm text-purple-900">{faq}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-purple-600 mt-3">
          💡 <strong>Dica:</strong> Responda cada FAQ em um post separado. Use a pergunta como gancho/título.
        </p>
      </div>
    )}

    {gaps && gaps.length > 0 && (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h5 className="font-semibold text-amber-800 mb-3">🎯 Lacunas de Conteúdo</h5>
        <p className="text-sm text-amber-700 mb-3">
          Temas com demanda mas pouca oferta de conteúdo — sua chance de se destacar:
        </p>
        <ul className="space-y-2">
          {gaps.map((gap, index) => (
            <li key={index} className="flex items-start gap-2 bg-white/70 rounded-lg p-2">
              <span className="text-amber-500 mt-0.5">★</span>
              <span className="text-sm text-amber-900">{gap}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// ============================================
// MAPA DE CONCORRÊNCIA
// ============================================
export const MapaConcorrenciaExplanation: React.FC<MetricExplanationProps & { 
  competitors?: Array<{
    name: string;
    engagementScore: number;
    topTopics: string[];
    gap: string;
    copyStyle?: string;
    hashtags?: string[];
  }>;
}> = ({ competitors }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-rose-100 rounded-lg">
        <Target className="text-rose-600" size={24} />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">O que é o Mapa de Concorrência?</h4>
        <p className="text-slate-600 text-sm mt-1">
          O Mapa de Concorrência apresenta uma <strong>análise detalhada</strong> de cada concorrente monitorado, 
          incluindo seu nível de engajamento, principais tópicos, estilo de comunicação e — mais importante — 
          seus <strong>pontos fracos</strong> que você pode explorar.
        </p>
      </div>
    </div>

    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
      <h5 className="font-semibold text-rose-800 mb-2">📊 Métricas Analisadas</h5>
      <ul className="space-y-2 text-sm text-rose-900">
        <li className="flex items-start gap-2">
          <span className="text-rose-500 mt-0.5">•</span>
          <span><strong>Score de Engajamento (0-100):</strong> Média ponderada de curtidas, comentários e compartilhamentos relativos ao número de seguidores.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-rose-500 mt-0.5">•</span>
          <span><strong>Tópicos Principais:</strong> Temas mais abordados pelo concorrente em suas publicações.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-rose-500 mt-0.5">•</span>
          <span><strong>Gap (Oportunidade):</strong> Fraqueza identificada que você pode explorar como diferencial.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-rose-500 mt-0.5">•</span>
          <span><strong>Estilo de Copy:</strong> Tom de voz e padrões de escrita utilizados.</span>
        </li>
      </ul>
    </div>

    {competitors && competitors.length > 0 && (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4">
        <h5 className="font-semibold text-slate-800 mb-3">🎯 Seus Concorrentes Analisados</h5>
        <div className="space-y-3">
          {competitors.map((comp, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-800">{comp.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  comp.engagementScore >= 70 ? 'bg-emerald-100 text-emerald-700' :
                  comp.engagementScore >= 40 ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {comp.engagementScore}/100
                </span>
              </div>
              
              {comp.topTopics && comp.topTopics.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-slate-500">Tópicos:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {comp.topTopics.map((topic, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {comp.gap && (
                <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                  <span className="text-xs font-semibold text-amber-800">🎯 Oportunidade:</span>
                  <p className="text-xs text-amber-700 mt-1">{comp.gap}</p>
                </div>
              )}
              
              {comp.copyStyle && (
                <p className="text-xs text-slate-500 mt-2">
                  <strong>Estilo:</strong> {comp.copyStyle}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
      <h5 className="font-semibold text-emerald-800 mb-2">🚀 Como Usar Esta Informação</h5>
      <ol className="space-y-1 text-sm text-emerald-900 list-decimal list-inside">
        <li>Identifique os concorrentes com maior engajamento — eles sabem algo que funciona</li>
        <li>Analise os gaps de cada um — são suas oportunidades de diferenciação</li>
        <li>Adapte (não copie) o estilo de copy que performa bem</li>
        <li>Evite os tópicos saturados e aposte nas lacunas identificadas</li>
      </ol>
    </div>
  </div>
);

// ============================================
// RADAR DE HASHTAGS
// ============================================
export const RadarHashtagsExplanation: React.FC<MetricExplanationProps & {
  hashtags?: Array<{
    tag: string;
    usage: 'concorrente' | 'nicho' | 'cliente';
    saturation: 'alta' | 'media' | 'baixa';
    opportunity: 'alta' | 'media' | 'baixa';
    note: string;
  }>;
}> = ({ hashtags }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-cyan-100 rounded-lg">
        <Hash className="text-cyan-600" size={24} />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">O que é o Radar de Hashtags?</h4>
        <p className="text-slate-600 text-sm mt-1">
          O Radar de Hashtags analisa as tags mais relevantes para seu nicho, classificando cada uma por 
          <strong> nível de saturação</strong> (competição) e <strong>oportunidade</strong> (potencial de alcance).
        </p>
      </div>
    </div>

    <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
      <h5 className="font-semibold text-cyan-800 mb-3">📊 Como Interpretar</h5>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white/70 rounded-lg p-3">
          <p className="font-semibold text-rose-700 mb-1">Saturação Alta</p>
          <p className="text-xs text-slate-600">Muita competição. Seu conteúdo pode se perder. Use com moderação.</p>
        </div>
        <div className="bg-white/70 rounded-lg p-3">
          <p className="font-semibold text-emerald-700 mb-1">Oportunidade Alta</p>
          <p className="text-xs text-slate-600">Bom alcance potencial. Público ativo buscando esta tag.</p>
        </div>
        <div className="bg-white/70 rounded-lg p-3">
          <p className="font-semibold text-amber-700 mb-1">Saturação Média</p>
          <p className="text-xs text-slate-600">Equilíbrio entre competição e visibilidade. Boas para uso regular.</p>
        </div>
        <div className="bg-white/70 rounded-lg p-3">
          <p className="font-semibold text-slate-700 mb-1">Oportunidade Baixa</p>
          <p className="text-xs text-slate-600">Pouca busca ativa. Use apenas se muito relevante ao conteúdo.</p>
        </div>
      </div>
    </div>

    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
      <h5 className="font-semibold text-indigo-800 mb-2">🏷️ Tipos de Hashtag</h5>
      <ul className="space-y-2 text-sm text-indigo-900">
        <li className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">CONCORRENTE</span>
          <span>Usada frequentemente pelos seus concorrentes</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">NICHO</span>
          <span>Específica do seu mercado/segmento</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">CLIENTE</span>
          <span>Já usada por você ou sua marca</span>
        </li>
      </ul>
    </div>

    {hashtags && hashtags.length > 0 && (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
        <h5 className="font-semibold text-emerald-800 mb-3">🎯 Hashtags Recomendadas</h5>
        <div className="space-y-2">
          {hashtags
            .filter(h => h.opportunity === 'alta')
            .slice(0, 5)
            .map((hashtag, index) => (
              <div key={index} className="flex items-center justify-between bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-emerald-800">{hashtag.tag}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    hashtag.usage === 'concorrente' ? 'bg-amber-100 text-amber-700' :
                    hashtag.usage === 'nicho' ? 'bg-blue-100 text-blue-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {hashtag.usage.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-emerald-600 font-medium">⭐ Priorizar</span>
              </div>
            ))}
        </div>
      </div>
    )}

    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h5 className="font-semibold text-amber-800 mb-2">💡 Estratégia de Hashtags</h5>
      <p className="text-sm text-amber-900">
        <strong>Mix ideal por post:</strong>
        <br/>• 2-3 hashtags de alta oportunidade (alcance)
        <br/>• 2-3 hashtags de nicho (relevância)
        <br/>• 1-2 hashtags de marca (identidade)
        <br/>• Evite mais de 10-15 hashtags por post
      </p>
    </div>
  </div>
);

// ============================================
// GRÁFICO SATURAÇÃO VS OPORTUNIDADE
// ============================================
export const GraficoSaturacaoExplanation: React.FC<MetricExplanationProps> = () => (
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-violet-100 rounded-lg">
        <BarChart3 className="text-violet-600" size={24} />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">Gráfico Saturação vs Oportunidade</h4>
        <p className="text-slate-600 text-sm mt-1">
          Este gráfico de dispersão posiciona cada tendência/tópico em dois eixos: 
          <strong> saturação de mercado</strong> (competição) e <strong>oportunidade</strong> (potencial).
        </p>
      </div>
    </div>

    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
      <h5 className="font-semibold text-violet-800 mb-3">📊 Como Ler o Gráfico</h5>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-100/50 rounded-lg p-3 border-2 border-emerald-300">
          <p className="font-bold text-emerald-800 text-sm">🌟 QUADRANTE IDEAL</p>
          <p className="text-xs text-emerald-700 mt-1">
            <strong>Alto-Esquerdo:</strong> Alta oportunidade + Baixa saturação
            <br/>Máxima prioridade para produção de conteúdo!
          </p>
        </div>
        <div className="bg-amber-100/50 rounded-lg p-3 border border-amber-200">
          <p className="font-bold text-amber-800 text-sm">⚡ COMPETITIVO</p>
          <p className="text-xs text-amber-700 mt-1">
            <strong>Alto-Direito:</strong> Alta oportunidade + Alta saturação
            <br/>Vale investir, mas precisa de diferencial forte.
          </p>
        </div>
        <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
          <p className="font-bold text-slate-700 text-sm">🔍 NICHO</p>
          <p className="text-xs text-slate-600 mt-1">
            <strong>Baixo-Esquerdo:</strong> Baixa oportunidade + Baixa saturação
            <br/>Nicho específico. Útil para audiência segmentada.
          </p>
        </div>
        <div className="bg-rose-100/50 rounded-lg p-3 border border-rose-200">
          <p className="font-bold text-rose-800 text-sm">⛔ EVITAR</p>
          <p className="text-xs text-rose-700 mt-1">
            <strong>Baixo-Direito:</strong> Baixa oportunidade + Alta saturação
            <br/>Muita competição para pouco retorno. Evite.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
      <h5 className="font-semibold text-indigo-800 mb-2">🎯 Ação Recomendada</h5>
      <ol className="space-y-1 text-sm text-indigo-900 list-decimal list-inside">
        <li>Foque nos pontos do quadrante alto-esquerdo (estrelas)</li>
        <li>Para pontos alto-direito, crie conteúdo com ângulo único</li>
        <li>Use pontos baixo-esquerdo para conteúdo técnico/específico</li>
        <li>Ignore os pontos baixo-direito (desperdício de esforço)</li>
      </ol>
    </div>
  </div>
);

export default {
  VolumeTopicoExplanation,
  PostsConcorrentesExplanation,
  LacunasConteudoExplanation,
  ResumoTematicoExplanation,
  MapaConcorrenciaExplanation,
  RadarHashtagsExplanation,
  GraficoSaturacaoExplanation,
};
