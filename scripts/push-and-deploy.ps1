<#
.SYNOPSIS
    Push local repo to GitHub (temporarily using a PAT if provided) and optionally trigger a Render deploy.

.DESCRIPTION
    This script helps automate a safe workflow similar to the one discussed:
    - commits local changes,
    - temporarily sets an HTTPS remote URL with an embedded PAT (if you pass -Pat),
    - pushes to the specified remote/branch,
    - restores the original remote URL,
    - optionally triggers a Render deploy using the Render REST API.

.NOTES
    - You should run this script locally (it will never send tokens to anyone).
    - If you pass a PAT, the script will avoid printing it and will unset it after use.
    - To deploy on Render you need a Render API key and the target service id.

.PARAMETER RemoteUrl
    The git remote URL to push to (e.g. https://github.com/USER/REPO.git or git@github.com:USER/REPO.git)

.PARAMETER Branch
    The target branch to push (default: main)

.PARAMETER Pat
    Optional GitHub Personal Access Token. If provided the script will set a temporary remote url using the token.

.PARAMETER RenderApiKey
    Optional Render API key. Required to trigger a Render deploy.

.PARAMETER RenderServiceId
    Optional Render service id to trigger a deploy.

.PARAMETER Deploy
    If present the script will attempt to trigger a deploy on Render after a successful push.

.PARAMETER Force
    If present, forces the git push with --force.

#>

param(
    [Parameter(Mandatory=$false)] [string]$RemoteUrl,
    [Parameter(Mandatory=$false)] [string]$Branch = 'main',
    [Parameter(Mandatory=$false)] [string]$Pat,
    [Parameter(Mandatory=$false)] [string]$RenderApiKey,
    [Parameter(Mandatory=$false)] [string]$RenderServiceId,
    [Parameter(Mandatory=$false)] [switch]$Deploy,
    [Parameter(Mandatory=$false)] [switch]$Force
)

function Write-SecureLine {
    param([string]$Text)
    Write-Host $Text
}

Push-Location -ErrorAction Stop
try {
    # Ensure we're in a git repo
    if (-not (Test-Path .git)) {
        Write-Error "This folder does not appear to be a git repository (no .git). Run this script from the repo root."
        exit 1
    }

    # Commit local changes
    Write-SecureLine "Staging and committing local changes (if any)..."
    git add .
    $commitResult = git commit -m "chore: automated push" 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0 -and $commitResult -match "nothing to commit") {
        Write-SecureLine "No changes to commit. Proceeding to push."
    } else {
        Write-SecureLine "Commit result: $commitResult"
    }

    # Save current remote URL
    $originalRemote = $null
    try { $originalRemote = git remote get-url origin 2>$null } catch { $originalRemote = $null }

    $tempRemoteSet = $false
    if ($Pat) {
        # Ask for explicit confirmation before using PAT
        Write-Host "PAT provided. The script will temporarily set a remote URL containing the token to perform the push."
        $confirm = Read-Host "Type YES to confirm using the PAT for this push"
        if ($confirm -ne 'YES') {
            Write-Host "Aborting: confirmation not provided."
            exit 1
        }

        if (-not $RemoteUrl) {
            Write-Error "When using -Pat you must also pass -RemoteUrl (HTTPS form) so the script can set the URL with the token."
            exit 1
        }

        # Build remote URL with token embedded, avoid printing the token
        $encoded = [System.Uri]::EscapeDataString($Pat)
        if ($RemoteUrl -match "^https://") {
            $urlWithToken = $RemoteUrl -replace "^https://", "https://$encoded@"
        } else {
            Write-Error "RemoteUrl must be HTTPS when using a PAT."
            exit 1
        }

        Write-SecureLine "Setting temporary remote URL and pushing (token will not be printed)."
        git remote set-url origin $urlWithToken
        $tempRemoteSet = $true
    } elseif ($RemoteUrl) {
        # If user passed a remote url but no PAT, set it (useful if remote not configured)
        Write-SecureLine "Setting remote url to the provided value."
        git remote set-url origin $RemoteUrl
    }

    # Push
    $pushArgs = @('push','-u','origin',$Branch)
    if ($Force) { $pushArgs += '--force' }

    Write-SecureLine "Pushing to origin/$Branch..."
    $pushOut = & git @pushArgs 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
        Write-Host "git push failed:" -ForegroundColor Red
        Write-Host $pushOut
        throw "Push failed"
    }
    Write-SecureLine "Push succeeded."

    # Restore original remote if we changed it
    if ($tempRemoteSet -and $originalRemote) {
        git remote set-url origin $originalRemote
        Write-SecureLine "Restored original remote URL."
    }

    # If deploy requested, call Render API
    if ($Deploy) {
        if (-not $RenderApiKey -or -not $RenderServiceId) {
            Write-Error "To trigger a Render deploy provide -RenderApiKey and -RenderServiceId."
            exit 1
        }

        Write-SecureLine "Triggering Render deploy for service id $RenderServiceId..."
        $headers = @{ Authorization = "Bearer $RenderApiKey"; "Content-Type" = "application/json" }
        $body = @{ } | ConvertTo-Json
        try {
            $deploy = Invoke-RestMethod -Method Post -Uri "https://api.render.com/v1/services/$RenderServiceId/deploys" -Headers $headers -Body $body
            Write-SecureLine "Render deploy created: $($deploy.id)"
        } catch {
            Write-Host "Render deploy failed: $_" -ForegroundColor Red
            throw $_
        }
    }

    Write-SecureLine "Done. For security: revoke the PAT on GitHub when you no longer need it."

} finally {
    # Clear variables that may contain secrets from the session
    if (Get-Variable -Name Pat -Scope 0 -ErrorAction SilentlyContinue) { Remove-Variable -Name Pat -ErrorAction SilentlyContinue }
    if (Get-Variable -Name encoded -Scope 0 -ErrorAction SilentlyContinue) { Remove-Variable -Name encoded -ErrorAction SilentlyContinue }
    Pop-Location
}
