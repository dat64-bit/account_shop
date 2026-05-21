# Script to load environment variables from .env and run Spring Boot backend

# Detect project root directory based on pom.xml location
$projectRoot = $PSScriptRoot
if (-not (Test-Path (Join-Path $PSScriptRoot "pom.xml"))) {
    if (Test-Path (Join-Path $PSScriptRoot "account-shop\pom.xml")) {
        $projectRoot = Join-Path $PSScriptRoot "account-shop"
    }
}

# Change directory to the project root
Set-Location $projectRoot

$envFile = Join-Path $projectRoot ".env"

if (Test-Path $envFile) {
    Write-Host "Loading environment variables from $envFile..." -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $name, $value = $line.Split('=', 2)
            $name = $name.Trim()
            $value = $value.Trim()
            # Remove quotes if present
            if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            } elseif ($value.StartsWith("'") -and $value.EndsWith("'")) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            [System.Environment]::SetEnvironmentVariable($name, $value)
        }
    }
} else {
    Write-Warning ".env file not found at $envFile! Spring Boot might fail to start if required environment variables are not set."
}

Write-Host "Starting Spring Boot backend..." -ForegroundColor Cyan
.\mvnw.cmd spring-boot:run
