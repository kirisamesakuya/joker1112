
import React, { useState } from 'react';
import { GenerationRecord, GenerationStatus, PublishStatus } from '../../types';
import { Search, RefreshCw, Eye, Download, Play, X, Trash2, ArrowUp, ArrowDown } from '../Icons';
import { Button } from '../Button';
import { ConfirmDialog } from '../ConfirmDialog';

interface BossGenerationManagerProps {
  generations: GenerationRecord[];
  onDelete: (ids: string[]) => void;
  onUpdateStatus: (ids: string[], status: PublishStatus) => void;
}

export const BossGenerationManager: React.FC<BossGenerationManagerProps> = ({ 
  generations, 
  onDelete,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [previewItem, setPreviewItem] = useState<GenerationRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirmation State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'danger';
    action: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'info', action: () => {} });

  // Filtering Logic
  const filteredGenerations = generations.filter(g => {
    const matchesSearch = 
      (g.videoNo && g.videoNo.includes(searchQuery)) ||
      (g.userName && g.userName.includes(searchQuery)) ||
      (g.userMobile && g.userMobile.includes(searchQuery)) ||
      g.id.includes(searchQuery);
    
    const matchesStatus = statusFilter === '全部' || g.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredGenerations.map(g => g.id)));
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

  // Helper to trigger confirmation
  const handleConfirmAction = (
    title: string, 
    message: string, 
    type: 'info' | 'danger',
    action: () => void
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      type,
      action: () => {
        action();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Batch Operations
  const requestUpdateStatus = (ids: string[], status: PublishStatus) => {
    const actionName = status === PublishStatus.ONLINE ? '上架' : '下架';
    handleConfirmAction(
      `确认批量${actionName}`,
      `确定要将选中的 ${ids.length} 个视频${actionName}吗？`,
      'info',
      () => {
        onUpdateStatus(ids, status);
        if (ids.length > 1) setSelectedIds(new Set());
      }
    );
  };

  const requestDelete = (ids: string[]) => {
    handleConfirmAction(
      '确认删除',
      `删除后将无法恢复，确定要删除选中的 ${ids.length} 条生成记录吗？`,
      'danger',
      () => {
        onDelete(ids);
        if (ids.length > 1) setSelectedIds(new Set());
      }
    );
  };

  const requestDownload = (ids: string[]) => {
    // Mock download
    alert(`已开始下载 ${ids.length} 个视频文件...`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      {/* Search Bar */}
      <div className="p-5 border-b border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-4">
          <input 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="搜索编号/用户/手机"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
             <span className="text-gray-600">生成状态:</span>
             <select 
               className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="全部">全部</option>
               <option value={GenerationStatus.COMPLETED}>已完成</option>
               <option value={GenerationStatus.PROCESSING}>生成中</option>
               <option value={GenerationStatus.FAILED}>失败</option>
             </select>
          </div>
          <Button size="sm" className="gap-2">
            <Search size={14} /> 搜索
          </Button>
           <Button size="sm" variant="outline" className="gap-2" onClick={() => { setSearchQuery(''); setStatusFilter('全部'); }}>
            <RefreshCw size={14} /> 重置
          </Button>
        </div>
      </div>

       {/* Action Bar */}
       <div className="px-5 py-3 bg-gray-50 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
           <input 
             type="checkbox" 
             checked={filteredGenerations.length > 0 && selectedIds.size === filteredGenerations.length}
             onChange={handleSelectAll}
             className="rounded border-gray-300"
           />
           <span className="text-gray-600 ml-1">全选</span>
           {selectedIds.size > 0 && (
             <span className="ml-4 text-blue-600 font-medium">已选择 {selectedIds.size} 项</span>
           )}
        </div>
        <div className="flex gap-2">
           <Button size="sm" variant="outline" disabled={selectedIds.size === 0} onClick={() => requestDownload(Array.from(selectedIds))}>批量下载</Button>
           <div className="w-px bg-gray-300 mx-1 h-6 self-center"></div>
           <Button size="sm" variant="outline" disabled={selectedIds.size === 0} onClick={() => requestUpdateStatus(Array.from(selectedIds), PublishStatus.ONLINE)}>批量上架</Button>
           <Button size="sm" variant="outline" disabled={selectedIds.size === 0} onClick={() => requestUpdateStatus(Array.from(selectedIds), PublishStatus.OFFLINE)}>批量下架</Button>
           <Button size="sm" variant="danger" disabled={selectedIds.size === 0} onClick={() => requestDelete(Array.from(selectedIds))}>批量删除</Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b">
            <tr>
              <th className="p-4 w-10"></th>
              <th className="p-4">视频信息</th>
              <th className="p-4">视频编号</th>
              <th className="p-4">创建用户</th>
              <th className="p-4">用户手机号</th>
              <th className="p-4">生成时间</th>
              <th className="p-4">生成状态</th>
              <th className="p-4">发布状态</th>
              <th className="p-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredGenerations.map(g => (
              <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(g.id)}
                    onChange={() => handleSelectOne(g.id)}
                    className="rounded border-gray-300" 
                  />
                </td>
                <td className="p-4">
                   <div className="w-12 h-16 bg-gray-200 rounded relative overflow-hidden flex-shrink-0 cursor-pointer group" onClick={() => setPreviewItem(g)}>
                       <img src={g.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                       <div className="absolute inset-0 flex items-center justify-center bg-black/10 hidden group-hover:flex bg-black/30 transition-colors">
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
                <td className="p-4">
                  {g.publishStatus && (
                    <span className={`px-2 py-1 text-[10px] rounded-full border ${
                      g.publishStatus === PublishStatus.ONLINE
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                      {g.publishStatus}
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-gray-500">
                     <button onClick={() => setPreviewItem(g)} className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded" title="预览">
                        <Eye size={16} />
                     </button>
                     <button onClick={() => requestDownload([g.id])} className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded" title="下载">
                        <Download size={16} />
                     </button>
                      
                     {/* Status Toggle */}
                     {g.publishStatus === PublishStatus.ONLINE ? (
                        <button onClick={() => requestUpdateStatus([g.id], PublishStatus.OFFLINE)} className="p-1 hover:text-orange-600 hover:bg-orange-50 rounded" title="下架">
                          <ArrowDown size={16} />
                        </button>
                     ) : (
                        <button onClick={() => requestUpdateStatus([g.id], PublishStatus.ONLINE)} className="p-1 hover:text-green-600 hover:bg-green-50 rounded" title="上架">
                          <ArrowUp size={16} />
                        </button>
                     )}

                     <span className="text-gray-300">|</span>
                     <button onClick={() => requestDelete([g.id])} className="p-1 hover:text-red-600 hover:bg-red-50 rounded" title="删除">
                        <Trash2 size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {/* Pagination */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2 text-gray-500 text-sm">
         <span>共 {filteredGenerations.length} 条</span>
         <div className="flex gap-1">
            <button className="w-8 h-8 border rounded hover:bg-gray-50" disabled>&lt;</button>
            <button className="w-8 h-8 border rounded bg-blue-50 text-blue-600 border-blue-200">1</button>
            <button className="w-8 h-8 border rounded hover:bg-gray-50" disabled>&gt;</button>
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
                <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                    <span>用户: {previewItem.userName}</span>
                    <span>{previewItem.timestamp}</span>
                </div>
                <div className="mt-4 flex gap-2">
                   <Button size="sm" fullWidth onClick={() => { requestDownload([previewItem.id]); }}>下载原片</Button>
                </div>
              </div>
           </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.action}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};
