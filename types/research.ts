/**
 * Tipos para o sistema de pesquisa profissional
 * 
 * Este módulo define todas as interfaces necessárias para:
 * - Web Search (SerpAPI)
 * - Social Media Scraping (Apify)
 * - Análise de Imagens (GPT-4 Vision)
 * - Processamento e Recomendações
 */

// ============================================
// CONFIGURAÇÃO DE APIs
// ============================================

export interface ResearchApiKeys {
  serpApi?: string;      // Para busca web (Google)
  apify?: string;        // Para scraping de redes sociais
  openAi?: string;       // Para processamento e visão
  googleCseKey?: string; // Google Custom Search API Key
  googleCseCx?: string;  // Google Custom Search CX
  bingApiKey?: string;   // Bing Web Search
}

// ============================================
// WEB SEARCH (SerpAPI)
// ============================================

export interface WebSearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  source: string;
}

export interface WebSearchResponse {
  query: string;
  totalResults: number;
  results: WebSearchResult[];
  relatedSearches?: string[];
  knowledgeGraph?: {
    title: string;
    description?: string;
    website?: string;
    socialProfiles?: { platform: string; url: string }[];
  };
}

// ============================================
// SOCIAL MEDIA SCRAPING (Apify)
// ============================================

export interface InstagramPost {
  id: string;
  shortcode: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timestamp?: string;
  mediaType: 'image' | 'video' | 'carousel';
  mediaUrl?: string;
  thumbnailUrl?: string;
  hashtags: string[];
  mentions: string[];
  ownerUsername?: string;
}

export interface InstagramProfile {
  username: string;
  fullName: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  profilePicUrl: string;
  isVerified: boolean;
  isBusinessAccount: boolean;
  category?: string;
  website?: string;
}

export interface FacebookPost {
  id: string;
  text: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  timestamp?: string;
  mediaType?: string;
  mediaUrl?: string;
  url?: string;
}

export interface FacebookPage {
  name: string;
  url: string;
  likesCount: number;
  followersCount: number;
  category: string;
  description?: string;
  coverPhotoUrl?: string;
  profilePictureUrl?: string;
  isVerified: boolean;
}

export interface SocialMediaData {
  instagram?: {
    profile: InstagramProfile;
    posts: InstagramPost[];
  };
  facebook?: {
    page: FacebookPage;
    posts: FacebookPost[];
  };
}

// ============================================
// ANÁLISE DE IMAGENS (GPT-4 Vision)
// ============================================

export interface ImageAnalysis {
  imageUrl: string;
  dominantColors: string[];
  colorMood?: string;
  style?: string;
  composition?: string;
  hasText: boolean;
  textContent?: string | null;
  hasProduct: boolean;
  productType?: string | null;
  hasPerson: boolean;
  personContext?: string | null;
  visualElements: string[];
  brandingElements: string[];
  qualityScore: number;
  engagementPotential?: string;
  suggestedImprovements?: string[];
}

export interface VisualAnalysisReport {
  competitorName: string;
  totalImagesAnalyzed: number;
  dominantColorPalette: string[];
  preferredStyles: string[];
  commonCompositions: string[];
  textUsagePercentage: number;
  productPresencePercentage: number;
  personPresencePercentage: number;
  averageQualityScore: number;
  commonVisualElements: string[];
  brandingConsistency: number;
  recommendations: string[];
}

// ============================================
// ANÁLISE DE COPY E CONTEÚDO
// ============================================

export interface CopyAnalysis {
  averageLength: number;
  toneOfVoice: string[];
  emojiUsage: 'heavy' | 'moderate' | 'minimal' | 'none';
  hashtagStrategy: {
    averagePerPost: number;
    mostUsed: string[];
    categories: { branded: string[]; niche: string[]; trending: string[] };
  };
  ctaPatterns: string[];
  engagementTriggers: string[];
  postingPatterns: {
    bestDays: string[];
    bestTimes: string[];
    averagePostsPerWeek: number;
  };
}

// ============================================
// MÉTRICAS DE CONCORRENTE
// ============================================

export interface CompetitorMetrics {
  instagramFollowers?: number;
  instagramPosts?: number;
  instagramEngagementRate?: number;
  facebookLikes?: number;
  facebookFollowers?: number;
  postingFrequency?: {
    postsPerWeek: number;
    postsPerMonth: number;
    mostActiveDay?: string;
    mostActiveHour?: number;
  };
}

// ============================================
// ANÁLISE DE CONCORRENTE COMPLETA
// ============================================

export interface CompetitorFullAnalysis {
  name: string;
  website?: string;
  socialProfiles?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
  };
  webPresence?: {
    searchResults: WebSearchResult[];
    newsResults?: WebSearchResult[];
    knowledgeGraph?: WebSearchResponse['knowledgeGraph'];
  };
  socialData?: SocialMediaData;
  visualAnalysis?: VisualAnalysisReport;
  copyAnalysis?: CopyAnalysis;
  metrics?: CompetitorMetrics;
}

// ============================================
// RECOMENDAÇÕES ESTRATÉGICAS
// ============================================

export interface StrategicPath {
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToResults: string;
  requiredResources: string[];
  expectedOutcomes: string[];
  actionSteps: string[];
}

export interface ContentRecommendation {
  type: 'reels' | 'carousel' | 'stories' | 'feed' | string;
  theme: string;
  frequency: string;
  bestTimes: string[];
  hashtags: string[];
  exampleIdeas: string[];
}

export interface StrategicRecommendations {
  clientName: string;
  generatedAt: Date;
  currentSituation: string;
  strategicPaths: StrategicPath[];
  contentRecommendations: ContentRecommendation[];
  urgentActions: string[];
  longTermGoals: string[];
}

// ============================================
// ANÁLISE DE NICHO
// ============================================

export interface NicheAnalysis {
  trends: string[];
  popularHashtags: string[];
  contentGaps: string[];
  marketSize: 'pequeno' | 'médio' | 'grande';
}

// ============================================
// RELATÓRIO FINAL DE PESQUISA
// ============================================

export interface ResearchReport {
  clientName: string;
  niche: string;
  generatedAt: Date;
  competitors: CompetitorFullAnalysis[];
  nicheAnalysis: NicheAnalysis;
  strategicRecommendations: StrategicRecommendations;
  visualComparison?: {
    visualLeader: string;
    commonPatterns: string[];
    differentiationOpportunities: string[];
    recommendedStrategy: string;
  };
}

// ============================================
// PIPELINE STATUS
// ============================================

export interface PhaseStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

export interface ResearchPipelineStatus {
  currentPhase: 'idle' | 'webSearch' | 'socialScraping' | 'imageAnalysis' | 'dataProcessing' | 'recommendations';
  progress: number;
  phases: {
    webSearch: PhaseStatus;
    socialScraping: PhaseStatus;
    imageAnalysis: PhaseStatus;
    dataProcessing: PhaseStatus;
    recommendations: PhaseStatus;
  };
  startTime: Date;
  endTime?: Date;
  logs: Array<{
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
  error?: string;
}

// ============================================
// CONFIGURAÇÃO DE PESQUISA
// ============================================

export interface ResearchConfig {
  maxCompetitors: number;
  maxPostsPerCompetitor: number;
  maxImagesPerCompetitor: number;
  enableImageAnalysis: boolean;
  enableSocialScraping: boolean;
  enableWebSearch: boolean;
}

export const DEFAULT_RESEARCH_CONFIG: ResearchConfig = {
  maxCompetitors: 5,
  maxPostsPerCompetitor: 12,
  maxImagesPerCompetitor: 9,
  enableImageAnalysis: true,
  enableSocialScraping: true,
  enableWebSearch: true,
};