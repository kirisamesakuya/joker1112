
import React from 'react';
import { GenerationRecord, GenerationStatus, PublishStatus } from '../types';
import { Play, Loader2, Eye, Check } from './Icons';

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
    <div className="space-y-3 pb-24">
      {items.map(item => (
        <div 
          key={item.id} 
          className={`relative flex gap-3 p-3 bg-white rounded-xl shadow-sm border transition-all duration-200 ${
            isSelectionMode && selectedIds.has(item.id) 
              ? 'border-blue-500 bg-blue-50/10' 
              : 'border-gray-100 hover:border-gray-200'
          }`}
          onClick={() => {
            if (isSelectionMode) {
              onSelect(item.id);
            }
          }}
        >
          {/* Selection Checkbox */}
          {isSelectionMode && (
            <div className="flex items-center justify-center mr-1">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                selectedIds.has(item.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
              }`}>
                {selectedIds.has(item.id) && <Check size={12} className="text-white" />}
              </div>
            </div>
          )}

          {/* Thumbnail */}
          <div 
            className="relative w-20 h-24 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer group"
            onClick={(e) => {
              if (isSelectionMode) {
                // Do nothing, bubble up to parent click
              } else {
                e.stopPropagation();
                onPreview(item);
              }
            }}
          >
             <img src={item.thumbnailUrl} alt={item.templateName} className="w-full h-full object-cover" />
             {item.status === GenerationStatus.PROCESSING && (
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                 <Loader2 size={20} className="text-white animate-spin" />
               </div>
             )}
             {item.status === GenerationStatus.COMPLETED && !isSelectionMode && (
               <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={20} className="text-white" fill="white" />
               </div>
             )}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
            <div>
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{item.templateName}</h4>
                <div className="flex gap-1 flex-shrink-0">
                   {/* Publish Status Badge */}
                   {item.publishStatus && (
                     <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                       item.publishStatus === PublishStatus.ONLINE
                         ? 'bg-green-50 text-green-600 border-green-100'
                         : 'bg-gray-50 text-gray-400 border-gray-100'
                     }`}>
                       {item.publishStatus}
                     </span>
                   )}
                   <StatusBadge status={item.status} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">用户: {item.userName}</p>
            </div>
            
            <div className="flex justify-between items-end">
               <span className="text-[10px] text-gray-400">{item.timestamp}</span>
               
               {item.status === GenerationStatus.COMPLETED && !isSelectionMode && (
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     onPreview(item);
                   }}
                   className="text-blue-600 text-xs font-medium bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1 transition-colors"
                 >
                   <Eye size={12} /> 查看
                 </button>
               )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const StatusBadge = ({ status }: { status: GenerationStatus }) => {
  switch (status) {
    case GenerationStatus.COMPLETED:
      return (
        <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
          {status}
        </span>
      );
    case GenerationStatus.PROCESSING:
      return (
        <span className="text-[10px] text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded">
          {status}
        </span>
      );
    case GenerationStatus.FAILED:
      return (
        <span className="text-[10px] text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
          {status}
        </span>
      );
    default:
      return null;
  }
};
