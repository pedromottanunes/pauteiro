import { AiModel, ClientSettingsData } from './types';

export const createDefaultSettings = (): ClientSettingsData => ({
  persona: '',
  objectives: [],
  tone: [],
  sources: [],
  priorityTopics: [],
  searchWeb: true,
  competitors: [],
  baseHashtags: [],
  referenceHashtags: [],
  selectedDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
  contentTypes: ['Institucional', 'Educativo'],
  forbiddenWords: '',
  requiredWords: '',
  ctas: [],
});

export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80';

export const DEFAULT_MODEL = AiModel.GEMINI;
