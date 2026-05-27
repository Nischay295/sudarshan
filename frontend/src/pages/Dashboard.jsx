import { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, ArrowDownRight, AlertCircle, Clock,
  CreditCard, PiggyBank
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

function KPICard({ label, value, icon: Icon, color, prefix = '', suffix = '' }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : value}{suffix}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-danger-50 text-danger-600 p-4 rounded-xl flex items-center gap-3">
      <AlertCircle size={20} />
      <span>{error}</span>
    </div>
  );

  if (!data) return null;

  const expenseData = data.recent_transactions
    ?.filter(t => t.transaction_type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'Other';
      const existing = acc.find(x => x.name === cat);
      if (existing) existing.value += Math.abs(t.amount);
      else acc.push({ name: cat, value: Math.abs(t.amount) });
      return acc;
    }, []) || [];

  const summaryData = [
    { name: 'Revenue', amount: data.total_revenue },
    { name: 'Expenses', amount: data.total_expenses },
    { name: 'Net Income', amount: data.net_income },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Financial overview and key metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Revenue" value={data.total_revenue} icon={TrendingUp} color="bg-gradient-to-br from-emerald-500 to-emerald-600" prefix="₹" />
        <KPICard label="Total Expenses" value={data.total_expenses} icon={TrendingDown} color="bg-gradient-to-br from-red-500 to-red-600" prefix="₹" />
        <KPICard label="Net Income" value={data.net_income} icon={DollarSign} color="bg-gradient-to-br from-primary-500 to-primary-600" prefix="₹" />
        <KPICard label="Cash Balance" value={data.cash_balance} icon={Wallet} color="bg-gradient-to-br from-violet-500 to-violet-600" prefix="₹" />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Assets" value={data.total_assets} icon={PiggyBank} color="bg-gradient-to-br from-cyan-500 to-cyan-600" prefix="₹" />
        <KPICard label="Total Liabilities" value={data.total_liabilities} icon={CreditCard} color="bg-gradient-to-br from-amber-500 to-amber-600" prefix="₹" />
        <KPICard label="Accounts Receivable" value={data.accounts_receivable} icon={ArrowUpRight} color="bg-gradient-to-br from-teal-500 to-teal-600" prefix="₹" />
        <KPICard label="Pending Transactions" value={data.pending_transactions} icon={Clock} color="bg-gradient-to-br from-orange-500 to-orange-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Summary Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Financial Summary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => ['₹' + value.toLocaleString('en-IN'), 'Amount']}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {summaryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Expense Distribution</h3>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => ['₹' + value.toLocaleString('en-IN'), 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">
              <p>No expense data yet. Add transactions to see the chart.</p>
            </div>
          )}
          {expenseData.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {expenseData.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards from API */}
      {data.kpis?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Key Performance Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.kpis.map((kpi, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{kpi.label}</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {kpi.value?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  {kpi.label.includes('Margin') && '%'}
                </p>
                {kpi.trend && (
                  <div className={`flex items-center gap-1 mt-1 text-xs ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {kpi.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {kpi.trend === 'up' ? 'Positive' : 'Negative'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions</h3>
        {data.recent_transactions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_transactions.map(txn => (
                  <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-slate-600">{new Date(txn.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{txn.description}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium">
                        {txn.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${txn.transaction_type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {txn.transaction_type === 'income' ? '+' : '-'}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        txn.status === 'posted' ? 'bg-emerald-50 text-emerald-700' :
                        txn.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        txn.status === 'approved' ? 'bg-blue-50 text-blue-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No transactions yet. Start by adding a transaction.</p>
        )}
      </div>
    </div>
  );
}
