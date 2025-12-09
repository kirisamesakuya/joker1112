import React from 'react';
import { LayoutGrid, Box, LogOut } from '../Icons';

interface BossLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onExit: () => void;
}

export const BossLayout: React.FC<BossLayoutProps> = ({ children, activeTab, onTabChange, onExit }) => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-sm">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
            B
          </div>
          <div>
            <h1 className="font-bold text-base">智能体·云</h1>
            <p className="text-xs text-slate-400">智能体部署管理</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs text-slate-500 font-medium px-3 py-2 uppercase tracking-wider">
            应用中心
          </div>
          <button 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              true ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Box size={18} />
            <span>智能体应用管理</span>
          </button>
          
          <button 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LayoutGrid size={18} />
            <span>智能体部署管理</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onExit}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 px-3 py-2 transition-colors"
          >
            <LogOut size={16} />
            <span>退出管理台</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-medium text-gray-800">内容管理</h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
           {children}
        </div>
      </main>
    </div>
  );
};