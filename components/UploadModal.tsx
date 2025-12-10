
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { X, Loader2, Play, Check, Mic, AlertCircle, FileAudio, Type, User } from './Icons';
import { generateCreativeTemplateName } from '../services/geminiService';
import { VideoTemplate, TemplateStatus, LipSyncMode } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  remainingQuota: number; // Bytes
  onClose: () => void;
  onSave: (template: VideoTemplate) => void;
}

type Step = 'UPLOAD' | 'CONFIG_NAME' | 'CONFIG_AREA';

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, remainingQuota, onClose, onSave }) => {
  const [step, setStep] = useState<Step>('UPLOAD');
  const [isUploading, setIsUploading] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Lip Sync State
  const [isLipSyncEnabled, setIsLipSyncEnabled] = useState(false);
  const [lipSyncMode, setLipSyncMode] = useState<LipSyncMode>(LipSyncMode.ORIGINAL);
  const [customScript, setCustomScript] = useState('');
  const [videoDuration, setVideoDuration] = useState(15); // Mock duration in seconds

  // Mock Video Reference (Image for this demo)
  const MOCK_VIDEO_IMG = "https://picsum.photos/seed/newupload/400/600";
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived Values
  const maxScriptChars = videoDuration * 4;
  const isScriptOverLimit = customScript.length > maxScriptChars;

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('UPLOAD');
      setTemplateName('');
      setSelectedTags([]);
      setIsLipSyncEnabled(false);
      setLipSyncMode(LipSyncMode.ORIGINAL);
      setCustomScript('');
      setPreviewUrl('');
      setErrorMessage(null);
      setVideoDuration(15); // Reset mock duration
    }
  }, [isOpen]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 1. Check Max File Size (50MB)
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`视频文件过大。最大支持 ${formatBytes(MAX_FILE_SIZE)}。`);
        return;
      }

      // 2. Check Quota (Available Storage)
      if (file.size > remainingQuota) {
        setErrorMessage(`存储空间不足。剩余空间 ${formatBytes(remainingQuota)}，文件大小 ${formatBytes(file.size)}。`);
        return;
      }

      setIsUploading(true);
      
      // Simulate Upload Delay
      setTimeout(async () => {
        setPreviewUrl(MOCK_VIDEO_IMG);
        setIsUploading(false);
        setStep('CONFIG_NAME');
        
        // AI Integration: Suggest Name
        const suggestedName = await generateCreativeTemplateName(file.name);
        setTemplateName(suggestedName);
      }, 2000);
    }
  };

  const handleConfigNameComplete = () => {
    if (templateName.trim()) {
      setStep('CONFIG_AREA');
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleFinish = () => {
    if (isLipSyncEnabled && lipSyncMode === LipSyncMode.CUSTOM && (isScriptOverLimit || !customScript.trim())) {
      return;
    }

    const newTemplate: VideoTemplate = {
      id: Date.now().toString(),
      name: templateName,
      thumbnailUrl: previewUrl,
      duration: `${videoDuration}s`,
      resolution: "1080P",
      status: TemplateStatus.ONLINE,
      tags: selectedTags.length > 0 ? selectedTags : ['通用'],
      supportLipSync: isLipSyncEnabled,
      lipSyncMode: isLipSyncEnabled ? lipSyncMode : undefined,
      defaultScript: isLipSyncEnabled && lipSyncMode === LipSyncMode.CUSTOM ? customScript : undefined,
      createdAt: Date.now()
    };
    onSave(newTemplate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-[90vh] sm:h-[800px] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="font-semibold text-lg">
            {step === 'UPLOAD' && '上传视频'}
            {(step === 'CONFIG_NAME' || step === 'CONFIG_AREA') && '配置模板'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
          
          {/* STEP 1: UPLOAD */}
          {step === 'UPLOAD' && (
             <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                {isUploading ? (
                  <div className="text-center space-y-4">
                    <Loader2 size={48} className="text-blue-500 animate-spin mx-auto" />
                    <p className="text-gray-500 font-medium">正在上传...</p>
                  </div>
                ) : (
                  <>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full aspect-[9/16] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          errorMessage 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${errorMessage ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-600'}`}>
                         {errorMessage ? <AlertCircle size={28} /> : <Play size={28} fill="currentColor" />}
                      </div>
                      <span className={`font-medium ${errorMessage ? 'text-red-600' : 'text-blue-700'}`}>
                        {errorMessage || '点击上传视频'}
                      </span>
                      <span className={`text-xs mt-1 ${errorMessage ? 'text-red-400' : 'text-blue-400'}`}>
                        {errorMessage || '单次上传1个30s以内视频，不超过50MB'}
                      </span>
                    </div>
                    {/* Quota Hint */}
                    <div className="text-xs text-gray-400">
                       剩余可用空间: {formatBytes(remainingQuota)}
                    </div>

                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileSelect} 
                    />
                  </>
                )}
             </div>
          )}

          {/* STEP 2: CONFIG NAME */}
          {step === 'CONFIG_NAME' && (
            <div className="w-full space-y-6">
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
                 <img src={previewUrl} className="w-full h-full object-cover opacity-80" alt="Preview" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Play size={40} className="text-white opacity-80" fill="white" />
                 </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">模板名称</label>
                <div className="relative">
                  <input 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="输入模板名称..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <div className="absolute right-3 top-3.5 text-xs text-gray-400">
                    {templateName.length}/20
                  </div>
                </div>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  ✨ AI已根据文件生成建议名称
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIG AREA & LIP SYNC (COMPACT LAYOUT) */}
          {step === 'CONFIG_AREA' && (
            <div className="w-full flex flex-col gap-4">
               {/* Video Preview */}
               <div className="relative w-full aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                 <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[60%] h-[40%] border-2 border-blue-500 bg-blue-500/10 rounded-lg relative animate-pulse">
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                        AI替换区域 (点击视频调整)
                      </span>
                    </div>
                 </div>
               </div>

               {/* Settings Container */}
               <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-3">
                 
                 {/* Subject Selection (Compact Row) */}
                 <div className="flex items-center justify-between">
                   <span className="text-xs font-medium text-gray-700">替换主体:</span>
                   <div className="flex gap-2">
                      {['人物', '背景', '物体'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            selectedTags.includes(tag) 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                   </div>
                 </div>

                 <div className="h-px bg-gray-200"></div>

                 {/* Lip Sync Module (Compact) */}
                 <div className="space-y-3">
                    {/* Header Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic size={14} className={isLipSyncEnabled ? "text-purple-600" : "text-gray-400"} />
                        <span className="text-xs font-medium text-gray-700">对口型增强</span>
                      </div>
                      
                      <button
                        onClick={() => setIsLipSyncEnabled(!isLipSyncEnabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          isLipSyncEnabled ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
                          isLipSyncEnabled ? 'translate-x-4.5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Expanded Settings */}
                    {isLipSyncEnabled && (
                      <div className="space-y-3 animate-in slide-in-from-top-1">
                         {/* Segmented Control for Mode */}
                         <div className="bg-gray-200/50 p-1 rounded-lg flex text-xs font-medium">
                           <button 
                              onClick={() => setLipSyncMode(LipSyncMode.ORIGINAL)}
                              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                                lipSyncMode === LipSyncMode.ORIGINAL 
                                  ? 'bg-white text-purple-700 shadow-sm' 
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              <FileAudio size={12} /> 保留原声
                            </button>
                            <button 
                              onClick={() => setLipSyncMode(LipSyncMode.CUSTOM)}
                              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                                lipSyncMode === LipSyncMode.CUSTOM 
                                  ? 'bg-white text-purple-700 shadow-sm' 
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              <User size={12} /> 用户配音
                            </button>
                         </div>
                         
                         {/* Description Text */}
                         <p className="text-[10px] text-gray-500 px-1">
                           {lipSyncMode === LipSyncMode.ORIGINAL 
                             ? "用户无需录音，视频保留模板原声，口型自动同步。" 
                             : "用户需根据提示文案录制声音，视频口型匹配用户语音。"}
                         </p>

                         {/* Custom Script Input */}
                         {lipSyncMode === LipSyncMode.CUSTOM && (
                            <div className="space-y-1.5">
                               <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-purple-700 font-medium">配置提词器文案</span>
                                  <span className={isScriptOverLimit ? 'text-red-500' : 'text-gray-400'}>
                                     {customScript.length}/{maxScriptChars} 字
                                  </span>
                               </div>
                               <textarea 
                                  value={customScript}
                                  onChange={(e) => setCustomScript(e.target.value)}
                                  placeholder="输入文案供用户朗读..."
                                  className={`w-full text-xs p-2 rounded-lg border outline-none min-h-[60px] resize-none ${
                                    isScriptOverLimit ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-purple-400'
                                  }`}
                                />
                            </div>
                         )}

                         {/* Warning */}
                         <div className="flex items-center gap-1.5 text-[10px] text-orange-600 bg-orange-50 px-2 py-1.5 rounded-md border border-orange-100">
                            <AlertCircle size={10} className="shrink-0" />
                            <span>生成时间将比普通视频稍长。</span>
                         </div>
                      </div>
                    )}
                 </div>
               </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex-shrink-0 safe-area-bottom">
          {step === 'CONFIG_NAME' && (
            <Button fullWidth onClick={handleConfigNameComplete} disabled={!templateName}>
              下一步
            </Button>
          )}
          {step === 'CONFIG_AREA' && (
            <Button 
              fullWidth 
              onClick={handleFinish}
              disabled={isLipSyncEnabled && lipSyncMode === LipSyncMode.CUSTOM && (isScriptOverLimit || !customScript.trim())}
            >
              完成配置
            </Button>
          )}
          {step === 'UPLOAD' && !isUploading && (
             <Button variant="ghost" fullWidth onClick={onClose}>取消</Button>
          )}
        </div>

      </div>
    </div>
  );
};
