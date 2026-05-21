# Script to load environment variables from .env and run Spring Boot backend

$envFile = Join-Path $PSScriptRoot ".env"

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
    Write-Warning ".env file not found! Spring Boot might fail to start if required environment variables are not set."
}

Write-Host "Starting Spring Boot backend..." -ForegroundColor Cyan
.\mvnw.cmd spring-boot:run
