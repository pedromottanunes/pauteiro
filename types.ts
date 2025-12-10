export enum AiModel {
  MANUS = 'Manus',
  DEEPSEEK = 'DeepSeek R1',
  OPENAI = 'GPT-4o',
  SONET = 'Claude 3.5 Sonnet',
  GEMINI = 'Gemini 1.5 Pro'
}

export enum ContentType {
  EDUCATIONAL = 'Educativo',
  INSTITUTIONAL = 'Institucional',
  SOCIAL_PROOF = 'Prova Social',
  PROMOTION = 'Oferta/Promo',
  BEHIND_THE_SCENES = 'Bastidores',
  QUICK_TIP = 'Dica Rápida'
}

export enum PipelineStatus {
  IDLE = 'idle',
  COLLECTING = 'collecting', // Crawling sources
  ANALYZING = 'analyzing',   // Benchmarking
  PLANNING = 'planning',     // Strategy
  DRAFTING = 'drafting',     // Generating text
  CRITIQUING = 'critiquing', // Refinement
  COMPLETE = 'complete'
}

export interface ClientProfile {
  id: string;
  name: string;
  nicho: string;
  avatarUrl: string;
  postsPerDay: number;
  selectedModel: AiModel;
}

export interface Post {
  id: string;
  title: string;
  type: ContentType;
  concept: string;
  imagePrompt: string;
  copy: string;
  hashtags: {
    core: string[];
    opportunity: string[];
    experimental: string[];
  };
  cta: string;
  justification: string; // The "Why"
  references: string[]; // Competitor/Source links
  status: 'draft' | 'approved' | 'posted';
  date: string;
}

export interface CompetitorData {
  name: string;
  engagementScore: number;
  topTopics: string[];
  gap: string; // Opportunity gap
  copyStyle?: string;
  hashtags?: string[];
}

export interface ThematicSummary {
  themes: string[];
  faqs: string[];
  gaps: string[];
}

export interface HashtagRadarEntry {
  tag: string;
  usage: 'concorrente' | 'nicho' | 'cliente';
  saturation: 'alta' | 'media' | 'baixa';
  opportunity: 'alta' | 'media' | 'baixa';
  note: string;
}

export interface TrendData {
  topic: string;
  volume: number;
  saturation: number; // 0-100
  opportunity: number; // 0-100
}

export interface ClientCompetitor {
  name: string;
  site?: string;
  profile?: string;
}

export interface ClientSettingsData {
  persona: string;
  objectives: string[];
  tone: string[];
  sources: string[];
  priorityTopics: string[];
  searchWeb: boolean;
  searchProviders?: {
    serpapi?: boolean;
    googlecse?: boolean;
    bing?: boolean;
  };
  competitors: ClientCompetitor[];
  baseHashtags: string[];
  referenceHashtags: string[];
  selectedDays: string[];
  contentTypes: string[];
  forbiddenWords: string;
  requiredWords: string;
  ctas: string[];
}

export interface ClientResearchData {
  competitors: CompetitorData[];
  trends: TrendData[];
  thematicSummary: ThematicSummary;
  hashtagRadar: HashtagRadarEntry[];
  lastUpdated?: string;
}

export interface ClientWorkspaceCard extends ClientProfile {
  generatedToday: number;
  pendingReview: number;
  autopilot: boolean;
  toneTags: string[];
  highlight: string;
  hashtags: string[];
  sourcesCount: number;
  lastInsight: string;
  settings: ClientSettingsData;
  posts: Post[];
  researchData?: ClientResearchData;
}
