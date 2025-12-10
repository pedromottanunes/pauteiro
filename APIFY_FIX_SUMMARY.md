# 🔧 Correções no Instagram Scraper - Apify API v2

## 📋 Problema Identificado

O scraper estava falhando ao coletar dados do Instagram (@rabbitagency4.0) retornando **0 posts**, mesmo com perfis válidos.

## 🔍 Análise Realizada

Após analisar a [documentação oficial da Apify API v2](https://docs.apify.com/api/v2), identifiquei os seguintes problemas:

### 1. **Método de Execução Inadequado** ❌
- **Antes**: Usava polling manual (POST para criar run → Loop de GET para checar status → GET para buscar resultados)
- **Problema**: Complexidade desnecessária, mais pontos de falha, timeouts mal gerenciados
- **Agora**: Usa endpoint síncrono `waitForFinish` que aguarda automaticamente ✅

### 2. **Input Incompleto** ❌
- **Antes**: Input tinha campos extras/desnecessários que podem ter causado conflitos
- **Problema**: Campos como `enhanceUserSearchWithFacebookPage`, `isUserReelFeedURL` eram incluídos incorretamente
- **Agora**: Input limpo com apenas campos necessários ✅

### 3. **Logging Insuficiente** ❌
- **Antes**: Logs básicos, difícil debugar quando falhava
- **Problema**: Não mostrava dataset vazio, run ID para investigação, ou detalhes do erro da API
- **Agora**: Logging detalhado em cada etapa com URLs para console Apify ✅

### 4. **Tratamento de Erros Fraco** ❌
- **Antes**: Erros genéricos sem contexto
- **Problema**: Impossível identificar se era problema de API key, rate limit, perfil privado, ou input errado
- **Agora**: Erros específicos com contexto completo e sugestões ✅

## ✨ Melhorias Implementadas

### 🎯 1. Endpoint Síncrono com `waitForFinish`

```typescript
// ANTES - Polling manual (código complexo)
const startResponse = await fetch(`${APIFY_API_BASE}/acts/${actorId}/runs?token=${apiKey}`, ...);
const runId = startData.data.id;
// Loop de polling...
while (Date.now() - startTime < timeout) {
  await new Promise(resolve => setTimeout(resolve, pollInterval));
  const statusResponse = await fetch(`${APIFY_API_BASE}/actor-runs/${runId}?token=${apiKey}`);
  // Checar status...
}

// AGORA - Síncrono simples e confiável ✅
const runUrl = `${APIFY_API_BASE}/acts/${actorId}/runs?token=${apiKey}&waitForFinish=${timeoutSeconds}`;
const runResponse = await fetch(runUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(input),
});
// Retorna automaticamente quando terminar!
```

**Benefícios:**
- ✅ Mais simples e confiável
- ✅ Menos requisições HTTP
- ✅ Timeout gerenciado pela Apify
- ✅ Menos pontos de falha

### 🎯 2. Input Limpo e Correto

```typescript
// ANTES - Input com campos desnecessários
{
  addParentData: false,
  directUrls: [`https://www.instagram.com/${username}/`],
  resultsType,
  resultsLimit: limit,
  searchType: '',
  searchLimit: 0,
  enhanceUserSearchWithFacebookPage: false,  // ❌ Não necessário
  isUserReelFeedURL: false,                  // ❌ Não necessário
  isUserTaggedFeedURL: false,                // ❌ Não necessário
  downloadMedia: false,                      // ❌ Não necessário
}

// AGORA - Input minimalista ✅
{
  directUrls: [instagramUrl],
  resultsType,
  resultsLimit: limit,
  search: '',
  searchType: '',
  searchLimit: 0,
  addParentData: false,
}
```

**Benefícios:**
- ✅ Menos chance de conflitos de parâmetros
- ✅ Mais alinhado com os exemplos da documentação
- ✅ Funciona com formatos de URL limpos

### 🎯 3. Logging Detalhado e Útil

```typescript
// Logging completo em cada etapa:

✅ Início do run com input formatado
✅ Run ID e Dataset ID para investigação
✅ Status final (SUCCEEDED, FAILED, etc.)
✅ Quantidade de itens coletados
✅ Amostra do primeiro resultado (500 chars)
✅ URL direta para console Apify em caso de erro
✅ Stats do run quando disponível
✅ Warnings para datasets vazios
```

**Exemplo de log:**
```
[Apify] 🚀 Iniciando actor: apify/instagram-scraper
[Apify] 📋 Input: { "directUrls": ["https://www.instagram.com/rabbitagency4.0/"], ... }
[Apify] ⏳ Aguardando conclusão... (timeout: 240s)
[Apify] 📝 Run ID: abc123xyz
[Apify] 📊 Status final: SUCCEEDED
[Apify] 🗄️ Dataset ID: def456uvw
[Apify] ✅ Coletados 12 itens do dataset
[Apify] 🔍 Amostra do primeiro resultado: { "type": "Image", "caption": "..." }
```

### 🎯 4. Tratamento de Erros Robusto

```typescript
// Tratamento específico para cada tipo de erro:

✅ Erro de API (400, 401, 403, etc.) → Mostra mensagem da Apify
✅ Run falhou (FAILED, ABORTED, TIMED-OUT) → Mostra logs e stats
✅ Dataset vazio → Warning claro + link para investigação
✅ Fallback automático → Tenta URL direta, depois busca
✅ Ambos falharam → Mostra razão de cada tentativa
```

### 🎯 5. Estratégia de Fallback Melhorada

```typescript
// Tentativa 1: URL Direta
console.log('[Apify] 🎯 Tentativa 1: URL direta para @username (posts)');
const directInput = buildInstagramInput({ username, resultsType: 'posts', limit: 20 });
// Se falhar ou retornar 0 resultados...

// Tentativa 2: Busca
console.log('[Apify] 🔁 Tentativa 2: Busca por usuário "username"');
const searchInput = buildInstagramInput({
  resultsType: 'posts',
  limit: 20,
  searchType: 'user',
  searchQuery: username,
});

// Se ambas falharem → Erro detalhado com razões de cada tentativa
```

## 🧪 Como Testar

1. **Abra a aplicação** em `localhost:3000`
2. **Vá para Research** page
3. **Configure o cliente** com Instagram `@rabbitagency4.0`
4. **Clique em "Gerar Pesquisa"**
5. **Abra o sidebar "Logs"** para ver logs em tempo real
6. **Aguarde a coleta** (~30-60 segundos)
7. **Verifique os resultados** em "Ver Dados Extraídos"

## 📊 O Que Esperar nos Logs

### ✅ Sucesso:
```
[Apify] 🚀 Iniciando actor: apify/instagram-scraper
[Apify] 🎯 Tentativa 1: URL direta para @rabbitagency4.0 (posts)
[Apify] ⏳ Aguardando conclusão... (timeout: 240s)
[Apify] 📝 Run ID: xyz789
[Apify] ✅ URL direta funcionou: 12 resultados
[Apify] ✅ Coletados 12 itens do dataset
✓ @rabbitagency4.0: 12 posts coletados
📍 45 hashtags únicas encontradas
```

### ❌ Se Falhar (com detalhes úteis):
```
[Apify] 🚀 Iniciando actor: apify/instagram-scraper
[Apify] 🎯 Tentativa 1: URL direta para @rabbitagency4.0 (posts)
[Apify] ⚠️ Erro na URL direta: Actor run FAILED
[Apify] 🔗 Logs: https://console.apify.com/actors/runs/xyz789
[Apify] 🔁 Tentativa 2: Busca por usuário "rabbitagency4.0"
[Apify] ✅ Busca funcionou: 8 resultados
```

## 🔑 Verificações Importantes

### 1. API Key Apify está configurada?
- Vá em **Settings → API Keys**
- Verifique se tem um valor em **Apify**
- Deve começar com `apify_api_...`

### 2. Perfil não é privado?
- O scraper só funciona com perfis **públicos**
- `@rabbitagency4.0` é público ✅

### 3. Rate limits?
- Apify tem rate limits (mas são generosos)
- Se atingir, aguarde ~1 minuto

## 🆘 Troubleshooting

### Problema: "API Key Apify não configurada"
**Solução:** Configure a key em Settings → API Keys

### Problema: "Actor run FAILED"
**Solução:** 
1. Copie o Run ID do log
2. Acesse `https://console.apify.com/actors/runs/[RUN_ID]`
3. Veja os logs detalhados no console da Apify

### Problema: "Dataset vazio - 0 resultados"
**Possíveis causas:**
- Perfil privado
- Username incorreto
- Rate limit atingido
- Problema temporário do Instagram

**Solução:**
1. Verifique o link para console Apify nos logs
2. Tente novamente em 1 minuto
3. Teste com outro perfil público conhecido

### Problema: "Timeout"
**Solução:**
- Instagram pode estar lento
- Aumente o timeout no código (atual: 240s)
- Tente com `limit` menor (ex: 10 posts)

## 📚 Referências

- [Apify API v2 Documentation](https://docs.apify.com/api/v2)
- [Instagram Scraper Actor](https://apify.com/apify/instagram-scraper)
- [Actor Runs - Wait for Finish](https://docs.apify.com/api/v2#tag/Actor-runs)

## ✅ Checklist de Validação

- [x] TypeScript compila sem erros
- [x] Endpoint síncrono com `waitForFinish`
- [x] Input limpo e minimalista
- [x] Logging detalhado em todas as etapas
- [x] Tratamento de erros específico
- [x] Fallback automático (URL → Busca)
- [x] URLs para console Apify em erros
- [x] Warning para datasets vazios
- [ ] **Teste com perfil real** (precisa executar!)

---

## 🎯 Próximo Passo

**Teste agora com @rabbitagency4.0** e compartilhe os logs completos se ainda houver problemas!
