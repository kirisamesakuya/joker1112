import React from 'react';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  Share2, 
  Download, 
  Lock, 
  RotateCw,
  Play
} from '../Icons';
import { GenerationRecord } from '../../types';
import { Button } from '../Button';

interface ConsumerResultProps {
  record: GenerationRecord;
  onBack: () => void;
}

export const ConsumerResult: React.FC<ConsumerResultProps> = ({ record, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-black text-white relative">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-8 z-20 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onBack} className="p-2 bg-white/10 backdrop-blur-md rounded-full">
           <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">视频详情</span>
        <button className="p-2 bg-white/10 backdrop-blur-md rounded-full">
            <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Main Content (Video) */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
        <img 
          src={record.thumbnailUrl} 
          alt={record.templateName} 
          className="w-full h-auto max-h-full object-contain" 
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
                <Play size={32} fill="white" className="ml-1" />
            </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-black p-4 pb-8">
        {/* Info */}
        <div className="flex items-center gap-3 mb-6">
           <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.userName}`} alt="Avatar" />
           </div>
           <div>
             <h3 className="text-sm font-medium">{record.templateName}</h3>
             <p className="text-[10px] text-gray-400">{record.timestamp}</p>
           </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-4 gap-4">
           <ActionItem icon={<RotateCw size={20} />} label="重新编辑" />
           <ActionItem icon={<Download size={20} />} label="下载" />
           <ActionItem icon={<Share2 size={20} />} label="分享" />
           <ActionItem icon={<Lock size={20} />} label="未公开" />
        </div>

        {/* Major CTA */}
        <div className="mt-6">
           <Button fullWidth className="bg-blue-600 hover:bg-blue-700 rounded-full font-semibold">
              我也要这么玩
           </Button>
        </div>
      </div>
    </div>
  );
};

const ActionItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="flex flex-col items-center gap-2 group">
     <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-200 group-hover:bg-gray-700 transition-colors">
       {icon}
     </div>
     <span className="text-[10px] text-gray-400">{label}</span>
  </button>
);