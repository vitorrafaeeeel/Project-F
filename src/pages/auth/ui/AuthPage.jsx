import { memo, useState } from 'react';
import { TrendingUp, Moon, Sun, Mail, Lock } from 'lucide-react';

export const AuthPage = memo(({ isDarkMode, setIsDarkMode, onSubmit, onPasswordReset, authLoading, authError, authSuccess }) => {
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const isSignup = mode === 'signup';

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ fullName, birthDate, cpf, email, phone, password, mode });
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <TrendingUp size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finanças Simplificadas</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Acesse seu painel financeiro</p>
              </div>

            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Alternar tema">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-6">
            <button type="button" onClick={() => setMode('login')} className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
              Entrar
            </button>
            <button type="button" onClick={() => setMode('signup')} className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome e sobrenome</label>
                  <input type="text" required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white" placeholder="Seu nome completo" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de nascimento</label>
                    <input type="date" required value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPF</label>
                    <input type="text" required inputMode="numeric" autoComplete="off" value={cpf} onChange={(event) => setCpf(event.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white" placeholder="000.000.000-00" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 pl-10 border bg-white" placeholder="voce@email.com" />
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numero de telefone</label>
                <input type="tel" required autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white" placeholder="(00) 00000-0000" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required minLength={6} autoComplete={isSignup ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 pl-10 border bg-white" placeholder="Minimo 6 caracteres" />
              </div>
            </div>

            {authError && (
              <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm text-green-700 dark:text-green-300">
                {authSuccess}
              </div>
            )}

            {!isSignup && (
              <button type="button" onClick={() => onPasswordReset(email)} disabled={authLoading} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-60">
                Esqueci minha senha
              </button>
            )}

            <button type="submit" disabled={authLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2 shadow-md">
              {authLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : (isSignup ? 'Criar minha conta' : 'Entrar na plataforma')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});
