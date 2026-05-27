import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BookOpen, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

export default function JournalEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api.getJournalEntries()
      .then(setEntries)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Journal Entries</h1>
        <p className="text-slate-500 mt-1">Double-entry accounting ledger — every transaction balanced</p>
      </div>

      {error && (
        <div className="bg-danger-50 text-danger-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-100 text-center">
          <BookOpen className="mx-auto mb-3 text-slate-300" size={48} strokeWidth={1} />
          <p className="text-lg font-medium text-slate-400">No journal entries yet</p>
          <p className="text-sm text-slate-400 mt-1">Entries are automatically created when transactions are approved</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
              <button
                onClick={() => toggle(entry.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    {expanded[entry.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-semibold text-primary-600">{entry.entry_number}</span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                        entry.status === 'posted' ? 'bg-emerald-50 text-emerald-700' :
                        entry.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        entry.status === 'approved' ? 'bg-blue-50 text-blue-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{entry.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">{new Date(entry.date).toLocaleDateString('en-IN')}</p>
                  <p className="text-sm font-semibold text-slate-800">₹{entry.total_debit.toLocaleString('en-IN')}</p>
                </div>
              </button>

              {expanded[entry.id] && (
                <div className="px-5 pb-5 animate-fade-in">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-y border-slate-100">
                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Account</th>
                        <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Debit (₹)</th>
                        <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.lines.map(line => (
                        <tr key={line.id} className="border-b border-slate-50">
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-xs text-slate-500 mr-2">{line.account_code}</span>
                            <span className="text-slate-700">{line.account_name}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium">
                            {line.debit > 0 ? `₹${line.debit.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium">
                            {line.credit > 0 ? `₹${line.credit.toLocaleString('en-IN')}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">Total</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">₹{entry.total_debit.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">₹{entry.total_credit.toLocaleString('en-IN')}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <div className="mt-3 flex gap-4 text-xs text-slate-400">
                    {entry.reference && <span>Ref: {entry.reference}</span>}
                    <span>Created by: {entry.created_by}</span>
                    {entry.approved_by && <span>Approved by: {entry.approved_by}</span>}
                    {entry.posted_at && <span>Posted: {new Date(entry.posted_at).toLocaleString('en-IN')}</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
