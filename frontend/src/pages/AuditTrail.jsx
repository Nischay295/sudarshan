import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Shield, AlertCircle, Clock } from 'lucide-react';

const ACTION_COLORS = {
  CREATE_TRANSACTION: 'bg-blue-50 text-blue-700',
  APPROVE_TRANSACTION: 'bg-emerald-50 text-emerald-700',
  REJECT_TRANSACTION: 'bg-red-50 text-red-700',
  CREATE_JOURNAL_ENTRY: 'bg-violet-50 text-violet-700',
  APPROVE_JOURNAL_ENTRY: 'bg-cyan-50 text-cyan-700',
  POST_JOURNAL_ENTRY: 'bg-emerald-50 text-emerald-700',
  CREATE_ACCOUNT: 'bg-amber-50 text-amber-700',
  SEED_ACCOUNTS: 'bg-slate-100 text-slate-600',
};

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getAuditLogs(200)
      .then(setLogs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Audit Trail</h1>
        <p className="text-slate-500 mt-1">Complete audit log — every action is tracked and immutable</p>
      </div>

      {error && (
        <div className="bg-danger-50 text-danger-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} /><span>{error}</span>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-100 text-center">
          <Shield className="mx-auto mb-3 text-slate-300" size={48} strokeWidth={1} />
          <p className="text-lg font-medium text-slate-400">No audit logs yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.entity_type} #{log.entity_id}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{log.user}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs max-w-md truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
