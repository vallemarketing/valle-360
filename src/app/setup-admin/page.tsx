'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [adminId, setAdminId] = useState('')

  const createAdmin = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: 'guilherme@vallegroup.com.br',
        password: '*Valle2307',
        options: {
          data: {
            full_name: 'Guilherme Valle',
            user_type: 'super_admin'
          }
        }
      })

      if (signUpError) {
        // Se o usuário já existe, tentar fazer sign in para pegar o ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'guilherme@vallegroup.com.br',
          password: '*Valle2307'
        })

        if (signInError) {
          throw new Error(`Erro ao criar/acessar usuário: ${signInError.message}`)
        }

        setAdminId(signInData.user?.id || '')

        // Atualizar perfil existente
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: signInData.user?.id,
            full_name: 'Guilherme Valle',
            email: 'guilherme@vallegroup.com.br',
            role: 'super_admin',
            user_type: 'super_admin',
            is_active: true,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guilherme'
          })

        setSuccess(true)
        setLoading(false)
        return
      }

      const userId = authData.user?.id
      setAdminId(userId || '')

      // 2. Criar perfil de super admin
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          full_name: 'Guilherme Valle',
          email: 'guilherme@vallegroup.com.br',
          role: 'super_admin',
          user_type: 'super_admin',
          is_active: true,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guilherme'
        }, {
          onConflict: 'user_id'
        })

      if (profileError) {
        console.warn('Aviso ao criar perfil:', profileError.message)
      }

      // 3. Criar registro na tabela users (se existir)
      await supabase
        .from('users')
        .upsert({
          id: userId,
          email: 'guilherme@vallegroup.com.br',
          full_name: 'Guilherme Valle',
          role: 'super_admin',
          user_type: 'super_admin',
          is_active: true,
          email_verified: true,
          two_factor_enabled: false,
          requires_2fa: false
        })

      // 4. Criar permissões completas
      const permissions = [
        'dashboard', 'clients', 'employees', 'kanban', 'financial', 
        'reports', 'analytics', 'ai', 'settings', 'machine_learning',
        'pricing_intelligence', 'competitive_intelligence', 'sales_intelligence'
      ]

      for (const permission of permissions) {
        await supabase
          .from('employee_permissions')
          .upsert({
            employee_id: userId,
            permission_key: permission,
            can_view: true,
            can_create: true,
            can_edit: true,
            can_delete: true,
            can_approve: true
          })
      }

      setSuccess(true)

    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao criar admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <Shield className="w-20 h-20 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Setup Admin - Valle 360
          </h1>
          <p className="text-gray-600">
            Criar conta de super administrador
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Credenciais que serão criadas:
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-mono font-semibold text-gray-900">guilherme@vallegroup.com.br</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Senha:</span>
              <span className="font-mono font-semibold text-gray-900">*Valle2307</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-semibold text-blue-600">Super Admin</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Erro</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">
                  ✅ Admin criado com sucesso!
                </h3>
                <p className="text-sm text-green-700">
                  Você já pode fazer login no sistema.
                </p>
              </div>
            </div>

            {adminId && (
              <div className="bg-white rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">User ID:</p>
                <code className="text-xs font-mono text-gray-700 break-all">
                  {adminId}
                </code>
              </div>
            )}

            <div className="bg-green-100 rounded-lg p-4">
              <p className="font-semibold text-green-900 mb-2">Próximos passos:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
                <li>Acesse a página de login</li>
                <li>Use o email: guilherme@vallegroup.com.br</li>
                <li>Use a senha: *Valle2307</li>
                <li>Você terá acesso completo ao sistema!</li>
              </ol>
            </div>

            <a
              href="/login"
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Ir para Login
              <CheckCircle className="w-5 h-5" />
            </a>
          </div>
        )}

        {!success && (
          <button
            onClick={createAdmin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Criando Admin...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Criar Admin Agora
              </>
            )}
          </button>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Esta página cria automaticamente o super admin no sistema.</p>
          <p className="mt-1">Após criar, você pode deletar esta página por segurança.</p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
          >
            ← Voltar para Login
          </a>
        </div>
      </div>
    </div>
  )
}

