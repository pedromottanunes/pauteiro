$ErrorActionPreference = 'Stop'

function Test-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Command '$Name' nao foi encontrada. Instale-a antes de continuar."
    }
}

function Install-Dependencies {
    if (-not (Test-Path -Path "node_modules")) {
        Write-Host "[testador] Instalando dependencias..." -ForegroundColor Cyan
        npm install | Out-String | Write-Host
    }
}

function Start-DevServer {
    Write-Host "[testador] Iniciando Vite (npm run dev)..." -ForegroundColor Cyan
    npm run dev
}

Test-Command -Name npm
Install-Dependencies
Start-DevServer
