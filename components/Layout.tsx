import React from 'react';
import { LayoutDashboard, Settings, PieChart, LogOut, Layers, UsersRound } from 'lucide-react';
import { ClientProfile } from '../types';
import { CURRENT_CLIENT } from '../mockData';
import { PromptNotifier } from './PromptNotifier';

interface Props {
  currentView: string;
  onNavigate: (view: string) => void;
  activeClient?: ClientProfile;
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ currentView, onNavigate, activeClient, children }) => {
  const client = activeClient ?? CURRENT_CLIENT;
  const navItems = [
    { id: 'clients', label: 'Clientes', icon: UsersRound },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2 border-b border-slate-800">
          <div className="bg-indigo-500 p-1.5 rounded-lg">
            <Layers className="text-white" size={20} />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">NeuroContent</span>
        </div>

        {/* Client Switcher */}
        <div className="px-4 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/50">
            <img
              src={client.avatarUrl}
              alt="Client"
              className="w-10 h-10 rounded-full object-cover border border-slate-600"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{client.name}</p>
              <p className="text-xs text-slate-400 truncate">{client.nicho}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative flex-1 h-full overflow-hidden bg-white shadow-inner rounded-l-3xl my-2 mr-2 border border-slate-200">
        {children}
        <PromptNotifier />
      </main>
    </div>
  );
};
