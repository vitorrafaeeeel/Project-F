export const getAuthErrorMessage = (code) => {
  const messages = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado. Entre com sua senha.',
    'auth/invalid-email': 'Digite um e-mail válido.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/missing-email': 'Digite seu e-mail para recuperar a senha.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/operation-not-allowed': 'Ative o provedor Email/Password no Firebase Authentication.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
    'auth/api-key-not-valid': 'Chave da API do Firebase inválida. Verifique o arquivo .env.local ou as variáveis de ambiente da Vercel.',
    'auth/invalid-api-key': 'Chave da API do Firebase inválida. Verifique o arquivo .env.local ou as variáveis de ambiente da Vercel.',
    'auth/network-request-failed': 'Falha na conexão de rede. Verifique sua internet e tente novamente.'
  };
  return messages[code] || 'Não foi possível autenticar. Verifique suas credenciais e tente novamente.';
};

