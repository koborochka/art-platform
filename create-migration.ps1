# Запуск: .\create-migration.ps1

$ErrorActionPreference = "Stop"

# Генерируем уникальное имя для возможной миграции
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$MigrationName = "auto_$Timestamp"

Write-Host "Checking for database schema changes..." -ForegroundColor Cyan

# Создаём миграцию схемы БД
cmd /c "npx payload migrate:create $MigrationName --skip-empty"

# Ищем, создался ли файл с таким именем
$NewMigration = Get-ChildItem "src\migrations\*$MigrationName.ts" -ErrorAction SilentlyContinue

if ($NewMigration) {
    Write-Host "Changes detected. Created: $($NewMigration.Name)" -ForegroundColor Green
    Write-Host "Fixing imports in new migration file..." -ForegroundColor Yellow

    # Читаем содержимое
    $Content = Get-Content $NewMigration.FullName

    # Исправляем импорт на корректный
    $Content[0] = "import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres';"

    # Сохраняем обратно в UTF8
    $Content | Set-Content $NewMigration.FullName -Encoding UTF8
    
    Write-Host "Migration ready!" -ForegroundColor Green
} else {
    Write-Host "No schema changes detected. Using existing migrations" -ForegroundColor Gray
}
