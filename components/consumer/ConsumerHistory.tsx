import React from 'react';
import { ChevronLeft, MoreHorizontal, Loader2, Play, AlertCircle } from '../Icons';
import { GenerationRecord, GenerationStatus } from '../../types';

interface ConsumerHistoryProps {
  records: GenerationRecord[];
  onBack: () => void;
  onSelectRecord: (record: GenerationRecord) => void;
}

export const ConsumerHistory: React.FC<ConsumerHistoryProps> = ({ 
  records, 
  onBack, 
  onSelectRecord 
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
        <button onClick={onBack} className="p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-bold">AI生成记录</h1>
        <button className="p-1">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Waterfall List */}
      <div className="flex-1 overflow-y-auto p-3">
         <div className="grid grid-cols-2 gap-3">
           {records.map(record => (
             <div 
               key={record.id} 
               onClick={() => onSelectRecord(record)}
               className="bg-white rounded-xl overflow-hidden shadow-sm relative group cursor-pointer"
             >
               {/* Thumbnail */}
               <div className="aspect-[3/4] bg-gray-200 relative">
                 <img src={record.thumbnailUrl} alt={record.templateName} className="w-full h-full object-cover" />
                 
                 {/* Status Overlays */}
                 {record.status === GenerationStatus.PROCESSING && (
                   <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                      <Loader2 size={24} className="animate-spin mb-2" />
                      <span className="text-xs font-medium">生成中 99%</span>
                   </div>
                 )}

                 {record.status === GenerationStatus.FAILED && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white/80">
                      <AlertCircle size={24} className="mb-2 text-red-400" />
                      <span className="text-xs font-medium">生成失败</span>
                   </div>
                 )}

                 {record.status === GenerationStatus.COMPLETED && (
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <Play size={24} fill="white" className="text-white" />
                   </div>
                 )}
               </div>

               {/* Info */}
               <div className="p-2">
                 <h3 className="text-xs font-medium truncate">{record.templateName}</h3>
                 <p className="text-[10px] text-gray-400 mt-1">{record.timestamp.split(' ')[0]}</p>
                 
                 {/* Status Tag for Completed */}
                 {record.status === GenerationStatus.COMPLETED && (
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white">
                      已公开
                    </div>
                 )}
               </div>
             </div>
           ))}
         </div>
         
         {records.length === 0 && (
           <div className="flex flex-col items-center justify-center h-64 text-gray-400">
             <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
             <p className="text-sm">暂无生成记录</p>
           </div>
         )}
      </div>
    </div>
  );
};