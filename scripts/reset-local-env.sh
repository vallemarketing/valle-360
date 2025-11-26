#!/bin/bash

echo "🚀 Iniciando Reset do Ambiente Local..."

# 1. Matar processos na porta 3000
echo "🔪 Matando processos na porta 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 2. Escrever .env.local CORRETO
echo "📝 Escrevendo .env.local..."
cat > .env.local << EOL
NEXT_PUBLIC_SUPABASE_URL=https://ikjgsqtykkhqimypacro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlramdzcXR5a2tocWlteXBhY3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTE4OTksImV4cCI6MjA3ODc4Nzg5OX0.vgVCpFIt-5ajFhcXg65dqrEw915pqW8fGZ8xgJxrnxI
EOL

# 3. Limpar caches
echo "🧹 Limpando caches..."
rm -rf .next

# 4. Reinstalar dependências
echo "📦 Reinstalando dependências..."
npm install --legacy-peer-deps

echo "✅ Pronto! Agora execute: npm run dev"

