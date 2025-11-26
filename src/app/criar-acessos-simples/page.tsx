'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, CheckCircle, Loader2 } from 'lucide-react'

export default function CriarAcessosSimplesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const criarAcessos = async () => {
    setLoading(true)
    setResult('')

    try {
      // Criar colaborador
      await supabase.auth.signUp({
        email: 'admin@valleai.com.br',
        password: '*Valle2307',
        options: {
          data: { full_name: 'Admin Colaborador' }
        }
      })

      // Criar cliente
      await supabase.auth.signUp({
        email: 'cliente@valleai.com.br',
        password: '*Valle2307',
        options: {
          data: { full_name: 'Cliente Teste' }
        }
      })

      setResult('success')
    } catch (err: any) {
      setResult('error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1b35] to-[#1a2642] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8">
        <div className="text-center mb-8">
          <Shield className="w-20 h-20 mx-auto text-[#4370d1] mb-4" />
          <h1 className="text-3xl font-bold text-[#0f1b35] mb-2">
            Criar Acessos Simples
          </h1>
        </div>

        {!result && (
          <>
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-[#0f1b35] mb-2">👥 Colaborador:</h3>
                <p className="text-sm font-mono text-gray-700">admin@valleai.com.br</p>
                <p className="text-sm font-mono text-gray-700">*Valle2307</p>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <h3 className="font-bold text-[#0f1b35] mb-2">👤 Cliente:</h3>
                <p className="text-sm font-mono text-gray-700">cliente@valleai.com.br</p>
                <p className="text-sm font-mono text-gray-700">*Valle2307</p>
              </div>
            </div>

            <button
              onClick={criarAcessos}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4370d1] to-[#0f1b35] hover:from-[#0f1b35] hover:to-[#4370d1] text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando...
                </span>
              ) : (
                'CRIAR AGORA'
              )}
            </button>
          </>
        )}

        {result === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-20 h-20 mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-4">✅ Criado!</h2>
            <p className="text-gray-600 mb-6">Agora faça login:</p>
            <a
              href="/login"
              className="inline-block bg-[#4370d1] hover:bg-[#0f1b35] text-white font-bold py-3 px-8 rounded-xl"
            >
              IR PARA LOGIN
            </a>
          </div>
        )}

        {result.includes('error') && (
          <div className="text-center">
            <p className="text-red-600 mb-4">{result}</p>
            <a
              href="/login"
              className="inline-block bg-[#4370d1] hover:bg-[#0f1b35] text-white font-bold py-3 px-8 rounded-xl"
            >
              IR PARA LOGIN (já existem)
            </a>
          </div>
        )}
      </div>
    </div>
  )
}











