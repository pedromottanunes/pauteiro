import React, { useMemo, useState } from 'react';
import { AiModel, ClientWorkspaceCard, ClientCompetitor, ClientSettingsData } from '../types';
import { CURRENT_CLIENT } from '../mockData';
import { Settings, Globe, Shield, Bot, FileText, Plus, X, Hash, Target, Check, Key } from 'lucide-react';
import { ApiKeysManager } from '../components/ApiKeysManager';

const DAY_OPTIONS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
const CONTENT_TYPES = ['Institucional', 'Educativo', 'Prova social', 'Oferta/promo', 'Bastidores', 'Dica rapida'];

interface Props {
  client?: ClientWorkspaceCard;
  onUpdateSettings: (patch: Partial<ClientSettingsData>) => void;
  onUpdateMeta: (patch: Partial<ClientWorkspaceCard>) => void;
}

export const ClientSettings: React.FC<Props> = ({
  client = CURRENT_CLIENT,
  onUpdateSettings,
  onUpdateMeta,
}) => {
  const activeClient = client;
  const [activeTab, setActiveTab] = useState('profile');

  const [newSource, setNewSource] = useState('');
  const [topicDraft, setTopicDraft] = useState('');

  const [competitorDraft, setCompetitorDraft] = useState<ClientCompetitor>({ name: '', site: '', profile: '' });

  const [hashtagDraft, setHashtagDraft] = useState('');
  const [refHashtagDraft, setRefHashtagDraft] = useState('');

  const [ctaDraft, setCtaDraft] = useState('');

  const tabs = [
    { id: 'profile', label: 'Perfil do Cliente', icon: Settings },
    { id: 'sources', label: 'Base de Conhecimento', icon: FileText },
    { id: 'competitors', label: 'Concorrencia & Hashtags', icon: Globe },
    { id: 'rules', label: 'Frequencia & Conteudo', icon: Shield },
    { id: 'ai', label: 'Modelo de IA', icon: Bot },
    { id: 'api-keys', label: 'API Keys', icon: Key },
  ];

  const settings = activeClient.settings;

  const updateSettings = (patch: Partial<ClientSettingsData>) => {
    onUpdateSettings(patch);
  };

  const toggleDay = (day: string) => {
    const next = settings.selectedDays.includes(day)
      ? settings.selectedDays.filter(d => d !== day)
      : [...settings.selectedDays, day];
    updateSettings({ selectedDays: next });
  };

  const toggleContentType = (label: string) => {
    const next = settings.contentTypes.includes(label)
      ? settings.contentTypes.filter(t => t !== label)
      : [...settings.contentTypes, label];
    updateSettings({ contentTypes: next });
  };

  const toggleObjective = (label: string) => {
    const next = settings.objectives.includes(label)
      ? settings.objectives.filter(o => o !== label)
      : [...settings.objectives, label];
    updateSettings({ objectives: next });
  };

  const addHashtag = (value: string, field: 'baseHashtags' | 'referenceHashtags', reset: () => void) => {
    if (!value.trim()) return;
    const next = Array.from(new Set([...(settings[field] ?? []), value.trim()]));
    updateSettings({ [field]: next } as Partial<ClientSettingsData>);
    reset();
  };

  const addCompetitor = () => {
    if (!competitorDraft.name.trim()) return;
    updateSettings({ competitors: [...settings.competitors, competitorDraft] });
    setCompetitorDraft({ name: '', site: '', profile: '' });
  };

  const addSourceUrl = () => {
    if (!newSource.trim()) return;
    updateSettings({ sources: [...settings.sources, newSource.trim()] });
    setNewSource('');
  };

  const addTopic = () => {
    if (!topicDraft.trim()) return;
    const next = Array.from(new Set([...(settings.priorityTopics ?? []), topicDraft.trim()]));
    updateSettings({ priorityTopics: next });
    setTopicDraft('');
  };

  const addCta = () => {
    if (!ctaDraft.trim()) return;
    const next = Array.from(new Set([...(settings.ctas ?? []), ctaDraft.trim()]));
    updateSettings({ ctas: next });
    setCtaDraft('');
  };

  const personaPlaceholder = useMemo(
    () => 'Ex: adultos 25-45, classe B, buscam estetica com linguagem acolhedora.',
    []
  );

  const toggleTone = (tone: string) => {
    const next = settings.tone.includes(tone)
      ? settings.tone.filter(t => t !== tone)
      : [...settings.tone, tone];
    updateSettings({ tone: next });
    onUpdateMeta({ toneTags: next });
  };

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar Wizard Nav */}
      <div className="w-64 border-r border-slate-200 p-6 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Configuracao</h2>
        <nav className="space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Perfil do Cliente</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Negocio</label>
                    <input
                      type="text"
                      value={activeClient.name}
                      onChange={e => onUpdateMeta({ name: e.target.value })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nicho</label>
                    <input
                      type="text"
                      value={activeClient.nicho}
                      onChange={e => onUpdateMeta({ nicho: e.target.value })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Persona Alvo</label>
                  <textarea
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                    value={settings.persona}
                    onChange={e => updateSettings({ persona: e.target.value })}
                    placeholder={personaPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tom de Voz</label>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {['Premium', 'Acolhedor', 'Educativo', 'Tecnico'].map(t => (
                      <label
                        key={t}
                        className="flex items-center gap-2 cursor-pointer border px-3 py-1.5 rounded-full hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={settings.tone.includes(t)}
                          onChange={() => toggleTone(t)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo de Conteudo</label>
                  <div className="flex flex-wrap gap-2">
                    {['Autoridade', 'Engajamento', 'Geracao de leads', 'Venda imediata', 'Branding'].map(obj => (
                      <button
                        key={obj}
                        onClick={() => toggleObjective(obj)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          settings.objectives.includes(obj)
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Fontes & Base de Conhecimento</h3>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 flex gap-3">
                <div className="bg-blue-100 p-2 rounded-full h-fit text-blue-600">
                  <FileText size={18} />
                </div>
                <div className="text-sm text-blue-800">
                  A IA usa essas fontes para checagem de fatos e embasamento. Envie PDFs ou adicione URLs de blogs/artigos.
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newSource}
                    onChange={e => setNewSource(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={addSourceUrl}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Plus size={16} /> Adicionar URL
                  </button>
                </div>

                <div className="space-y-2">
                  {settings.sources.map((s, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg group"
                    >
                      <div className="flex items-center gap-3">
                        <Globe size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600 truncate max-w-md">{s}</span>
                      </div>
                      <button
                        onClick={() =>
                          updateSettings({
                            sources: settings.sources.filter((_, idx) => idx !== i),
                          })
                        }
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-6 mt-6 space-y-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Enviar Documentos (PDF, DOCX)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="text-sm text-slate-500">Clique para enviar ou arraste e solte</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Pesquisa aberta na web</p>
                      <p className="text-xs text-slate-500">Se ativo, o orquestrador consulta internet alem das fontes cadastradas.</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.searchWeb}
                        onChange={e => updateSettings({ searchWeb: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 relative after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Topicos prioritarios para pesquisa</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={topicDraft}
                        onChange={e => setTopicDraft(e.target.value)}
                        placeholder="clareamento dental, facetas..."
                        className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        onClick={addTopic}
                        className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50"
                      >
                        Adicionar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.priorityTopics.map(topic => (
                        <span
                          key={topic}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-2"
                        >
                          {topic}
                          <button
                            onClick={() => updateSettings({ priorityTopics: settings.priorityTopics.filter(t => t !== topic) })}
                            className="text-indigo-400 hover:text-indigo-700"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'competitors' && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-6">Concorrencia monitorada</h3>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Nome do concorrente"
                      value={competitorDraft.name}
                      onChange={e => setCompetitorDraft(prev => ({ ...prev, name: e.target.value }))}
                      className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Site (opcional)"
                      value={competitorDraft.site}
                      onChange={e => setCompetitorDraft(prev => ({ ...prev, site: e.target.value }))}
                      className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="@perfil social (opcional)"
                      value={competitorDraft.profile}
                      onChange={e => setCompetitorDraft(prev => ({ ...prev, profile: e.target.value }))}
                      className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={addCompetitor}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <Plus size={16} /> Cadastrar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {settings.competitors.map((comp, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{comp.name}</p>
                          <div className="text-xs text-slate-500 flex gap-3">
                            {comp.site && <span>{comp.site}</span>}
                            {comp.profile && <span>{comp.profile}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            updateSettings({
                              competitors: settings.competitors.filter((_, i) => i !== idx),
                            })
                          }
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Hashtags</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Hash size={16} className="text-indigo-600" />
                      <p className="font-semibold text-slate-800 text-sm">Base do cliente</p>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="#hashtag"
                        value={hashtagDraft}
                        onChange={e => setHashtagDraft(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        onClick={() => addHashtag(hashtagDraft, 'baseHashtags', () => setHashtagDraft(''))}
                        className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50"
                      >
                        Adicionar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.baseHashtags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() =>
                              updateSettings({
                                baseHashtags: settings.baseHashtags.filter(t => t !== tag),
                              })
                            }
                            className="text-indigo-400 hover:text-indigo-700"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target size={16} className="text-emerald-600" />
                      <p className="font-semibold text-slate-800 text-sm">Referencias de concorrencia</p>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="#hashtag"
                        value={refHashtagDraft}
                        onChange={e => setRefHashtagDraft(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        onClick={() => addHashtag(refHashtagDraft, 'referenceHashtags', () => setRefHashtagDraft(''))}
                        className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50"
                      >
                        Adicionar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.referenceHashtags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() =>
                              updateSettings({
                                referenceHashtags: settings.referenceHashtags.filter(t => t !== tag),
                              })
                            }
                            className="text-emerald-400 hover:text-emerald-700"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <h3 className="text-xl font-bold text-slate-800">Frequencia & Tipos de Conteudo</h3>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Posts por dia</p>
                    <p className="text-xs text-slate-500">Define volume de pautas que o orquestrador gera.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-900">{activeClient.postsPerDay}</span>
                    <p className="text-xs text-slate-500">pautas/dia</p>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={activeClient.postsPerDay}
                  onChange={e => onUpdateMeta({ postsPerDay: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Dias da semana</p>
                  <div className="flex flex-wrap gap-2">
                    {DAY_OPTIONS.map(day => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          settings.selectedDays.includes(day)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Tipos de post</p>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map(label => (
                      <button
                        key={label}
                        onClick={() => toggleContentType(label)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          settings.contentTypes.includes(label)
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-amber-500" />
                  <p className="text-sm font-semibold text-slate-800">Regras avancadas</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Palavras proibidas</label>
                    <textarea
                      value={settings.forbiddenWords}
                      onChange={e => updateSettings({ forbiddenWords: e.target.value })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                    />
                    <p className="text-xs text-slate-500 mt-1">Separar por virgula.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Palavras obrigatorias</label>
                    <textarea
                      value={settings.requiredWords}
                      onChange={e => updateSettings({ requiredWords: e.target.value })}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                    />
                    <p className="text-xs text-slate-500 mt-1">Marca, cidade, produtos.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CTAs preferidos</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Agende uma avaliacao"
                      value={ctaDraft}
                      onChange={e => setCtaDraft(e.target.value)}
                      className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      onClick={addCta}
                      className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-50"
                    >
                      Adicionar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.ctas.map(cta => (
                      <span
                        key={cta}
                        className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-full text-xs font-medium flex items-center gap-2"
                      >
                        <Check size={12} className="text-green-600" />
                        {cta}
                        <button
                          onClick={() =>
                            updateSettings({
                              ctas: settings.ctas.filter(c => c !== cta),
                            })
                          }
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Pipeline do Modelo de IA</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50/60">
                  <input
                    id="searchWebToggle"
                    type="checkbox"
                    checked={settings.searchWeb}
                    onChange={e => updateSettings({ searchWeb: e.target.checked })}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                  />
                  <div>
                    <label htmlFor="searchWebToggle" className="text-sm font-semibold text-slate-800">Ativar agente com busca na web</label>
                    <p className="text-xs text-slate-500">Quando ligado, o pipeline consulta resultados web (SerpAPI / CSE) para enriquecer pautas e pesquisas.</p>
                    <div className="mt-2 inline-flex items-center gap-2 text-[11px] bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600">
                      <span className="font-semibold text-slate-700">Prioridade</span>
                      <span>SerpAPI → Google CSE → Bing</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!settings.searchProviders?.serpapi}
                          onChange={e => updateSettings({ searchProviders: { ...(settings.searchProviders || {}), serpapi: e.target.checked } })}
                          className="h-4 w-4 text-green-600 rounded"
                        />
                        <span className="text-xs">SerpAPI</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!settings.searchProviders?.googlecse}
                          onChange={e => updateSettings({ searchProviders: { ...(settings.searchProviders || {}), googlecse: e.target.checked } })}
                          className="h-4 w-4 text-amber-600 rounded"
                        />
                        <span className="text-xs">Google CSE</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!settings.searchProviders?.bing}
                          onChange={e => updateSettings({ searchProviders: { ...(settings.searchProviders || {}), bing: e.target.checked } })}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-xs">Bing</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Provedor do Modelo Principal</label>
                  <select
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={activeClient.selectedModel}
                    onChange={e => onUpdateMeta({ selectedModel: e.target.value as AiModel })}
                  >
                    {Object.values(AiModel).map(model => (
                      <option key={model}>{model}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-2">Este modelo controla o motor principal de criacao e raciocinio.</p>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-slate-800">Controle Avancado de Pipeline</h4>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Recurso PRO</span>
                  </div>

                  <div className="space-y-4 opacity-75 pointer-events-none">
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <span className="text-sm text-slate-600">Pesquisa & Analise</span>
                      <select className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-slate-50">
                        <option>DeepSeek R1</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <span className="text-sm text-slate-600">Redacao Criativa</span>
                      <select className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-slate-50">
                        <option>Gemini 1.5 Pro</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <span className="text-sm text-slate-600">Critica & Seguranca</span>
                      <select className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-slate-50">
                        <option>Claude 3.5 Sonnet</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api-keys' && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Configuração de API Keys</h3>
              <ApiKeysManager />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
