import React from 'react';
import { VideoTemplate, TemplateStatus } from '../types';
import { Play, Check, Trash2, MoreHorizontal, Mic } from './Icons';

interface TemplateCardProps {
  template: VideoTemplate;
  isSelectionMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick: (template: VideoTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  isSelectionMode, 
  isSelected, 
  onSelect,
  onClick
}) => {
  return (
    <div 
      className={`relative group bg-white rounded-xl overflow-hidden shadow-sm border transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-100'}`}
      onClick={() => isSelectionMode ? onSelect(template.id) : onClick(template)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] bg-gray-200">
        <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
        
        {/* Selection Overlay */}
        {isSelectionMode && (
          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white/50 border-white'}`}>
             {isSelected && <Check size={14} className="text-white" />}
          </div>
        )}

        {/* Lip Sync Badge */}
        {template.supportLipSync && !isSelectionMode && (
          <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1 rounded-full text-white" title="支持对口型">
             <Mic size={12} />
          </div>
        )}

        {/* Video Info Badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white">
          <Play size={8} fill="currentColor" />
          <span>{template.resolution} · {template.duration}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm truncate">{template.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-1 flex-wrap">
            {template.tags.map((tag, i) => (
              <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            template.status === TemplateStatus.ONLINE 
              ? 'bg-green-50 text-green-600' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            {template.status}
          </span>
        </div>
      </div>
    </div>
  );
};