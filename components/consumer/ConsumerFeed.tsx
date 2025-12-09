import React from 'react';
import { VideoTemplate } from '../../types';
import { Play, Clock, MoreHorizontal, History, LogOut, AlertCircle } from '../Icons';
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
  // Mocking a single active template for the "Feed" view
  // In a real app, this would be a swiper/carousel
  const activeTemplate = templates.length > 0 ? templates[0] : null;

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

  return (
    <div className="relative w-full h-full bg-black text-white flex flex-col">
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
      <div className="flex-1 relative overflow-hidden">
        {/* Background Image (Simulating Video) */}
        <img 
          src={activeTemplate.thumbnailUrl} 
          alt={activeTemplate.name} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play size={32} fill="white" className="ml-1" />
            </div>
        </div>

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="mb-4">
             <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">热门</span>
                <h2 className="text-lg font-bold">{activeTemplate.name}</h2>
             </div>
             <p className="text-sm text-gray-200 line-clamp-2">
               这是一个非常酷炫的AI视频模板，只需一张照片即可生成同款视频。#AI #视频制作
             </p>
             <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
               <span className="flex items-center gap-1"><Play size={10} /> 12.5w 使用</span>
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
               className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full h-12 text-base font-semibold shadow-lg shadow-blue-900/50"
             >
               一键做同款
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};