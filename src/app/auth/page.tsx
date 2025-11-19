'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';

export default function AuthPage() {
  const router = useRouter();
  const { refreshUserData } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    if (!resetEmail) {
      setError('Digite seu email');
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        setError('Serviço de recuperação não disponível. Configure o Supabase.');
        setLoading(false);
        return;
      }

      // ✅ USAR APENAS O SUPABASE PARA ENVIAR E-MAIL DE RECUPERAÇÃO
      // O Supabase enviará um e-mail com link contendo token JWT
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: 'https://ordnalucasmarzullo.lasy.pro/reset-password',
      });

      if (resetError) {
        console.error('Erro ao enviar email de recuperação:', resetError);
        setError('Erro ao enviar email. Verifique se o email está correto.');
        setLoading(false);
        return;
      }

      // Sucesso - Supabase enviou o e-mail
      console.log('✅ E-mail de recuperação enviado pelo Supabase');
      setResetMessage('Enviamos um e-mail com instruções de redefinição. Verifique sua caixa de entrada.');
      
      // Voltar para login após 5 segundos
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 5000);

    } catch (err) {
      console.error('Erro ao recuperar senha:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validação básica
    if (!formData.email || !formData.password) {
      setError('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    if (!isLogin && !formData.name) {
      setError('Nome é obrigatório para cadastro');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // ========== LOGIN ==========
        // Sempre buscar dados do Supabase ao fazer login
        
        if (supabase) {
          try {
            // 1. Fazer login no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password,
            });

            if (authError) {
              console.error('Erro no login Supabase:', authError);
              setError('Email ou senha incorretos');
              setLoading(false);
              return;
            }

            // 2. Buscar dados do usuário na tabela users
            // Campos: id, email, nome, is_premium
            const { data: dbUser, error: dbError } = await supabase
              .from('users')
              .select('id, email, nome, is_premium')
              .eq('email', formData.email)
              .single();

            if (dbError) {
              console.error('Erro ao buscar usuário na tabela users:', dbError);
              setError('Erro ao carregar dados do usuário');
              setLoading(false);
              return;
            }

            // 3. Salvar localmente para manter sessão
            const user = {
              id: dbUser.id || authData.user?.id || Date.now().toString(),
              name: dbUser.nome || formData.email.split('@')[0],
              email: formData.email,
              password: formData.password,
              createdAt: new Date().toISOString(),
            };

            localStorage.setItem('odrna_current_user', JSON.stringify(user));
            
            // 4. Atualizar contexto global com dados do Supabase
            // Isso vai buscar: id, email, nome, is_premium
            await refreshUserData();
            
            console.log('✅ Login realizado com sucesso');
            router.push('/');
          } catch (err) {
            console.error('Erro no login:', err);
            setError('Erro ao fazer login. Tente novamente.');
            setLoading(false);
          }
        } else {
          // Fallback para localStorage se Supabase não configurado
          const users = JSON.parse(localStorage.getItem('odrna_users') || '[]');
          const user = users.find((u: any) => u.email === formData.email && u.password === formData.password);
          
          if (user) {
            localStorage.setItem('odrna_current_user', JSON.stringify(user));
            await refreshUserData();
            router.push('/');
          } else {
            setError('Email ou senha incorretos');
            setLoading(false);
          }
        }
      } else {
        // ========== CADASTRO ==========
        
        if (!formData.name || !formData.email || !formData.password) {
          setError('Preencha todos os campos');
          setLoading(false);
          return;
        }

        const users = JSON.parse(localStorage.getItem('odrna_users') || '[]');
        const existingUser = users.find((u: any) => u.email === formData.email);
        
        if (existingUser) {
          setError('Este email já está em uso');
          setLoading(false);
          return;
        }

        // 1. Criar usuário no Supabase Auth
        if (supabase) {
          try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
              email: formData.email,
              password: formData.password,
            });

            if (authError) {
              console.error('Erro ao criar usuário no Supabase Auth:', authError);
              setError('Erro ao criar conta. Tente novamente.');
              setLoading(false);
              return;
            }

            console.log('✅ Usuário criado no Supabase Auth');

            // 2. Criar entrada na tabela users do Supabase
            // Campos: email, nome, is_premium (padrão: false)
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  email: formData.email,
                  nome: formData.name,
                  is_premium: false
                }
              ]);

            if (insertError) {
              console.error('Erro ao criar usuário na tabela users:', insertError);
              setError('Erro ao salvar dados do usuário');
              setLoading(false);
              return;
            }
            
            console.log('✅ Usuário criado na tabela users');
          } catch (err) {
            console.error('Erro ao criar usuário:', err);
            setError('Erro ao criar conta. Tente novamente.');
            setLoading(false);
            return;
          }
        }

        // 3. Criar usuário localmente
        const newUser = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          password: formData.password,
          createdAt: new Date().toISOString(),
        };
        
        users.push(newUser);
        localStorage.setItem('odrna_users', JSON.stringify(users));
        localStorage.setItem('odrna_current_user', JSON.stringify(newUser));
        
        // 4. Atualizar contexto global (vai buscar do Supabase)
        await refreshUserData();
        
        console.log('✅ Cadastro realizado com sucesso');
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao processar autenticação:', error);
      setError('Erro inesperado. Tente novamente.');
      setLoading(false);
    }
  };

  // Modal de Esqueceu a Senha
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-cyan-600 to-blue-700">
        <div className="w-full max-w-md">
          {/* Logo e Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-2xl mb-4">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/dc950168-8616-4b25-98ec-a492901ea4ee.jpg" 
                alt="ORDNA Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Recuperar Senha</h1>
            <p className="text-white/80">Digite seu email para receber o link de recuperação</p>
          </div>

          {/* Card de Recuperação */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {resetMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {resetMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <span>Enviar link de recuperação</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                  setError('');
                  setResetMessage('');
                }}
                className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium transition-all"
              >
                Voltar para o login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-cyan-600 to-blue-700">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-2xl mb-4">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/dc950168-8616-4b25-98ec-a492901ea4ee.jpg" 
              alt="ORDNA Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ORDNA</h1>
          <p className="text-white/80">Organize sua vida de forma simples</p>
        </div>

        {/* Card de Autenticação */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Toggle Login/Signup */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                isLogin
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                !isLogin
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Carregando...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Entrar' : 'Criar conta'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Link alternativo */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? (
              <p>
                Não tem uma conta?{' '}
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Cadastre-se grátis
                </button>
              </p>
            ) : (
              <p>
                Já tem uma conta?{' '}
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Faça login
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          Ao continuar, você concorda com nossos Termos e Política de Privacidade
        </p>
      </div>
    </div>
  );
}
