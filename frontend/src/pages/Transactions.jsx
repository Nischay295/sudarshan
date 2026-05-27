import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Check, X, AlertCircle, Sparkles, Eye } from 'lucide-react';

const TRANSACTION_TYPES = ['expense', 'income', 'transfer'];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 16),
    description: '',
    amount: '',
    transaction_type: 'expense',
    counterparty: '',
    notes: '',
  });

  const load = () => {
    setLoading(true);
    api.getTransactions(filter || undefined)
      .then(setTransactions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createTransaction({
        ...form,
        amount: parseFloat(form.amount),
        date: new Date(form.date).toISOString(),
      });
      setForm({
        date: new Date().toISOString().slice(0, 16),
        description: '', amount: '', transaction_type: 'expense',
        counterparty: '', notes: '',
      });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApprove = async (id, approved) => {
    try {
      await api.approveTransaction(id, { approved });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Transactions</h1>
          <p className="text-slate-500 mt-1">Manage and classify your financial transactions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200"
        >
          <Plus size={18} />
          New Transaction
        </button>
      </div>

      {error && (
        <div className="bg-danger-50 text-danger-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      {/* New Transaction Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-primary-500" />
            New Transaction (AI will auto-classify)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Date & Time</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="e.g., Office supplies from Amazon"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Type</label>
              <select
                value={form.transaction_type}
                onChange={e => setForm({...form, transaction_type: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
              >
                {TRANSACTION_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Counterparty</label>
              <input
                type="text"
                value={form.counterparty}
                onChange={e => setForm({...form, counterparty: e.target.value})}
                placeholder="e.g., Amazon, Uber, Client Name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                placeholder="Optional notes"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all">
              Create & Auto-Classify
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'pending', 'posted', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === s
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Receipt className="mx-auto mb-3" size={48} strokeWidth={1} />
            <p className="text-lg font-medium">No transactions yet</p>
            <p className="text-sm mt-1">Click "New Transaction" to get started</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Counterparty</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Category</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => (
                <tr key={txn.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-slate-600">{new Date(txn.date).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{txn.description}</td>
                  <td className="py-3 px-4 text-slate-600">{txn.counterparty || '—'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-accent-50 text-accent-600 text-xs font-medium flex items-center gap-1 w-fit">
                      <Sparkles size={10} />
                      {txn.ai_classification || txn.category || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {txn.ai_confidence != null && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              txn.ai_confidence > 0.7 ? 'bg-emerald-500' :
                              txn.ai_confidence > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${txn.ai_confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{Math.round(txn.ai_confidence * 100)}%</span>
                      </div>
                    )}
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
                  <td className="py-3 px-4 text-center">
                    {txn.status === 'pending' && (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleApprove(txn.id, true)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          title="Approve & Post"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleApprove(txn.id, false)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Reject"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Receipt(props) {
  return <Eye {...props} />;
}
