# CLAUDE.md

Guia para trabalhar neste repositório. O app é o "Finanças Plus": dashboard financeiro pessoal (React 19 + Vite + Tailwind 4 + Firebase), originalmente escrito como um único `App.jsx` de ~1600 linhas e reorganizado em **Feature-Sliced Design (FSD)**.

## Comandos

```bash
npm run dev       # servidor de desenvolvimento (Vite)
npm run build     # build de produção
npm run preview   # servir o build
npm run lint      # ESLint (flat config, eslint-plugin-react-hooks incluso)
```

Não há suite de testes configurada neste projeto (`package.json` não tem script `test`). Ao alterar lógica de cálculo (projeções, calendário, filtros), valide manualmente — não existe rede de segurança automatizada.

## Arquitetura (FSD)

```
src/
├── app/
│   ├── App.jsx                     # composição raiz: decide o que renderizar (erro/loading/auth/shell)
│   └── model/useSession.js         # onAuthStateChanged + checagem de env var obrigatória
├── pages/
│   ├── auth/ui/AuthPage.jsx        # tela de login/criar conta (memo, estado local do formulário)
│   ├── dashboard/ui/DashboardPage.jsx
│   ├── calendar/ui/CalendarPage.jsx
│   ├── expenses/ui/ExpensesPage.jsx
│   └── investments/ui/InvestmentsPage.jsx
├── widgets/
│   ├── header/ui/Header.jsx        # navegação por abas, tema, configurações, logout
│   └── quick-actions-fab/ui/QuickActionsFab.jsx
├── features/
│   ├── auth/model/useAuthActions.js            # login, criar conta, reset de senha
│   ├── theme/model/useTheme.js                 # dark mode (classe `.dark` no <html>)
│   ├── manage-expense/{model,ui}                # CRUD de gastos + modais
│   ├── manage-income/{model,ui}                 # CRUD de receitas extras + modais
│   ├── manage-investment/{model,ui}             # CRUD de investimentos + aporte + modais
│   ├── account-settings/{model,ui}              # editar renda fixa / dia de recebimento / saldo / orçamento
│   ├── manage-category-budgets/{model,ui}       # orçamento (envelope) por categoria — categoryBudgets[]
│   ├── ai-insight/model/useAiInsight.js          # "Consultor Inteligente" (Gemini)
│   └── ai-smart-expense/model/useSmartExpense.js # "Preenchimento Mágico" de gasto via texto livre (Gemini)
├── entities/
│   ├── finance/
│   │   ├── model/  # constants (DEFAULT_DATA), api (doc ref + write), useFinanceDoc, useAutoSettle
│   │   └── lib/     # computeProjections, computeCalendarData, computeFilteredExpenses/Impact, computeCategoryUsage, autoSettle
│   ├── expense/model/categories.js  # categoryConfig (label + cor por categoria)
│   └── user/
│       └── model/   # api (profile doc ref), useProfile, getFirstName
└── shared/
    ├── api/firebase/client.js  # initializeApp/getAuth/getFirestore + appId
    ├── api/gemini/client.js    # callGeminiAPI
    ├── config/env.js           # leitura das VITE_* env vars
    └── lib/                    # date.js, currency.js, authErrors.js
```

### Por que `entities/finance` é uma fatia só (e não `expense`/`income`/`investment` separados)

Firestore guarda **um único documento** (`artifacts/{appId}/users/{uid}/finances/main`) com `income`, `incomePaymentDay`, `currentAccountBalance`, `plannedBudget`, `extraIncomes[]`, `expenses[]`, `investments[]`, `categoryBudgets[]`. Toda escrita é um `setDoc(ref, patch, { merge: true })` nesse mesmo documento, e várias mutações são **cross-entity**: excluir um gasto ajusta `currentAccountBalance`; adicionar uma receita também. Por isso:

- `incomePaymentDay` (1–31) é só para exibição: o `entities/finance/lib/calendar.js` usa esse dia para desenhar um evento sintético de salário no Calendário. Ele **nunca** credita `currentAccountBalance` automaticamente — diferente de `extraIncomes[]`, que é debitado/creditado no momento do cadastro/edição/exclusão (ver `features/manage-income`). Se um dia quiser que o salário passe a afetar o saldo automaticamente no dia do pagamento, isso precisa de uma lógica de "settle" nova (similar a `entities/finance/lib/autoSettle.js`), não é gratuito.
- `expenses[]` pode ter um campo opcional `items: [{id, desc, amount, category}]` (uma "fatura" com sub-itens, ex: fatura de R$100 = R$50 gasolina + R$50 almoço). Quando presente, `amount` do gasto é sempre a soma dos itens — as UIs (`AddExpenseModal`/`EditExpenseModal`) tornam o campo Valor somente leitura nesse modo. `computeFilteredExpenses`/`computeFilteredImpact` (`entities/finance/lib/filters.js`) e `computeCategoryUsage` (`entities/finance/lib/categoryUsage.js`) sabem ratear o valor de uma fatura entre as categorias dos seus itens; `computeProjections` (projections.js) não precisa saber disso porque só soma `amount` total, que já vem correto.
- `categoryBudgets[]` (`[{category, amount}]`, gerido por `features/manage-category-budgets`) são orçamentos/envelopes por categoria (ex: R$100 para lazer, R$100 para saúde), independentes do `plannedBudget` geral. É sempre gravado como **array substituído por inteiro**, nunca como mapa — `setDoc(..., {merge:true})` faz merge raso de mapas, então remover uma chave de um mapa não a apagaria no Firestore.

- `entities/finance` é dona do documento: doc ref, `updateFinanceData`, `DEFAULT_DATA`, hook de assinatura (`useFinanceDoc`) e os cálculos puros (`lib/`).
- `entities/expense` existe só para o dado estático `categoryConfig` (label + cor) — sem lógica de escrita.
- Todo handler que **muta saldo/lista** (adicionar, editar, excluir gasto/receita/investimento) vive em `features/manage-*`, que recebe `data` e `updateData` de `entities/finance` e nunca escreve diretamente no Firestore por conta própria.

Se for adicionar uma nova entidade de domínio que também mexe em `currentAccountBalance`, siga o mesmo padrão: leitura/escrita centralizadas em `entities/finance`, regra de negócio específica em `features/`.

### Cálculos movidos "byte a byte"

`entities/finance/lib/projections.js`, `calendar.js` e `filters.js` são a extração literal dos três `useMemo` que existiam no `App.jsx` original (projeção de 12 meses, grade do calendário, filtro de transações). Não há testes cobrindo essa lógica — ela tem casos de borda sutis (parcelamento, `monthsSincePurchase`, o tratamento especial do mês `i === 0`, `dailyExpensesRaw[Math.min(ed, daysInCurrentMonth) - 1]`). **Ao mexer nessas funções, prefira o menor diff possível** e teste manualmente cenários com parcelas, gastos fixos recorrentes e receitas agendadas para o futuro.

### Estado de sessão e loading

`app/model/useSession.js` assina `onAuthStateChanged` (a menos que falte `VITE_FIREBASE_API_KEY`/`VITE_GOOGLE_API_KEY`, caso em que nunca assina e expõe `envError`). `entities/finance/model/useFinanceDoc.js` e `entities/user/model/useProfile.js` assinam os dois documentos do Firestore de forma independente, cada um expondo seu próprio `*Loaded`/`*Error`. `app/App.jsx` combina os três num único `loading`/`startupError`, reproduzindo o comportamento original (esperar os dois documentos carregarem, mas cair rápido se qualquer um deles errar).

Esses hooks resetam seu próprio estado quando `user` muda usando o padrão React de "ajustar estado durante o render" (comparar com um `trackedUser` guardado em `useState` e chamar `setState` fora de `useEffect`), não dentro de um `useEffect`. Isso é proposital: fazer o reset dentro do corpo de um `useEffect` dispara o lint `react-hooks/set-state-in-effect`. Se precisar adicionar mais um reset desse tipo, siga o mesmo padrão em vez de um `useEffect` com `setState` direto no corpo.

### Composição de features entre si

Features não importam uma da outra. Quando uma feature precisa do estado de outra (ex.: `ai-smart-expense` precisa escrever no formulário de `manage-expense`), a composição acontece em `app/App.jsx`, que passa o setter de uma como prop/parâmetro da outra. Ver `useSmartExpense(newExpense, setNewExpense)` em `App.jsx`.

### Modais

Cada modal (`Add*Modal`, `Edit*Modal`, `SettingsModal`, `DepositModal`) é um componente próprio dentro do `ui/` da sua feature, com o backdrop e o botão de fechar duplicados inline — igual ao arquivo original. Isso foi deliberado: não introduzimos um componente `Modal` genérico compartilhado para não adicionar uma abstração que o código-fonte original não tinha. Se for extrair um `shared/ui/Modal.jsx` no futuro, é uma decisão de refatoração separada, não parte da reorganização em FSD.

## Pontos de atenção conhecidos (pré-existentes, não corrigidos nesta reorganização)

- **`deductFromBalance` vs `deductedFromBalance`**: `features/manage-expense/ui/EditExpenseModal.jsx` lê/escreve `editExpenseModal.data.deductFromBalance`, mas o campo persistido no gasto é `deductedFromBalance` (ver `entities` — o objeto vem de `{...expense}` em `ExpensesPage`). Ao abrir "Editar Gasto" para um gasto existente, o checkbox provavelmente aparece desmarcado independentemente do valor real. Bug pré-existente no arquivo original; preservado como estava.
- `src/App.css` e `src/assets/*` são sobras do template Vite e não são importados por nada.
- `npm run lint` ainda acusa 3 erros pré-existentes (não introduzidos por esta reorganização): um `set-state-in-effect` no branch de env var ausente (`app/model/useSession.js`), e duas variáveis de `entities/finance/lib/projections.js` (`expensesAlreadyDeducted` não usada, `appliedMonthlyBalance` sobrescrita sem uso) — fazem parte da lógica original de projeção e foram preservadas byte a byte.

## Estilo e convenções

- Todo o domínio e os textos de UI são em **pt-BR** (mensagens de erro do Firebase, labels, categorias). Mantenha esse idioma em novo código voltado ao usuário.
- Tailwind com dark mode via classe (`darkMode: 'class'`); o componente raiz aplica `className={isDarkMode ? 'dark' : ''}` no wrapper mais externo — não existe um `ThemeProvider` de contexto.
- Sem TypeScript, sem gerenciador de estado global (Redux/Zustand) — o estado vive em hooks por feature/entidade e é passado via props a partir de `app/App.jsx`.
