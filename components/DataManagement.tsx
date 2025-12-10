import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { ClientWorkspaceCard } from '../types';
import { downloadBackup, importFromJSON, clearStorage, getStorageStats } from '../utils/storage';

interface Props {
  clients: ClientWorkspaceCard[];
  activeClientId: string | null;
  onImportData: (clients: ClientWorkspaceCard[], activeClientId: string | null) => void;
  onClearData: () => void;
}

export const DataManagement: React.FC<Props> = ({ clients, activeClientId, onImportData, onClearData }) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stats = getStorageStats();

  const handleExport = () => {
    try {
      downloadBackup(clients, activeClientId);
      setMessage({ type: 'success', text: 'Backup baixado com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao fazer backup' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const { clients: importedClients, activeClientId: importedActiveId } = importFromJSON(content);
        onImportData(importedClients, importedActiveId);
        setMessage({ type: 'success', text: `${importedClients.length} cliente(s) importado(s) com sucesso!` });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro ao importar arquivo. Verifique o formato.' });
        setTimeout(() => setMessage(null), 3000);
      }
    };
    reader.readAsText(file);
    
    // Limpa o input para permitir reimportar o mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearStorage = () => {
    if (window.confirm('Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.')) {
      clearStorage();
      onClearData();
      setMessage({ type: 'success', text: 'Todos os dados foram apagados' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Database size={18} className="text-slate-600" />
        <h3 className="font-bold text-slate-800">Gerenciamento de Dados</h3>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
        <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Estatísticas</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-600">Total de clientes</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalClients}</p>
          </div>
          <div>
            <p className="text-slate-600">Tamanho dos dados</p>
            <p className="text-xl font-bold text-slate-900">{stats.storageSize}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleExport}
          disabled={clients.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          Exportar Backup (JSON)
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="import-file"
        />
        <label
          htmlFor="import-file"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Upload size={16} />
          Importar Backup
        </label>

        <button
          onClick={handleClearStorage}
          disabled={!stats.hasData}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={16} />
          Apagar Todos os Dados
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Dica:</strong> Faça backup regular dos seus dados. Os backups são salvos automaticamente no navegador,
          mas você pode exportar para ter uma cópia de segurança.
        </p>
      </div>
    </div>
  );
};
