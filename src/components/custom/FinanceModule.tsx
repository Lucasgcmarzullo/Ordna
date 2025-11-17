'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign, Crown, AlertCircle } from 'lucide-react';
import { Transaction, FREE_PLAN_LIMITS } from '@/lib/types';
import { getTransactions, saveTransactions } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';

export default function FinanceModule() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const { isPremium } = useUser();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '' as 'alimentacao' | 'transporte' | 'saude' | 'lazer' | 'salario' | 'outros' | '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const canAddTransaction = () => {
    if (isPremium) return true;
    return transactions.length < FREE_PLAN_LIMITS.TRANSACTIONS;
  };

  const handleAddClick = () => {
    if (!canAddTransaction()) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 3000);
      return;
    }
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!formData.description.trim() || !formData.amount || !formData.category) return;

    if (editingId) {
      const updated = transactions.map(transaction =>
        transaction.id === editingId
          ? { ...transaction, description: formData.description, amount: parseFloat(formData.amount), type: formData.type, category: formData.category as 'alimentacao' | 'transporte' | 'saude' | 'lazer' | 'salario' | 'outros', date: formData.date }
          : transaction
      );
      setTransactions(updated);
      saveTransactions(updated);
      setEditingId(null);
    } else {
      if (!canAddTransaction()) {
        setShowLimitWarning(true);
        setTimeout(() => setShowLimitWarning(false), 3000);
        return;
      }

      const newTransaction: Transaction = {
        id: Date.now().toString(),
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category as 'alimentacao' | 'transporte' | 'saude' | 'lazer' | 'salario' | 'outros',
        date: formData.date,
        createdAt: new Date().toISOString(),
      };
      const updated = [...transactions, newTransaction];
      setTransactions(updated);
      saveTransactions(updated);
      setIsAdding(false);
    }

    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    });
  };

  const handleDelete = (id: string) => {
    const updated = transactions.filter(transaction => transaction.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const categoryLabels: Record<'alimentacao' | 'transporte' | 'saude' | 'lazer' | 'salario' | 'outros', string> = {
    alimentacao: 'Alimentação',
    transporte: 'Transporte',
    saude: 'Saúde',
    lazer: 'Lazer',
    salario: 'Salário',
    outros: 'Outros',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Finanças</h2>
          {!isPremium && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {transactions.length}/{FREE_PLAN_LIMITS.TRANSACTIONS} transações usadas (Plano Free)
            </p>
          )}
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      {showLimitWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Limite do Plano Free Atingido
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Você atingiu o limite de {FREE_PLAN_LIMITS.TRANSACTIONS} transações. Faça upgrade para Premium e tenha transações ilimitadas!
            </p>
          </div>
          <Crown className="w-5 h-5 text-yellow-500" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Receitas</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Despesas</span>
            <TrendingDown className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600'} p-6 rounded-xl shadow-lg text-white`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Saldo</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                formData.type === 'income'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Receita
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                formData.type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Despesa
            </button>
          </div>

          <input
            type="text"
            placeholder="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />

          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">Selecione categoria</option>
              <option value="alimentacao">Alimentação</option>
              <option value="transporte">Transporte</option>
              <option value="saude">Saúde</option>
              <option value="lazer">Lazer</option>
              <option value="salario">Salário</option>
              <option value="outros">Outros</option>
            </select>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Salvar
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                setFormData({
                  description: '',
                  amount: '',
                  type: 'expense',
                  category: '',
                  date: new Date().toISOString().split('T')[0],
                });
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Transações Recentes</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Nenhuma transação ainda. Adicione sua primeira transação!
          </div>
        ) : (
          transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border-l-4 border-gray-200 dark:border-gray-700"
                style={{
                  borderLeftColor: transaction.type === 'income' ? '#10b981' : '#ef4444',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {transaction.description}
                      </h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {categoryLabels[transaction.category]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`text-lg font-bold ${
                          transaction.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'} R${' '}
                        {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
