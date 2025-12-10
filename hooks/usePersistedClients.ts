import { useState, useEffect, useCallback } from 'react';
import { ClientWorkspaceCard } from '../types';
import { saveClients, loadClients, loadActiveClientId } from '../utils/storage';

/**
 * Hook customizado para gerenciar clientes com persistência automática
 */
export const usePersistedClients = (initialClients: ClientWorkspaceCard[] = []) => {
  // Carrega clientes do storage na inicialização
  const [clients, setClientsState] = useState<ClientWorkspaceCard[]>(() => {
    const stored = loadClients();
    return stored.length > 0 ? stored : initialClients;
  });

  // Carrega o cliente ativo do storage
  const [activeClientId, setActiveClientIdState] = useState<string | null>(() => {
    return loadActiveClientId();
  });

  // Salva clientes e ID ativo automaticamente quando houver qualquer mudanca
  useEffect(() => {
    saveClients(clients, activeClientId);
  }, [clients, activeClientId]);

  // Função para adicionar um novo cliente
  const addClient = useCallback((newClient: ClientWorkspaceCard) => {
    setClientsState(prev => {
      const updated = [newClient, ...prev];
      console.log('[Hook] Cliente adicionado:', newClient.name);
      return updated;
    });
    // Define o novo cliente como ativo
    setActiveClientIdState(newClient.id);
  }, []);

  // Função para atualizar um cliente existente
  const updateClient = useCallback((clientId: string, updates: Partial<ClientWorkspaceCard>) => {
    setClientsState(prev => {
      const updated = prev.map(client =>
        client.id === clientId ? { ...client, ...updates } : client
      );
      console.log('[Hook] Cliente atualizado:', clientId);
      return updated;
    });
  }, []);

  // Função para remover um cliente
  const removeClient = useCallback((clientId: string) => {
    setClientsState(prev => {
      const updated = prev.filter(client => client.id !== clientId);
      console.log('[Hook] Cliente removido:', clientId);
      return updated;
    });
    
    // Se o cliente removido era o ativo, limpa
    if (activeClientId === clientId) {
      setActiveClientIdState(null);
    }
  }, [activeClientId]);

  // Função para definir o cliente ativo
  const setActiveClient = useCallback((clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setActiveClientIdState(clientId);
      console.log('[Hook] Cliente ativo definido:', client.name);
    }
  }, [clients]);

  // Função para obter o cliente ativo
  const getActiveClient = useCallback((): ClientWorkspaceCard | null => {
    if (!activeClientId) return null;
    return clients.find(c => c.id === activeClientId) || null;
  }, [clients, activeClientId]);

  // Função para atualizar configurações de um cliente
  const updateClientSettings = useCallback((clientId: string, settings: Partial<ClientWorkspaceCard['settings']>) => {
    setClientsState(prev => {
      const updated = prev.map(client =>
        client.id === clientId
          ? {
              ...client,
              settings: {
                ...client.settings,
                ...settings,
              },
            }
          : client
      );
      console.log('[Hook] Configurações atualizadas para cliente:', clientId);
      return updated;
    });
  }, []);

  // Função para atualizar posts de um cliente
  const updateClientPosts = useCallback((clientId: string, posts: ClientWorkspaceCard['posts']) => {
    setClientsState(prev => {
      const updated = prev.map(client =>
        client.id === clientId ? { ...client, posts } : client
      );
      console.log('[Hook] Posts atualizados para cliente:', clientId, '- Total:', posts.length);
      return updated;
    });
  }, []);

  // Função para substituir todos os clientes (útil para importação)
  const replaceAllClients = useCallback((newClients: ClientWorkspaceCard[]) => {
    setClientsState(newClients);
    console.log('[Hook] Todos os clientes substituídos. Total:', newClients.length);
  }, []);

  return {
    clients,
    activeClientId,
    activeClient: getActiveClient(),
    addClient,
    updateClient,
    removeClient,
    setActiveClient,
    updateClientSettings,
    updateClientPosts,
    replaceAllClients,
  };
};
