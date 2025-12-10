/**
 * Services Index
 * 
 * Exporta todos os serviços do sistema de pesquisa profissional
 */

// Web Search Service
export {
  searchGoogle,
  searchCompetitor,
  searchNicheTrends,
  extractSocialProfiles,
  validateSerpApiKey,
} from './webSearchService';

// Social Scraping Service
export {
  INSTAGRAM_SCRAPER_ACTOR,
  runApifyActor,
  scrapeInstagramProfile,
  scrapeInstagramPosts,
  scrapeInstagramHashtag,
  scrapeFacebookPage,
  scrapeFacebookPosts,
  scrapeCompetitorSocial,
  validateApifyKey,
  extractInstagramUsername,
  extractHashtags,
  extractMentions,
  calculateInstagramEngagement,
  analyzePostingFrequency,
} from './socialScrapingService';

// Image Analysis Service
export {
  analyzeImage,
  analyzeMultipleImages,
  generateVisualReport,
  analyzeCompetitorVisuals,
  compareCompetitorVisuals,
} from './imageAnalysisService';

// Strategic Recommendations Service
export {
  analyzeCompetitorLeadership,
  generateStrategicPaths,
  generateContentRecommendations,
  generateUrgentActions,
  generateLongTermGoals,
  generateCompleteRecommendations,
} from './strategicRecommendations';

// Research Pipeline
export {
  ResearchPipeline,
  executeResearch,
} from './researchPipeline';
