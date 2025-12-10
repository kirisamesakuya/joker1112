
import React from 'react';
import { GenerationRecord, GenerationStatus, PublishStatus } from '../types';
import { Play, Loader2, Check, AlertCircle, ImageIcon } from './Icons';

interface GenerationListProps {
  items: GenerationRecord[];
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onPreview: (record: GenerationRecord) => void;
}

export const GenerationList: React.FC<GenerationListProps> = ({ 
  items, 
  isSelectionMode,
  selectedIds,
  onSelect,
  onPreview 
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 pb-24 px-1">
      {items.map(item => (
        <div 
          key={item.id} 
          className={`relative bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-200 cursor-pointer`}
          onClick={() => {
            if (isSelectionMode) onSelect(item.id);
            else onPreview(item);
          }}
        >
          {/* Selection Checkbox (Updated to Circle Style) */}
          {isSelectionMode && (
            <div className="absolute top-2 right-2 z-20">
              <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
                selectedIds.has(item.id) 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-black/20 border-white backdrop-blur-sm'
              }`}>
                {selectedIds.has(item.id) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-200">
             {item.thumbnailUrl ? (
               <img src={item.thumbnailUrl} alt={item.templateName} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                 <ImageIcon size={24} />
               </div>
             )}
             
             {/* Status Overlay */}
             {item.status === GenerationStatus.PROCESSING && (
               <div className="absolute inset-0 bg-blue-500/80 flex flex-col items-center justify-center text-white">
                 <Loader2 size={24} className="animate-spin mb-1" />
                 <span className="text-xs font-medium">生成中 99%</span>
               </div>
             )}
             
             {item.status === GenerationStatus.FAILED && (
               <div className="absolute inset-0 bg-gray-500/80 flex flex-col items-center justify-center text-white">
                 <div className="mb-1 text-white/80"><ImageIcon size={24} /></div>
                 <span className="text-xs font-medium">生成失败</span>
               </div>
             )}

             {/* Timestamp Overlay */}
             <div className="absolute bottom-2 left-2 text-[10px] text-white drop-shadow-md font-medium">
               {item.timestamp.split(' ')[0]}
             </div>
          </div>

          {/* Content */}
          <div className="p-2">
            <h4 className="font-medium text-sm text-gray-900 truncate">{item.templateName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-400 truncate flex-1">{item.userName || '匿名用户'}</p>
              {item.publishStatus && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  item.publishStatus === PublishStatus.ONLINE 
                    ? 'bg-white border-gray-200 text-gray-400' 
                    : 'bg-gray-100 text-gray-500 border-transparent'
                }`}>
                  {item.publishStatus}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
