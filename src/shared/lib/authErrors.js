export const getAuthErrorMessage = (code) => {
  const messages = {
    'auth/email-already-in-use': 'Este e-mail ja esta cadastrado. Entre com sua senha.',
    'auth/invalid-email': 'Digite um e-mail valido.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'Usuario nao encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/missing-email': 'Digite seu e-mail para recuperar a senha.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/operation-not-allowed': 'Ative o provedor Email/Password no Firebase Authentication.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.'
  };
  return messages[code] || 'Nao foi possivel autenticar. Tente novamente.';
};
