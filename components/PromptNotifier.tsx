import React, { useEffect, useState } from 'react';
import { Bell, FileText, X, Trash2 } from 'lucide-react';
import { PromptUsageEvent, subscribePromptUsage } from '../utils/promptEvents';

interface PromptNotice extends PromptUsageEvent {
  id: string;
}

const RECENT_MS = 5000; // highlight as "recent" if within this window

export const PromptNotifier: React.FC = () => {
  const [items, setItems] = useState<PromptNotice[]>([]);

  useEffect(() => {
    const unsubscribe = subscribePromptUsage((evt) => {
      setItems((prev) => {
        const notice: PromptNotice = {
          id: `${evt.timestamp}-${evt.name}-${Math.random().toString(36).slice(2, 7)}`,
          ...evt,
        };
        // prepend newest
        return [notice, ...prev].slice(0, 100);
      });
    });
    return () => unsubscribe();
  }, []);

  if (items.length === 0) return null;

  const clearAll = () => setItems([]);
  const removeItem = (id: string) => setItems(prev => prev.filter(p => p.id !== id));

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-indigo-600" />
            <div>
              <div className="text-sm font-semibold text-slate-800">Prompts usados</div>
              <div className="text-[11px] text-slate-500">Aparece quando um prompt é chamado e permanece neste painel</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearAll} title="Limpar tudo" className="text-xs text-red-600 hover:underline flex items-center gap-1"><Trash2 size={14} />Limpar</button>
          </div>
        </div>

        <div className="max-h-64 overflow-auto space-y-2">
          {items.map(item => {
            const recent = Date.now() - item.timestamp < RECENT_MS;
            return (
              <div key={item.id} className={`flex items-start justify-between gap-2 p-2 rounded-md ${recent ? 'bg-indigo-50 border border-indigo-100' : 'bg-white border border-slate-100'}`}>
                <div className="flex items-start gap-2">
                  <FileText size={16} className="text-slate-600 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800">{item.name}.txt <span className="text-[11px] text-slate-400">· {new Date(item.timestamp).toLocaleTimeString()}</span></div>
                    <div className="text-[11px] text-slate-600">Vars: {Object.keys(item.variables || {}).join(', ') || '—'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <button onClick={() => removeItem(item.id)} title="Remover" className="p-1 text-slate-400 hover:text-slate-700"><X size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
