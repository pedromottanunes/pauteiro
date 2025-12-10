import { ClientWorkspaceCard } from '../types';

/**
 * Sistema de persistencia de dados
 * Salva dados no localStorage e espelha um snapshot JSON completo
 */

const STORAGE_KEYS = {
  CLIENTS: 'neurocontent_clients',
  ACTIVE_CLIENT_ID: 'neurocontent_active_client_id',
  APP_VERSION: 'neurocontent_version',
  BACKUP_JSON: 'neurocontent_clients_snapshot',
} as const;

const CURRENT_VERSION = '1.0.0';

interface DataBackup {
  version: string;
  timestamp: string;
  clients: ClientWorkspaceCard[];
  activeClientId: string | null;
}

const createBackupPayload = (
  clients: ClientWorkspaceCard[],
  activeClientId: string | null,
  timestamp?: string,
  version: string = CURRENT_VERSION
): DataBackup => ({
  version,
  timestamp: timestamp ?? new Date().toISOString(),
  clients,
  activeClientId,
});

const persistBackupPayload = (payload: DataBackup): void => {
  const backupString = JSON.stringify(payload, null, 2);
  localStorage.setItem(STORAGE_KEYS.BACKUP_JSON, backupString);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(payload.clients));

  if (payload.activeClientId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CLIENT_ID, payload.activeClientId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CLIENT_ID);
  }
};

const loadBackupSnapshot = (): DataBackup | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BACKUP_JSON);
    if (!raw) return null;
    return JSON.parse(raw) as DataBackup;
  } catch (error) {
    console.error('[Storage] Erro ao ler snapshot JSON:', error);
    return null;
  }
};

const getClientsFromRawStorage = (): ClientWorkspaceCard[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) return [];
    return JSON.parse(raw) as ClientWorkspaceCard[];
  } catch (error) {
    console.error('[Storage] Erro ao ler clients cru:', error);
    return [];
  }
};

const getStoredClients = (): ClientWorkspaceCard[] => {
  const snapshot = loadBackupSnapshot();
  if (snapshot?.clients) {
    return snapshot.clients;
  }
  return getClientsFromRawStorage();
};

const getStoredActiveClientId = (): string | null => {
  const snapshot = loadBackupSnapshot();
  if (snapshot) {
    return snapshot.activeClientId;
  }
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_CLIENT_ID);
};

/**
 * Salva os clientes no localStorage e no snapshot JSON
 */
export const saveClients = (clients: ClientWorkspaceCard[], activeClientId?: string | null): void => {
  try {
    const effectiveActiveId =
      typeof activeClientId === 'undefined' ? getStoredActiveClientId() : activeClientId;
    const payload = createBackupPayload(clients, effectiveActiveId ?? null);
    persistBackupPayload(payload);
    console.log('[Storage] Snapshot salvo em JSON:', clients.length);
  } catch (error) {
    console.error('[Storage] Erro ao salvar clientes:', error);
    throw new Error('Falha ao salvar dados dos clientes');
  }
};

/**
 * Carrega os clientes do storage
 */
export const loadClients = (): ClientWorkspaceCard[] => {
  try {
    const clients = getStoredClients();
    console.log('[Storage] Clientes carregados do JSON:', clients.length);
    return clients;
  } catch (error) {
    console.error('[Storage] Erro ao carregar clientes:', error);
    return [];
  }
};

/**
 * Salva o ID do cliente ativo
 */
export const saveActiveClientId = (clientId: string | null): void => {
  try {
    const clients = getStoredClients();
    saveClients(clients, clientId);
    console.log('[Storage] Cliente ativo salvo:', clientId);
  } catch (error) {
    console.error('[Storage] Erro ao salvar cliente ativo:', error);
  }
};

/**
 * Carrega o ID do cliente ativo
 */
export const loadActiveClientId = (): string | null => {
  try {
    return getStoredActiveClientId();
  } catch (error) {
    console.error('[Storage] Erro ao carregar cliente ativo:', error);
    return null;
  }
};

/**
 * Limpa todos os dados do storage
 */
export const clearStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('[Storage] Storage limpo com sucesso');
  } catch (error) {
    console.error('[Storage] Erro ao limpar storage:', error);
  }
};

/**
 * Exporta todos os dados para backup em JSON
 */
export const exportToJSON = (clients: ClientWorkspaceCard[], activeClientId: string | null): string => {
  return JSON.stringify(createBackupPayload(clients, activeClientId), null, 2);
};

/**
 * Importa dados de um backup JSON
 */
export const importFromJSON = (
  jsonString: string
): { clients: ClientWorkspaceCard[]; activeClientId: string | null } => {
  try {
    const backup = JSON.parse(jsonString) as Partial<DataBackup>;

    if (!backup.clients || !Array.isArray(backup.clients)) {
      throw new Error('Formato de backup invalido');
    }

    console.log(
      `[Storage] Importando backup v${backup.version ?? 'desconhecida'} de ${backup.timestamp ?? 'sem data'}`
    );
    console.log(`[Storage] ${backup.clients.length} clientes encontrados`);

    const normalizedBackup = createBackupPayload(
      backup.clients,
      backup.activeClientId ?? null,
      backup.timestamp,
      backup.version ?? CURRENT_VERSION
    );
    persistBackupPayload(normalizedBackup);

    return {
      clients: normalizedBackup.clients,
      activeClientId: normalizedBackup.activeClientId,
    };
  } catch (error) {
    console.error('[Storage] Erro ao importar JSON:', error);
    throw new Error('Falha ao importar dados. Verifique se o arquivo esta correto.');
  }
};

/**
 * Faz download do backup como arquivo JSON
 */
export const downloadBackup = (clients: ClientWorkspaceCard[], activeClientId: string | null): void => {
  try {
    const jsonData = exportToJSON(clients, activeClientId);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.href = url;
    link.download = `neurocontent-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('[Storage] Backup baixado com sucesso');
  } catch (error) {
    console.error('[Storage] Erro ao fazer download do backup:', error);
    throw new Error('Falha ao fazer download do backup');
  }
};

/**
 * Verifica se ha dados salvos
 */
export const hasStoredData = (): boolean => {
  return (
    localStorage.getItem(STORAGE_KEYS.BACKUP_JSON) !== null ||
    localStorage.getItem(STORAGE_KEYS.CLIENTS) !== null
  );
};

/**
 * Migra dados de versoes antigas (se necessario)
 */
export const migrateData = (): void => {
  try {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.APP_VERSION);

    if (!storedVersion) {
      localStorage.setItem(STORAGE_KEYS.APP_VERSION, CURRENT_VERSION);
      console.log('[Storage] Versao inicial configurada:', CURRENT_VERSION);
      return;
    }

    if (storedVersion !== CURRENT_VERSION) {
      console.log(`[Storage] Migrando de v${storedVersion} para v${CURRENT_VERSION}`);
      localStorage.setItem(STORAGE_KEYS.APP_VERSION, CURRENT_VERSION);
    }
  } catch (error) {
    console.error('[Storage] Erro na migracao:', error);
  }
};

/**
 * Obtem estatisticas do storage
 */
export const getStorageStats = (): { totalClients: number; storageSize: string; hasData: boolean } => {
  try {
    const snapshot = loadBackupSnapshot();
    const clients = snapshot?.clients ?? getClientsFromRawStorage();
    const data =
      localStorage.getItem(STORAGE_KEYS.BACKUP_JSON) ||
      localStorage.getItem(STORAGE_KEYS.CLIENTS) ||
      '[]';
    const sizeInBytes = new Blob([data]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);

    return {
      totalClients: clients.length,
      storageSize: `${sizeInKB} KB`,
      hasData: clients.length > 0,
    };
  } catch (error) {
    console.error('[Storage] Erro ao obter estatisticas:', error);
    return {
      totalClients: 0,
      storageSize: '0 KB',
      hasData: false,
    };
  }
};
