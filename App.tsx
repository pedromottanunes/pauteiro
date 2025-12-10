import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from './components/Layout';
import { ContentWorkspace } from './pages/ContentWorkspace';
import { ClientSettings } from './pages/ClientSettings';
import { Research } from './pages/Research';
import { CURRENT_CLIENT } from './mockData';
import { ClientsWorkspace } from './pages/ClientsWorkspace';
import { ClientWorkspaceCard, ClientSettingsData } from './types';
import { createDefaultSettings } from './defaults';
import { usePersistedClients } from './hooks/usePersistedClients';
import { migrateData } from './utils/storage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('clients');
  
  // Inicializa sistema de persistência
  useEffect(() => {
    migrateData();
  }, []);
  
  // Usa hook customizado para gerenciamento de clientes com persistência
  const {
    clients,
    activeClient: persistedActiveClient,
    addClient,
    updateClient,
    removeClient,
    setActiveClient: setPersistedActiveClient,
    updateClientSettings,
    replaceAllClients,
  } = usePersistedClients();

  // Normaliza o cliente com valores padrão
  const normalizeClient = (client: ClientWorkspaceCard): ClientWorkspaceCard => {
    const settings = {
      ...createDefaultSettings(),
      ...(client.settings ?? {}),
    };
    return {
      ...client,
      toneTags: client.toneTags ?? settings.tone ?? [],
      settings,
      posts: client.posts ?? [],
      generatedToday: client.generatedToday ?? 0,
      pendingReview: client.pendingReview ?? 0,
      highlight: client.highlight ?? '',
      hashtags: client.hashtags ?? [],
      sourcesCount: client.sourcesCount ?? 0,
      lastInsight: client.lastInsight ?? '',
    };
  };

  const handleCreateClient = (client: ClientWorkspaceCard) => {
    const normalized = normalizeClient(client);
    addClient(normalized);
  };

  const handleSelectClient = (client: ClientWorkspaceCard) => {
    setPersistedActiveClient(client.id);
  };

  const updateClientSettingsHandler = (clientId: string, updates: Partial<ClientSettingsData>) => {
    updateClientSettings(clientId, updates);
  };

  const updateClientMeta = (clientId: string, updates: Partial<ClientWorkspaceCard>) => {
    updateClient(clientId, updates);
  };

  const handleImportData = (importedClients: ClientWorkspaceCard[], importedActiveId: string | null) => {
    replaceAllClients(importedClients);
    if (importedActiveId && importedClients.find(c => c.id === importedActiveId)) {
      setPersistedActiveClient(importedActiveId);
    } else if (importedClients.length > 0) {
      setPersistedActiveClient(importedClients[0].id);
    }
  };

  const handleClearData = () => {
    replaceAllClients([]);
    setCurrentView('clients');
  };

  const handleDeleteClient = (clientId: string) => {
    const wasActive = persistedActiveClient?.id === clientId;
    removeClient(clientId);
    if (wasActive) {
      setCurrentView('clients');
    }
  };

  const selectedClient = useMemo(() => {
    return persistedActiveClient || CURRENT_CLIENT;
  }, [persistedActiveClient]);

  const renderClientsView = () => (
    <ClientsWorkspace
      clients={clients}
      activeClientId={selectedClient?.id}
      onSelectClient={handleSelectClient}
      onCreateClient={handleCreateClient}
      onQuickAction={(client, view) => {
        handleSelectClient(client);
        setCurrentView(view);
      }}
      onDeleteClient={handleDeleteClient}
      onImportData={handleImportData}
      onClearData={handleClearData}
    />
  );

  const renderContent = () => {
    // Se não há cliente ativo e a view não é 'clients', redireciona para clientes
    if (!persistedActiveClient && currentView !== 'clients') {
      setCurrentView('clients');
      return renderClientsView();
    }

    switch (currentView) {
      case 'planner':
        return (
          <ContentWorkspace 
            client={selectedClient} 
            onUpdatePosts={(posts) => updateClient(selectedClient.id, { posts })}
          />
        );
      case 'settings':
        return (
          <ClientSettings
            client={selectedClient}
            onUpdateMeta={partial => updateClientMeta(selectedClient.id, partial)}
            onUpdateSettings={partial => updateClientSettingsHandler(selectedClient.id, partial)}
          />
        );
      case 'research':
        return (
          <Research 
            client={selectedClient}
            onUpdateResearch={(researchData) => updateClient(selectedClient.id, { researchData })}
          />
        );
      case 'clients':
        return renderClientsView();
      default:
        return renderClientsView();
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} activeClient={selectedClient}>
      {renderContent()}
    </Layout>
  );
};

export default App;
