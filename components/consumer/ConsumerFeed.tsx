
import React, { useState, useEffect, useRef } from 'react';
import { VideoTemplate, LipSyncMode } from '../../types';
import { Play, Clock, MoreHorizontal, History, LogOut, AlertCircle, Mic, Type } from '../Icons';
import { Button } from '../Button';

interface ConsumerFeedProps {
  templates: VideoTemplate[];
  remainingUses: number;
  onSelectTemplate: (template: VideoTemplate) => void;
  onOpenHistory: () => void;
  onExit: () => void;
}

export const ConsumerFeed: React.FC<ConsumerFeedProps> = ({ 
  templates, 
  remainingUses, 
  onSelectTemplate,
  onOpenHistory,
  onExit
}) => {
  // Use state to track the active index, initialized randomly
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (templates.length > 0) {
      // Pick a random template on mount to simulate a feed
      const randomIndex = Math.floor(Math.random() * templates.length);
      setActiveIndex(randomIndex);
    }
  }, [templates.length]); // Only re-run if template count changes significantly

  const handleWheel = (e: React.WheelEvent) => {
    // Debounce scroll to prevent rapid switching
    if (scrollTimeout.current) return;

    const threshold = 30; // Min scroll distance to trigger
    if (Math.abs(e.deltaY) < threshold) return;

    if (e.deltaY > 0) {
      // Scroll Down -> Next Video
      if (activeIndex < templates.length - 1) {
        setActiveIndex(prev => prev + 1);
        scrollTimeout.current = setTimeout(() => {
          scrollTimeout.current = null;
        }, 500); // 500ms cooldown
      }
    } else {
      // Scroll Up -> Prev Video
      if (activeIndex > 0) {
        setActiveIndex(prev => prev - 1);
        scrollTimeout.current = setTimeout(() => {
          scrollTimeout.current = null;
        }, 500);
      }
    }
  };

  const activeTemplate = templates.length > 0 ? templates[activeIndex] : null;

  if (!activeTemplate) {
    return (
      <div className="relative w-full h-full bg-black text-white flex flex-col">
         {/* Header Overlay */}
         <div className="absolute top-0 left-0 right-0 p-4 pt-8 z-10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button onClick={onExit} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={onOpenHistory} className="p-2 bg-white/10 backdrop-blur-md rounded-full">
                <History size={20} />
              </button>
            </div>
         </div>

         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-gray-500">
               <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold">暂无上架模板</h3>
            <p className="text-gray-400 text-sm">管理员暂未上架任何视频模板，请稍后再来。</p>
            <Button onClick={onExit} variant="outline" className="mt-4 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
               返回首页
            </Button>
         </div>
      </div>
    );
  }

  // Determine Badge Type
  let featureBadge = null;
  if (activeTemplate.supportLipSync) {
    if (activeTemplate.lipSyncMode === LipSyncMode.CUSTOM) {
       featureBadge = (
         <div className="flex items-center gap-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            <Mic size={10} /> 配音玩法
         </div>
       );
    } else {
       featureBadge = (
         <div className="flex items-center gap-1 bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            <Type size={10} /> 照片开口
         </div>
       );
    }
  }

  return (
    <div 
      className="relative w-full h-full bg-black text-white flex flex-col outline-none"
      onWheel={handleWheel}
    >
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-8 z-10 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors">
            <LogOut size={16} />
          </button>
          <button className="p-2 bg-white/10 backdrop-blur-md rounded-full">
             <span className="text-xs font-medium px-1">视频模板</span>
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={onOpenHistory} className="p-2 bg-white/10 backdrop-blur-md rounded-full">
            <History size={20} />
          </button>
          <button className="p-2 bg-white/10 backdrop-blur-md rounded-full">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Main Content (Video Area) */}
      <div className="flex-1 relative overflow-hidden group">
        {/* Background Image (Simulating Video) */}
        <div className="w-full h-full relative transition-transform duration-300">
           <img 
            key={activeTemplate.id}
            src={activeTemplate.thumbnailUrl} 
            alt={activeTemplate.name} 
            className="w-full h-full object-cover opacity-80 animate-in fade-in zoom-in-105 duration-300"
          />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
                <Play size={32} fill="white" className="ml-1" />
            </div>
        </div>

        {/* Scroll Hint */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-center opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none">
           <div className="w-1 h-12 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="w-full bg-white transition-all duration-300"
                style={{ 
                  height: `${((activeIndex + 1) / templates.length) * 100}%`
                }}
              />
           </div>
           <span className="text-[10px] text-white/80">{activeIndex + 1}/{templates.length}</span>
        </div>

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="mb-4">
             <div className="flex items-center gap-2 mb-2">
                {featureBadge}
                {!featureBadge && <span className="bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">热门</span>}
                <h2 className="text-lg font-bold">{activeTemplate.name}</h2>
             </div>
             <p className="text-sm text-gray-200 line-clamp-2">
               {activeTemplate.supportLipSync 
                 ? activeTemplate.lipSyncMode === LipSyncMode.CUSTOM 
                    ? "跟随提词器录制你的声音，生成专属的口播视频，好玩又有趣！" 
                    : "只需一张照片，完美保留模版原声，让照片瞬间开口说话！"
                 : "这是一个非常酷炫的AI视频模板，只需一张照片即可生成同款视频。#AI #视频制作"
               }
             </p>
             <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
               <span className="flex items-center gap-1"><Play size={10} /> {activeTemplate.usageCount} 使用</span>
               <span>·</span>
               <span>{activeTemplate.duration}</span>
             </div>
          </div>

          {/* Action Button */}
          <div className="space-y-2">
             <div className="flex items-center justify-between text-xs text-gray-400 px-1">
               <span>🔥 今日剩余 {remainingUses}/10 次</span>
             </div>
             <Button 
               fullWidth 
               size="lg"
               onClick={() => onSelectTemplate(activeTemplate)}
               className={`border-none rounded-full h-12 text-base font-semibold shadow-lg ${
                 activeTemplate.supportLipSync 
                   ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/50' 
                   : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/50'
               }`}
             >
                {activeTemplate.supportLipSync ? '一键做同款 (对口型)' : '一键做同款'}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
