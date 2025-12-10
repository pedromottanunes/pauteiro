/**
 * Utilitário para carregar e processar templates de prompts externos
 * 
 * Este serviço gerencia o carregamento de arquivos .txt de prompts da pasta public/prompts/
 * e faz a substituição de placeholders ({{VARIABLE}}) pelos valores reais.
 */

import { emitPromptUsage } from './promptEvents';

// Cache para evitar recarregar arquivos repetidamente
const promptCache: Map<string, string> = new Map();

/**
 * Carrega um template de prompt de um arquivo .txt
 * @param promptName Nome do arquivo (sem extensão)
 * @returns Template bruto com placeholders
 */
export const loadPromptTemplate = async (promptName: string): Promise<string> => {
  // Verifica cache primeiro
  if (promptCache.has(promptName)) {
    return promptCache.get(promptName)!;
  }

  try {
    const response = await fetch(`/prompts/${promptName}.txt`);
    
    if (!response.ok) {
      throw new Error(`Falha ao carregar prompt: ${promptName} (${response.status})`);
    }

    const content = await response.text();
    
    // Extrai apenas a parte do template (depois do marcador)
    const templateMarker = '===== TEMPLATE DO PROMPT =====';
    const parts = content.split(templateMarker);
    
    if (parts.length < 2) {
      console.warn(`[Prompt Loader] Arquivo ${promptName}.txt não tem marcador de template, usando conteúdo completo`);
      promptCache.set(promptName, content.trim());
      return content.trim();
    }
    
    const template = parts[1].trim();
    promptCache.set(promptName, template);
    
    return template;
  } catch (error) {
    console.error(`[Prompt Loader] Erro ao carregar ${promptName}:`, error);
    throw new Error(`Não foi possível carregar o template de prompt: ${promptName}`);
  }
};

/**
 * Substitui placeholders no template por valores reais
 * @param template Template com placeholders {{VARIABLE}}
 * @param variables Objeto com valores para substituição
 * @returns Template processado com valores reais
 */
export const fillPromptTemplate = (template: string, variables: Record<string, string | number | boolean>): string => {
  let filled = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    const replacement = String(value);
    
    // Substitui todas as ocorrências do placeholder
    filled = filled.split(placeholder).join(replacement);
  }
  
  return filled;
};

/**
 * Carrega e processa um prompt em uma única chamada
 * @param promptName Nome do arquivo de prompt
 * @param variables Variáveis para substituir no template
 * @returns Prompt processado pronto para usar
 */
export const getPrompt = async (
  promptName: string, 
  variables: Record<string, string | number | boolean>
): Promise<string> => {
  const template = await loadPromptTemplate(promptName);
  const filled = fillPromptTemplate(template, variables);
  try {
    emitPromptUsage(promptName, variables);
  } catch (err) {
    console.warn('[Prompt Loader] Falha ao emitir evento de prompt', err);
  }
  return filled;
};

/**
 * Limpa o cache de prompts (útil em desenvolvimento)
 */
export const clearPromptCache = (): void => {
  promptCache.clear();
  console.log('[Prompt Loader] Cache limpo');
};

/**
 * Pré-carrega prompts mais usados para melhor performance
 */
export const preloadCommonPrompts = async (): Promise<void> => {
  const commonPrompts = [
    'competitors',
    'trends',
    'hashtags',
    'thematic',
    'posts',
  ];

  console.log('[Prompt Loader] Pré-carregando prompts comuns...');
  
  await Promise.all(
    commonPrompts.map(name => 
      loadPromptTemplate(name).catch(err => 
        console.warn(`[Prompt Loader] Falha ao pré-carregar ${name}:`, err)
      )
    )
  );
  
  console.log('[Prompt Loader] Pré-carregamento completo');
};
