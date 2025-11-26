#!/bin/bash

# ==================================
# Script para executar migrações via API do Supabase
# ==================================

SUPABASE_URL="https://enzazswaehuawcugexbr.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuemF6c3dhZWh1YXdjdWdleGJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA4Nzk3MywiZXhwIjoyMDc4NjYzOTczfQ.ZiRTOxpw9UFbE7DH_9xBeW-DEGhdiHrWj2JVpAbAeMo"

echo "🚀 Executando migrações no Supabase..."
echo ""

# Ler o script SQL
SQL_SCRIPT=$(cat supabase/⚡_SCRIPT_COMPLETO_EXECUTAR_TUDO.sql)

# Executar via API REST
echo "📊 Executando script consolidado..."
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_SCRIPT" | jq -Rs .)}"

echo ""
echo "✅ Script executado!"
echo ""
echo "Agora executando criar_admin_guilherme.sql..."

# Executar script de admin
ADMIN_SCRIPT=$(cat supabase/criar_admin_guilherme.sql)

curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$ADMIN_SCRIPT" | jq -Rs .)}"

echo ""
echo "✅ Admin criado!"
echo ""
echo "🎉 Tudo pronto! Faça login em http://localhost:3000/login"
echo "   Email: guilherme@vallegroup.com.br"
echo "   Senha: *Valle2307"







