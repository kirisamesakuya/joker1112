
import React from 'react';
import { VideoTemplate, TemplateStatus } from '../types';
import { Play, Mic } from './Icons';

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
      className={`relative group bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-200`}
      onClick={() => isSelectionMode ? onSelect(template.id) : onClick(template)}
    >
      {/* Thumbnail - 16:9 Aspect Ratio */}
      <div className="relative aspect-video bg-gray-200">
        <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
        
        {/* Selection Overlay (Updated to Circle Style) */}
        {isSelectionMode && (
          <div className="absolute top-2 right-2 z-10">
             <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
               isSelected 
                 ? 'bg-blue-600 border-blue-600' 
                 : 'bg-black/20 border-white backdrop-blur-sm'
             }`}>
                {isSelected && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
             </div>
          </div>
        )}

        {/* Play Button Overlay (Center) - Hide in selection mode */}
        {!isSelectionMode && (
           <div className="absolute bottom-2 right-2 w-6 h-6 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
              <Play size={12} fill="white" />
           </div>
        )}

        {/* Lip Sync Badge */}
        {template.supportLipSync && !isSelectionMode && (
          <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1 rounded-full text-white" title="支持对口型">
             <Mic size={10} />
          </div>
        )}

        {/* Tech Specs Badge */}
        <div className="absolute bottom-2 left-2 text-[10px] text-white font-medium drop-shadow-md">
          {template.resolution} · {template.duration}
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <h3 className="font-medium text-gray-900 text-sm truncate">{template.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          {/* Tags */}
          <div className="flex gap-1 flex-wrap">
            {template.tags.slice(0, 1).map((tag, i) => (
              <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          {/* Status */}
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
            template.status === TemplateStatus.ONLINE 
              ? 'bg-white border-gray-200 text-gray-400' 
              : 'bg-gray-100 text-gray-500 border-transparent'
          }`}>
            {template.status}
          </span>
        </div>
      </div>
    </div>
  );
};
