import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatementTable({ sections, showTotal, totalLabel, totalValue }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100">
          <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</th>
          <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        {sections.map((section, i) => (
          <Fragment key={i}>
            <tr className="bg-slate-50/50">
              <td colSpan={2} className="py-2.5 px-3 font-semibold text-slate-700">{section.title}</td>
            </tr>
            {section.lines.map((line, j) => (
              <tr key={j} className="border-b border-slate-50">
                <td className="py-2 px-3 pl-8 text-slate-600">
                  <span className="font-mono text-xs text-slate-400 mr-2">{line.account_code}</span>
                  {line.account_name}
                </td>
                <td className={`py-2 px-3 text-right font-medium ${line.amount >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                  ₹{Math.abs(line.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            <tr className="border-b border-slate-200">
              <td className="py-2 px-3 pl-8 font-semibold text-slate-600">Total {section.title}</td>
              <td className="py-2 px-3 text-right font-bold text-slate-800">
                ₹{Math.abs(section.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </Fragment>
        ))}
      </tbody>
      {showTotal && (
        <tfoot>
          <tr className="border-t-2 border-slate-300">
            <td className="py-3 px-3 font-bold text-slate-800 text-lg">{totalLabel}</td>
            <td className={`py-3 px-3 text-right font-bold text-lg ${totalValue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ₹{Math.abs(totalValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}

import { Fragment } from 'react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('trial-balance');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { key: 'trial-balance', label: 'Trial Balance' },
    { key: 'income-statement', label: 'Income Statement (P&L)' },
    { key: 'balance-sheet', label: 'Balance Sheet' },
    { key: 'cash-flow', label: 'Cash Flow' },
  ];

  const loadReport = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      let result;
      switch (tab) {
        case 'trial-balance': result = await api.getTrialBalance(); break;
        case 'income-statement': result = await api.getIncomeStatement('2024-01-01', '2025-12-31'); break;
        case 'balance-sheet': result = await api.getBalanceSheet(); break;
        case 'cash-flow': result = await api.getCashFlow('2024-01-01', '2025-12-31'); break;
      }
      setData(result);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { loadReport(activeTab); }, [activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Financial Reports</h1>
        <p className="text-slate-500 mt-1">Automatically generated from your posted journal entries</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-danger-50 text-danger-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : data && (
        <div>
          {activeTab === 'trial-balance' && (
            <Section title="Trial Balance">
              <div className="mb-4 flex items-center gap-2">
                {data.is_balanced ? (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <CheckCircle size={16} /> Balanced
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                    <XCircle size={16} /> Not Balanced — Difference: ₹{Math.abs(data.total_debit - data.total_credit).toFixed(2)}
                  </span>
                )}
              </div>
              {data.items.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Code</th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Account</th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                      <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Debit (₹)</th>
                      <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map(item => (
                      <tr key={item.account_id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-primary-600">{item.account_code}</td>
                        <td className="py-2.5 px-3 text-slate-700">{item.account_name}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">{item.account_type}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">{item.debit > 0 ? `₹${item.debit.toLocaleString('en-IN')}` : '—'}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{item.credit > 0 ? `₹${item.credit.toLocaleString('en-IN')}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300">
                      <td colSpan={3} className="py-3 px-3 font-bold text-slate-800">Total</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">₹{data.total_debit.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">₹{data.total_credit.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className="text-slate-400 text-center py-8">No data. Post some transactions first.</p>
              )}
            </Section>
          )}

          {activeTab === 'income-statement' && (
            <Section title="Income Statement (Profit & Loss)">
              <StatementTable
                sections={[data.revenue, data.expenses]}
                showTotal={true}
                totalLabel="Net Income"
                totalValue={data.net_income}
              />
            </Section>
          )}

          {activeTab === 'balance-sheet' && (
            <Section title="Balance Sheet">
              <div className="mb-4 flex items-center gap-2">
                {data.is_balanced ? (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <CheckCircle size={16} /> Assets = Liabilities + Equity
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                    <XCircle size={16} /> Not Balanced
                  </span>
                )}
              </div>
              <StatementTable
                sections={[data.assets, data.liabilities, data.equity]}
                showTotal={false}
              />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium uppercase">Total Assets</p>
                  <p className="text-xl font-bold text-blue-800">₹{data.total_assets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-xs text-purple-600 font-medium uppercase">Total Liabilities + Equity</p>
                  <p className="text-xl font-bold text-purple-800">₹{data.total_liabilities_equity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'cash-flow' && (
            <Section title="Cash Flow Statement">
              {[data.operating, data.investing, data.financing].map((section, i) => (
                <div key={i} className="mb-6">
                  <h4 className="font-semibold text-slate-700 mb-2">{section.title}</h4>
                  {section.items.length > 0 ? (
                    <table className="w-full text-sm mb-2">
                      <tbody>
                        {section.items.map((item, j) => (
                          <tr key={j} className="border-b border-slate-50">
                            <td className="py-2 px-3 text-slate-600">{item.description}</td>
                            <td className={`py-2 px-3 text-right font-medium ${item.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {item.amount >= 0 ? '+' : ''}₹{item.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-slate-400 px-3 mb-2">No items</p>
                  )}
                  <div className="px-3 py-2 bg-slate-50 rounded-lg text-right font-semibold text-sm text-slate-700">
                    Net: ₹{section.total.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 font-medium uppercase">Opening Balance</p>
                  <p className="text-lg font-bold text-slate-800">₹{data.opening_balance.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 text-center">
                  <p className="text-xs text-primary-600 font-medium uppercase">Net Change</p>
                  <p className={`text-lg font-bold ${data.net_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {data.net_change >= 0 ? '+' : ''}₹{data.net_change.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <p className="text-xs text-emerald-600 font-medium uppercase">Closing Balance</p>
                  <p className="text-lg font-bold text-emerald-800">₹{data.closing_balance.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
