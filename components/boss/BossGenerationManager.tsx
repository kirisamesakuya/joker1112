import React, { useState } from 'react';
import { GenerationRecord, GenerationStatus } from '../../types';
import { Search, RefreshCw, Eye, Download, Play, X } from '../Icons';
import { Button } from '../Button';

interface BossGenerationManagerProps {
  generations: GenerationRecord[];
}

export const BossGenerationManager: React.FC<BossGenerationManagerProps> = ({ generations }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<GenerationRecord | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Search Bar */}
      <div className="p-5 border-b border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-4">
          <input 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="搜索视频编号"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          />
           <input 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="搜索创建用户手机号"
          />
          <Button size="sm" className="gap-2">
            <Search size={14} /> 搜索
          </Button>
           <Button size="sm" variant="outline" className="gap-2" onClick={() => setSearchQuery('')}>
            <RefreshCw size={14} /> 重置
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b">
            <tr>
              <th className="p-4 w-10">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="p-4">视频信息</th>
              <th className="p-4">视频编号</th>
              <th className="p-4">创建用户</th>
              <th className="p-4">用户手机号</th>
              <th className="p-4">生成时间</th>
              <th className="p-4">状态</th>
              <th className="p-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {generations.map(g => (
              <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="p-4">
                   <div className="w-12 h-16 bg-gray-200 rounded relative overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setPreviewItem(g)}>
                       <img src={g.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                       <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/30 transition-colors">
                          <Play size={12} fill="white" className="text-white" />
                       </div>
                   </div>
                </td>
                <td className="p-4 text-xs font-mono text-gray-500">{g.videoNo || `V${g.id.toUpperCase()}`}</td>
                <td className="p-4 text-sm text-gray-900">{g.userName}</td>
                <td className="p-4 text-xs font-mono text-gray-500">{g.userMobile || '138****0000'}</td>
                <td className="p-4 text-xs text-gray-500">{g.timestamp}</td>
                <td className="p-4">
                   <span className={`px-2 py-1 text-[10px] rounded-full ${
                    g.status === GenerationStatus.COMPLETED ? 'bg-green-50 text-green-600' :
                    g.status === GenerationStatus.FAILED ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                   }`}>
                     {g.status}
                   </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-gray-500">
                     <button onClick={() => setPreviewItem(g)} className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded" title="预览">
                        <Eye size={16} />
                     </button>
                     <button className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded" title="下载">
                        <Download size={16} />
                     </button>
                      <span className="text-gray-300">|</span>
                     <button className="text-xs hover:text-red-600">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {/* Pagination */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2 text-gray-500 text-sm">
         <span>共 {generations.length} 条</span>
         <div className="flex gap-1">
            <button className="w-8 h-8 border rounded bg-blue-50 text-blue-600 border-blue-200">1</button>
         </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setPreviewItem(null)}>
           <div className="bg-black rounded-xl overflow-hidden shadow-2xl max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
              <div className="aspect-[9/16] relative bg-gray-900">
                <img src={previewItem.thumbnailUrl} className="w-full h-full object-contain" alt="" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <Play size={32} fill="white" className="ml-1 text-white" />
                   </div>
                </div>
              </div>
              <button 
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
              >
                <X size={20} />
              </button>
              <div className="p-4 bg-gray-900 text-white">
                <h3 className="font-medium">{previewItem.templateName}</h3>
                <p className="text-xs text-gray-400 mt-1">Video ID: {previewItem.id}</p>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};