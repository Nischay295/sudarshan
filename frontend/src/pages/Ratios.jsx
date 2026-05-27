import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TrendingUp, AlertCircle } from 'lucide-react';

function RatioCard({ label, value, description, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color || 'text-slate-800'}`}>
        {value != null ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A'}
      </p>
      <p className="text-xs text-slate-400 mt-2">{description}</p>
    </div>
  );
}

export default function Ratios() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getRatios()
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
      <AlertCircle size={20} /><span>{error}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Ratio Analysis</h1>
        <p className="text-slate-500 mt-1">Key financial ratios derived from your accounting data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RatioCard
          label="Current Ratio"
          value={data?.current_ratio}
          description="Current Assets / Current Liabilities. Above 1.0 is healthy."
          color={data?.current_ratio >= 1 ? 'text-emerald-600' : 'text-red-600'}
        />
        <RatioCard
          label="Debt-to-Equity Ratio"
          value={data?.debt_to_equity}
          description="Total Liabilities / Total Equity. Lower is generally better."
          color={data?.debt_to_equity <= 1 ? 'text-emerald-600' : 'text-amber-600'}
        />
        <RatioCard
          label="Net Profit Margin"
          value={data?.net_margin}
          description="Net Income / Revenue × 100. Higher indicates better profitability."
          color={data?.net_margin > 0 ? 'text-emerald-600' : 'text-red-600'}
        />
        <RatioCard
          label="Return on Assets (ROA)"
          value={data?.return_on_assets}
          description="Net Income / Total Assets × 100. Measures asset efficiency."
          color={data?.return_on_assets > 0 ? 'text-emerald-600' : 'text-red-600'}
        />
        <RatioCard
          label="Return on Equity (ROE)"
          value={data?.return_on_equity}
          description="Net Income / Total Equity × 100. Measures return for equity holders."
          color={data?.return_on_equity > 0 ? 'text-emerald-600' : 'text-red-600'}
        />
        <RatioCard
          label="Asset Turnover"
          value={data?.asset_turnover}
          description="Revenue / Total Assets. Measures revenue generation efficiency."
        />
        <RatioCard
          label="Working Capital"
          value={data?.working_capital}
          description="Current Assets - Current Liabilities. Positive = can meet short-term obligations."
          color={data?.working_capital >= 0 ? 'text-emerald-600' : 'text-red-600'}
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-500" />
          Understanding Your Ratios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="p-4 rounded-xl bg-slate-50">
            <h4 className="font-semibold text-slate-700 mb-1">Liquidity Ratios</h4>
            <p>Current Ratio measures ability to pay short-term obligations. A ratio above 1.0 means assets exceed liabilities.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50">
            <h4 className="font-semibold text-slate-700 mb-1">Profitability Ratios</h4>
            <p>Net Margin, ROA, and ROE measure how effectively the business generates profits from its resources.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50">
            <h4 className="font-semibold text-slate-700 mb-1">Leverage Ratios</h4>
            <p>Debt-to-Equity shows how much debt is used relative to equity. Lower ratios indicate less financial risk.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50">
            <h4 className="font-semibold text-slate-700 mb-1">Efficiency Ratios</h4>
            <p>Asset Turnover measures how efficiently assets generate revenue. Higher is better.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
