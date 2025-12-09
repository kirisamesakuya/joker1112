import React, { useState } from 'react';
import { VideoTemplate, TemplateStatus } from '../../types';
import { Search, RefreshCw, Trash2, Check, X, Play } from '../Icons';
import { Button } from '../Button';

interface BossTemplateManagerProps {
  templates: VideoTemplate[];
  onDelete: (ids: string[]) => void;
  onUpdateStatus: (ids: string[], status: TemplateStatus) => void;
}

export const BossTemplateManager: React.FC<BossTemplateManagerProps> = ({ 
  templates, 
  onDelete, 
  onUpdateStatus 
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(templates.map(t => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const filteredTemplates = templates.filter(t => t.name.includes(searchQuery) || t.id.includes(searchQuery));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Search Bar */}
      <div className="p-5 border-b border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <input 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="搜索模板名称/ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
             <span className="text-gray-600">状态:</span>
             <select className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none">
               <option>全部</option>
               <option>已上架</option>
               <option>已下架</option>
             </select>
          </div>
          <Button size="sm" className="gap-2">
            <Search size={14} /> 搜索
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setSearchQuery('')}>
            <RefreshCw size={14} /> 重置
          </Button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
           <input 
             type="checkbox" 
             checked={selectedIds.size === templates.length && templates.length > 0}
             onChange={handleSelectAll}
             className="rounded border-gray-300"
           />
           <span className="text-gray-600 ml-1">全选</span>
           {selectedIds.size > 0 && (
             <span className="ml-4 text-blue-600 font-medium">已选择 {selectedIds.size} 项</span>
           )}
        </div>
        <div className="flex gap-2">
           <Button size="sm" variant="outline" disabled={selectedIds.size === 0} onClick={() => onUpdateStatus(Array.from(selectedIds), TemplateStatus.ONLINE)}>批量上架</Button>
           <Button size="sm" variant="outline" disabled={selectedIds.size === 0} onClick={() => onUpdateStatus(Array.from(selectedIds), TemplateStatus.OFFLINE)}>批量下架</Button>
           <Button size="sm" variant="danger" disabled={selectedIds.size === 0} onClick={() => onDelete(Array.from(selectedIds))}>批量删除</Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b">
            <tr>
              <th className="p-4 w-10"></th>
              <th className="p-4">模板信息 (ID/名称/预览)</th>
              <th className="p-4">创建人</th>
              <th className="p-4">使用次数</th>
              <th className="p-4">状态</th>
              <th className="p-4">提交时间</th>
              <th className="p-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTemplates.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(t.id)}
                    onChange={() => handleSelectOne(t.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="p-4">
                   <div className="flex gap-3 items-center">
                      <div className="w-16 h-12 bg-gray-200 rounded relative overflow-hidden flex-shrink-0 group">
                         <img src={t.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                         <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center">
                           <Play size={16} className="text-white" fill="white"/>
                         </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{t.name}</div>
                        <div className="text-xs text-gray-400">ID: {t.id}</div>
                      </div>
                   </div>
                </td>
                <td className="p-4 text-gray-600">{t.creator || 'Admin'}</td>
                <td className="p-4 text-gray-900 font-mono">{t.usageCount || 0}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    t.status === TemplateStatus.ONLINE 
                      ? 'bg-green-50 text-green-600 border border-green-100' 
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-xs">
                  {new Date(t.createdAt).toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-3 text-sm">
                     {t.status === TemplateStatus.ONLINE ? (
                        <button onClick={() => onUpdateStatus([t.id], TemplateStatus.OFFLINE)} className="text-gray-500 hover:text-red-600">下架</button>
                     ) : (
                        <button onClick={() => onUpdateStatus([t.id], TemplateStatus.ONLINE)} className="text-blue-600 hover:text-blue-800">上架</button>
                     )}
                     <button className="text-gray-500 hover:text-blue-600">推荐</button>
                     <button onClick={() => onDelete([t.id])} className="text-red-500 hover:text-red-700">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination (Mock) */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2 text-gray-500 text-sm">
         <span>共 {filteredTemplates.length} 条</span>
         <div className="flex gap-1">
            <button className="w-8 h-8 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>&lt;</button>
            <button className="w-8 h-8 border rounded bg-blue-50 text-blue-600 border-blue-200">1</button>
            <button className="w-8 h-8 border rounded hover:bg-gray-50">2</button>
            <button className="w-8 h-8 border rounded hover:bg-gray-50">&gt;</button>
         </div>
      </div>
    </div>
  );
};