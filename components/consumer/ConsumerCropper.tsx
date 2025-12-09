import React from 'react';
import { ChevronLeft, RotateCw, Scissors } from '../Icons';
import { Button } from '../Button';

interface ConsumerCropperProps {
  imageUrl: string;
  onBack: () => void;
  onStartGeneration: () => void;
}

export const ConsumerCropper: React.FC<ConsumerCropperProps> = ({ 
  imageUrl, 
  onBack, 
  onStartGeneration 
}) => {
  return (
    <div className="flex flex-col h-full bg-black text-white">
       {/* Header */}
       <div className="flex items-center justify-between p-4 absolute top-0 left-0 right-0 z-10">
        <button onClick={onBack} className="p-2 bg-black/20 backdrop-blur-md rounded-full">
          <ChevronLeft size={24} />
        </button>
        <div className="w-8"></div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
        <img src={imageUrl} className="w-full h-auto max-h-full object-contain" alt="Editing" />
        
        {/* Crop Overlay (Visual Only) */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="w-full h-full border-[1px] border-white/30 grid grid-cols-3 grid-rows-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border-[0.5px] border-white/10"></div>
              ))}
           </div>
           {/* Face Focus Area Hint */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-blue-500 px-2 py-0.5 rounded-full">
                推荐区域
              </span>
           </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-black p-6 pb-8 space-y-6">
         <div className="flex justify-center gap-8">
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
               <RotateCw size={20} />
               <span className="text-[10px]">旋转</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
               <Scissors size={20} />
               <span className="text-[10px]">裁剪</span>
            </button>
         </div>

         <div className="space-y-3">
           <div className="flex justify-between items-center text-xs text-gray-500">
              <span>圣诞主题视频 (模板名称)</span>
              <span>今日剩余 9/10 次</span>
           </div>
           <Button 
             fullWidth 
             size="lg"
             onClick={onStartGeneration}
             className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold"
           >
             开始生成
           </Button>
         </div>
      </div>
    </div>
  );
};