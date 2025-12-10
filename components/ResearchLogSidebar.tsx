/**
 * ResearchLogSidebar - Sidebar com logs detalhados do processo de pesquisa
 * 
 * Mostra em tempo real:
 * - Status de cada etapa do pipeline
 * - Dados sendo coletados do Apify
 * - Análises sendo processadas
 * - Erros e avisos
 */

import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Instagram,
  Search,
  Image,
  Brain,
  Database,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'loading';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: 'apify' | 'serpapi' | 'openai' | 'pipeline' | 'analysis' | 'system';
  message: string;
  details?: string;
  data?: any;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  isRunning: boolean;
  elapsedTime?: number;
}

const categoryIcons: Record<LogEntry['category'], React.ReactNode> = {
  apify: <Instagram size={14} className="text-pink-500" />,
  serpapi: <Search size={14} className="text-blue-500" />,
  openai: <Brain size={14} className="text-emerald-500" />,
  pipeline: <Database size={14} className="text-indigo-500" />,
  analysis: <Image size={14} className="text-purple-500" />,
  system: <Clock size={14} className="text-slate-500" />,
};

const levelStyles: Record<LogLevel, { bg: string; text: string; icon: React.ReactNode }> = {
  info: { 
    bg: 'bg-slate-50', 
    text: 'text-slate-700',
    icon: <Clock size={12} className="text-slate-400" />
  },
  success: { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700',
    icon: <CheckCircle2 size={12} className="text-emerald-500" />
  },
  warning: { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700',
    icon: <AlertTriangle size={12} className="text-amber-500" />
  },
  error: { 
    bg: 'bg-rose-50', 
    text: 'text-rose-700',
    icon: <XCircle size={12} className="text-rose-500" />
  },
  loading: { 
    bg: 'bg-blue-50', 
    text: 'text-blue-700',
    icon: <Loader2 size={12} className="text-blue-500 animate-spin" />
  },
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3 
  }).slice(0, -1); // Remove último dígito para ter 2 casas decimais
};

const formatElapsedTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
};

const LogEntryItem: React.FC<{ entry: LogEntry }> = ({ entry }) => {
  const [expanded, setExpanded] = React.useState(false);
  const hasDetails = entry.details || entry.data;
  const style = levelStyles[entry.level];

  return (
    <div className={`${style.bg} border-l-2 ${entry.level === 'error' ? 'border-rose-400' : entry.level === 'success' ? 'border-emerald-400' : entry.level === 'warning' ? 'border-amber-400' : 'border-slate-300'} px-3 py-2 text-xs`}>
      <div className="flex items-start gap-2">
        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap mt-0.5">
          {formatTime(entry.timestamp)}
        </span>
        
        {/* Category Icon */}
        <span className="mt-0.5">{categoryIcons[entry.category]}</span>
        
        {/* Level Icon */}
        <span className="mt-0.5">{style.icon}</span>
        
        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className={`${style.text} break-words`}>{entry.message}</p>
          
          {/* Expandable Details */}
          {hasDetails && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-700 mt-1"
            >
              {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              Ver detalhes
            </button>
          )}
          
          {expanded && entry.details && (
            <p className="text-[10px] text-slate-500 mt-1 pl-2 border-l border-slate-200">
              {entry.details}
            </p>
          )}
          
          {expanded && entry.data && (
            <pre className="text-[9px] text-slate-600 mt-1 p-2 bg-slate-100 rounded overflow-x-auto max-h-32">
              {JSON.stringify(entry.data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export const ResearchLogSidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  logs,
  isRunning,
  elapsedTime = 0,
}) => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll para o final quando novos logs chegam
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Contadores
  const errorCount = logs.filter(l => l.level === 'error').length;
  const warningCount = logs.filter(l => l.level === 'warning').length;
  const successCount = logs.filter(l => l.level === 'success').length;

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            {isRunning && <Loader2 size={16} className="animate-spin text-indigo-600" />}
            Logs da Pesquisa
          </h3>
          {isRunning && (
            <p className="text-xs text-slate-500 mt-1">
              Tempo decorrido: <span className="font-mono">{formatElapsedTime(elapsedTime)}</span>
            </p>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-200 rounded transition-colors"
        >
          <X size={18} className="text-slate-500" />
        </button>
      </div>

      {/* Status Summary */}
      <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <span className="text-emerald-700">{successCount}</span>
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle size={12} className="text-amber-500" />
          <span className="text-amber-700">{warningCount}</span>
        </span>
        <span className="flex items-center gap-1">
          <XCircle size={12} className="text-rose-500" />
          <span className="text-rose-700">{errorCount}</span>
        </span>
        <span className="text-slate-400 ml-auto">
          {logs.length} entradas
        </span>
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Database size={32} className="mb-2" />
            <p className="text-sm">Nenhum log ainda</p>
            <p className="text-xs">Inicie uma pesquisa para ver os logs</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <LogEntryItem key={log.id} entry={log} />
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      {logs.length > 0 && (
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              // Copiar logs para clipboard
              const logText = logs.map(l => 
                `[${formatTime(l.timestamp)}] [${l.category.toUpperCase()}] ${l.message}${l.details ? `\n  ${l.details}` : ''}`
              ).join('\n');
              navigator.clipboard.writeText(logText);
            }}
            className="w-full px-3 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded transition-colors"
          >
            📋 Copiar logs
          </button>
        </div>
      )}
    </div>
  );
};

// Helper para criar log entries
export const createLogEntry = (
  level: LogLevel,
  category: LogEntry['category'],
  message: string,
  details?: string,
  data?: any
): LogEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date(),
  level,
  category,
  message,
  details,
  data,
});
