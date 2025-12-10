import {
  ContentType,
  Post,
  CompetitorData,
  TrendData,
  ThematicSummary,
  HashtagRadarEntry,
  ClientWorkspaceCard,
} from './types';
import { createDefaultSettings, DEFAULT_AVATAR, DEFAULT_MODEL } from './defaults';

export const CURRENT_CLIENT: ClientWorkspaceCard = {
  id: 'placeholder',
  name: 'Selecione um cliente',
  nicho: 'Sem nicho definido',
  avatarUrl: DEFAULT_AVATAR,
  postsPerDay: 0,
  selectedModel: DEFAULT_MODEL,
  generatedToday: 0,
  pendingReview: 0,
  autopilot: false,
  toneTags: [],
  highlight: 'Nenhum cliente selecionado.',
  hashtags: [],
  sourcesCount: 0,
  lastInsight: 'Crie ou escolha um cliente para visualizar dados.',
  settings: createDefaultSettings(),
  posts: [],
};

export const CLIENTS_WORKSPACE: ClientWorkspaceCard[] = [];

export const MOCK_POSTS: Post[] = [];

export const COMPETITORS: CompetitorData[] = [];

export const TREND_DATA: TrendData[] = [];

export const THEMATIC_SUMMARY: ThematicSummary = {
  themes: [],
  faqs: [],
  gaps: [],
};

export const HASHTAG_RADAR: HashtagRadarEntry[] = [];

