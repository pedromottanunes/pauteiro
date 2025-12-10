# Test Apify Instagram Scraper
# Este script testa diferentes formatos de input para o Instagram Scraper

# Configuração
$APIFY_TOKEN = "apify_api_..." # Cole sua API key aqui
$ACTOR_ID = "apify/instagram-scraper"

Write-Host "=== TESTE APIFY INSTAGRAM SCRAPER ===" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Input básico com directUrls
Write-Host "Teste 1: Input com directUrls" -ForegroundColor Yellow
$input1 = @{
    directUrls = @("https://www.instagram.com/rabbitagency4.0/")
    resultsType = "posts"
    resultsLimit = 5
} | ConvertTo-Json

Write-Host "Input:" -ForegroundColor Gray
Write-Host $input1
Write-Host ""

try {
    $response1 = Invoke-WebRequest `
        -Uri "https://api.apify.com/v2/acts/$ACTOR_ID/runs?token=$APIFY_TOKEN" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $input1 `
        -UseBasicParsing
    
    $runData1 = $response1.Content | ConvertFrom-Json
    $runId1 = $runData1.data.id
    Write-Host "Run iniciado: $runId1" -ForegroundColor Green
    Write-Host "Status URL: https://console.apify.com/actors/runs/$runId1" -ForegroundColor Cyan
} catch {
    Write-Host "ERRO: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== DOCUMENTAÇÃO ===" -ForegroundColor Cyan
Write-Host "Para ver detalhes do actor:" -ForegroundColor Gray
Write-Host "https://apify.com/apify/instagram-scraper" -ForegroundColor Blue
Write-Host ""
Write-Host "Para ver o input schema:" -ForegroundColor Gray
Write-Host "https://apify.com/apify/instagram-scraper/input-schema" -ForegroundColor Blue
