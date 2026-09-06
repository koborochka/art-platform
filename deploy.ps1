# Запуск: .\deploy.ps1

$ErrorActionPreference = "Stop"

# Конфиг
$SshHost = "185.93.111.64"
$SshUser = "artuser"
$ArchiveName = "deploy.tar.gz"

Write-Host "STARTING DEPLOY..." -ForegroundColor Green

# Билд и проверка типов
Write-Host "Building, generating types and migrations..." -ForegroundColor Cyan
pnpm install

# Генерируем типы Payload
npx payload generate:types

# Создание миграций схем для БД. Скрипт сам поймет, нужно ли создавать новый файл
./create-migration.ps1

# Билд Next.js
pnpm run build:prod 

# Проверка билда
if (-not (Test-Path ".next\BUILD_ID")) {
    Write-Error "ERROR: .next\BUILD_ID not found"
    exit 1
}

# Упаковка архива
# src/migrations и src/payload.config.ts нужны для миграций на ВМ, а package.json и прочие файлы - для зависимостей
Write-Host "Archiving (tar)..." -ForegroundColor Cyan
tar -czf $ArchiveName .next public src package.json pnpm-lock.yaml next.config.ts components.json tsconfig.json

# Отправка архива на ВМ
# Загружаем файл в /root/deploy.tar.gz
Write-Host "Uploading..." -ForegroundColor Cyan
scp $ArchiveName "$($SshUser)@$($SshHost):/var/app/$ArchiveName"

Write-Host "DONE!" -ForegroundColor Green

# На ВМ:
# 1. Полное пересоздание проекта и БД:
# bash /var/app/scripts/reset_db.sh
# bash /var/app/scripts/update.sh

# 2. Просто обновление проекта и миграция БД:
# bash /var/app/scripts/update.sh

# 3. Очистка логов и кэша:
# TODO: настроить cron
# bash /var/app/scripts/clean-logs-and-cache.sh

# Логи указаны в:
# /etc/nginx/sites-available/polki-minto.ru

# Nginx:
# /etc/nginx/nginx.conf

# Сертификаты:
# /etc/nginx/sites-enabled/polki-minto.ru

# .env
# nano /var/app/.env

# email
# nano /etc/postfix/main.cf

# DKIM
# nano /etc/opendkim/keys/vm-13380e01.na4u.ru

# User для работы с проектом на ВМ (Для PM2, pnpm, npx, nginx, certbot, ufw, systemctl)
# Если нужно выполнить какую-то команду в проекте, всегда переключаться на artuser
# su - artuser

# Выключение ВМ, если CPU > 90% в течении 30 мин
# bash /usr/local/bin/check_highcpu.sh
# Логи:
# journalctl -xe | grep "High CPU"
