import React from 'react';
import { ChevronLeft, Camera, Image as ImageIcon } from 'lucide-react';
import { X } from '../Icons';

interface ConsumerImagePickerProps {
  onBack: () => void;
  onSelectImage: (imageUrl: string) => void;
}

export const ConsumerImagePicker: React.FC<ConsumerImagePickerProps> = ({ onBack, onSelectImage }) => {
  // Mock images
  const mockImages = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    url: `https://picsum.photos/seed/${i + 200}/200/200`
  }));

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black">
        <button onClick={onBack} className="p-1">
          <X size={24} />
        </button>
        <h1 className="text-base font-medium">选图</h1>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-gray-800">
         <button className="pb-3 border-b-2 border-white font-medium text-sm px-2">最近项目</button>
         <button className="pb-3 border-b-2 border-transparent text-gray-500 text-sm px-2 ml-4">相册</button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-1">
         <div className="grid grid-cols-3 gap-1">
            {/* Camera Button */}
            <div className="aspect-square bg-gray-900 flex flex-col items-center justify-center text-gray-400">
               <Camera size={24} />
               <span className="text-xs mt-1">拍摄</span>
            </div>
            
            {/* Images */}
            {mockImages.map(img => (
              <div 
                key={img.id} 
                onClick={() => onSelectImage(img.url)}
                className="aspect-square bg-gray-800 cursor-pointer relative group overflow-hidden"
              >
                <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};