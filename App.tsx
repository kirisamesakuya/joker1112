import React, { useState, useMemo, useEffect } from 'react';
import { 
  Settings, 
  MoreHorizontal, 
  Upload, 
  Trash2, 
  ChevronLeft, 
  Check, 
  X, 
  Loader2, 
  Play, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle, 
  Box, 
  LayoutGrid,
  Disc, 
  Minus, 
  Plus, 
  Info,
  Download
} from './components/Icons';
import { Button } from './components/Button';
import { TemplateCard } from './components/TemplateCard';
import { UploadModal } from './components/UploadModal';
import { GenerationList } from './components/GenerationList';
import { DashboardHeader } from './components/DashboardHeader';
import { ConsumerFeed } from './components/consumer/ConsumerFeed';
import { ConsumerImagePicker } from './components/consumer/ConsumerImagePicker';
import { ConsumerCropper } from './components/consumer/ConsumerCropper';
import { ConsumerHistory } from './components/consumer/ConsumerHistory';
import { ConsumerResult } from './components/consumer/ConsumerResult';
import { BossLayout } from './components/boss/BossLayout';
import { BossTemplateManager } from './components/boss/BossTemplateManager';
import { BossGenerationManager } from './components/boss/BossGenerationManager';
import { ConfirmDialog } from './components/ConfirmDialog';
import { 
  VideoTemplate, 
  TemplateStatus, 
  GenerationRecord, 
  GenerationStatus, 
  PublishStatus, 
  BossTab, 
  LipSyncMode 
} from './types';

// --- CONSTANTS & UTILS ---
const MAX_TEMPLATE_COUNT = 20; // Quantity Limit
const MAX_STORAGE_CAPACITY = 500 * 1024 * 1024; // 500MB Storage Limit

const formatBytes = (bytes: number, decimals = 1) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// --- MOCK DATA ---
const MOCK_TEMPLATES: VideoTemplate[] = [
  {
    id: `tpl-1001`,
    name: "圣诞主题视频",
    thumbnailUrl: `https://picsum.photos/seed/1001/300/400`,
    duration: "5s",
    resolution: "720P",
    size: 15 * 1024 * 1024,
    status: TemplateStatus.ONLINE,
    tags: ['人物', '节日'],
    createdAt: Date.now(),
    supportLipSync: false, // Type 1: Face Swap Only
    creator: "Admin",
    usageCount: 1204
  },
  {
    id: `tpl-1002`,
    name: "元旦烟花特效",
    thumbnailUrl: `https://picsum.photos/seed/1002/300/400`,
    duration: "5s",
    resolution: "720P",
    size: 10 * 1024 * 1024,
    status: TemplateStatus.ONLINE,
    tags: ['背景'],
    createdAt: Date.now() - 100000,
    supportLipSync: true, 
    lipSyncMode: LipSyncMode.ORIGINAL, // Type 2: Face Swap + Original Audio Lip Sync
    creator: "Admin",
    usageCount: 850
  },
  {
    id: `tpl-1003`,
    name: "新春祝福(自定义)",
    thumbnailUrl: `https://picsum.photos/seed/1003/300/400`,
    duration: "5s",
    resolution: "720P",
    size: 18 * 1024 * 1024,
    status: TemplateStatus.ONLINE,
    tags: ['人物', '祝福'],
    createdAt: Date.now() - 200000,
    supportLipSync: true,
    lipSyncMode: LipSyncMode.CUSTOM, // Type 3: Face Swap + Custom Script
    creator: "Creator_001",
    usageCount: 3200
  },
  ...Array.from({ length: 5 }).map((_, i) => ({
    id: `tpl-${1004 + i}`,
    name: `通用模板 ${i+1}`,
    thumbnailUrl: `https://picsum.photos/seed/${i + 20}/300/400`,
    duration: "5s",
    resolution: "720P",
    size: 8 * 1024 * 1024,
    status: i === 0 ? TemplateStatus.OFFLINE : TemplateStatus.ONLINE,
    tags: ['通用'],
    createdAt: Date.now() - (i + 5) * 100000,
    creator: "Admin",
    usageCount: Math.floor(Math.random() * 1000)
  }))
];

const MOCK_GENERATIONS: GenerationRecord[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `gen-${i}`,
  templateId: `tpl-${1000 + (i % 8)}`,
  templateName: i % 2 === 0 ? "圣诞主题视频" : "元旦烟花特效",
  userName: `User${100 + i}`,
  thumbnailUrl: `https://picsum.photos/seed/${i + 55}/200/200`,
  status: i === 0 ? GenerationStatus.PROCESSING : i === 1 ? GenerationStatus.FAILED : GenerationStatus.COMPLETED,
  publishStatus: i % 3 === 0 ? PublishStatus.OFFLINE : PublishStatus.ONLINE, // Mock publish status
  timestamp: `2024-12-2${i % 9} 13:00`,
  // Boss Mock Fields
  videoNo: `V2024110500${i}`,
  userMobile: `138000000${i}`,
  shareCount: Math.floor(Math.random() * 100)
}));

// --- APP COMPONENT ---

type AppMode = 'LANDING' | 'ADMIN' | 'CONSUMER' | 'BOSS';
type ConsumerView = 'FEED' | 'PICKER' | 'CROPPER' | 'HISTORY' | 'RESULT';

const App: React.FC = () => {
  // Global App State
  const [appMode, setAppMode] = useState<AppMode>('LANDING');
  
  // --- SHARED DATA STATE ---
  const [templates, setTemplates] = useState<VideoTemplate[]>(MOCK_TEMPLATES);
  const [generations, setGenerations] = useState<GenerationRecord[]>(MOCK_GENERATIONS);

  // --- ADMIN STATE (B-Side) ---
  const [activeAdminTab, setActiveAdminTab] = useState<'templates' | 'generations'>('templates');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(2); // New: Limit Count Setting
  
  // Template Management
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  const [previewTemplate, setPreviewTemplate] = useState<VideoTemplate | null>(null);
  
  // Generation Management
  const [isGenManageMode, setIsGenManageMode] = useState(false);
  const [selectedGenIds, setSelectedGenIds] = useState<Set<string>>(new Set());
  const [genFilter, setGenFilter] = useState('全部');
  const [previewGenRecord, setPreviewGenRecord] = useState<GenerationRecord | null>(null);
  
  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // --- BOSS STATE (Platform) ---
  const [activeBossTab, setActiveBossTab] = useState<BossTab>(BossTab.TEMPLATE_MGMT);

  // --- CONSUMER STATE (C-Side) ---
  const [consumerView, setConsumerView] = useState<ConsumerView>('FEED');
  const [consumerGenerations, setConsumerGenerations] = useState<GenerationRecord[]>(MOCK_GENERATIONS);
  const [selectedConsumerTemplate, setSelectedConsumerTemplate] = useState<VideoTemplate | null>(null);
  const [selectedConsumerImage, setSelectedConsumerImage] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<GenerationRecord | null>(null);
  const [usageCount, setUsageCount] = useState(9); // Mock starting at 9/10
  const MAX_USAGE = 10; // This could be linked to dailyLimit
  
  // Toast Notification State
  const [toast, setToast] = useState<{message: string, type: 'info' | 'success', onClick?: () => void} | null>(null);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // --- COMPUTED STATES ---
  
  // Admin Template Selection Logic
  const selectionState = useMemo(() => {
    const selected = templates.filter(t => selectedTemplateIds.has(t.id));
    const hasOnline = selected.some(t => t.status === TemplateStatus.ONLINE);
    const hasOffline = selected.some(t => t.status === TemplateStatus.OFFLINE);
    const count = selected.length;
    // Enterprise Safety Rule: Can only delete if ALL selected are offline
    const canDelete = count > 0 && !hasOnline; 
    return { selected, count, hasOnline, hasOffline, canDelete };
  }, [templates, selectedTemplateIds]);

  // Admin Generation Selection Logic
  const genSelectionState = useMemo(() => {
    const selected = generations.filter(g => selectedGenIds.has(g.id));
    const hasOnline = selected.some(g => g.publishStatus === PublishStatus.ONLINE);
    const hasOffline = selected.some(g => g.publishStatus === PublishStatus.OFFLINE);
    const count = selected.length;
    return { selected, count, hasOnline, hasOffline };
  }, [generations, selectedGenIds]);

  // Admin Storage
  const storageStats = useMemo(() => {
    const usedBytes = templates.reduce((acc, t) => acc + (t.size || 0), 0);
    const count = templates.length;
    const isCountFull = count >= MAX_TEMPLATE_COUNT;
    const isStorageFull = usedBytes >= MAX_STORAGE_CAPACITY;
    return { usedBytes, count, isCountFull, isStorageFull, remainingBytes: MAX_STORAGE_CAPACITY - usedBytes };
  }, [templates]);

  // Filtered Generations
  const filteredGenerations = useMemo(() => {
    if (genFilter === '全部') return generations;
    return generations.filter(g => g.status === genFilter);
  }, [generations, genFilter]);
  
  // Dashboard Stats
  const dashboardStats = useMemo(() => ({
    total: generations.length,
    completed: generations.filter(g => g.status === GenerationStatus.COMPLETED).length,
    processing: generations.filter(g => g.status === GenerationStatus.PROCESSING).length,
    failed: generations.filter(g => g.status === GenerationStatus.FAILED).length,
  }), [generations]);

  // Consumer Templates (Only show ONLINE)
  const consumerTemplates = useMemo(() => {
    return templates.filter(t => t.status === TemplateStatus.ONLINE);
  }, [templates]);


  // --- HANDLERS ---
  const handleAddTemplate = (newTemplate: VideoTemplate) => {
    // Add mock size to new template (simulating ~15MB)
    const templateWithSize = {
      ...newTemplate,
      size: 15 * 1024 * 1024
    };
    setTemplates([templateWithSize, ...templates]);
  };

  const handleClickUpload = () => {
    if (storageStats.isCountFull) {
      setToast({ message: `数量已达上限 (${MAX_TEMPLATE_COUNT}个)，请先删除部分模板`, type: 'info' });
      return;
    }
    if (storageStats.isStorageFull) {
      setToast({ message: `存储空间已满 (${formatBytes(MAX_STORAGE_CAPACITY)})，请先清理空间`, type: 'info' });
      return;
    }
    setIsModalOpen(true);
  };

  const toggleManageMode = () => {
    setIsManageMode(!isManageMode);
    setSelectedTemplateIds(new Set());
  };
  const toggleGenManageMode = () => {
    setIsGenManageMode(!isGenManageMode);
    setSelectedGenIds(new Set());
  };

  const handleSelectTemplate = (id: string) => {
    const newSelected = new Set(selectedTemplateIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedTemplateIds(newSelected);
  };
  const handleSelectGen = (id: string) => {
    const newSelected = new Set(selectedGenIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedGenIds(newSelected);
  };

  const handleSelectAllTemplates = () => {
    if (selectedTemplateIds.size === templates.length) setSelectedTemplateIds(new Set());
    else setSelectedTemplateIds(new Set(templates.map(t => t.id)));
  };
  const handleSelectAllGens = () => {
    if (selectedGenIds.size === filteredGenerations.length) setSelectedGenIds(new Set());
    else setSelectedGenIds(new Set(filteredGenerations.map(g => g.id)));
  };

  const confirmAction = (title: string, message: string, action: () => void, type: 'danger' | 'info' = 'info') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        action();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      type
    });
  };

  const handleDownload = (url: string, filename: string) => {
    setToast({ message: `开始下载: ${filename}`, type: 'success' });
    console.log(`Simulating download of ${filename} from ${url}`);
  };

  // --- TEMPLATE BULK ACTIONS ---
  const handleBulkStatus = (status: TemplateStatus) => {
    const targetIds = Array.from(selectedTemplateIds).filter(id => {
      const t = templates.find(temp => temp.id === id);
      return t && t.status !== status;
    });

    if (targetIds.length === 0) return;

    const actionName = status === TemplateStatus.ONLINE ? '上架' : '下架';
    confirmAction(
      `批量${actionName}`,
      `确定要将选中的 ${targetIds.length} 个视频模板${actionName}吗？`,
      () => {
        setTemplates(prev => prev.map(t => 
          selectedTemplateIds.has(t.id) ? { ...t, status } : t
        ));
        setIsManageMode(false);
        setSelectedTemplateIds(new Set());
        setToast({ message: `已成功${actionName} ${targetIds.length} 个模板`, type: 'success' });
      }
    );
  };

  const handleBulkDelete = () => {
    if (!selectionState.canDelete) {
      setToast({ message: '为了安全，请先下架模板后再进行删除操作', type: 'info' });
      return;
    }
    confirmAction(
      '批量删除',
      `删除后将无法恢复，确定要删除选中的 ${selectedTemplateIds.size} 个视频吗?`,
      () => {
        setTemplates(prev => prev.filter(t => !selectedTemplateIds.has(t.id)));
        setIsManageMode(false);
        setSelectedTemplateIds(new Set());
        setToast({ message: '删除成功', type: 'success' });
      },
      'danger'
    );
  };

  // --- GENERATION BULK ACTIONS ---
  const handleBulkGenStatus = (status: PublishStatus) => {
    const targetIds = Array.from(selectedGenIds).filter(id => {
      const g = generations.find(gen => gen.id === id);
      return g && g.publishStatus !== status;
    });
    if (targetIds.length === 0) return;

    const actionName = status === PublishStatus.ONLINE ? '上架' : '下架';
    confirmAction(
      `批量${actionName}`,
      `确定要将选中的 ${targetIds.length} 个生成视频${actionName}吗？\n${status === PublishStatus.ONLINE ? '上架后将在C端广场可见' : '下架后仅用户自己可见'}`,
      () => {
        setGenerations(prev => prev.map(g => 
           selectedGenIds.has(g.id) ? { ...g, publishStatus: status } : g
        ));
        setIsGenManageMode(false);
        setSelectedGenIds(new Set());
        setToast({ message: `已成功${actionName} ${targetIds.length} 个视频`, type: 'success' });
      }
    );
  };

  const handleBulkGenDelete = () => {
    confirmAction(
      '批量删除',
      `确定要删除选中的 ${selectedGenIds.size} 条生成记录吗？\n删除后用户将无法查看此视频。`,
      () => {
        setGenerations(prev => prev.filter(g => !selectedGenIds.has(g.id)));
        setIsGenManageMode(false);
        setSelectedGenIds(new Set());
        setToast({ message: '删除成功', type: 'success' });
      },
      'danger'
    );
  };
  
  const handleBulkGenDownload = () => {
    const selectedCount = selectedGenIds.size;
    if (selectedCount === 0) return;

    setToast({ message: `开始批量下载 ${selectedCount} 个视频`, type: 'success' });
    console.log('Downloading generations:', Array.from(selectedGenIds));
  };


  const handleBossDeleteTemplates = (ids: string[]) => {
    // Direct Update: Confirmation is handled by the UI Component (BossTemplateManager)
    setTemplates(prev => prev.filter(t => !ids.includes(t.id)));
  };
  const handleBossUpdateStatus = (ids: string[], status: TemplateStatus) => {
    // Direct Update: Confirmation is handled by the UI Component
    setTemplates(prev => prev.map(t => ids.includes(t.id) ? { ...t, status } : t));
  };
  
  const handleBossDeleteGenerations = (ids: string[]) => {
     setGenerations(prev => prev.filter(g => !ids.includes(g.id)));
  };
  const handleBossUpdateGenerationStatus = (ids: string[], status: PublishStatus) => {
     setGenerations(prev => prev.map(g => ids.includes(g.id) ? { ...g, publishStatus: status } : g));
  };

  // --- CONSUMER HANDLERS ---
  const handleStartCreation = (template: VideoTemplate) => {
    if (usageCount >= MAX_USAGE) {
      setIsLimitModalOpen(true);
      return;
    }
    setSelectedConsumerTemplate(template);
    setConsumerView('PICKER');
  };

  const handleImageSelected = (url: string) => {
    setSelectedConsumerImage(url);
    setConsumerView('CROPPER');
  };

  const handleStartGeneration = (script?: string) => {
    setConsumerView('FEED');
    const newRecord: GenerationRecord = {
      id: `gen-new-${Date.now()}`,
      templateId: selectedConsumerTemplate!.id,
      templateName: selectedConsumerTemplate!.name,
      userName: 'Me',
      thumbnailUrl: selectedConsumerImage,
      status: GenerationStatus.PROCESSING,
      publishStatus: PublishStatus.ONLINE,
      timestamp: new Date().toLocaleString()
    };
    
    // Log script usage if any
    if (script) {
        console.log("Generating with custom script:", script);
    }

    setConsumerGenerations([newRecord, ...consumerGenerations]);
    setUsageCount(prev => prev + 1);
    setToast({
      message: '开始生成，作品已生成，去看看吧',
      type: 'info'
    });
    setTimeout(() => {
      setConsumerGenerations(prev => prev.map(r => 
        r.id === newRecord.id ? { ...r, status: GenerationStatus.COMPLETED } : r
      ));
      setToast({
        message: '生成成功！点击查看',
        type: 'success',
        onClick: () => {
            setSelectedResult({ ...newRecord, status: GenerationStatus.COMPLETED });
            setConsumerView('RESULT');
            setToast(null);
        }
      });
    }, 3000);
  };

  // --- RENDER ---
  
  if (appMode === 'LANDING') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">智能体视频工作室</h1>
            <p className="text-gray-500">选择您的入口</p>
          </div>
          <Button fullWidth size="lg" onClick={() => setAppMode('ADMIN')}>
            我是管理员 (B端)
          </Button>
          <Button fullWidth size="lg" variant="secondary" onClick={() => setAppMode('CONSUMER')}>
            我是用户 (C端)
          </Button>
           <Button fullWidth size="lg" variant="outline" onClick={() => setAppMode('BOSS')}>
            我是BOSS (平台)
          </Button>
        </div>
      </div>
    );
  }

  if (appMode === 'BOSS') {
    return (
      <BossLayout 
        activeTab={activeBossTab} 
        onTabChange={setActiveBossTab}
        onExit={() => setAppMode('LANDING')}
      >
        <div className="mb-6 flex space-x-6 border-b border-gray-200">
           <button 
             onClick={() => setActiveBossTab(BossTab.TEMPLATE_MGMT)}
             className={`pb-3 font-medium text-sm transition-colors relative ${
               activeBossTab === BossTab.TEMPLATE_MGMT 
                 ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600' 
                 : 'text-gray-500 hover:text-gray-800'
             }`}
           >
             视频模板管理
           </button>
           <button 
              onClick={() => setActiveBossTab(BossTab.GENERATION_MGMT)}
              className={`pb-3 font-medium text-sm transition-colors relative ${
               activeBossTab === BossTab.GENERATION_MGMT 
                 ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600' 
                 : 'text-gray-500 hover:text-gray-800'
             }`}
           >
             AI生成视频管理
           </button>
        </div>
        {activeBossTab === BossTab.TEMPLATE_MGMT && (
          <BossTemplateManager 
            templates={templates}
            onDelete={handleBossDeleteTemplates}
            onUpdateStatus={handleBossUpdateStatus}
          />
        )}
        {activeBossTab === BossTab.GENERATION_MGMT && (
          <BossGenerationManager 
             generations={generations} 
             onDelete={handleBossDeleteGenerations}
             onUpdateStatus={handleBossUpdateGenerationStatus}
          />
        )}
      </BossLayout>
    );
  }

  // Render Admin View (B-Side) - UPDATED TO NEW DESIGN
  if (appMode === 'ADMIN') {
    const isAnyManageMode = isManageMode || isGenManageMode;
    const activeSelectedCount = isManageMode ? selectionState.count : genSelectionState.count;

    return (
      <div className="min-h-screen flex justify-center bg-gray-50">
        <div className="w-full max-w-md bg-[#f9fafb] min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
          
          {/* Header - Dynamic based on Manage Mode */}
          {!isAnyManageMode ? (
            /* Normal Header */
            <header className="px-4 py-3 bg-white sticky top-0 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setAppMode('LANDING')} className="p-1 hover:bg-gray-100 rounded-full">
                  <ChevronLeft size={24} className="text-gray-900" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">智能体设置</h1>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreHorizontal size={20} className="text-gray-900" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Disc size={20} className="text-gray-900" />
                </button>
              </div>
            </header>
          ) : (
            /* Manage Mode Header */
            <header className="px-4 py-3 bg-white sticky top-0 z-10 flex items-center justify-between border-b border-gray-100">
               <button 
                 onClick={() => { setIsManageMode(false); setIsGenManageMode(false); }}
                 className="p-1 hover:bg-gray-100 rounded-full"
               >
                 <X size={24} className="text-gray-900" />
               </button>
               <h1 className="text-base font-medium text-gray-900">已选{activeSelectedCount}个</h1>
               <button 
                 onClick={isManageMode ? handleSelectAllTemplates : handleSelectAllGens}
                 className="text-sm font-medium text-blue-600 hover:text-blue-700"
               >
                 {activeSelectedCount > 0 ? '取消全选' : '全选'}
               </button>
            </header>
          )}

          {/* Tab Navigation (Underline Style) - Hide in Manage Mode for cleaner look, or keep? 
              Design usually hides tabs in selection mode. Let's hide if manage mode is active.
          */}
          {!isAnyManageMode && (
            <div className="bg-white px-4 border-b border-gray-100 flex gap-6 pt-2">
              <button 
                onClick={() => {
                  setActiveAdminTab('templates');
                  setIsManageMode(false);
                  setIsGenManageMode(false);
                }}
                className={`pb-3 text-sm font-medium transition-all relative ${
                  activeAdminTab === 'templates' 
                    ? 'text-blue-600 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-blue-600 after:rounded-full' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                视频模板管理
              </button>
              <button 
                onClick={() => {
                  setActiveAdminTab('generations');
                  setIsManageMode(false);
                  setIsGenManageMode(false);
                }}
                className={`pb-3 text-sm font-medium transition-all relative ${
                  activeAdminTab === 'generations' 
                    ? 'text-blue-600 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-blue-600 after:rounded-full' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                生成视频管理
              </button>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-4 scroll-smooth">
            {activeAdminTab === 'templates' && (
              <div className="space-y-6 pb-24">
                
                {/* 1. Upload Area (Only show in Normal Mode) */}
                {!isManageMode && (
                  <div 
                    onClick={handleClickUpload}
                    className="bg-blue-50/50 border border-blue-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-1">
                        <Play size={20} fill="currentColor" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">上传视频</h3>
                    <p className="text-[10px] text-gray-400">单次上传1个30s以内视频，不超过50MB</p>
                  </div>
                )}

                {/* 2. Limit Settings Row (Only show in Normal Mode) */}
                {!isManageMode && (
                  <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                      限制次数
                      <Info size={14} className="text-gray-400" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setDailyLimit(Math.max(1, dailyLimit - 1))}
                          className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{dailyLimit}</span>
                        <button 
                          onClick={() => setDailyLimit(dailyLimit + 1)}
                          className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        >
                          <Plus size={16} />
                        </button>
                    </div>
                  </div>
                )}

                {/* 3. List Header */}
                {!isManageMode && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">共{templates.length}个模板 · 已推荐3个</span>
                  </div>
                )}

                {/* 4. Template Grid (2 Columns) */}
                <div className="grid grid-cols-2 gap-3">
                  {templates.map(tpl => (
                    <TemplateCard 
                      key={tpl.id} 
                      template={tpl} 
                      isSelectionMode={isManageMode}
                      isSelected={selectedTemplateIds.has(tpl.id)}
                      onSelect={handleSelectTemplate}
                      onClick={(template) => setPreviewTemplate(template)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeAdminTab === 'generations' && (
              <div className="space-y-4 pb-24">
                {/* 1. Filter Tabs (Pill) - Only show in Normal Mode */}
                {!isGenManageMode && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {['全部', '已完成', '生成中', '失败'].map((filter, idx) => {
                      const count = idx === 0 ? generations.length : generations.filter(g => {
                        if(filter === '已完成') return g.status === GenerationStatus.COMPLETED;
                        if(filter === '生成中') return g.status === GenerationStatus.PROCESSING;
                        if(filter === '失败') return g.status === GenerationStatus.FAILED;
                        return true;
                      }).length;
                      
                      return (
                        <button
                          key={filter}
                          onClick={() => setGenFilter(filter)}
                          className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                            genFilter === filter 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                        >
                          {filter} {count}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* 2. Generation Grid */}
                <GenerationList 
                  items={filteredGenerations} 
                  isSelectionMode={isGenManageMode}
                  selectedIds={selectedGenIds}
                  onSelect={handleSelectGen}
                  onPreview={setPreviewGenRecord}
                />
              </div>
            )}
          </main>

          {/* BOTTOM FIXED ACTION BAR */}
          
          {/* Template Manage Bar */}
          {activeAdminTab === 'templates' && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-2 shadow-xl z-20 safe-area-bottom">
              {!isManageMode ? (
                 <div className="p-2">
                    <Button fullWidth onClick={toggleManageMode} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 text-sm font-medium">
                        管理
                    </Button>
                 </div>
              ) : (
                /* Manage Action Toolbar (Icons + Text) */
                <div className="grid grid-cols-3 gap-1 p-1">
                   {/* Online Action */}
                   <button 
                      onClick={() => handleBulkStatus(TemplateStatus.ONLINE)}
                      disabled={selectionState.count === 0 || !selectionState.hasOffline}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-gray-600 active:bg-gray-50 rounded-lg disabled:opacity-40 disabled:active:bg-transparent"
                   >
                      <ArrowUp size={20} className="text-gray-800" />
                      <span className="text-[10px] font-medium">上架</span>
                   </button>
                   
                   {/* Offline Action */}
                   <button 
                      onClick={() => handleBulkStatus(TemplateStatus.OFFLINE)}
                      disabled={selectionState.count === 0 || !selectionState.hasOnline}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-gray-600 active:bg-gray-50 rounded-lg disabled:opacity-40 disabled:active:bg-transparent"
                   >
                      <ArrowDown size={20} className="text-gray-800" />
                      <span className="text-[10px] font-medium">下架</span>
                   </button>

                   {/* Delete Action */}
                   <button 
                      onClick={handleBulkDelete}
                      disabled={selectionState.count === 0}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-gray-600 active:bg-gray-50 rounded-lg disabled:opacity-40 disabled:active:bg-transparent"
                   >
                      <Trash2 size={20} className="text-gray-800" />
                      <span className="text-[10px] font-medium">删除</span>
                   </button>
                </div>
              )}
            </div>
          )}

           {/* Generation Manage Bar */}
           {activeAdminTab === 'generations' && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-2 shadow-xl z-20 safe-area-bottom">
              {!isGenManageMode ? (
                 <div className="p-2">
                    <Button fullWidth onClick={toggleGenManageMode} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 text-sm font-medium">
                        管理
                    </Button>
                 </div>
              ) : (
                <div className="grid grid-cols-4 gap-1 p-1">
                   <button 
                      onClick={handleBulkGenDownload}
                      disabled={genSelectionState.count === 0}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-gray-600 active:bg-gray-50 rounded-lg disabled:opacity-40"
                   >
                      <Download size={20} className="text-gray-800" />
                      <span className="text-[10px] font-medium">下载</span>
                   </button>

                   <button 
                      onClick={() => handleBulkGenStatus(PublishStatus.ONLINE)}
                      disabled={genSelectionState.count === 0}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-gray-600 active:bg-gray-50 rounded-lg disabled:opacity-40"
                   >
                      <ArrowUp size={20} className="text-gray-800" />
                      <span className="text-[10px] font-medium">上架</span>
                   </button>
                   
                   <button 
                      onClick={() => handleBulkGenStatus(PublishStatus.OFFLINE)}
                      disabled={genSelectionState.count === 0}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-gray-600 active:bg-gray-50 rounded-lg disabled:opacity-40"
                   >
                      <ArrowDown size={20} className="text-gray-800" />
                      <span className="text-[10px] font-medium">下架</span>
                   </button>

                   <button 
                      onClick={handleBulkGenDelete}
                      disabled={genSelectionState.count === 0}
                      className="flex flex-col items-center justify-center gap-1 py-2 text-gray-600 active:bg-gray-50 rounded-lg disabled:opacity-40"
                   >
                      <Trash2 size={20} className="text-gray-800" />
                      <span className="text-[10px] font-medium">删除</span>
                   </button>
                </div>
              )}
            </div>
          )}

          <UploadModal 
            isOpen={isModalOpen} 
            remainingQuota={storageStats.remainingBytes}
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddTemplate}
          />
          
          <ConfirmDialog 
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            type={confirmDialog.type}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          />

          {/* GENERATION Preview Modal */}
          {previewGenRecord && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setPreviewGenRecord(null)}>
                <div className="w-full max-w-sm bg-black rounded-2xl overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="aspect-video bg-gray-900 relative">
                        <img src={previewGenRecord.thumbnailUrl} className="w-full h-full object-contain" alt="Video Preview" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                              <Play size={32} fill="white" className="ml-1 text-white" />
                           </div>
                        </div>
                    </div>
                    <button 
                       onClick={() => setPreviewGenRecord(null)}
                       className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md"
                    >
                       <X size={20} />
                    </button>
                    <div className="p-4 bg-gray-900 text-white">
                        <h3 className="font-bold">{previewGenRecord.templateName}</h3>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                            <span>用户: {previewGenRecord.userName}</span>
                            <span>{previewGenRecord.timestamp}</span>
                        </div>
                         {/* Download Button */}
                        <div className="mt-4">
                           <Button 
                              fullWidth 
                              size="sm"
                              onClick={() => handleDownload(previewGenRecord.thumbnailUrl, `${previewGenRecord.templateName}_${previewGenRecord.id}.mp4`)}
                              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                           >
                              <Download size={16} className="mr-2" />
                              下载视频
                           </Button>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* TEMPLATE Preview Modal */}
          {previewTemplate && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setPreviewTemplate(null)}>
                <div className="w-full max-w-sm bg-black rounded-2xl overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="aspect-video bg-gray-900 relative">
                        <img src={previewTemplate.thumbnailUrl} className="w-full h-full object-contain" alt="Template Preview" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                              <Play size={32} fill="white" className="ml-1 text-white" />
                           </div>
                        </div>
                    </div>
                    <button 
                       onClick={() => setPreviewTemplate(null)}
                       className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md"
                    >
                       <X size={20} />
                    </button>
                    <div className="p-4 bg-gray-900 text-white">
                        <h3 className="font-bold">{previewTemplate.name}</h3>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                            <span>{previewTemplate.resolution} · {previewTemplate.duration}</span>
                            <span>{new Date(previewTemplate.createdAt).toLocaleDateString()}</span>
                        </div>
                        {/* Download Button */}
                        <div className="mt-4">
                           <Button 
                              fullWidth 
                              size="sm"
                              onClick={() => handleDownload(previewTemplate.thumbnailUrl, `${previewTemplate.name}_original.mp4`)}
                              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                           >
                              <Download size={16} className="mr-2" />
                              下载原视频
                           </Button>
                        </div>
                    </div>
                </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- CONSUMER RENDER (C-Side) ---
  return (
    <div className="min-h-screen flex justify-center bg-black">
      <div className="w-full max-w-md bg-black min-h-screen shadow-2xl relative overflow-hidden">
        
        {toast && (
          <div 
             className="absolute top-4 left-4 right-4 z-[70] animate-in slide-in-from-top-5 fade-in duration-300 cursor-pointer"
             onClick={() => {
               if (toast.onClick) toast.onClick();
               setToast(null);
             }}
          >
            <div className={`p-4 rounded-xl shadow-lg flex items-center justify-between gap-3 ${toast.type === 'success' ? 'bg-white text-gray-900' : 'bg-blue-600 text-white'}`}>
              <div className="flex items-center gap-3">
                {toast.type === 'info' && <Loader2 className="animate-spin" size={20} />}
                {toast.type === 'success' && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><Check size={12} className="text-white"/></div>}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{toast.message}</h4>
                </div>
              </div>
              {toast.onClick && <ChevronLeft size={16} className="rotate-180 opacity-50" />}
            </div>
          </div>
        )}

        {isLimitModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-white rounded-2xl w-full max-w-xs p-6 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">限制次数</h3>
                <p className="text-sm text-gray-500 mb-6">今日生成次数已用完，请明日再来体验更多精彩模板。</p>
                <Button fullWidth onClick={() => setIsLimitModalOpen(false)}>好的</Button>
             </div>
          </div>
        )}

        {consumerView === 'FEED' && (
          <ConsumerFeed 
            templates={consumerTemplates} 
            remainingUses={MAX_USAGE - usageCount}
            onSelectTemplate={handleStartCreation}
            onOpenHistory={() => setConsumerView('HISTORY')}
            onExit={() => setAppMode('LANDING')}
          />
        )}

        {consumerView === 'PICKER' && (
          <ConsumerImagePicker 
            onBack={() => setConsumerView('FEED')}
            onSelectImage={handleImageSelected}
          />
        )}

        {consumerView === 'CROPPER' && selectedConsumerTemplate && (
          <ConsumerCropper
             imageUrl={selectedConsumerImage}
             template={selectedConsumerTemplate}
             onBack={() => setConsumerView('PICKER')}
             onStartGeneration={handleStartGeneration}
          />
        )}

        {consumerView === 'HISTORY' && (
           <ConsumerHistory 
             records={consumerGenerations}
             onBack={() => setConsumerView('FEED')}
             onSelectRecord={(rec) => {
               if(rec.status === GenerationStatus.COMPLETED) {
                 setSelectedResult(rec);
                 setConsumerView('RESULT');
               }
             }}
           />
        )}

        {consumerView === 'RESULT' && selectedResult && (
          <ConsumerResult 
            record={selectedResult}
            onBack={() => setConsumerView('HISTORY')}
          />
        )}

      </div>
    </div>
  );
};

export default App;