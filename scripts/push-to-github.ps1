# Helper script to initialize git repo and push to GitHub
# This script will run locally and prompt you for credentials when needed.
# Do NOT paste your token into this script or into the chat.

param(
    [string]$RemoteUrl = "https://github.com/pedromottanunes/pauteiro.git",
    [string]$Branch = "main",
    [switch]$AllowUnrelatedHistories
)

Write-Host "Starting Git push helper..." -ForegroundColor Cyan

# Ensure git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git not found in PATH. Please install Git and re-run this script.";
    exit 1
}

# If .git doesn't exist, init
if (-not (Test-Path -Path .git)) {
    Write-Host "Initializing new git repository..." -ForegroundColor Green
    git init
} else {
    Write-Host "Existing git repository detected." -ForegroundColor Yellow
}

# Check for remote named origin
$remotes = git remote -v | Out-String
if ($remotes -match "origin") {
    Write-Host "Remote 'origin' already exists. Will update URL to the one provided." -ForegroundColor Yellow
    git remote remove origin
}

Write-Host "Adding remote origin: $RemoteUrl" -ForegroundColor Green
git remote add origin $RemoteUrl

# Add all files and commit
Write-Host "Staging all files..." -ForegroundColor Green
git add .

# If no commits exist, create initial commit, else create a new commit
$hasCommits = $false
try {
    git rev-parse --verify HEAD > $null 2>&1
    $hasCommits = $true
} catch {
    $hasCommits = $false
}

if (-not $hasCommits) {
    Write-Host "Creating initial commit..." -ForegroundColor Green
    git commit -m "chore: initial import"
} else {
    Write-Host "Creating commit with latest changes..." -ForegroundColor Green
    git commit -m "chore: update workspace" || Write-Host "No changes to commit." -ForegroundColor Yellow
}

# Set branch and push
Write-Host "Pushing to remote (branch: $Branch)..." -ForegroundColor Cyan

# If remote has content, may need to pull first
if ($AllowUnrelatedHistories) {
    Write-Host "Pulling remote with allow-unrelated-histories..." -ForegroundColor Yellow
    git pull origin $Branch --allow-unrelated-histories
}

# Try pushing (will prompt for credentials if needed)
try {
    git push -u origin $Branch
    Write-Host "Push completed." -ForegroundColor Green
} catch {
    Write-Error "Push failed. If authentication is required you will need to provide credentials in the terminal."
    exit 1
}

Write-Host "Done. If you see authentication errors, run this script again and provide credentials when prompted." -ForegroundColor Cyan
