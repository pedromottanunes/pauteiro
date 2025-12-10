# Sistema de Prompts Externalizados

## Visão Geral

Este projeto agora utiliza um sistema de **prompts externalizados** em arquivos `.txt` separados. Isso permite que qualquer pessoa edite os prompts da IA sem precisar mexer no código.

## Como Funciona

### Estrutura de Arquivos

Todos os prompts estão localizados em:
```
public/prompts/
├── analise-contexto.txt
├── autoridade.txt
├── competitors-real-data.txt
├── competitors.txt
├── conversao.txt
├── engajamento.txt
├── generic-competitors.txt
├── hashtags-real-data.txt
├── hashtags.txt
├── posts.txt
├── refinamento.txt
├── research-pipeline-recommendations.txt
├── scoring.txt
├── strategic-recommendations.txt
├── thematic-real-data.txt
├── thematic.txt
├── trends.txt
└── variantes.txt
```

### Formato dos Arquivos

Cada arquivo `.txt` contém:

1. **Cabeçalho com explicações** (antes do marcador)
   - Objetivo do prompt
   - Entradas necessárias (variáveis)
   - Quando é usado
   - Saída esperada

2. **Marcador de separação**
   ```
   ===== TEMPLATE DO PROMPT =====
   ```

3. **Template do prompt** (após o marcador)
   - Prompt real com placeholders `{{VARIABLE}}`

### Exemplo de Estrutura

```txt
=== PROMPT: ANÁLISE DE CONCORRENTES ===

OBJETIVO:
Analisar a presença digital e estratégia dos concorrentes.

ENTRADAS NECESSÁRIAS:
- {{CLIENT_NAME}}: Nome do cliente
- {{NICHO}}: Nicho de mercado
- {{COMPETITORS_LIST}}: Lista de concorrentes

QUANDO É USADO:
- Durante pesquisa de mercado
- Para análise competitiva

SAÍDA ESPERADA:
JSON com análise detalhada dos concorrentes

===== TEMPLATE DO PROMPT =====

Você é um analista especializado...

CLIENTE: {{CLIENT_NAME}}
NICHO: {{NICHO}}

CONCORRENTES:
{{COMPETITORS_LIST}}

...resto do prompt...
```

## Como Editar um Prompt

### Passo 1: Localize o arquivo

Encontre o arquivo `.txt` correspondente ao prompt que deseja editar na pasta `public/prompts/`.

### Passo 2: Leia as explicações

Antes do marcador `===== TEMPLATE DO PROMPT =====`, você encontrará:
- **OBJETIVO**: Para que serve este prompt
- **ENTRADAS NECESSÁRIAS**: Quais variáveis são substituídas (formato `{{VARIABLE}}`)
- **QUANDO É USADO**: Em que contexto o prompt é chamado
- **SAÍDA ESPERADA**: Que tipo de resposta a IA deve retornar

### Passo 3: Edite o template

Edite apenas a parte **APÓS** o marcador `===== TEMPLATE DO PROMPT =====`.

**⚠️ IMPORTANTE:**
- **NÃO remova** os placeholders `{{VARIABLE}}`
- **NÃO altere** o nome das variáveis (ex: não mude `{{CLIENT_NAME}}` para `{{NOME_CLIENTE}}`)
- **Você pode:**
  - Adicionar/remover instruções
  - Mudar o tom do prompt
  - Adicionar exemplos
  - Reorganizar seções
  - Alterar o formato de saída (JSON)

### Passo 4: Salve e teste

1. Salve o arquivo `.txt`
2. Recarregue a aplicação no navegador
3. Teste a funcionalidade que usa aquele prompt

## Lista de Prompts e Suas Funções

| Arquivo | Usado Em | Função |
|---------|----------|--------|
| `competitors.txt` | Pesquisa de Mercado | Analisa concorrentes (sem dados reais) |
| `generic-competitors.txt` | Pesquisa de Mercado | Análise genérica quando não há concorrentes configurados |
| `trends.txt` | Pesquisa de Mercado | Identifica tendências do nicho |
| `hashtags.txt` | Pesquisa de Mercado | Análise estratégica de hashtags |
| `thematic.txt` | Pesquisa de Mercado | Identifica temas, FAQs e lacunas de conteúdo |
| `competitors-real-data.txt` | Pesquisa Avançada | Analisa concorrentes com dados reais do Instagram |
| `hashtags-real-data.txt` | Pesquisa Avançada | Análise de hashtags com dados coletados |
| `thematic-real-data.txt` | Pesquisa Avançada | Análise temática com posts reais |
| `posts.txt` | Geração de Conteúdo | Gera ideias de posts para redes sociais |
| `analise-contexto.txt` | Pipeline Avançado | Analisa contexto antes de gerar pautas |
| `engajamento.txt` | Pipeline Avançado | Ideias focadas em engajamento |
| `autoridade.txt` | Pipeline Avançado | Ideias focadas em autoridade |
| `conversao.txt` | Pipeline Avançado | Ideias focadas em conversão |
| `refinamento.txt` | Pipeline Avançado | Refina ideias em pautas completas |
| `variantes.txt` | Pipeline Avançado | Cria variantes para teste A/B |
| `scoring.txt` | Pipeline Avançado | Avalia qualidade de pautas |
| `research-pipeline-recommendations.txt` | Pipeline de Pesquisa | Gera recomendações estratégicas |
| `strategic-recommendations.txt` | Serviço de Recomendações | Recomendações integradas |

## Dicas para Melhorar Prompts

### 1. Seja Específico
Em vez de:
```
Analise o concorrente.
```

Use:
```
Analise PROFUNDAMENTE este concorrente focando em:
1. Frequência de posts (quantas vezes por semana?)
2. Tipos de conteúdo (Reels, Stories, Carrosséis?)
3. Estilo de copywriting (tom, tamanho, emojis)
```

### 2. Dê Exemplos
```
Retorne JSON válido:
{
  "competitors": [
    {
      "name": "Nome do Concorrente",
      "engagementScore": 75,
      "topTopics": ["marketing digital", "redes sociais"],
      "gap": "Não fazem lives regularmente"
    }
  ]
}
```

### 3. Defina o Formato de Saída
```
IMPORTANTE: Retorne APENAS JSON válido, sem markdown, sem explicações extras.
```

### 4. Use Contexto
```
CONTEXTO:
Você é um estrategista de marketing digital com 10 anos de experiência.
Foque em insights ACIONÁVEIS e PRÁTICOS.
```

### 5. Estabeleça Critérios
```
Para cada hashtag, avalie:
- Saturação: alta (muito competitiva), media, baixa (pouco usada)
- Oportunidade: alta (grande potencial), media, baixa
```

## Manutenção

### Cache de Prompts

O sistema mantém um cache em memória para melhor performance. Para limpar o cache durante desenvolvimento:

```javascript
import { clearPromptCache } from './utils/promptLoader';

clearPromptCache();
```

### Pré-carregamento

Prompts mais usados são pré-carregados automaticamente ao iniciar a aplicação.

### Fallback

Se um arquivo de prompt não for encontrado, o sistema lançará um erro claro indicando qual arquivo está faltando.

## Troubleshooting

### Erro: "Falha ao carregar prompt"

**Causa:** Arquivo `.txt` não encontrado ou não acessível

**Solução:**
1. Verifique se o arquivo existe em `public/prompts/`
2. Verifique o nome do arquivo (sem erros de digitação)
3. Recarregue a aplicação

### Erro de JSON inválido

**Causa:** A IA retornou JSON malformado

**Solução:**
1. Adicione instruções mais claras no prompt sobre formato JSON
2. Use `response_format: { type: "json_object" }` na chamada da API (já configurado)
3. Revise o prompt para garantir que o exemplo de JSON está correto

### Variável não substituída

**Causa:** Nome da variável no código não corresponde ao placeholder no `.txt`

**Solução:**
1. Verifique se o nome da variável no código (ex: `CLIENT_NAME`) corresponde exatamente ao placeholder (ex: `{{CLIENT_NAME}}`)
2. Nomes de variáveis são case-sensitive

## Referências Técnicas

### promptLoader.ts

Utilitário principal que:
- Carrega arquivos `.txt` via `fetch`
- Extrai a seção de template (após o marcador)
- Substitui placeholders `{{VARIABLE}}` por valores reais
- Mantém cache para performance

### Funções Principais

```typescript
// Carregar e processar prompt em uma chamada
const prompt = await getPrompt('competitors', {
  CLIENT_NAME: 'Minha Empresa',
  NICHO: 'Marketing Digital',
  COMPETITORS_LIST: '- Concorrente 1\n- Concorrente 2'
});

// Limpar cache (desenvolvimento)
clearPromptCache();

// Pré-carregar prompts comuns
await preloadCommonPrompts();
```

## Contribuindo

Ao adicionar um novo prompt:

1. Crie o arquivo `.txt` em `public/prompts/`
2. Siga o formato padrão (explicações + marcador + template)
3. Documente as variáveis claramente
4. Teste com dados reais
5. Atualize esta documentação

---

**Última atualização:** Dezembro 2025
**Mantido por:** Equipe de Desenvolvimento
