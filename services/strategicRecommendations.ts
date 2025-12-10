/**
 * Strategic Recommendations Service
 * 
 * Serviço dedicado à geração de recomendações estratégicas detalhadas
 * baseadas nos dados coletados de pesquisa.
 */

import {
  ResearchReport,
  StrategicRecommendations,
  StrategicPath,
  ContentRecommendation,
  CompetitorFullAnalysis,
} from '../types/research';

/**
 * Analisa os concorrentes e identifica o líder em cada métrica
 */
export const analyzeCompetitorLeadership = (competitors: CompetitorFullAnalysis[]): {
  engagementLeader?: CompetitorFullAnalysis;
  followersLeader?: CompetitorFullAnalysis;
  contentQualityLeader?: CompetitorFullAnalysis;
  postingConsistencyLeader?: CompetitorFullAnalysis;
} => {
  if (competitors.length === 0) return {};

  const competitorsWithMetrics = competitors.filter(c => c.metrics);

  return {
    engagementLeader: competitorsWithMetrics.reduce((best, c) => 
      (c.metrics?.instagramEngagementRate || 0) > (best?.metrics?.instagramEngagementRate || 0) ? c : best
    , competitorsWithMetrics[0]),
    
    followersLeader: competitorsWithMetrics.reduce((best, c) =>
      (c.metrics?.instagramFollowers || 0) > (best?.metrics?.instagramFollowers || 0) ? c : best
    , competitorsWithMetrics[0]),
    
    contentQualityLeader: competitors.reduce((best, c) =>
      (c.visualAnalysis?.averageQualityScore || 0) > (best?.visualAnalysis?.averageQualityScore || 0) ? c : best
    , competitors[0]),
    
    postingConsistencyLeader: competitorsWithMetrics.reduce((best, c) =>
      (c.metrics?.postingFrequency?.postsPerWeek || 0) > (best?.metrics?.postingFrequency?.postsPerWeek || 0) ? c : best
    , competitorsWithMetrics[0]),
  };
};

/**
 * Gera caminhos estratégicos baseados na análise competitiva
 */
export const generateStrategicPaths = (
  report: ResearchReport,
  leadership: ReturnType<typeof analyzeCompetitorLeadership>
): StrategicPath[] => {
  const paths: StrategicPath[] = [];

  // CAMINHO 1: Competir por Engajamento
  if (leadership.engagementLeader) {
    const leader = leadership.engagementLeader;
    const engagementRate = leader.metrics?.instagramEngagementRate || 0;
    
    paths.push({
      name: '🎯 Caminho do Engajamento',
      description: `Focar em maximizar interações. ${leader.name} lidera com ${engagementRate.toFixed(2)}% de engajamento. A estratégia é criar conteúdo altamente interativo que provoque comentários e compartilhamentos.`,
      difficulty: 'medium',
      timeToResults: '2-3 meses',
      requiredResources: [
        'Criador de conteúdo dedicado',
        'Calendário de postagens consistente',
        'Ferramentas de agendamento (Later, Buffer)',
        'Banco de CTAs (calls-to-action)',
      ],
      expectedOutcomes: [
        `Alcançar engajamento de ${(engagementRate * 0.8).toFixed(2)}% em 3 meses`,
        'Aumentar comentários médios por post em 50%',
        'Crescer base de seguidores engajados em 30%',
        'Melhorar posicionamento no algoritmo do Instagram',
      ],
      actionSteps: [
        'Analisar os 5 posts de maior engajamento de cada concorrente',
        'Criar template de posts com perguntas abertas no final',
        'Implementar estratégia de resposta a todos os comentários em até 1 hora',
        'Usar recursos interativos nos Stories diariamente (enquetes, quiz, slider)',
        'Testar diferentes horários e identificar os de melhor performance',
        'Criar série de conteúdo que gere expectativa (séries numeradas)',
      ],
    });
  }

  // CAMINHO 2: Competir por Qualidade Visual
  if (leadership.contentQualityLeader) {
    const leader = leadership.contentQualityLeader;
    const quality = leader.visualAnalysis?.averageQualityScore || 0;
    const styles = leader.visualAnalysis?.preferredStyles || [];
    
    paths.push({
      name: '🎨 Caminho da Excelência Visual',
      description: `Superar a qualidade visual dos concorrentes. ${leader.name} tem qualidade ${quality.toFixed(1)}/10 com estilo ${styles.join(', ')}. A estratégia é criar identidade visual premium e diferenciada.`,
      difficulty: 'hard',
      timeToResults: '3-4 meses',
      requiredResources: [
        'Designer gráfico ou ferramentas como Canva Pro',
        'Banco de imagens premium (Unsplash, Pexels, ou próprias)',
        'Paleta de cores e tipografia definidas',
        'Templates personalizados para cada tipo de post',
        'Equipamento de fotografia/iluminação (se aplicável)',
      ],
      expectedOutcomes: [
        `Alcançar qualidade visual ${quality + 1}/10 ou superior`,
        'Criar identidade visual reconhecível instantaneamente',
        'Aumentar salvamentos de posts em 40%',
        'Atrair parcerias com marcas premium',
      ],
      actionSteps: [
        'Definir paleta de cores exclusiva (máximo 5 cores)',
        'Escolher 2-3 fontes que representem a marca',
        'Criar grid do Instagram planejado visualmente',
        'Desenvolver 10 templates base para diferentes tipos de conteúdo',
        'Estabelecer guidelines de fotografia e edição',
        'Fazer auditoria visual mensal do perfil',
        'Investir em mockups e recursos visuais profissionais',
      ],
    });
  }

  // CAMINHO 3: Competir por Volume e Consistência
  if (leadership.postingConsistencyLeader) {
    const leader = leadership.postingConsistencyLeader;
    const frequency = leader.metrics?.postingFrequency?.postsPerWeek || 0;
    
    paths.push({
      name: '📅 Caminho da Consistência',
      description: `Dominar pela presença constante. ${leader.name} posta ${frequency.toFixed(1)}x por semana. A estratégia é estar sempre presente no feed do público com conteúdo de valor.`,
      difficulty: 'medium',
      timeToResults: '1-2 meses',
      requiredResources: [
        'Sistema de batch content (criar conteúdo em lote)',
        'Ferramenta de agendamento profissional',
        'Banco de ideias de conteúdo (mínimo 100 ideias)',
        'Processo documentado de criação',
      ],
      expectedOutcomes: [
        `Manter ${Math.max(frequency, 5)} posts por semana consistentemente`,
        'Aumentar alcance médio em 60%',
        'Reduzir tempo de criação de conteúdo em 40%',
        'Construir hábito no público (expectativa de conteúdo)',
      ],
      actionSteps: [
        'Definir calendário editorial semanal fixo',
        `Meta: ${Math.max(Math.ceil(frequency), 5)} posts/semana + Stories diários`,
        'Reservar 1 dia para produção de conteúdo da semana toda',
        'Criar banco de conteúdo evergreen (sempre relevante)',
        'Automatizar legendas e hashtags com templates',
        'Usar ferramentas de IA para auxiliar na criação',
        'Monitorar métricas semanalmente e ajustar',
      ],
    });
  }

  // CAMINHO 4: Diferenciação por Nicho
  paths.push({
    name: '🎪 Caminho do Nicho Específico',
    description: `Dominar um sub-nicho específico dentro de ${report.niche}. Ao invés de competir diretamente, tornar-se a referência absoluta em uma vertical específica.`,
    difficulty: 'medium',
    timeToResults: '2-4 meses',
    requiredResources: [
      'Pesquisa de sub-nichos não explorados',
      'Conhecimento profundo do sub-nicho escolhido',
      'Comunidade ou grupo do sub-nicho',
      'Conteúdo especializado e técnico',
    ],
    expectedOutcomes: [
      'Tornar-se referência no sub-nicho escolhido',
      'Atrair público altamente qualificado',
      'Menor concorrência por atenção',
      'Oportunidades de monetização premium',
    ],
    actionSteps: [
      `Identificar 5 sub-nichos dentro de ${report.niche}`,
      'Analisar demanda vs oferta de conteúdo em cada um',
      'Escolher o sub-nicho com maior gap de conteúdo',
      'Criar série de conteúdo "definitivo" sobre o sub-nicho',
      'Usar hashtags específicas do sub-nicho',
      'Engajar com comunidade do sub-nicho ativamente',
      'Posicionar-se como especialista com conteúdo técnico',
    ],
  });

  // CAMINHO 5: Comunidade e Relacionamento
  paths.push({
    name: '🤝 Caminho da Comunidade',
    description: 'Construir uma comunidade leal ao invés de apenas seguidores. Foco em relacionamento, DMs, e criação de pertencimento.',
    difficulty: 'hard',
    timeToResults: '4-6 meses',
    requiredResources: [
      'Tempo dedicado a interações (2-3h/dia)',
      'Plataforma de comunidade (Close Friends, Telegram, Discord)',
      'Sistema de conteúdo exclusivo',
      'Eventos online regulares (Lives, Q&A)',
    ],
    expectedOutcomes: [
      'Taxa de retenção de seguidores superior a 95%',
      'Engajamento 3x maior que a média',
      'Base de fãs leais que defendem a marca',
      'Facilidade em lançar produtos/serviços',
    ],
    actionSteps: [
      'Responder 100% dos DMs e comentários',
      'Criar Close Friends com conteúdo exclusivo',
      'Fazer Lives semanais de Q&A',
      'Reconhecer e destacar membros ativos da comunidade',
      'Criar desafios e campanhas participativas',
      'Compartilhar bastidores e vulnerabilidades autênticas',
      'Construir rituais da comunidade (ex: post toda segunda)',
    ],
  });

  return paths;
};

/**
 * Gera recomendações de conteúdo específicas
 */
export const generateContentRecommendations = (
  report: ResearchReport
): ContentRecommendation[] => {
  const recommendations: ContentRecommendation[] = [];
  const popularHashtags = report.nicheAnalysis.popularHashtags || [];

  // Reels
  recommendations.push({
    type: 'reels',
    theme: 'Conteúdo viral e descoberta',
    frequency: '4-5x por semana (mínimo para crescimento)',
    bestTimes: ['07:00-08:00', '12:00-13:00', '18:00-19:00', '21:00-22:00'],
    hashtags: [
      ...popularHashtags.slice(0, 5),
      '#reels', '#reelsviral', '#reelsbrasil',
    ],
    exampleIdeas: [
      `Tutorial rápido sobre ${report.niche} em 15-30 segundos`,
      'Antes e depois com transição criativa',
      'Top 3 erros que iniciantes cometem',
      'POV: situação relatable do nicho',
      'Tendência de áudio adaptada ao nicho',
      'Behind the scenes do processo',
      'Dica que ninguém conta',
      'Reação a comentário ou pergunta comum',
    ],
  });

  // Carrosseis
  recommendations.push({
    type: 'carousel',
    theme: 'Conteúdo educativo e salvável',
    frequency: '2-3x por semana',
    bestTimes: ['09:00-10:00', '14:00-15:00', '19:00-20:00'],
    hashtags: popularHashtags.slice(0, 10),
    exampleIdeas: [
      'Guia completo passo a passo (8-10 slides)',
      'Checklist visual para download',
      '10 dicas que transformaram meu resultado',
      'O que fazer vs O que não fazer',
      'Evolução: mês 1 vs mês 6',
      'Ferramentas que uso diariamente',
      'Perguntas frequentes respondidas',
      'Case study: como consegui X resultado',
    ],
  });

  // Stories
  recommendations.push({
    type: 'stories',
    theme: 'Conexão e interação diária',
    frequency: '5-10 stories por dia',
    bestTimes: ['08:00', '12:00', '17:00', '21:00'],
    hashtags: [],
    exampleIdeas: [
      'Bom dia com enquete sobre o dia',
      'Bastidores do trabalho/criação',
      'Caixinha de perguntas semanal',
      'Quiz sobre o nicho',
      'Contagem regressiva para lançamentos',
      'Compartilhar conteúdo de seguidores',
      'Música do dia + mood',
      'Reflexão ou aprendizado do dia',
      'Prévia do próximo conteúdo',
      'Votação para decidir próximo tema',
    ],
  });

  // Feed estático
  recommendations.push({
    type: 'feed',
    theme: 'Posicionamento e autoridade',
    frequency: '1-2x por semana',
    bestTimes: ['10:00-11:00', '19:00-20:00'],
    hashtags: popularHashtags.slice(0, 15),
    exampleIdeas: [
      'Frase de impacto com design premium',
      'Conquista ou marco importante',
      'Depoimento de cliente/seguidor',
      'Foto pessoal com legenda storytelling',
      'Anúncio de novidade ou lançamento',
      'Post de agradecimento à comunidade',
      'Reflexão profunda sobre o nicho',
      'Conteúdo inspiracional autoral',
    ],
  });

  return recommendations;
};

/**
 * Gera ações urgentes baseadas na análise
 */
export const generateUrgentActions = (report: ResearchReport): string[] => {
  const actions: string[] = [];

  // Ações sempre importantes
  actions.push('🔍 Auditar e otimizar bio do Instagram (incluir CTA claro)');
  actions.push('🎨 Definir ou revisar identidade visual (cores, fontes)');
  actions.push('📱 Criar highlights organizados por categoria');
  
  // Baseado nas lacunas identificadas
  for (const gap of report.nicheAnalysis.contentGaps.slice(0, 2)) {
    actions.push(`📝 Criar conteúdo sobre: ${gap}`);
  }

  // Baseado na concorrência
  const avgEngagement = report.competitors.reduce((sum, c) => 
    sum + (c.metrics?.instagramEngagementRate || 0), 0
  ) / (report.competitors.length || 1);

  if (avgEngagement > 3) {
    actions.push('💬 Implementar resposta rápida a comentários (< 1 hora)');
  }

  actions.push('📊 Configurar planilha de métricas semanais');
  actions.push('📅 Criar calendário de conteúdo para as próximas 2 semanas');
  actions.push(`#️⃣ Pesquisar e listar 30 hashtags relevantes para ${report.niche}`);

  return actions.slice(0, 8);
};

/**
 * Gera metas de longo prazo
 */
export const generateLongTermGoals = (report: ResearchReport): string[] => {
  const goals: string[] = [];
  
  // Calcula médias dos concorrentes para definir metas
  const avgFollowers = report.competitors.reduce((sum, c) => 
    sum + (c.metrics?.instagramFollowers || 0), 0
  ) / (report.competitors.length || 1);

  if (avgFollowers > 0) {
    const targetFollowers = Math.round(avgFollowers * 0.5);
    goals.push(`📈 Alcançar ${targetFollowers.toLocaleString()} seguidores em 6 meses`);
  } else {
    goals.push('📈 Alcançar 10.000 seguidores em 6 meses');
  }

  goals.push(`🏆 Tornar-se referência em ${report.niche} no Instagram`);
  goals.push('🤝 Estabelecer 5 parcerias estratégicas com marcas');
  goals.push('💰 Criar primeira fonte de receita (produto digital, serviço, afiliado)');
  goals.push('👥 Construir comunidade engajada de 1.000+ pessoas');
  goals.push('📧 Criar lista de email com 500+ inscritos');
  goals.push('🎓 Lançar conteúdo educativo (ebook, curso, mentoria)');
  goals.push('📺 Expandir para outra plataforma (TikTok, YouTube, LinkedIn)');

  return goals;
};

/**
 * Gera relatório completo de recomendações estratégicas
 */
export const generateCompleteRecommendations = (
  report: ResearchReport
): StrategicRecommendations => {
  const leadership = analyzeCompetitorLeadership(report.competitors);
  
  // Gera análise da situação atual
  let currentSituation = `## Análise do Mercado: ${report.niche}\n\n`;
  
  currentSituation += `Foram analisados ${report.competitors.length} concorrentes no nicho.\n\n`;
  
  if (leadership.engagementLeader) {
    currentSituation += `**Líder em engajamento:** ${leadership.engagementLeader.name} com ${(leadership.engagementLeader.metrics?.instagramEngagementRate || 0).toFixed(2)}%\n`;
  }
  if (leadership.followersLeader) {
    currentSituation += `**Maior audiência:** ${leadership.followersLeader.name} com ${(leadership.followersLeader.metrics?.instagramFollowers || 0).toLocaleString()} seguidores\n`;
  }
  if (leadership.contentQualityLeader) {
    currentSituation += `**Melhor qualidade visual:** ${leadership.contentQualityLeader.name} com ${(leadership.contentQualityLeader.visualAnalysis?.averageQualityScore || 0).toFixed(1)}/10\n`;
  }
  
  currentSituation += `\n**Tendências identificadas:** ${report.nicheAnalysis.trends.slice(0, 3).join(', ')}\n`;
  currentSituation += `\n**Tamanho do mercado:** ${report.nicheAnalysis.marketSize}`;

  return {
    clientName: report.clientName,
    generatedAt: new Date(),
    currentSituation,
    strategicPaths: generateStrategicPaths(report, leadership),
    contentRecommendations: generateContentRecommendations(report),
    urgentActions: generateUrgentActions(report),
    longTermGoals: generateLongTermGoals(report),
  };
};
