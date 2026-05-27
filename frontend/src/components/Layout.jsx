import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, BookOpen, FileText, ScrollText,
  BarChart3, Shield, ChevronLeft, ChevronRight, TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/journal', icon: BookOpen, label: 'Journal Entries' },
  { to: '/accounts', icon: FileText, label: 'Chart of Accounts' },
  { to: '/reports', icon: BarChart3, label: 'Financial Reports' },
  { to: '/ratios', icon: TrendingUp, label: 'Ratio Analysis' },
  { to: '/audit', icon: Shield, label: 'Audit Trail' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300 shadow-2xl`}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-primary-500/25">
              S
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-bold tracking-tight">Sudarshan</h1>
                <p className="text-[10px] text-slate-400 tracking-widest uppercase">Commerce Intelligence</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-300 shadow-lg shadow-primary-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="animate-slide-in">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-4 border-t border-slate-700/50 text-slate-500 hover:text-white transition-colors flex items-center justify-center"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
