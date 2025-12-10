/**
 * Image Analysis Service - GPT-4 Vision Integration
 * 
 * Este serviço utiliza GPT-4 Vision para analisar imagens de posts
 * dos concorrentes, identificando padrões visuais, cores, estilos e composição.
 */

import { ImageAnalysis, VisualAnalysisReport, InstagramPost } from '../types/research';

const OPENAI_API_BASE = 'https://api.openai.com/v1';

/**
 * Analisa uma imagem usando GPT-4 Vision
 */
export const analyzeImage = async (
  imageUrl: string,
  openaiApiKey: string,
  context?: string
): Promise<ImageAnalysis> => {
  console.log(`[Vision] 🖼️ Analisando imagem: ${imageUrl.substring(0, 50)}...`);

  const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em análise visual de conteúdo para redes sociais.
Analise a imagem fornecida e retorne um JSON com a seguinte estrutura:
{
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "colorMood": "quente/frio/neutro/vibrante/suave",
  "style": "minimalista/moderno/vintage/profissional/casual/luxuoso/artístico",
  "composition": "centralizado/regra-dos-tercos/simetrico/dinamico/enquadramento-fechado",
  "hasText": true/false,
  "textContent": "texto visível na imagem ou null",
  "hasProduct": true/false,
  "productType": "tipo do produto se houver ou null",
  "hasPerson": true/false,
  "personContext": "descricao da pessoa se houver ou null",
  "visualElements": ["elemento1", "elemento2"],
  "brandingElements": ["logo", "cores-da-marca", etc],
  "qualityScore": 1-10,
  "engagementPotential": "baixo/medio/alto",
  "suggestedImprovements": ["sugestao1", "sugestao2"]
}

${context ? `Contexto adicional: ${context}` : ''}

Seja preciso e objetivo na análise.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'high' },
            },
            {
              type: 'text',
              text: 'Analise esta imagem de post de rede social e retorne o JSON com a análise.',
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const analysis = JSON.parse(data.choices[0].message.content);

  console.log(`[Vision] ✅ Análise concluída - Estilo: ${analysis.style}, Qualidade: ${analysis.qualityScore}/10`);

  return {
    imageUrl,
    dominantColors: analysis.dominantColors || [],
    colorMood: analysis.colorMood,
    style: analysis.style,
    composition: analysis.composition,
    hasText: analysis.hasText || false,
    textContent: analysis.textContent,
    hasProduct: analysis.hasProduct || false,
    productType: analysis.productType,
    hasPerson: analysis.hasPerson || false,
    personContext: analysis.personContext,
    visualElements: analysis.visualElements || [],
    brandingElements: analysis.brandingElements || [],
    qualityScore: analysis.qualityScore || 5,
    engagementPotential: analysis.engagementPotential || 'medio',
    suggestedImprovements: analysis.suggestedImprovements || [],
  };
};

/**
 * Analisa múltiplas imagens em lote
 */
export const analyzeMultipleImages = async (
  images: { url: string; context?: string }[],
  openaiApiKey: string,
  options: {
    maxConcurrent?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<ImageAnalysis[]> => {
  const { maxConcurrent = 3, onProgress } = options;
  const results: ImageAnalysis[] = [];
  let completed = 0;

  console.log(`[Vision] 🖼️ Analisando ${images.length} imagens (${maxConcurrent} em paralelo)...`);

  // Processa em lotes para não sobrecarregar a API
  for (let i = 0; i < images.length; i += maxConcurrent) {
    const batch = images.slice(i, i + maxConcurrent);
    
    const batchResults = await Promise.all(
      batch.map(async ({ url, context }) => {
        try {
          return await analyzeImage(url, openaiApiKey, context);
        } catch (error) {
          console.warn(`[Vision] ⚠️ Erro ao analisar imagem: ${error}`);
          return null;
        }
      })
    );

    for (const result of batchResults) {
      if (result) results.push(result);
      completed++;
      if (onProgress) onProgress(completed, images.length);
    }

    // Pequena pausa entre lotes para evitar rate limiting
    if (i + maxConcurrent < images.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`[Vision] ✅ Análise concluída: ${results.length}/${images.length} imagens`);
  return results;
};

/**
 * Gera relatório visual completo a partir de análises de múltiplas imagens
 */
export const generateVisualReport = (
  analyses: ImageAnalysis[],
  competitorName: string
): VisualAnalysisReport => {
  console.log(`[Vision] 📊 Gerando relatório visual para: ${competitorName}`);

  if (analyses.length === 0) {
    return {
      competitorName,
      totalImagesAnalyzed: 0,
      dominantColorPalette: [],
      preferredStyles: [],
      commonCompositions: [],
      textUsagePercentage: 0,
      productPresencePercentage: 0,
      personPresencePercentage: 0,
      averageQualityScore: 0,
      commonVisualElements: [],
      brandingConsistency: 0,
      recommendations: ['Não foi possível analisar imagens deste concorrente'],
    };
  }

  // Conta frequência de cores
  const colorFrequency: Record<string, number> = {};
  for (const analysis of analyses) {
    for (const color of analysis.dominantColors) {
      colorFrequency[color] = (colorFrequency[color] || 0) + 1;
    }
  }
  const dominantColorPalette = Object.entries(colorFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color);

  // Conta frequência de estilos
  const styleFrequency: Record<string, number> = {};
  for (const analysis of analyses) {
    if (analysis.style) {
      styleFrequency[analysis.style] = (styleFrequency[analysis.style] || 0) + 1;
    }
  }
  const preferredStyles = Object.entries(styleFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([style]) => style);

  // Conta frequência de composições
  const compositionFrequency: Record<string, number> = {};
  for (const analysis of analyses) {
    if (analysis.composition) {
      compositionFrequency[analysis.composition] = (compositionFrequency[analysis.composition] || 0) + 1;
    }
  }
  const commonCompositions = Object.entries(compositionFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([comp]) => comp);

  // Calcula percentuais
  const textUsagePercentage = (analyses.filter(a => a.hasText).length / analyses.length) * 100;
  const productPresencePercentage = (analyses.filter(a => a.hasProduct).length / analyses.length) * 100;
  const personPresencePercentage = (analyses.filter(a => a.hasPerson).length / analyses.length) * 100;

  // Média de qualidade
  const averageQualityScore = analyses.reduce((sum, a) => sum + a.qualityScore, 0) / analyses.length;

  // Elementos visuais comuns
  const elementFrequency: Record<string, number> = {};
  for (const analysis of analyses) {
    for (const element of analysis.visualElements) {
      elementFrequency[element] = (elementFrequency[element] || 0) + 1;
    }
  }
  const commonVisualElements = Object.entries(elementFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([element]) => element);

  // Consistência de branding (baseado na repetição de elementos de marca)
  const brandingElements = analyses.flatMap(a => a.brandingElements);
  const uniqueBrandingElements = new Set(brandingElements);
  const brandingConsistency = uniqueBrandingElements.size > 0
    ? (brandingElements.length / (uniqueBrandingElements.size * analyses.length)) * 100
    : 0;

  // Gera recomendações baseadas na análise
  const recommendations: string[] = [];

  if (averageQualityScore >= 7) {
    recommendations.push(`O concorrente ${competitorName} tem alta qualidade visual (${averageQualityScore.toFixed(1)}/10). Invista em produção de qualidade similar.`);
  } else if (averageQualityScore < 5) {
    recommendations.push(`O concorrente ${competitorName} tem qualidade visual baixa (${averageQualityScore.toFixed(1)}/10). Esta é uma oportunidade de diferenciação.`);
  }

  if (preferredStyles.length > 0) {
    recommendations.push(`Estilo visual predominante: ${preferredStyles.join(', ')}. Considere adotar ou diferenciar-se deste estilo.`);
  }

  if (textUsagePercentage > 70) {
    recommendations.push(`Alto uso de texto nas imagens (${textUsagePercentage.toFixed(0)}%). Considere se isso funciona para seu público.`);
  } else if (textUsagePercentage < 30) {
    recommendations.push(`Baixo uso de texto nas imagens (${textUsagePercentage.toFixed(0)}%). Foco em conteúdo visual puro.`);
  }

  if (personPresencePercentage > 50) {
    recommendations.push(`Presença frequente de pessoas (${personPresencePercentage.toFixed(0)}%). Humanização do conteúdo é importante neste nicho.`);
  }

  if (dominantColorPalette.length > 0) {
    recommendations.push(`Paleta de cores dominante: ${dominantColorPalette.join(', ')}. Defina sua própria paleta para diferenciação.`);
  }

  return {
    competitorName,
    totalImagesAnalyzed: analyses.length,
    dominantColorPalette,
    preferredStyles,
    commonCompositions,
    textUsagePercentage,
    productPresencePercentage,
    personPresencePercentage,
    averageQualityScore,
    commonVisualElements,
    brandingConsistency,
    recommendations,
  };
};

/**
 * Analisa posts do Instagram e gera relatório visual
 */
export const analyzeCompetitorVisuals = async (
  competitorName: string,
  posts: InstagramPost[],
  openaiApiKey: string,
  options: {
    maxImages?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<VisualAnalysisReport> => {
  const { maxImages = 9, onProgress } = options;

  // Filtra posts com imagens
  const imagePosts = posts
    .filter(p => p.mediaUrl && p.mediaType !== 'video')
    .slice(0, maxImages);

  if (imagePosts.length === 0) {
    console.log(`[Vision] ⚠️ Nenhuma imagem disponível para análise de ${competitorName}`);
    return generateVisualReport([], competitorName);
  }

  console.log(`[Vision] 🔍 Analisando ${imagePosts.length} imagens de ${competitorName}...`);

  const images = imagePosts.map(post => ({
    url: post.mediaUrl!,
    context: `Post de ${competitorName} com ${post.likesCount} likes. Caption: ${post.caption?.substring(0, 100)}`,
  }));

  const analyses = await analyzeMultipleImages(images, openaiApiKey, { onProgress });
  return generateVisualReport(analyses, competitorName);
};

/**
 * Compara visualmente múltiplos concorrentes
 */
export const compareCompetitorVisuals = (
  reports: VisualAnalysisReport[]
): {
  visualLeader: string;
  commonPatterns: string[];
  differentiationOpportunities: string[];
  recommendedStrategy: string;
} => {
  if (reports.length === 0) {
    return {
      visualLeader: 'N/A',
      commonPatterns: [],
      differentiationOpportunities: [],
      recommendedStrategy: 'Não foi possível realizar comparação visual.',
    };
  }

  // Encontra o líder em qualidade visual
  const sortedByQuality = [...reports].sort((a, b) => b.averageQualityScore - a.averageQualityScore);
  const visualLeader = sortedByQuality[0].competitorName;

  // Encontra padrões comuns (estilos que aparecem em mais de um concorrente)
  const allStyles = reports.flatMap(r => r.preferredStyles);
  const styleCount: Record<string, number> = {};
  for (const style of allStyles) {
    styleCount[style] = (styleCount[style] || 0) + 1;
  }
  const commonPatterns = Object.entries(styleCount)
    .filter(([, count]) => count > 1)
    .map(([style]) => style);

  // Identifica oportunidades de diferenciação
  const differentiationOpportunities: string[] = [];
  
  const avgTextUsage = reports.reduce((sum, r) => sum + r.textUsagePercentage, 0) / reports.length;
  if (avgTextUsage < 40) {
    differentiationOpportunities.push('Uso estratégico de texto overlay pode ser diferenciador');
  } else if (avgTextUsage > 70) {
    differentiationOpportunities.push('Imagens clean sem texto podem se destacar');
  }

  const avgPersonPresence = reports.reduce((sum, r) => sum + r.personPresencePercentage, 0) / reports.length;
  if (avgPersonPresence < 30) {
    differentiationOpportunities.push('Humanizar conteúdo com pessoas pode gerar conexão');
  }

  const allColors = reports.flatMap(r => r.dominantColorPalette);
  const uniqueColors = new Set(allColors);
  if (uniqueColors.size < 10) {
    differentiationOpportunities.push('Paleta de cores diferenciada pode criar identidade única');
  }

  // Estratégia recomendada
  const recommendedStrategy = `
Baseado na análise visual dos ${reports.length} concorrentes:
- Líder visual: ${visualLeader} (qualidade ${sortedByQuality[0].averageQualityScore.toFixed(1)}/10)
- Padrões comuns: ${commonPatterns.length > 0 ? commonPatterns.join(', ') : 'diversos'}
- Para se diferenciar: ${differentiationOpportunities.length > 0 ? differentiationOpportunities.join('; ') : 'foque em qualidade superior'}
`.trim();

  return {
    visualLeader,
    commonPatterns,
    differentiationOpportunities,
    recommendedStrategy,
  };
};
