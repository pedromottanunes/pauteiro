import React, { useMemo, useState } from 'react';
import { AiModel, ClientWorkspaceCard } from '../types';
import {
  Search,
  Filter,
  Zap,
  Settings,
  PieChart,
  FileText,
  Clock,
  Sparkles,
  Layers,
  UserPlus,
  Hash,
  BadgeCheck,
  Database,
  Trash2,
} from 'lucide-react';
import { createDefaultSettings } from '../defaults';
import { DataManagement } from '../components/DataManagement';

interface Props {
  clients: ClientWorkspaceCard[];
  activeClientId?: string;
  onSelectClient: (client: ClientWorkspaceCard) => void;
  onCreateClient: (client: ClientWorkspaceCard) => void;
  onQuickAction: (client: ClientWorkspaceCard, view: string) => void;
  onDeleteClient: (clientId: string) => void;
  onImportData?: (clients: ClientWorkspaceCard[], activeClientId: string | null) => void;
  onClearData?: () => void;
}

const quickActions = [
  { icon: Settings, label: 'Config', target: 'settings' },
  { icon: PieChart, label: 'Pesquisa', target: 'research' },
  { icon: FileText, label: 'Pautas', target: 'planner' },
];

const toneOptions = ['Premium', 'Acolhedor', 'Educativo', 'Tecnico', 'Divertido'];

export const ClientsWorkspace: React.FC<Props> = ({
  clients,
  activeClientId,
  onSelectClient,
  onCreateClient,
  onQuickAction,
  onDeleteClient,
  onImportData,
  onClearData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [name, setName] = useState('');
  const [nicho, setNicho] = useState('');
  const [postsPerDay, setPostsPerDay] = useState(3);
  const [model, setModel] = useState<AiModel>(AiModel.GEMINI);
  const [autopilot, setAutopilot] = useState(true);
  const [toneTags, setToneTags] = useState<string[]>([]);
  const [highlight, setHighlight] = useState('');
  const [lastInsight, setLastInsight] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagDraft, setHashtagDraft] = useState('');
  const [sourcesCount, setSourcesCount] = useState(0);

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(
      client =>
        client.name.toLowerCase().includes(term) ||
        client.nicho.toLowerCase().includes(term) ||
        client.highlight?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  const totalGenerated = clients.reduce((sum, client) => sum + client.generatedToday, 0);
  const totalPending = clients.reduce((sum, client) => sum + client.pendingReview, 0);
  const autopilotCount = clients.filter(client => client.autopilot).length;

  const handleToggleTone = (tone: string) => {
    setToneTags(prev => (prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]));
  };

  const handleAddHashtag = () => {
    if (!hashtagDraft.trim()) return;
    setHashtags(prev => Array.from(new Set([...prev, hashtagDraft.trim()])));
    setHashtagDraft('');
  };

  const resetForm = () => {
    setName('');
    setNicho('');
    setPostsPerDay(3);
    setModel(AiModel.GEMINI);
    setAutopilot(true);
    setToneTags([]);
    setHighlight('');
    setLastInsight('');
    setHashtags([]);
    setHashtagDraft('');
    setSourcesCount(0);
  };

  const handleCreateClient = () => {
    if (!name.trim() || !nicho.trim()) return;
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString();
    const avatarSeed = encodeURIComponent(name || nicho || id);
    const settings = createDefaultSettings();
    settings.tone = toneTags;
    const newClient: ClientWorkspaceCard = {
      id,
      name: name.trim(),
      nicho: nicho.trim(),
      postsPerDay,
      selectedModel: model,
      autopilot,
      toneTags,
      highlight: highlight || 'Configure uma mensagem-chave para este cliente.',
      lastInsight: lastInsight || 'Ainda sem insights registrados.',
      hashtags,
      sourcesCount,
      generatedToday: 0,
      pendingReview: 0,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`,
      settings,
      posts: [],
    };
    onCreateClient(newClient);
    resetForm();
    setFormOpen(false);
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex flex-col gap-6 mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase text-slate-400 font-semibold tracking-[0.2em] mb-1">Workspace</p>
          <h1 className="text-3xl font-bold text-slate-900">Clientes e pipelines ativos</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Crie um cliente, conecte fontes e avance pelas etapas de pesquisa, planejamento e copy.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-white shadow-sm bg-slate-50 flex items-center gap-2"
            onClick={() => setShowDataManagement(prev => !prev)}
          >
            <Database size={16} /> Dados
          </button>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-white shadow-sm bg-slate-50 flex items-center gap-2">
            <Filter size={16} /> Filtros
          </button>
          <button
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 flex items-center gap-2"
            onClick={() => setFormOpen(prev => !prev)}
          >
            <UserPlus size={16} /> {formOpen ? 'Fechar' : 'Novo cliente'}
          </button>
        </div>
      </div>

      {showDataManagement && onImportData && onClearData && (
        <div className="mb-8">
          <DataManagement
            clients={clients}
            activeClientId={activeClientId || null}
            onImportData={onImportData}
            onClearData={onClearData}
          />
        </div>
      )}

      {formOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-slate-900">Cadastrar cliente</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs uppercase font-semibold text-slate-500">Nome</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Clinica Nova Vida"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-slate-500">Nicho</label>
              <input
                type="text"
                value={nicho}
                onChange={e => setNicho(e.target.value)}
                placeholder="Ex: Odontologia Estetica"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-slate-500">Modelo de IA</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value as AiModel)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {Object.values(AiModel).map(value => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-slate-500">Posts por dia</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={postsPerDay}
                  onChange={e => setPostsPerDay(Number(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <span className="text-sm font-semibold text-slate-800 w-10 text-right">{postsPerDay}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs uppercase font-semibold text-slate-500">Mensagem destaque</label>
              <textarea
                value={highlight}
                onChange={e => setHighlight(e.target.value)}
                placeholder="Ex: foco em clareamento anti-dor para classe B"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 h-24"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-slate-500">Insight inicial</label>
              <textarea
                value={lastInsight}
                onChange={e => setLastInsight(e.target.value)}
                placeholder="Ex: concorrentes nao falam de higiene pos-refeicao"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 h-24"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs uppercase font-semibold text-slate-500">Tags de tom</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {toneOptions.map(tone => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => handleToggleTone(tone)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      toneTags.includes(tone)
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-slate-500">Hashtags iniciais</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={hashtagDraft}
                  onChange={e => setHashtagDraft(e.target.value)}
                  placeholder="#SorrisoPerfeito"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddHashtag}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full flex items-center gap-1">
                    <Hash size={12} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => setHashtags(prev => prev.filter(t => t !== tag))}
                      className="text-indigo-400 hover:text-indigo-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-slate-700">Modo Autopilot</p>
                <p className="text-xs text-slate-500">Faz a geração automática diária</p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={autopilot}
                  onChange={e => setAutopilot(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-300 rounded-full relative transition-colors peer-checked:bg-indigo-600">
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      autopilot ? 'translate-x-5' : ''
                    }`}
                  ></div>
                </div>
              </label>
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-slate-500">Fontes conectadas</label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="number"
                  min={0}
                  value={sourcesCount}
                  onChange={e => setSourcesCount(Number(e.target.value))}
                  className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500">Pode ser atualizado depois via Configurações.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => {
                resetForm();
                setFormOpen(false);
              }}
            >
              Cancelar
            </button>
            <button
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              onClick={handleCreateClient}
              disabled={!name.trim() || !nicho.trim()}
            >
              Salvar cliente
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Pautas geradas hoje</p>
            <p className="text-2xl font-bold text-slate-900">{totalGenerated}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Pendentes de revisao</p>
            <p className="text-2xl font-bold text-slate-900">{totalPending}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Zap size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Autopilot ativo</p>
            <p className="text-2xl font-bold text-slate-900">
              {clients.length === 0 ? 0 : autopilotCount}/{clients.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nicho, nome ou insight..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-sm border-none focus:ring-0 placeholder:text-slate-400"
          />
        </div>
        <span className="text-xs text-slate-400">Mostrando {filteredClients.length} clientes</span>
      </div>

      {filteredClients.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-2xl p-10 text-center bg-white">
          <p className="text-sm text-slate-500">
            Nenhum cliente cadastrado ainda. Clique em <strong>Novo cliente</strong> para começar o fluxo completo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClients.map(client => {
            const isActive = client.id === activeClientId;
            return (
              <div
                key={client.id}
                className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${
                  isActive ? 'border-indigo-300' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={client.avatarUrl}
                      alt={client.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 flex items-center gap-2">
                        {client.name}
                        {isActive && (
                          <span className="text-[10px] uppercase font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <BadgeCheck size={10} />
                            Ativo
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{client.nicho}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right space-y-1">
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-slate-900 text-white shadow">
                        {client.selectedModel}
                      </span>
                      {!isActive && (
                        <button
                          className="block ml-auto text-[11px] text-indigo-600 hover:text-indigo-800"
                          onClick={() => onSelectClient(client)}
                        >
                          Definir ativo
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Excluir ${client.name}? Esta ação removerá todas as configurações e não poderá ser desfeita.`
                          )
                        ) {
                          onDeleteClient(client.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      aria-label={`Excluir ${client.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500">Posts/dia</p>
                    <p className="text-lg font-semibold text-slate-900">{client.postsPerDay}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <p className="text-xs text-indigo-600">Gerados hoje</p>
                    <p className="text-lg font-semibold text-indigo-800">{client.generatedToday}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-amber-600">Pendentes</p>
                    <p className="text-lg font-semibold text-amber-800">{client.pendingReview}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {client.toneTags.map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                  {client.autopilot && (
                    <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Autopilot
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Insight / foco</p>
                  <p className="text-sm text-slate-700">{client.highlight}</p>
                  <p className="text-xs text-slate-400 mt-2">Referencia: {client.lastInsight}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {client.hashtags.map(hash => (
                    <span
                      key={hash}
                      className="text-[11px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      {hash}
                    </span>
                  ))}
                  <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {client.sourcesCount} fontes
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickActions.map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => onQuickAction(client, action.target)}
                        className="flex-1 min-w-[30%] border border-slate-200 rounded-xl py-2.5 text-sm font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Icon size={16} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>

                <div className="absolute inset-x-6 bottom-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
