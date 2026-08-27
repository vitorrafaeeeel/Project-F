# Finanças Plus

Painel financeiro pessoal em React: renda, gastos (fixos/variáveis, parcelados no crédito), receitas extras, investimentos, calendário financeiro e projeção de 12 meses. Autenticação e persistência via Firebase (Auth + Firestore), com um recurso opcional de IA (Google Gemini) para insights e preenchimento automático de gastos a partir de texto livre.

## Stack

- **React 19** + **Vite 8** (`@vitejs/plugin-react`)
- **Tailwind CSS 4** (`@tailwindcss/vite`, dark mode via classe `.dark`)
- **Firebase** — Authentication (e-mail/senha) e Firestore (dados do usuário)
- **Google Gemini API** (`generativelanguage.googleapis.com`) — opcional, para os recursos de IA
- **lucide-react** para ícones
- **ESLint 10** (flat config) com `eslint-plugin-react-hooks` e `eslint-plugin-react-refresh`

## Pré-requisitos

- Node.js e npm
- Um projeto Firebase com **Authentication** (provedor Email/Senha) e **Firestore** ativados
- (Opcional) uma chave de API do Google AI Studio para os recursos de IA

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env.local` e preencha as chaves:
   ```bash
   VITE_GOOGLE_API_KEY=sua_chave_google_aqui
   # Opcional: separe as chaves se tiverem restrições diferentes no Google Cloud
   VITE_FIREBASE_API_KEY=sua_chave_firebase_aqui
   VITE_GEMINI_API_KEY=sua_chave_gemini_aqui
   VITE_GEMINI_MODEL=gemini-2.5-flash
   ```
   Sem `VITE_FIREBASE_API_KEY` (ou `VITE_GOOGLE_API_KEY` como fallback), o app não inicializa e exibe uma tela de erro pedindo a configuração.
   O restante da configuração do Firebase (authDomain, projectId etc.) já está fixo em `src/shared/api/firebase/client.js` — troque esses valores se for usar um projeto Firebase diferente.
3. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```
4. Build de produção / preview / lint:
   ```bash
   npm run build
   npm run preview
   npm run lint
   ```

## Arquitetura

O código-fonte segue **Feature-Sliced Design (FSD)**. Veja [`CLAUDE.md`](./CLAUDE.md) para o detalhamento completo das camadas, decisões de modelagem e convenções do projeto.

```
src/
├── app/         # composição raiz (App.jsx) e bootstrap de sessão
├── pages/        # telas por rota/aba (auth, dashboard, calendário, transações, investimentos)
├── widgets/      # blocos de UI compostos (header, FAB de ações rápidas)
├── features/     # ações do usuário (autenticação, gerenciar gasto/receita/investimento, tema, IA)
├── entities/     # domínio (finance, expense, user) — dados e regras de negócio
└── shared/       # infra sem regra de negócio (Firebase, Gemini, formatação, config de env)
```

## Modelo de dados (Firestore)

Cada usuário autenticado possui dois documentos:

- `artifacts/{appId}/users/{uid}/finances/main` — renda fixa, saldo em conta, orçamento planejado, receitas extras, gastos e investimentos (documento único; toda mutação é um merge parcial nele).
- `artifacts/{appId}/users/{uid}/profiles/main` — dados cadastrais (nome, nascimento, CPF, telefone).

## Observações conhecidas

- `src/App.css` e os arquivos em `src/assets/` são resíduos do template inicial do Vite e não são referenciados por nenhum componente.
- Há uma inconsistência de nomes pré-existente entre o campo usado no modal de edição de gasto (`deductFromBalance`) e o campo persistido no gasto (`deductedFromBalance`); isso é anterior a esta reorganização e não foi alterado.
