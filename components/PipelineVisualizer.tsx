import React from 'react';
import { PipelineStatus } from '../types';
import { Search, Database, BrainCircuit, PenTool, CheckCircle, MessageSquare } from 'lucide-react';

interface Props {
  status: PipelineStatus;
}

const steps = [
  { id: PipelineStatus.COLLECTING, label: 'Lendo Fontes', icon: Database },
  { id: PipelineStatus.ANALYZING, label: 'Analisando Lacunas', icon: Search },
  { id: PipelineStatus.PLANNING, label: 'Planejando Estratégia', icon: BrainCircuit },
  { id: PipelineStatus.DRAFTING, label: 'Criando Conteúdo', icon: PenTool },
  { id: PipelineStatus.CRITIQUING, label: 'Crítica & Refino', icon: CheckCircle },
  { id: PipelineStatus.COMPLETE, label: 'Justificando', icon: MessageSquare },
];

export const PipelineVisualizer: React.FC<Props> = ({ status }) => {
  if (status === PipelineStatus.IDLE) return null;

  const currentIndex = steps.findIndex(s => s.id === status);
  const isComplete = status === PipelineStatus.COMPLETE;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Pipeline de Raciocínio IA</h3>
        <span className="text-xs text-slate-500 font-mono">Executando: Gemini 1.5 Pro</span>
      </div>
      
      <div className="relative flex justify-between items-start">
        {/* Connecting Line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
        <div 
          className="absolute top-4 left-0 h-0.5 bg-indigo-500 transition-all duration-500 -z-0"
          style={{ width: `${isComplete ? 100 : (currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex || isComplete;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 group">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200' : 
                  isPast ? 'bg-indigo-100 border-indigo-500 text-indigo-600' : 
                  'bg-white border-slate-200 text-slate-300'
                }`}
              >
                <Icon size={14} />
              </div>
              <span className={`text-[10px] mt-2 font-medium uppercase tracking-tight transition-colors ${
                isActive ? 'text-indigo-700' : isPast ? 'text-indigo-900/60' : 'text-slate-300'
              }`}>
                {step.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-6 w-max text-xs text-indigo-600 animate-pulse">
                  Processando...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};