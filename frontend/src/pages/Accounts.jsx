import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, FileText, AlertCircle, X } from 'lucide-react';

const TYPE_COLORS = {
  asset: 'bg-blue-50 text-blue-700',
  liability: 'bg-red-50 text-red-700',
  equity: 'bg-purple-50 text-purple-700',
  revenue: 'bg-emerald-50 text-emerald-700',
  expense: 'bg-amber-50 text-amber-700',
};

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', account_type: 'asset', description: '' });

  const load = () => {
    setLoading(true);
    api.getAccounts()
      .then(setAccounts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createAccount(form);
      setForm({ code: '', name: '', account_type: 'asset', description: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const grouped = accounts.reduce((acc, a) => {
    const type = a.account_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(a);
    return acc;
  }, {});

  const typeOrder = ['asset', 'liability', 'equity', 'revenue', 'expense'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Chart of Accounts</h1>
          <p className="text-slate-500 mt-1">Standard double-entry account structure</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200"
        >
          <Plus size={18} />
          Add Account
        </button>
      </div>

      {error && (
        <div className="bg-danger-50 text-danger-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} /><span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">New Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Account Code</label>
              <input
                type="text" value={form.code}
                onChange={e => setForm({...form, code: e.target.value})}
                placeholder="e.g., 7100"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Account Name</label>
              <input
                type="text" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g., Consulting Revenue"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Type</label>
              <select
                value={form.account_type}
                onChange={e => setForm({...form, account_type: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                {typeOrder.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Description</label>
              <input
                type="text" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Optional"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all">
              Create Account
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {typeOrder.map(type => {
            const accs = grouped[type];
            if (!accs || accs.length === 0) return null;
            return (
              <div key={type} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${TYPE_COLORS[type]}`}>
                      {type.toUpperCase()}
                    </span>
                    <span className="text-sm text-slate-400">({accs.length} accounts)</span>
                  </h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="text-right py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accs.map(acc => (
                      <tr key={acc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-6 font-mono text-sm text-primary-600 font-medium">{acc.code}</td>
                        <td className="py-3 px-6 text-slate-700">{acc.name}</td>
                        <td className={`py-3 px-6 text-right font-semibold ${acc.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                          ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
