'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Verificar se o Supabase estabeleceu a sessão automaticamente
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (!supabase) {
          setError('Serviço de autenticação não configurado');
          return;
        }

        // O Supabase automaticamente estabelece a sessão quando o usuário
        // clica no link de recuperação de senha do email
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao verificar sessão:', sessionError);
          setError('Erro ao verificar sessão de recuperação. Solicite um novo link.');
          return;
        }

        if (session) {
          console.log('✅ Sessão de recuperação estabelecida pelo Supabase');
          setSessionReady(true);
        } else {
          console.error('❌ Nenhuma sessão encontrada');
          setError('Link de recuperação inválido ou expirado. Solicite um novo link de recuperação.');
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
        setError('Erro ao verificar sessão. Solicite um novo link de recuperação.');
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações
    if (!sessionReady) {
      setError('Sessão de recuperação não encontrada. Solicite um novo link.');
      setLoading(false);
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError('Preencha todos os campos');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        setError('Serviço de autenticação não configurado');
        setLoading(false);
        return;
      }

      // Atualizar a senha usando o método nativo do Supabase
      // A sessão já foi estabelecida automaticamente pelo Supabase via URL
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        
        // Mensagens específicas baseadas no erro
        if (updateError.message.includes('expired')) {
          setError('Sessão expirada. Solicite um novo link de recuperação.');
        } else if (updateError.message.includes('invalid')) {
          setError('Sessão inválida. Solicite um novo link de recuperação.');
        } else if (updateError.message.includes('same')) {
          setError('A nova senha não pode ser igual à senha anterior.');
        } else {
          setError(updateError.message || 'Erro ao redefinir senha. Tente novamente.');
        }
        
        setLoading(false);
        return;
      }

      // Sucesso!
      console.log('✅ Senha redefinida com sucesso via Supabase');
      setSuccess(true);

      // Fazer logout para limpar a sessão de recuperação
      await supabase.auth.signOut();

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/auth');
      }, 3000);

    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      setError('Erro inesperado ao redefinir senha. Tente novamente ou solicite um novo link.');
      setLoading(false);
    }
  };

  // Tela de sucesso
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Senha redefinida com sucesso!</h1>
            <p className="text-gray-600 mb-6">
              Sua senha foi alterada. Você será redirecionado para a página de login em instantes...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Redirecionando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-2xl mb-4">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/9179d525-92d6-4d5f-a6ee-6acb92a0dc66.png" 
              alt="Odrna Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Redefinir Senha</h1>
          <p className="text-white/80">Digite sua nova senha abaixo</p>
        </div>

        {/* Card de Redefinição */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={!sessionReady}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={!sessionReady}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  disabled={!sessionReady}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={!sessionReady}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{error}</p>
                  {error.includes('inválido') || error.includes('expirado') ? (
                    <p className="mt-1 text-xs">
                      Por favor, solicite um novo link de recuperação na página de login.
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {/* Botão Redefinir Senha */}
            <button
              type="submit"
              disabled={loading || !sessionReady}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Redefinindo senha...</span>
              ) : (
                <>
                  <span>Redefinir senha</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Link para voltar ao login */}
            <button
              type="button"
              onClick={() => router.push('/auth')}
              className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium transition-all"
            >
              Voltar para o login
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          Ao redefinir sua senha, você poderá acessar sua conta normalmente
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-100 rounded-full mb-4">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/9179d525-92d6-4d5f-a6ee-6acb92a0dc66.png" 
                alt="Odrna Logo" 
                className="w-20 h-20 object-contain animate-pulse"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Carregando...</h1>
            <p className="text-gray-600">Aguarde um momento</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
