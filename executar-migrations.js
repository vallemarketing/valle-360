#!/usr/bin/env node

// ==================================
// Script para executar migrações no Supabase
// ==================================

const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://enzazswaehuawcugexbr.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuemF6c3dhZWh1YXdjdWdleGJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA4Nzk3MywiZXhwIjoyMDc4NjYzOTczfQ.ZiRTOxpw9UFbE7DH_9xBeW-DEGhdiHrWj2JVpAbAeMo'

// Criar cliente Supabase com Service Role (bypass RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executarSQL(titulo, arquivo) {
  console.log(`\n📊 ${titulo}...`)
  
  try {
    const sql = fs.readFileSync(arquivo, 'utf8')
    
    // Dividir em statements individuais (separados por ;)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== '')
    
    console.log(`   ${statements.length} statements para executar...`)
    
    let executados = 0
    let erros = 0
    
    for (const statement of statements) {
      try {
        // Executar via RPC ou query direta
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        }).catch(() => ({ error: 'RPC não disponível' }))
        
        if (error) {
          // Se RPC não existe, tentamos executar de outra forma
          // Nota: Supabase não permite SQL arbitrário via REST API
          // Para isso seria necessário psql direto
          console.log(`   ⚠️  Erro: ${error.message || error}`)
          erros++
        } else {
          executados++
        }
      } catch (err) {
        console.log(`   ⚠️  Erro ao executar statement: ${err.message}`)
        erros++
      }
    }
    
    console.log(`   ✅ Executados: ${executados}`)
    if (erros > 0) {
      console.log(`   ⚠️  Erros: ${erros}`)
    }
    
    return { executados, erros }
    
  } catch (error) {
    console.error(`   ❌ Erro ao ler arquivo: ${error.message}`)
    return { executados: 0, erros: 1 }
  }
}

async function verificarAdmin() {
  console.log('\n🔍 Verificando se admin foi criado...')
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('email, role, user_type')
      .eq('email', 'guilherme@vallegroup.com.br')
      .single()
    
    if (error) {
      console.log('   ⚠️  Admin ainda não criado ou tabela não existe')
      return false
    }
    
    if (data) {
      console.log('   ✅ Admin encontrado!')
      console.log(`      Email: ${data.email}`)
      console.log(`      Role: ${data.role}`)
      console.log(`      Type: ${data.user_type}`)
      return true
    }
  } catch (error) {
    console.log(`   ⚠️  Erro: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('   🚀 EXECUTANDO MIGRAÇÕES NO SUPABASE')
  console.log('═══════════════════════════════════════════════════════════')
  
  console.log('\n⚠️  IMPORTANTE:')
  console.log('   O Supabase REST API não permite execução de SQL arbitrário.')
  console.log('   Você precisa executar os scripts manualmente no SQL Editor.')
  console.log('')
  console.log('   📝 Passos:')
  console.log('   1. Acesse: https://supabase.com/dashboard/project/enzazswaehuawcugexbr/sql/new')
  console.log('   2. Cole o conteúdo de: supabase/⚡_SCRIPT_COMPLETO_EXECUTAR_TUDO.sql')
  console.log('   3. Clique em "Run"')
  console.log('   4. Depois, cole o conteúdo de: supabase/criar_admin_guilherme.sql')
  console.log('   5. Clique em "Run" novamente')
  console.log('')
  console.log('═══════════════════════════════════════════════════════════')
  
  // Tentar verificar se admin já existe
  await verificarAdmin()
  
  console.log('\n📖 Arquivos prontos para executar:')
  console.log('   📄 supabase/⚡_SCRIPT_COMPLETO_EXECUTAR_TUDO.sql')
  console.log('   📄 supabase/criar_admin_guilherme.sql')
  console.log('')
  console.log('🎯 Após executar, faça login em:')
  console.log('   🌐 http://localhost:3000/login')
  console.log('   📧 Email: guilherme@vallegroup.com.br')
  console.log('   🔑 Senha: *Valle2307')
  console.log('')
}

main().catch(console.error)







