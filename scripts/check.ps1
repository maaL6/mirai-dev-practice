$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent $PSScriptRoot
$python = Join-Path $workspace ".venv\Scripts\python.exe"

function Assert-ExitCode {
    param(
        [int]$Code,
        [string]$Step
    )

    if ($Code -ne 0) {
        throw "$Step failed with exit code $Code."
    }
}

if (-not (Test-Path $python)) {
    $python = "python"
}

Push-Location (Join-Path $workspace "backend")
try {
    & $python -m ruff check .
    Assert-ExitCode $LASTEXITCODE "Backend lint"
    & $python manage.py check
    Assert-ExitCode $LASTEXITCODE "Django system check"
    & $python manage.py makemigrations --check --dry-run
    Assert-ExitCode $LASTEXITCODE "Migration check"
    & $python -m pytest
    Assert-ExitCode $LASTEXITCODE "Backend tests"
}
finally {
    Pop-Location
}

Push-Location (Join-Path $workspace "frontend")
try {
    npm run lint
    Assert-ExitCode $LASTEXITCODE "Frontend lint"
    npm run test
    Assert-ExitCode $LASTEXITCODE "Frontend tests"
    npm run build
    Assert-ExitCode $LASTEXITCODE "Frontend build"
}
finally {
    Pop-Location
}

docker compose -f (Join-Path $workspace "docker-compose.yml") config --quiet
Assert-ExitCode $LASTEXITCODE "Docker Compose validation"

Write-Host "All checks passed." -ForegroundColor Green
