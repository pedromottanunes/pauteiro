// Teste direto da API Apify no navegador
// Cole este código no console do navegador (F12) para testar

// Substitua pela sua API key
const APIFY_API_KEY = 'apify_api_XXXXXXX'; // <-- COLE SUA KEY AQUI

async function testApifyDirect() {
  const APIFY_API_BASE = 'https://api.apify.com/v2';
  const INSTAGRAM_SCRAPER_ACTOR = 'apify/instagram-scraper';
  
  console.log('=== TESTE DIRETO APIFY ===');
  
  // 1. Testar validação da API key
  console.log('\n1. Validando API Key...');
  try {
    const userResponse = await fetch(`${APIFY_API_BASE}/users/me?token=${APIFY_API_KEY}`);
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ API Key válida:', userData.data?.username);
    } else {
      console.log('❌ API Key inválida:', userResponse.status);
      return;
    }
  } catch (e) {
    console.log('❌ Erro ao validar key:', e);
    return;
  }
  
  // 2. Testar criação de um run
  console.log('\n2. Iniciando scraper...');
  const input = {
    directUrls: ['https://www.instagram.com/rabbitagency4.0/'],
    resultsType: 'posts',
    resultsLimit: 5,
    search: '',
    searchType: '',
    searchLimit: 0,
    addParentData: false,
  };
  
  console.log('Input:', JSON.stringify(input, null, 2));
  
  try {
    const startUrl = `${APIFY_API_BASE}/acts/${INSTAGRAM_SCRAPER_ACTOR}/runs?token=${APIFY_API_KEY}`;
    console.log('URL:', startUrl.replace(APIFY_API_KEY, 'HIDDEN'));
    
    const startResponse = await fetch(startUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    
    console.log('Response status:', startResponse.status);
    
    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.log('❌ Erro ao iniciar:', errorText);
      return;
    }
    
    const startData = await startResponse.json();
    const runId = startData.data?.id;
    console.log('✅ Run iniciado:', runId);
    console.log('🔗 Console:', `https://console.apify.com/actors/runs/${runId}`);
    
    // 3. Poll para status
    console.log('\n3. Aguardando conclusão (max 60s)...');
    const startTime = Date.now();
    const maxWait = 60000; // 1 minuto
    
    while (Date.now() - startTime < maxWait) {
      await new Promise(r => setTimeout(r, 3000)); // poll a cada 3s
      
      const statusUrl = `${APIFY_API_BASE}/actor-runs/${runId}?token=${APIFY_API_KEY}`;
      const statusResponse = await fetch(statusUrl);
      const statusData = await statusResponse.json();
      const status = statusData.data?.status;
      
      console.log(`Status: ${status} (${Math.round((Date.now() - startTime) / 1000)}s)`);
      
      if (status === 'SUCCEEDED') {
        console.log('✅ Concluído!');
        
        // Buscar resultados
        const datasetId = statusData.data?.defaultDatasetId;
        const resultsUrl = `${APIFY_API_BASE}/datasets/${datasetId}/items?token=${APIFY_API_KEY}`;
        const resultsResponse = await fetch(resultsUrl);
        const results = await resultsResponse.json();
        
        console.log(`\n✅ RESULTADOS: ${results.length} itens`);
        if (results.length > 0) {
          console.log('Primeiro post:', results[0]);
        }
        return results;
      }
      
      if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        console.log('❌ Falhou:', status);
        return;
      }
    }
    
    console.log('❌ Timeout');
    
  } catch (e) {
    console.log('❌ Erro:', e);
  }
}

// Executar
testApifyDirect();
