import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { 
  Plus, Trash2, TrendingUp, DollarSign, Wallet, 
  LayoutDashboard, Receipt, PiggyBank, ArrowDownCircle, ArrowUpCircle, Calendar, Coins, X,
  BarChart3, ArrowRight, ArrowDownRight, ArrowUpRight, Settings, Moon, Sun, CalendarDays,
  ChevronLeft, ChevronRight, Edit, Sparkles, Bot, Wand2, Edit2, Pencil, LogOut, Mail, Lock
} from 'lucide-react';

// --- FIREBASE CONFIGURATION ---
const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY || googleApiKey;
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || googleApiKey;
const geminiModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: "project-f-77ed8.firebaseapp.com",
  projectId: "project-f-77ed8",
  storageBucket: "project-f-77ed8.firebasestorage.app",
  messagingSenderId: "261138589545",
  appId: "1:261138589545:web:e6eb19add3bfe6eb8c7ff8",
  measurementId: "G-ETLN1M012M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- DEFAULT DATA & CONSTANTS ---
const DEFAULT_DATA = {
  income: 1638.95,
  currentAccountBalance: 0,
  plannedBudget: 0,
  includeFixedInCurrentMonth: true,
  extraIncomes: [],
  expenses: [],
  investments: []
};

const categoryConfig = {
  casa: { label: 'Casa', color: 'bg-blue-500' },
  alimentacao: { label: 'Alimentação', color: 'bg-orange-500' },
  transporte: { label: 'Transporte', color: 'bg-gray-600' },
  lazer: { label: 'Lazer', color: 'bg-pink-500' },
  saude: { label: 'Saúde', color: 'bg-green-500' },
  educacao: { label: 'Educação', color: 'bg-purple-500' },
  cartao_credito: { label: 'Cartão de Crédito', color: 'bg-indigo-500' },
  outros: { label: 'Outros', color: 'bg-gray-400' }
};

// --- HELPER FUNCTIONS ---
const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const getAuthErrorMessage = (code) => {
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

const getFirstName = (profile, user) => {
  const name = profile?.fullName || user?.displayName || user?.email || '';
  return name.trim().split(/\s+/)[0] || 'voce';
};

const callGeminiAPI = async (prompt, isJson = false) => {
  if (!geminiApiKey) {
    console.error("Configure VITE_GEMINI_API_KEY ou VITE_GOOGLE_API_KEY no ambiente.");
    return "";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`;
  const data = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  if (isJson) {
    data.generationConfig = { responseMimeType: "application/json" };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      // ISSO VAI MOSTRAR O ERRO REAL NO CONSOLE
      console.log("--- ERRO REAL DO GOOGLE ---");
      console.log("Status:", response.status);
      console.log("Mensagem:", result.error?.message);
      console.log("---------------------------");
      throw new Error(result.error?.message || "Erro na API");
    }

    return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Falha total na IA:", error.message);
    return "";
  }
};
// ============================================================================
// COMPONENTES MEMOIZADOS (OTIMIZAÇÃO DE PERFORMANCE PARA REDUZIR USO DE RAM)
// ============================================================================

const DashboardTab = memo(({ projections, data, aiInsight, aiInsightLoading, handleGenerateInsight }) => {
  if (!projections.currentMonthStats) return null;
  const maxChartValue = projections.timeline.length > 0 
    ? Math.max(...projections.timeline.map(t => Math.max(t.netBalance, t.totalInvestments, 0)))
    : 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Renda Total (Mês Atual)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(projections.currentMonthStats.monthTotalIncome)}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Fixo: {formatCurrency(data.income)} | Extras: {formatCurrency(projections.currentMonthStats.monthExtraIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gastos Totais (Mês Atual)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(projections.currentMonthStats.monthTotalExpenses)}</h3>
              <div className="flex flex-col gap-0.5 mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Fixos: {formatCurrency(projections.currentMonthStats.monthFixedExpenses)} | Variáveis: {formatCurrency(projections.currentMonthStats.monthVariableExpenses)}
                </p>
                {projections.prevMonthStats.totalExpenses > 0 && (
                  <div className={`flex items-center gap-1 text-[10px] font-medium ${
                    projections.currentMonthStats.monthTotalExpenses > projections.prevMonthStats.totalExpenses ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {projections.currentMonthStats.monthTotalExpenses > projections.prevMonthStats.totalExpenses ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{Math.abs(((projections.currentMonthStats.monthTotalExpenses - projections.prevMonthStats.totalExpenses) / projections.prevMonthStats.totalExpenses) * 100).toFixed(1)}% vs Mês Passado</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
              <ArrowDownCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual em Conta</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                {formatCurrency(data.currentAccountBalance || 0)}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              <Wallet size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* AI ADVISOR */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 shadow-sm border border-blue-100 dark:border-blue-800/30 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-full shadow-md">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">Consultor Inteligente ✨</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300/80">Análise baseada nos seus dados deste mês com Inteligência Artificial.</p>
            </div>
          </div>
          {!aiInsight && !aiInsightLoading && (
            <button
              onClick={() => handleGenerateInsight(projections.currentMonthStats)}
              className="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <Bot size={18} /> Gerar Insight
            </button>
          )}
        </div>

        {aiInsightLoading && (
          <div className="mt-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800/50 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">A IA está analisando suas finanças...</span>
          </div>
        )}

        {aiInsight && !aiInsightLoading && (
          <div className="mt-4 p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-blue-100 dark:border-blue-800/50">
            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed italic">"{aiInsight}"</p>
            <div className="mt-3 text-right">
              <button onClick={() => handleGenerateInsight(projections.currentMonthStats)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Gerar nova análise
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ALERTA DE ORÇAMENTO */}
      {data.plannedBudget > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">🎯 Planejamento de Gastos (Mês Atual)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Você gastou {formatCurrency(projections.currentMonthStats.monthTotalExpenses)} de um limite de {formatCurrency(data.plannedBudget)}</p>
            </div>
            <div className="text-right">
              <span className={`text-xl font-bold ${
                (projections.currentMonthStats.monthTotalExpenses / data.plannedBudget) >= 1 ? 'text-red-600 dark:text-red-400' :
                (projections.currentMonthStats.monthTotalExpenses / data.plannedBudget) >= 0.8 ? 'text-orange-500' : 'text-green-600 dark:text-green-400'
              }`}>
                {((projections.currentMonthStats.monthTotalExpenses / data.plannedBudget) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-4 overflow-hidden flex">
            <div 
              className={`h-3 transition-all duration-500 ${
                (projections.currentMonthStats.monthTotalExpenses / data.plannedBudget) >= 1 ? 'bg-red-500' :
                (projections.currentMonthStats.monthTotalExpenses / data.plannedBudget) >= 0.8 ? 'bg-orange-500' : 'bg-green-500'
              }`} 
              style={{ width: `${Math.min((projections.currentMonthStats.monthTotalExpenses / data.plannedBudget) * 100, 100)}%` }}
            ></div>
          </div>

          {data.plannedBudget > projections.currentMonthStats.monthTotalExpenses && (
            <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30 transition-colors duration-300">
              {(() => {
                const today = new Date().getDate();
                const daysRemaining = Math.max(1, projections.daysInCurrentMonth - today + 1); 
                const remainingBudget = data.plannedBudget - projections.currentMonthStats.monthTotalExpenses;
                const safeDaily = remainingBudget / daysRemaining;
                const safeWeekly = safeDaily * 7;
                return (
                  <>
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Para não estourar o limite nestes {daysRemaining} dias que faltam, você pode gastar:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-xs text-blue-600 dark:text-blue-400">Por Semana (aprox.)</p><p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(safeWeekly)}</p></div>
                      <div><p className="text-xs text-blue-600 dark:text-blue-400">Por Dia</p><p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(safeDaily)}</p></div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2"><BarChart3 size={16} className="text-blue-500" /> Gastos por Dia (Mês Atual)</h4>
              <div className="h-28 flex items-end gap-1 relative w-full mt-2">
                  {(() => {
                      const dailyTarget = data.plannedBudget / projections.daysInCurrentMonth;
                      const maxDailyVal = Math.max(dailyTarget * 1.5, ...projections.dailySpending.map(d => d.amount));
                      const safeMax = maxDailyVal > 0 ? maxDailyVal : 1;
                      const budgetLinePct = (dailyTarget / safeMax) * 100;
                      return (
                          <div className="absolute left-0 w-full border-t border-dashed border-red-400 dark:border-red-600 z-0 flex items-end justify-end" style={{ bottom: `${Math.min(budgetLinePct, 100)}%` }}>
                              <span className="text-[10px] text-red-500 bg-white dark:bg-gray-800 px-1 -translate-y-1/2 rounded">Média Ideal/Dia</span>
                          </div>
                      );
                  })()}
                  {projections.dailySpending.map((dayData, idx) => {
                      const dailyTarget = data.plannedBudget / projections.daysInCurrentMonth;
                      const maxVal = Math.max(dailyTarget * 1.5, ...projections.dailySpending.map(d => d.amount));
                      const safeMax = maxVal > 0 ? maxVal : 1;
                      const heightPct = (dayData.amount / safeMax) * 100;
                      return (
                          <div key={idx} className="flex-1 flex flex-col justify-end items-center relative group z-10 h-full">
                               {dayData.amount > 0 && (
                                 <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg transition-opacity">
                                    Dia {dayData.day}<br/>{formatCurrency(dayData.amount)}
                                 </div>
                               )}
                               <div className={`w-full max-w-[12px] rounded-t-[2px] transition-all duration-300 ${dayData.amount > dailyTarget ? 'bg-red-400 dark:bg-red-500' : 'bg-blue-400 dark:bg-blue-500'}`} style={{ height: `${Math.min(heightPct, 100)}%` }}></div>
                          </div>
                      )
                  })}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                  <span>Dia 1</span><span>Dia 15</span><span>Dia {projections.daysInCurrentMonth}</span>
              </div>
          </div>
        </div>
      )}

      {/* Evolutivo Chart & Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" /> Evolução Projetada (12 Meses)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A projeção assume que nos meses futuros você atingirá o seu Planejamento de Gastos.</p>
        </div>
        <div className="p-6 overflow-x-auto">
          <div className="min-w-[600px] h-64 flex items-end gap-2 pb-6 relative">
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 pr-2 border-r border-gray-200 dark:border-gray-700 w-16 text-right">
              <span>{formatCurrency(maxChartValue).split(',')[0]}</span>
              <span>{formatCurrency(maxChartValue / 2).split(',')[0]}</span>
              <span>R$ 0</span>
            </div>
            <div className="ml-16 flex-1 flex items-end justify-between h-full relative">
              <div className="absolute w-full h-px bg-gray-200 dark:bg-gray-700 bottom-0"></div>
              {projections.timeline.map((point, idx) => {
                const safeMax = maxChartValue || 1;
                const balanceHeight = Math.max(0, (point.netBalance / safeMax) * 100);
                const investHeight = Math.max(0, (point.totalInvestments / safeMax) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    <div className="flex gap-1 items-end h-[200px] w-full justify-center relative">
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded p-2 z-10 whitespace-nowrap pointer-events-none shadow-lg">
                        <p className="font-bold mb-1">{point.label}</p>
                        <p>Conta: {formatCurrency(point.netBalance)}</p>
                        <p>Patrimônio: {formatCurrency(point.totalInvestments)}</p>
                      </div>
                      <div className={`w-1/3 max-w-[20px] rounded-t-sm transition-all duration-500 ${point.netBalance >= 0 ? 'bg-blue-400 dark:bg-blue-500' : 'bg-red-400 dark:bg-red-500'}`} style={{ height: `${balanceHeight}%` }}></div>
                      <div className="w-1/3 max-w-[20px] bg-green-400 dark:bg-green-500 rounded-t-sm transition-all duration-500" style={{ height: `${investHeight}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{point.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-sm"></div><span>Saldo na Conta (Parado)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 dark:bg-green-500 rounded-sm"></div><span>Patrimônio (Investimentos)</span></div>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3">Mês</th>
                <th className="px-6 py-3 text-right">Fluxo do Mês (Conta)</th>
                <th className="px-6 py-3 text-right">Saldo na Conta (Parado)</th>
                <th className="px-6 py-3 text-right">Patrimônio Total (Investimentos)</th>
              </tr>
            </thead>
            <tbody>
              {projections.timeline.map((point, idx) => (
                <tr key={idx} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {point.label}
                    {idx === 0 && <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-300">Atual</span>}
                  </td>
                  <td className={`px-6 py-4 text-right font-medium ${point.appliedMonthlyBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                    {idx === 0 ? '-' : formatCurrency(point.appliedMonthlyBalance)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(point.netBalance)}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(point.totalAssets)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

const CalendarTab = memo(({ calendarData, calendarOffset, setCalendarOffset, setEditExpenseModal, setEditIncomeModal }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="text-blue-500" /> Calendário Financeiro
        </h3>
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
          <button onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 1))} disabled={calendarOffset === 0} className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 disabled:opacity-30 transition-colors shadow-sm disabled:shadow-none">
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-sm text-gray-800 dark:text-white min-w-[130px] text-center uppercase tracking-wide">
            {calendarData.monthName} {calendarData.year}
          </span>
          <button onClick={() => setCalendarOffset(Math.min(11, calendarOffset + 1))} disabled={calendarOffset === 11} className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 disabled:opacity-30 transition-colors shadow-sm disabled:shadow-none">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-gray-50 dark:bg-gray-800 text-center py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{day}</div>
        ))}
        {calendarData.grid.map((cell, idx) => {
          let dailyIncome = 0, dailyExpense = 0;
          (cell.events || []).forEach(ev => {
              if (ev.type === 'income') dailyIncome += ev.amount;
              if (ev.type === 'expense') dailyExpense += ev.amount;
          });
          const dailyBalance = dailyIncome - dailyExpense;
          return (
          <div key={idx} className={`bg-white dark:bg-gray-900 min-h-[100px] p-2 flex flex-col transition-colors group relative ${!cell.day ? 'bg-gray-50 dark:bg-gray-800/30' : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}>
            {cell.day && (
              <>
                <div className="absolute z-50 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded p-2 shadow-xl border border-gray-700 dark:border-gray-300">
                   <p className="font-bold border-b border-gray-700 dark:border-gray-300 pb-1 mb-1">Resumo do Dia {cell.day}</p>
                   <p className="text-green-400 dark:text-green-600">Entradas: +{formatCurrency(dailyIncome)}</p>
                   <p className="text-red-400 dark:text-red-600">Saídas: -{formatCurrency(dailyExpense)}</p>
                   <p className={`font-semibold mt-1 pt-1 border-t border-gray-700 dark:border-gray-300 ${dailyBalance >= 0 ? 'text-blue-400 dark:text-blue-600' : 'text-orange-400 dark:text-orange-600'}`}>Saldo do Dia: {formatCurrency(dailyBalance)}</p>
                </div>
                <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col">
                        {dailyExpense > 0 && <span className="text-[10px] text-red-500 font-semibold leading-tight">-{formatCurrency(dailyExpense).replace('R$','')}</span>}
                        {dailyIncome > 0 && <span className="text-[10px] text-green-500 font-semibold leading-tight">+{formatCurrency(dailyIncome).replace('R$','')}</span>}
                    </div>
                    <span className={`text-xs font-bold text-right mb-1 ${cell.day === new Date().getDate() && calendarOffset === 0 ? 'text-white bg-blue-500 w-5 h-5 flex items-center justify-center rounded-full self-end' : 'text-gray-500 dark:text-gray-400'}`}>{cell.day}</span>
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto hide-scrollbar flex-1 relative z-10">
                  {cell.events.map((ev, eIdx) => (
                    <div key={eIdx} className={`group/event text-[10px] px-1.5 py-1 rounded font-medium relative ${ev.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                      <div className="truncate pr-4">
                        {ev.type === 'income' ? '+' : '-'} {formatCurrency(ev.amount).replace('R$', '').trim()}
                        <span className="block opacity-75 font-normal truncate">{ev.desc}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (ev.type === 'expense') setEditExpenseModal({ isOpen: true, data: ev.raw });
                          if (ev.type === 'income') setEditIncomeModal({ isOpen: true, data: ev.raw });
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/50 hidden group-hover/event:block transition-colors"
                      ><Pencil size={10} /></button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )})}
      </div>
    </div>
  );
});

const ExpensesTab = memo(({ data, expenseFilter, setExpenseFilter, filteredImpact, filteredExpenses, setEditIncomeModal, handleDeleteExtraIncome, setEditExpenseModal, handleDeleteExpense }) => {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de Transações</h3>
            <div className="mt-3">
              <select value={expenseFilter} onChange={(e) => setExpenseFilter(e.target.value)} className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white py-1.5 px-3 border text-sm cursor-pointer bg-white dark:bg-gray-700">
                <option value="all">Mostrar Todos</option>
                <optgroup label="Por Tipo"><option value="credit">Só Crédito</option><option value="fixed">Fixos</option><option value="variable">Variáveis</option></optgroup>
                <optgroup label="Por Categoria">
                  <option value="casa">Casa</option><option value="alimentacao">Alimentação</option><option value="transporte">Transporte</option><option value="lazer">Lazer</option><option value="saude">Saúde</option><option value="educacao">Educação</option><option value="cartao_credito">Cartão de Crédito</option><option value="outros">Outros</option>
                </optgroup>
              </select>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 w-full lg:w-auto">
             <div className="text-sm px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium w-full text-center lg:w-auto">
              {expenseFilter === 'all' ? 'Impacto este Mês: ' : 'Impacto do Filtro: '} {formatCurrency(filteredImpact)}
             </div>
          </div>
        </div>
        
        {(data.extraIncomes || []).length > 0 && expenseFilter === 'all' && (
          <div className="bg-green-50/50 dark:bg-green-900/10 border-b border-gray-100 dark:border-gray-700">
            <div className="px-6 py-2 text-xs font-semibold text-green-600 dark:text-green-500 uppercase tracking-wider">Receitas</div>
            <ul className="divide-y divide-green-100 dark:divide-green-900/30">
              {(data.extraIncomes || []).map(extra => {
                const isPending = extra.appliedToBalance === false;
                return (
                <li key={extra.id} className="p-4 flex items-center justify-between hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${isPending ? 'bg-green-300 dark:bg-green-700' : 'bg-green-500'}`}></div>
                    <div>
                       <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">{extra.desc}{isPending && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Agendado</span>}</p>
                       <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                         <span className="text-xs text-green-600 dark:text-green-400 font-medium">Entrada</span>
                         {extra.date && <span className="text-[10px] flex items-center gap-1 text-gray-400 ml-1"><Calendar size={10} /> {formatDate(extra.date)}</span>}
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="font-semibold text-green-600 dark:text-green-400">+{formatCurrency(extra.amount)}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditIncomeModal({ isOpen: true, data: { ...extra } })} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteExtraIncome(extra.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </li>
              )})}
            </ul>
          </div>
        )}

        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400"><Receipt className="mx-auto h-12 w-12 opacity-20 mb-3" /><p>Nenhum gasto encontrado.</p></div>
        ) : (
          <>
            <div className="px-6 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">Saídas e Gastos</div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredExpenses.map((expense) => {
                const [ey, em] = expense.date ? expense.date.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
                const monthsSincePurchase = (new Date().getFullYear() - ey) * 12 + (new Date().getMonth() - (em - 1));
                const isFutureInstallment = expense.installments > 1 && monthsSincePurchase < expense.installments;
                const currentInstallment = monthsSincePurchase + 1;
                const cat = categoryConfig[expense.category] || categoryConfig['outros'];
                const isPending = expense.appliedToBalance === false;

                return (
                <li key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${isPending ? 'bg-gray-300 dark:bg-gray-600' : cat.color}`}></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {expense.desc}
                        {isFutureInstallment && <span className="text-[10px] flex items-center gap-1 text-orange-600 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-400 px-2 py-0.5 rounded-full font-semibold"><ArrowRight size={10} /> Parcela {Math.max(1, currentInstallment)}/{expense.installments}</span>}
                        {isPending && <span className="text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 px-2 py-0.5 rounded-full">Agendado</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{cat.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">• {expense.type === 'fixed' ? 'Fixo' : 'Variável'} • {expense.paymentMethod === 'credit' ? ' Crédito' : expense.paymentMethod === 'debit' ? ' Débito' : expense.paymentMethod === 'cash' ? ' Dinheiro' : ' PIX'}{expense.deductedFromBalance && !isPending && <span className="text-blue-500 font-medium ml-1"> (Descontado)</span>}</span>
                        {expense.date && <span className="text-[10px] flex items-center gap-1 text-gray-400 ml-1"><Calendar size={10} /> {formatDate(expense.date)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(expense.amount)}</span>
                      {expense.installments > 1 && <p className="text-xs text-gray-500 dark:text-gray-400">{expense.installments}x de {formatCurrency(expense.amount / expense.installments)}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditExpenseModal({ isOpen: true, data: { ...expense } })} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
});

const InvestmentsTab = memo(({ data, projections, setEditInvModal, setDepositModal, handleDeleteInvestment }) => {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meus Investimentos</h3>
            <div className="text-sm mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium inline-block">
              Metas de Aporte: {formatCurrency(projections.totalInvestmentMonthly)} / mês
            </div>
          </div>
        </div>
        
        {!(data.investments && data.investments.length > 0) ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <PiggyBank className="mx-auto h-16 w-16 opacity-20 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Nenhum investimento registrado.</p>
            <p className="text-sm mt-1">Comece a planear o seu futuro adicionando as suas metas pelo botão azul (+).</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr><th className="px-6 py-3">Descrição</th><th className="px-6 py-3 text-right">Saldo Atual</th><th className="px-6 py-3 text-right">Meta (Simulador)</th><th className="px-6 py-3 text-center">Taxa/Mês</th><th className="px-6 py-3 text-center">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div>{inv.desc}</td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">{formatCurrency(inv.currentBalance)}</td>
                    <td className="px-6 py-4 text-right font-medium text-blue-600 dark:text-blue-400">{formatCurrency(inv.monthlyAmount)}</td>
                    <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">{(inv.interestRate * 100).toFixed(2)}%</td>
                  <td className="px-6 py-4 text-center flex justify-center gap-2">
                    <button onClick={() => setEditInvModal({ isOpen: true, id: inv.id, desc: inv.desc, monthlyAmount: inv.monthlyAmount, interestRate: inv.interestRate * 100 })} className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-600 rounded-md transition-colors flex items-center gap-1" title="Editar Meta"><Edit size={16} /></button>
                    <button onClick={() => setDepositModal({ isOpen: true, invId: inv.id, amount: '' })} className="p-2 text-green-600 hover:text-white hover:bg-green-600 bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-600 rounded-md transition-colors flex items-center gap-1" title="Fazer Aporte"><Coins size={16} /> <span className="text-xs font-semibold hidden sm:inline">Aportar</span></button>
                    <button onClick={() => handleDeleteInvestment(inv.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Remover"><Trash2 size={18} /></button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});


const AuthScreen = memo(({ isDarkMode, setIsDarkMode, onSubmit, onPasswordReset, authLoading, authError, authSuccess }) => {
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financas Plus</h1>
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


// ============================================================================
// COMPONENTE PRINCIPAL (ORQUESTRADOR)
// ============================================================================

export default function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startupError, setStartupError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [calendarOffset, setCalendarOffset] = useState(0);
  const [expenseFilter, setExpenseFilter] = useState('all');

  const [modalType, setModalType] = useState(null); 
  const [fabOpen, setFabOpen] = useState(false);
  const [depositModal, setDepositModal] = useState({ isOpen: false, invId: null, amount: '' });
  const [editInvModal, setEditInvModal] = useState({ isOpen: false, id: null, desc: '', monthlyAmount: '', interestRate: '' });
  const [editExpenseModal, setEditExpenseModal] = useState({ isOpen: false, data: null });
  const [editIncomeModal, setEditIncomeModal] = useState({ isOpen: false, data: null });

  const [newExpense, setNewExpense] = useState({ desc: '', amount: '', type: 'variable', date: getTodayDate(), paymentMethod: 'pix', installments: 1, deductFromBalance: true, category: 'alimentacao' });
  const [newExtraIncome, setNewExtraIncome] = useState({ desc: '', amount: '', date: getTodayDate() });
  const [newInvestment, setNewInvestment] = useState({ desc: '', monthlyAmount: '', currentBalance: '', interestRate: '0.8' });
  const [editIncome, setEditIncome] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editBudget, setEditBudget] = useState('');

  const [aiInsight, setAiInsight] = useState('');
  const [aiInsightLoading, setAiInsightLoading] = useState(false);
  const [aiSmartInput, setAiSmartInput] = useState('');
  const [aiSmartLoading, setAiSmartLoading] = useState(false);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (!firebaseApiKey) {
      setStartupError('Configure VITE_FIREBASE_API_KEY ou VITE_GOOGLE_API_KEY no arquivo .env.local e reinicie o servidor.');
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthError('');
      setAuthSuccess('');
      setStartupError('');

      if (currentUser) {
        setData(null);
        setProfile(null);
        setLoading(true);
      } else {
        setData(null);
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const financeRef = doc(db, 'artifacts', appId, 'users', user.uid, 'finances', 'main');
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profiles', 'main');
    let financeLoaded = false;
    let profileLoaded = false;
    const finishLoading = () => {
      if (financeLoaded && profileLoaded) setLoading(false);
    };

    const unsubscribeFinance = onSnapshot(financeRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const dbData = docSnap.data();
          setData(dbData);
          setEditIncome(dbData.income?.toString() || '0');
          setEditBalance((dbData.currentAccountBalance || 0).toString());
          setEditBudget((dbData.plannedBudget || 0).toString());
        } else {
          setDoc(financeRef, DEFAULT_DATA);
          setData(DEFAULT_DATA);
        }
        financeLoaded = true;
        finishLoading();
      },
      (error) => {
        console.error("Error fetching data: ", error);
        setStartupError(error.message || 'Nao foi possivel carregar os dados do Firebase.');
        setLoading(false);
      }
    );

    const unsubscribeProfile = onSnapshot(profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          const fallbackProfile = {
            fullName: user.displayName || '',
            email: user.email || '',
            birthDate: '',
            cpf: '',
            phone: '',
            createdAt: new Date().toISOString()
          };
          setDoc(profileRef, fallbackProfile, { merge: true });
          setProfile(fallbackProfile);
        }
        profileLoaded = true;
        finishLoading();
      },
      (error) => {
        console.error("Error fetching profile: ", error);
        setStartupError(error.message || 'Nao foi possivel carregar o perfil do usuario.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribeFinance();
      unsubscribeProfile();
    };
  }, [user]);

  const handleAuthSubmit = useCallback(async ({ fullName, birthDate, cpf, email, phone, password, mode }) => {
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const profileRef = doc(db, 'artifacts', appId, 'users', userCredential.user.uid, 'profiles', 'main');
        await setDoc(profileRef, {
          fullName: fullName.trim(),
          birthDate,
          cpf: cpf.trim(),
          email: email.trim(),
          phone: phone.trim(),
          createdAt: new Date().toISOString()
        }, { merge: true });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      console.error('Auth form error:', error);
      setAuthError(getAuthErrorMessage(error.code));
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handlePasswordReset = useCallback(async (email) => {
    setAuthError('');
    setAuthSuccess('');

    if (!email.trim()) {
      setAuthError(getAuthErrorMessage('auth/missing-email'));
      return;
    }

    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAuthSuccess('Enviamos um link de redefinicao para o seu e-mail.');
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthError(getAuthErrorMessage(error.code));
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setAuthError('');
    setAuthSuccess('');
    setStartupError('');
    setModalType(null);
    setFabOpen(false);
    await signOut(auth);
  }, []);

  // Efetivação de transações no background
  useEffect(() => {
    if (!data) return;
    const today = getTodayDate();
    let needsUpdate = false;
    let updatedBalance = data.currentAccountBalance || 0;

    const updatedIncomes = (data.extraIncomes || []).map(inc => {
      if (inc.appliedToBalance === false && inc.date <= today) {
        updatedBalance += inc.amount; needsUpdate = true; return { ...inc, appliedToBalance: true };
      }
      return inc;
    });

    const updatedExpenses = (data.expenses || []).map(exp => {
      if (exp.deductedFromBalance && exp.appliedToBalance === false && exp.date <= today) {
        updatedBalance -= exp.amount; needsUpdate = true; return { ...exp, appliedToBalance: true };
      }
      return exp;
    });

    if (needsUpdate && user) {
      setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'finances', 'main'), { 
        currentAccountBalance: updatedBalance, extraIncomes: updatedIncomes, expenses: updatedExpenses
      }, { merge: true });
    }
  }, [data, user]);

  const updateData = useCallback(async (newData) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'finances', 'main');
    await setDoc(docRef, newData, { merge: true });
  }, [user]);

  // Funções envolvidas com useCallback para evitar re-renderizações desnecessárias das Abas
  const handleDeleteExtraIncome = useCallback((id) => {
    const currentExtras = data.extraIncomes || [];
    const incomeToDelete = currentExtras.find(e => e.id === id);
    let updatedBalance = data.currentAccountBalance || 0;
    if (incomeToDelete && (incomeToDelete.appliedToBalance === true || incomeToDelete.appliedToBalance === undefined)) {
        updatedBalance -= incomeToDelete.amount;
    }
    updateData({ extraIncomes: currentExtras.filter(e => e.id !== id), currentAccountBalance: updatedBalance });
  }, [data, updateData]);

  const handleDeleteExpense = useCallback((id) => {
    const expToDelete = (data.expenses || []).find(e => e.id === id);
    let updatedBalance = data.currentAccountBalance || 0;
    if (expToDelete && expToDelete.deductedFromBalance && (expToDelete.appliedToBalance === true || expToDelete.appliedToBalance === undefined)) {
        updatedBalance += expToDelete.amount;
    }
    updateData({ expenses: (data.expenses || []).filter(e => e.id !== id), currentAccountBalance: updatedBalance });
  }, [data, updateData]);

  const handleDeleteInvestment = useCallback((id) => {
    updateData({ investments: (data.investments || []).filter(i => i.id !== id) });
  }, [data, updateData]);

  const handleGenerateInsight = useCallback(async (currentMonthStats) => {
    setAiInsightLoading(true);
    try {
      const prompt = `Você é um consultor financeiro virtual inteligente.
      Dados atuais: Renda: ${currentMonthStats.monthTotalIncome}, Orçamento: ${data.plannedBudget}, Gastos Totais: ${currentMonthStats.monthTotalExpenses}, Saldo: ${data.currentAccountBalance}.
      Forneça um insight financeiro encorajador em português, 2 frases. Se gastar muito, alerte suavemente.`;
      const response = await callGeminiAPI(prompt, false);
      setAiInsight(response);
    } catch (e) {
      setAiInsight("Não foi possível gerar um insight no momento.");
    } finally {
      setAiInsightLoading(false);
    }
  }, [data]);

  const handleSmartExpense = async () => {
    if (!aiSmartInput.trim()) return;
    setAiSmartLoading(true);
    try {
      const prompt = `Extraia despesa do texto e retorne JSON estrito: "${aiSmartInput}". Chaves: desc (string), amount (number), category (alimentacao, casa, transporte, lazer, saude, educacao, cartao_credito, outros), paymentMethod (pix, debit, cash, credit), type (variable, fixed).`;
      const responseText = await callGeminiAPI(prompt, true);
      const parsed = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
      setNewExpense({ ...newExpense, desc: parsed.desc || '', amount: parsed.amount?.toString() || '', category: parsed.category || 'outros', paymentMethod: parsed.paymentMethod || 'pix', type: parsed.type || 'variable' });
      setAiSmartInput(''); 
    } catch (e) { console.error(e); } finally { setAiSmartLoading(false); }
  };

  const handleUpdateAccount = () => {
    const newIncome = parseFloat(editIncome.replace(',', '.'));
    const newBalance = parseFloat(editBalance.replace(',', '.'));
    const newBudget = parseFloat(editBudget.replace(',', '.'));
    if (!isNaN(newIncome) && newIncome >= 0 && !isNaN(newBalance) && !isNaN(newBudget)) {
      updateData({ income: newIncome, currentAccountBalance: newBalance, plannedBudget: newBudget });
      setModalType(null);
    }
  };

  const handleAddExtraIncome = (e) => {
    e.preventDefault();
    const amount = parseFloat(newExtraIncome.amount.replace(',', '.'));
    if (!newExtraIncome.desc || isNaN(amount) || amount <= 0) return;
    const dateStr = newExtraIncome.date || getTodayDate();
    const isFuture = dateStr > getTodayDate();
    const newIncome = { id: crypto.randomUUID(), desc: newExtraIncome.desc, amount, date: dateStr, appliedToBalance: !isFuture };
    let newBalance = data.currentAccountBalance || 0;
    if (!isFuture) newBalance += amount;
    updateData({ extraIncomes: [...(data.extraIncomes || []), newIncome], currentAccountBalance: newBalance });
    setNewExtraIncome({ desc: '', amount: '', date: getTodayDate() });
    setModalType(null);
  };

  const handleUpdateExtraIncome = (e) => {
    e.preventDefault();
    const amount = parseFloat(String(editIncomeModal.data.amount).replace(',', '.'));
    if (!editIncomeModal.data.desc || isNaN(amount) || amount <= 0) return;
    const oldIncome = (data.extraIncomes || []).find(i => i.id === editIncomeModal.data.id);
    if (!oldIncome) return;
    let newBalance = data.currentAccountBalance || 0;
    if (oldIncome.appliedToBalance === true || oldIncome.appliedToBalance === undefined) newBalance -= oldIncome.amount;
    const dateStr = editIncomeModal.data.date || getTodayDate();
    const isFuture = dateStr > getTodayDate();
    if (!isFuture) newBalance += amount;
    const updatedIncome = { ...oldIncome, desc: editIncomeModal.data.desc, amount, date: dateStr, appliedToBalance: !isFuture };
    updateData({ extraIncomes: data.extraIncomes.map(i => i.id === updatedIncome.id ? updatedIncome : i), currentAccountBalance: newBalance });
    setEditIncomeModal({ isOpen: false, data: null });
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const amount = parseFloat(newExpense.amount.replace(',', '.'));
    if (!newExpense.desc || isNaN(amount) || amount <= 0) return;
    const dateStr = newExpense.date || getTodayDate();
    const isFuture = dateStr > getTodayDate();
    const isCredit = newExpense.paymentMethod === 'credit';
    const doDeduct = !isCredit && newExpense.deductFromBalance; 
    const willDeductNow = doDeduct && !isFuture;
    const expense = {
      id: crypto.randomUUID(), desc: newExpense.desc, amount, type: newExpense.type, date: dateStr,
      paymentMethod: newExpense.paymentMethod, installments: isCredit ? parseInt(newExpense.installments) || 1 : 1,
      deductedFromBalance: doDeduct, appliedToBalance: willDeductNow ? true : (doDeduct ? false : true), category: newExpense.category
    };
    let newBalance = data.currentAccountBalance || 0;
    if (willDeductNow) newBalance -= amount;
    updateData({ expenses: [...(data.expenses || []), expense], currentAccountBalance: newBalance });
    setNewExpense({ desc: '', amount: '', type: 'variable', date: getTodayDate(), paymentMethod: 'pix', installments: 1, deductFromBalance: true, category: 'alimentacao' });
    setModalType(null);
  };

  const handleUpdateExpense = (e) => {
    e.preventDefault();
    const amount = parseFloat(String(editExpenseModal.data.amount).replace(',', '.'));
    if (!editExpenseModal.data.desc || isNaN(amount) || amount <= 0) return;
    const oldExpense = (data.expenses || []).find(ex => ex.id === editExpenseModal.data.id);
    if (!oldExpense) return;
    let newBalance = data.currentAccountBalance || 0;
    if (oldExpense.deductedFromBalance && (oldExpense.appliedToBalance === true || oldExpense.appliedToBalance === undefined)) newBalance += oldExpense.amount;
    const dateStr = editExpenseModal.data.date || getTodayDate();
    const isFuture = dateStr > getTodayDate();
    const isCredit = editExpenseModal.data.paymentMethod === 'credit';
    const doDeduct = !isCredit && editExpenseModal.data.deductFromBalance;
    const willDeductNow = doDeduct && !isFuture;
    if (willDeductNow) newBalance -= amount;
    const updatedExpense = {
       ...oldExpense, desc: editExpenseModal.data.desc, amount, type: editExpenseModal.data.type, date: dateStr,
       paymentMethod: editExpenseModal.data.paymentMethod, installments: isCredit ? parseInt(editExpenseModal.data.installments) || 1 : 1,
       category: editExpenseModal.data.category, deductedFromBalance: doDeduct, appliedToBalance: willDeductNow ? true : (doDeduct ? false : true)
    };
    updateData({ expenses: data.expenses.map(ex => ex.id === updatedExpense.id ? updatedExpense : ex), currentAccountBalance: newBalance });
    setEditExpenseModal({ isOpen: false, data: null });
  };

  const handleAddInvestment = (e) => {
    e.preventDefault();
    const monthlyAmount = parseFloat(newInvestment.monthlyAmount.replace(',', '.'));
    const currentBalance = parseFloat(newInvestment.currentBalance.replace(',', '.')) || 0;
    const interestRate = parseFloat(newInvestment.interestRate.replace(',', '.')) || 0;
    if (!newInvestment.desc || isNaN(monthlyAmount) || monthlyAmount < 0) return;
    const investment = { id: crypto.randomUUID(), desc: newInvestment.desc, monthlyAmount, currentBalance, interestRate: interestRate / 100 };
    updateData({ investments: [...(data.investments || []), investment] });
    setNewInvestment({ desc: '', monthlyAmount: '', currentBalance: '', interestRate: '0.8' });
    setModalType(null);
  };

  const handleMakeDeposit = (e) => {
    e.preventDefault();
    const depositAmount = parseFloat(depositModal.amount.replace(',', '.'));
    if (isNaN(depositAmount) || depositAmount <= 0) return;
    const updatedInvestments = (data.investments || []).map(inv => inv.id === depositModal.invId ? { ...inv, currentBalance: inv.currentBalance + depositAmount } : inv);
    updateData({ investments: updatedInvestments });
    setDepositModal({ isOpen: false, invId: null, amount: '' });
  };

  const handleUpdateInvestment = (e) => {
    e.preventDefault();
    const amount = parseFloat(String(editInvModal.monthlyAmount).replace(',', '.'));
    const rate = parseFloat(String(editInvModal.interestRate).replace(',', '.'));
    if (!editInvModal.desc || isNaN(amount) || amount < 0) return;
    const updatedInvestments = (data.investments || []).map(inv => inv.id === editInvModal.id ? { ...inv, desc: editInvModal.desc, monthlyAmount: amount, interestRate: isNaN(rate) ? inv.interestRate : rate / 100 } : inv);
    updateData({ investments: updatedInvestments });
    setEditInvModal({ isOpen: false, id: null, desc: '', monthlyAmount: '', interestRate: '' });
  };

  // --- COMPUTAÇÃO DE DADOS (MEMOIZADOS) ---
  const projections = useMemo(() => {
    if (!data) return null;
    const totalInvestmentMonthly = (data.investments || []).reduce((acc, curr) => acc + curr.monthlyAmount, 0);
    let currentAccumulatedBalance = data.currentAccountBalance || 0;
    let runningInvestments = (data.investments || []).map(inv => ({ ...inv }));

    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    let prevFixedExpenses = 0, prevVariableExpenses = 0;
    
    (data.expenses || []).forEach(exp => {
      const [ey, em] = exp.date ? exp.date.split('-').map(Number) : [prevYear, prevMonth + 1];
      const monthsSincePurchase = (prevYear - ey) * 12 + (prevMonth - (em - 1));
      const inst = exp.installments || 1;
      if (exp.type === 'fixed') {
        if (inst > 1) { if (monthsSincePurchase >= 0 && monthsSincePurchase < inst) prevFixedExpenses += (exp.amount / inst); } 
        else prevFixedExpenses += exp.amount;
      } else {
        if (monthsSincePurchase >= 0 && monthsSincePurchase < inst) prevVariableExpenses += (exp.amount / inst);
      }
    });

    const timeline = [];
    let currentMonthStats = null;
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyExpensesRaw = Array(daysInCurrentMonth).fill(0);

    for (let i = 0; i < 12; i++) {
      const monthIdx = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      
      let monthExtraIncome = 0;
      (data.extraIncomes || []).forEach(inc => {
        if (!inc.date) return;
        const [iy, im] = inc.date.split('-').map(Number);
        if (iy === year && (im - 1) === monthIdx) monthExtraIncome += inc.amount;
      });
      const monthTotalIncome = (data.income || 0) + monthExtraIncome;

      let monthFixedExpenses = 0, monthVariableExpenses = 0, expensesAlreadyDeducted = 0;

      (data.expenses || []).forEach(exp => {
        const [ey, em, ed] = exp.date ? exp.date.split('-').map(Number) : [currentYear, currentMonth + 1, 1];
        const monthsSincePurchase = (year - ey) * 12 + (monthIdx - (em - 1));
        const inst = exp.installments || 1;

        if (exp.type === 'fixed') {
          if (inst > 1) {
            if (monthsSincePurchase >= 0 && monthsSincePurchase < inst) {
              const instAmt = exp.amount / inst; monthFixedExpenses += instAmt;
              if (i === 0 && exp.deductedFromBalance && monthsSincePurchase === 0 && (exp.appliedToBalance === true || exp.appliedToBalance === undefined)) expensesAlreadyDeducted += instAmt;
              if (i === 0) dailyExpensesRaw[Math.min(ed, daysInCurrentMonth) - 1] += instAmt;
            }
          } else {
            monthFixedExpenses += exp.amount;
            if (i === 0 && exp.deductedFromBalance && monthsSincePurchase === 0 && (exp.appliedToBalance === true || exp.appliedToBalance === undefined)) expensesAlreadyDeducted += exp.amount;
            if (i === 0 && monthsSincePurchase === 0) dailyExpensesRaw[Math.min(ed, daysInCurrentMonth) - 1] += exp.amount;
          }
        } else {
          if (monthsSincePurchase >= 0 && monthsSincePurchase < inst) {
            const instAmt = exp.amount / inst; monthVariableExpenses += instAmt;
            if (i === 0 && exp.deductedFromBalance && monthsSincePurchase === 0 && (exp.appliedToBalance === true || exp.appliedToBalance === undefined)) expensesAlreadyDeducted += instAmt;
            if (i === 0) dailyExpensesRaw[Math.min(ed, daysInCurrentMonth) - 1] += instAmt;
          }
        }
      });
      
      const monthTotalExpenses = monthFixedExpenses + monthVariableExpenses;
      let projectedExpenses = i > 0 ? Math.max(monthTotalExpenses, data.plannedBudget || 0) : monthTotalExpenses;
      
      let appliedMonthlyBalance = 0;
      if (i === 0) {
        appliedMonthlyBalance = monthTotalIncome - monthTotalExpenses;
        currentAccumulatedBalance = data.currentAccountBalance || 0;
      } else {
        appliedMonthlyBalance = monthTotalIncome - projectedExpenses - totalInvestmentMonthly;
        currentAccumulatedBalance += appliedMonthlyBalance;
      }

      let monthTotalInvestments = 0;
      runningInvestments = runningInvestments.map(inv => {
        let newBalance = i === 0 ? inv.currentBalance * (1 + inv.interestRate) : (inv.currentBalance * (1 + inv.interestRate)) + inv.monthlyAmount;
        monthTotalInvestments += newBalance; return { ...inv, currentBalance: newBalance };
      });

      const point = { label: `${monthsNames[monthIdx]}/${year.toString().slice(-2)}`, netBalance: currentAccumulatedBalance, totalInvestments: monthTotalInvestments, totalAssets: monthTotalInvestments, appliedMonthlyBalance, monthTotalIncome, monthExtraIncome, monthFixedExpenses, monthVariableExpenses, monthTotalExpenses };
      timeline.push(point);
      if (i === 0) currentMonthStats = point; 
    }

    return {
      totalInvestmentMonthly, currentMonthStats, prevMonthStats: { totalExpenses: prevFixedExpenses + prevVariableExpenses },
      dailySpending: dailyExpensesRaw.map((val, idx) => ({ day: idx + 1, amount: val })), timeline,
      currentMonth, currentYear, daysInCurrentMonth
    };
  }, [data]);

  const calendarData = useMemo(() => {
    if (!data || !projections) return { grid: [], monthName: '', year: '' };
    const monthsNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const targetMonthRaw = projections.currentMonth + calendarOffset;
    const targetMonth = targetMonthRaw % 12;
    const targetYear = projections.currentYear + Math.floor(targetMonthRaw / 12);
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(targetYear, targetMonth, 1).getDay(); 
    
    const eventsByDay = {};
    const addEvent = (d, ev) => { const sd = Math.min(d, daysInMonth); if (!eventsByDay[sd]) eventsByDay[sd] = []; eventsByDay[sd].push(ev); };

    (data.extraIncomes || []).forEach(inc => {
        if (!inc.date) return; const [iy, im, id] = inc.date.split('-').map(Number);
        if (iy === targetYear && (im - 1) === targetMonth) addEvent(id, { type: 'income', desc: inc.desc, amount: inc.amount, raw: inc });
    });

    (data.expenses || []).forEach(exp => {
        if (!exp.date) return; const [ey, em, ed] = exp.date.split('-').map(Number);
        const msp = (targetYear - ey) * 12 + (targetMonth - (em - 1));
        const inst = exp.installments || 1;
        if (exp.type === 'fixed') {
            if (inst > 1) { if (msp >= 0 && msp < inst) addEvent(ed, { type: 'expense', desc: exp.desc, amount: exp.amount / inst, raw: exp }); } 
            else { if (msp >= 0) addEvent(ed, { type: 'expense', desc: exp.desc, amount: exp.amount, raw: exp }); }
        } else {
            if (msp >= 0 && msp < inst) addEvent(ed, { type: 'expense', desc: exp.desc, amount: exp.amount / inst, raw: exp });
        }
    });

    const grid = [];
    for (let i = 0; i < firstDayOfWeek; i++) grid.push({ day: null, events: [] });
    for (let day = 1; day <= daysInMonth; day++) grid.push({ day, events: eventsByDay[day] || [] });

    return { grid, monthName: monthsNames[targetMonth], year: targetYear };
  }, [data, projections, calendarOffset]);

  const filteredExpenses = useMemo(() => {
    if (!data?.expenses) return [];
    if (expenseFilter === 'all') return data.expenses;
    if (expenseFilter === 'credit') return data.expenses.filter(e => e.paymentMethod === 'credit');
    if (expenseFilter === 'fixed') return data.expenses.filter(e => e.type === 'fixed');
    if (expenseFilter === 'variable') return data.expenses.filter(e => e.type === 'variable');
    return data.expenses.filter(e => e.category === expenseFilter);
  }, [data?.expenses, expenseFilter]);

  const filteredImpact = useMemo(() => {
    let impact = 0;
    if (!projections) return 0;
    filteredExpenses.forEach(exp => {
        const [ey, em] = exp.date ? exp.date.split('-').map(Number) : [projections.currentYear, projections.currentMonth + 1];
        const msp = (projections.currentYear - ey) * 12 + (projections.currentMonth - (em - 1));
        const inst = exp.installments || 1;
        if (exp.type === 'fixed') {
             if (inst > 1) { if (msp >= 0 && msp < inst) impact += (exp.amount / inst); } 
             else impact += exp.amount;
        } else if (msp >= 0 && msp < inst) impact += (exp.amount / inst);
    });
    return impact;
  }, [filteredExpenses, projections]);

  const firstName = getFirstName(profile, user);

  // --- RENDER ---
  if (startupError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6">
        <div className="w-full max-w-lg rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Nao foi possivel iniciar o app</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {startupError}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Verifique o arquivo .env.local e reinicie o servidor com npm run dev.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onSubmit={handleAuthSubmit}
        onPasswordReset={handlePasswordReset}
        authLoading={authLoading}
        authError={authError}
        authSuccess={authSuccess}
      />
    );
  }

  if (!data || !projections) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative pb-20 transition-colors duration-300">
        
        {/* HEADER */}
        <header className="bg-white dark:bg-gray-800 shadow relative z-10 transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <TrendingUp size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finanças Plus</h1>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex-nowrap transition-colors duration-300 min-w-max">
                <button onClick={() => setActiveTab('dashboard')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                  <LayoutDashboard size={18} /> <span className="hidden sm:inline">Resumo</span>
                </button>
                <button onClick={() => setActiveTab('expenses')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'expenses' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                  <Receipt size={18} /> <span className="hidden sm:inline">Transações</span>
                </button>
                <button onClick={() => setActiveTab('calendar')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'calendar' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                  <CalendarDays size={18} /> <span className="hidden sm:inline">Calendário</span>
                </button>
                <button onClick={() => setActiveTab('investments')} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'investments' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
                  <PiggyBank size={18} /> <span className="hidden sm:inline">Investimentos</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[180px] truncate">Ola, {firstName}</p>
                </div>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Alternar Tema">
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={() => setModalType('settings')} className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Configurações">
                  <Settings size={20} />
                </button>
                <button onClick={handleLogout} className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors" title="Sair">
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {activeTab === 'dashboard' && <DashboardTab projections={projections} data={data} aiInsight={aiInsight} aiInsightLoading={aiInsightLoading} handleGenerateInsight={handleGenerateInsight} />}
          {activeTab === 'calendar' && <CalendarTab calendarData={calendarData} calendarOffset={calendarOffset} setCalendarOffset={setCalendarOffset} setEditExpenseModal={setEditExpenseModal} setEditIncomeModal={setEditIncomeModal} />}
          {activeTab === 'expenses' && <ExpensesTab data={data} expenseFilter={expenseFilter} setExpenseFilter={setExpenseFilter} filteredImpact={filteredImpact} filteredExpenses={filteredExpenses} setEditIncomeModal={setEditIncomeModal} handleDeleteExtraIncome={handleDeleteExtraIncome} setEditExpenseModal={setEditExpenseModal} handleDeleteExpense={handleDeleteExpense} />}
          {activeTab === 'investments' && <InvestmentsTab data={data} projections={projections} setEditInvModal={setEditInvModal} setDepositModal={setDepositModal} handleDeleteInvestment={handleDeleteInvestment} />}
        </main>

        {/* --- QUICK ACTIONS FAB --- */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
          {fabOpen && (
            <div className="flex flex-col gap-3 items-end mb-2 transition-all duration-200">
              <button onClick={() => { setModalType('income'); setFabOpen(false); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-green-700 transition-colors font-medium">
                 Nova Receita <ArrowUpCircle size={18} />
              </button>
              <button onClick={() => { setModalType('expense'); setFabOpen(false); }} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-red-700 transition-colors font-medium">
                 Novo Gasto <Receipt size={18} />
              </button>
              <button onClick={() => { setModalType('investment'); setFabOpen(false); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors font-medium">
                 Novo Investimento <PiggyBank size={18} />
              </button>
            </div>
          )}
          <button onClick={() => setFabOpen(!fabOpen)} className={`bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-transform duration-300 flex items-center justify-center ${fabOpen ? 'rotate-45' : 'rotate-0'}`}>
            <Plus size={28} />
          </button>
        </div>

        {/* --- UNIFIED MODALS --- */}
        {modalType && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              <button onClick={() => setModalType(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-full p-1"><X size={20} /></button>

              {modalType === 'settings' && (
                 <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"><Settings className="text-blue-500" /> Dados da Conta</h3>
                    <div className="space-y-4">
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Renda Mensal Fixa (R$)</label><input type="number" step="0.01" value={editIncome} onChange={(e) => setEditIncome(e.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Saldo Atual em Conta (R$)</label><input type="number" step="0.01" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Limite Planejado de Gastos/Mês (R$)</label><input type="number" step="0.01" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                      <button onClick={handleUpdateAccount} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors">Guardar Alterações</button>
                    </div>
                 </div>
              )}

              {modalType === 'income' && (
                 <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"><ArrowUpCircle className="text-green-500" /> Adicionar Receita</h3>
                    <form onSubmit={handleAddExtraIncome} className="space-y-4">
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label><input type="text" required placeholder="Ex: Freelance, Vendas..." autoFocus value={newExtraIncome.desc} onChange={(e) => setNewExtraIncome({...newExtraIncome, desc: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label><input type="number" step="0.01" required min="0.01" placeholder="0.00" value={newExtraIncome.amount} onChange={(e) => setNewExtraIncome({...newExtraIncome, amount: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label><input type="date" required value={newExtraIncome.date} onChange={(e) => setNewExtraIncome({...newExtraIncome, date: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                      </div>
                      <button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2"><Plus size={18} /> Adicionar à Conta</button>
                    </form>
                 </div>
              )}

              {modalType === 'expense' && (
                 <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"><Receipt className="text-red-500" /> Adicionar Gasto</h3>
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
                      <label className="block text-xs font-semibold text-purple-800 dark:text-purple-300 mb-2 uppercase tracking-wide flex items-center gap-1"><Wand2 size={14} /> Preenchimento Mágico ✨</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Ex: Gastei 50 reais de mercado no crédito" value={aiSmartInput} onChange={(e) => setAiSmartInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSmartExpense())} className="w-full rounded-md border-purple-200 dark:border-purple-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-800 dark:text-white p-2.5 border text-sm"/>
                        <button type="button" onClick={handleSmartExpense} disabled={aiSmartLoading || !aiSmartInput.trim()} className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-3 py-2 rounded-md transition-colors flex items-center justify-center min-w-[44px]">
                          {aiSmartLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Sparkles size={18} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1.5 leading-tight">Descreva o gasto e a IA preencherá o formulário automaticamente.</p>
                    </div>
                    <form onSubmit={handleAddExpense} className="space-y-4">
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label><input type="text" required placeholder="Ex: Aluguel, Mercado..." autoFocus value={newExpense.desc} onChange={(e) => setNewExpense({...newExpense, desc: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label><input type="number" step="0.01" required min="0.01" placeholder="0.00" value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label><select value={newExpense.type} onChange={(e) => setNewExpense({...newExpense, type: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"><option value="variable">Variável (Pontual)</option><option value="fixed">Fixo (Recorrente)</option></select></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pagamento</label><select value={newExpense.paymentMethod} onChange={(e) => setNewExpense({...newExpense, paymentMethod: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"><option value="pix">PIX</option><option value="debit">Débito</option><option value="cash">Dinheiro</option><option value="credit">Crédito</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label><input type="date" required value={newExpense.date} onChange={(e) => setNewExpense({...newExpense, date: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                          <select value={newExpense.category} onChange={(e) => setNewExpense({...newExpense, category: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700">
                            <option value="alimentacao">Alimentação / Mercado</option><option value="casa">Casa / Moradia</option><option value="transporte">Transporte / Veículo</option><option value="lazer">Lazer / Viagens</option><option value="saude">Saúde / Farmácia</option><option value="educacao">Educação / Cursos</option><option value="cartao_credito">Cartão de Crédito / Fatura</option><option value="outros">Outros</option>
                          </select>
                      </div>
                      {newExpense.paymentMethod === 'credit' && (
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parcelas</label><input type="number" min="1" max="48" value={newExpense.installments} onChange={(e) => setNewExpense({...newExpense, installments: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
                      )}
                      {newExpense.paymentMethod !== 'credit' && (
                        <div className="pt-1"><label className="flex items-start gap-3 cursor-pointer group bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors hover:border-red-300 dark:hover:border-red-700"><input type="checkbox" checked={newExpense.deductFromBalance} onChange={(e) => setNewExpense({...newExpense, deductFromBalance: e.target.checked})} className="mt-0.5 rounded w-4 h-4 text-red-600 focus:ring-red-500 bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"/><span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">Descontar do Saldo Atual (Ocultará no futuro caso a data escolhida for posterior a de hoje)</span></label></div>
                      )}
                      <button type="submit" className="w-full mt-4 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2 shadow-md"><Plus size={18} /> Registrar Gasto</button>
                    </form>
                 </div>
              )}

              {modalType === 'investment' && (
                 <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"><PiggyBank className="text-blue-500" /> Novo Investimento</h3>
                    <form onSubmit={handleAddInvestment} className="space-y-4">
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome / Objetivo</label><input type="text" required placeholder="Ex: Tesouro Selic, Reserva..." autoFocus value={newInvestment.desc} onChange={(e) => setNewInvestment({...newInvestment, desc: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta de Aporte Mensal (Simulador)</label><input type="number" step="0.01" required min="0" placeholder="0.00" value={newInvestment.monthlyAmount} onChange={(e) => setNewInvestment({...newInvestment, monthlyAmount: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Saldo Inicial</label><input type="number" step="0.01" min="0" placeholder="0.00" value={newInvestment.currentBalance} onChange={(e) => setNewInvestment({...newInvestment, currentBalance: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rendimento (%/mês)</label><input type="number" step="0.01" placeholder="0.8" value={newInvestment.interestRate} onChange={(e) => setNewInvestment({...newInvestment, interestRate: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                      </div>
                      <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2"><Plus size={18} /> Criar Investimento</button>
                    </form>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* MODAIS DE EDIÇÃO DE TRANSAÇÕES */}
        {editExpenseModal.isOpen && editExpenseModal.data && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              <button onClick={() => setEditExpenseModal({ isOpen: false, data: null })} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-full p-1"><X size={20} /></button>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Edit className="text-blue-500" /> Editar Gasto</h3>
              <form onSubmit={handleUpdateExpense} className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label><input type="text" required autoFocus value={editExpenseModal.data.desc} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, desc: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label><input type="number" step="0.01" required min="0.01" value={editExpenseModal.data.amount} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, amount: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label><select value={editExpenseModal.data.type} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, type: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"><option value="variable">Variável (Pontual)</option><option value="fixed">Fixo (Recorrente)</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pagamento</label><select value={editExpenseModal.data.paymentMethod} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, paymentMethod: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"><option value="pix">PIX</option><option value="debit">Débito</option><option value="cash">Dinheiro</option><option value="credit">Crédito</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label><input type="date" required value={editExpenseModal.data.date} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, date: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                      <select value={editExpenseModal.data.category} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, category: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700">
                        <option value="alimentacao">Alimentação / Mercado</option><option value="casa">Casa / Moradia</option><option value="transporte">Transporte / Veículo</option><option value="lazer">Lazer / Viagens</option><option value="saude">Saúde / Farmácia</option><option value="educacao">Educação / Cursos</option><option value="cartao_credito">Cartão de Crédito / Fatura</option><option value="outros">Outros</option>
                      </select>
                  </div>
                  {editExpenseModal.data.paymentMethod === 'credit' && (
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parcelas</label><input type="number" min="1" max="48" value={editExpenseModal.data.installments} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, installments: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2.5 border bg-white dark:bg-gray-700"/></div>
                  )}
                  {editExpenseModal.data.paymentMethod !== 'credit' && (
                    <div className="pt-1"><label className="flex items-start gap-3 cursor-pointer group bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors hover:border-blue-300 dark:hover:border-blue-700"><input type="checkbox" checked={editExpenseModal.data.deductFromBalance} onChange={(e) => setEditExpenseModal({...editExpenseModal, data: {...editExpenseModal.data, deductFromBalance: e.target.checked}})} className="mt-0.5 rounded w-4 h-4 text-blue-600 focus:ring-blue-500 bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"/><span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">Descontar do Saldo Atual</span></label></div>
                  )}
                  <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2 shadow-md">Guardar Alterações</button>
              </form>
            </div>
          </div>
        )}

        {editIncomeModal.isOpen && editIncomeModal.data && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-700">
              <button onClick={() => setEditIncomeModal({ isOpen: false, data: null })} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-full p-1"><X size={20} /></button>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Edit className="text-blue-500" /> Editar Receita</h3>
              <form onSubmit={handleUpdateExtraIncome} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label><input type="text" required autoFocus value={editIncomeModal.data.desc} onChange={(e) => setEditIncomeModal({...editIncomeModal, data: {...editIncomeModal.data, desc: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label><input type="number" step="0.01" required min="0.01" value={editIncomeModal.data.amount} onChange={(e) => setEditIncomeModal({...editIncomeModal, data: {...editIncomeModal.data, amount: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label><input type="date" required value={editIncomeModal.data.date} onChange={(e) => setEditIncomeModal({...editIncomeModal, data: {...editIncomeModal.data, date: e.target.value}})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                </div>
                <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2">Guardar Alterações</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL APORTE/EDITAR INVESTIMENTOS AQUI */}
        {depositModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-700">
              <button onClick={() => setDepositModal({ isOpen: false, invId: null, amount: '' })} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-full p-1"><X size={20} /></button>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Coins className="text-green-500" /> Fazer Aporte</h3>
              <form onSubmit={handleMakeDeposit} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor do Aporte (R$)</label><input type="number" step="0.01" required min="0.01" value={depositModal.amount} onChange={(e) => setDepositModal({...depositModal, amount: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white p-3 border text-lg bg-white dark:bg-gray-700" autoFocus/></div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">Confirmar</button>
              </form>
            </div>
          </div>
        )}

        {editInvModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-700">
              <button onClick={() => setEditInvModal({ isOpen: false, id: null, desc: '', monthlyAmount: '', interestRate: '' })} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-700 rounded-full p-1"><X size={20} /></button>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Edit className="text-blue-500" /> Editar Investimento</h3>
              <form onSubmit={handleUpdateInvestment} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome / Objetivo</label><input type="text" required value={editInvModal.desc} onChange={(e) => setEditInvModal({...editInvModal, desc: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Meta (R$/mês)</label><input type="number" step="0.01" required min="0" value={editInvModal.monthlyAmount} onChange={(e) => setEditInvModal({...editInvModal, monthlyAmount: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rendimento (%/mês)</label><input type="number" step="0.01" value={editInvModal.interestRate} onChange={(e) => setEditInvModal({...editInvModal, interestRate: e.target.value})} className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-3 border bg-white dark:bg-gray-700"/></div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">Guardar Alterações</button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
