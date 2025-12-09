import React from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, 
  title, 
  message, 
  type = 'info', 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-2xl w-full max-w-xs p-6 text-center shadow-xl scale-100 animate-in zoom-in-95 duration-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <div className="flex gap-3">
             <Button fullWidth variant="ghost" onClick={onCancel}>取消</Button>
             <Button 
               fullWidth 
               variant={type === 'danger' ? 'danger' : 'primary'} 
               onClick={onConfirm}
             >
               确定
             </Button>
          </div>
       </div>
    </div>
  );
};