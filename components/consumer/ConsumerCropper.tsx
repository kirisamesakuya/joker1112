
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, RotateCw, Scissors, Mic, Trash2, Play, Pause, Check, CheckCircle2 } from '../Icons';
import { Button } from '../Button';
import { VideoTemplate, LipSyncMode } from '../../types';

interface ConsumerCropperProps {
  imageUrl: string;
  template: VideoTemplate;
  onBack: () => void;
  onStartGeneration: (script?: string) => void;
}

export const ConsumerCropper: React.FC<ConsumerCropperProps> = ({ 
  imageUrl, 
  template,
  onBack, 
  onStartGeneration 
}) => {
  // Mode Check
  const isCustomMode = template.supportLipSync && template.lipSyncMode === LipSyncMode.CUSTOM;
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Parse duration from template (e.g., "12s" -> 120 deciseconds for smoother progress)
  const maxDurationSec = parseInt(template.duration) || 15;
  const maxDurationDs = maxDurationSec * 10;

  // Clean up timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    setHasRecordedAudio(false);
    
    // Simulate recording progress (every 100ms)
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= maxDurationDs) {
          handleStopRecording();
          return maxDurationDs;
        }
        return prev + 1;
      });
    }, 100);
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    // Only count as success if recorded at least 1 second
    if (recordingDuration > 10) {
      setHasRecordedAudio(true);
    } else {
      setRecordingDuration(0); // Reset if too short
    }
  };

  const handleDeleteAudio = () => {
    setHasRecordedAudio(false);
    setRecordingDuration(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Shared Legal Disclaimer Component
  const LegalDisclaimer = ({ mode }: { mode: 'dark' | 'light' }) => (
    <div className={`flex items-start justify-center gap-1.5 mt-3 text-[10px] leading-tight ${mode === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
      <CheckCircle2 size={10} className={`mt-[1px] ${mode === 'dark' ? 'text-blue-600' : 'text-purple-400'}`} />
      <span className="opacity-80">
        点击生成即代表同意 <span className="underline decoration-dotted">用户协议</span>，授权官方使用生成内容用于宣传展示。
      </span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black text-white relative">
       {/* Background Image Layer - Blurred for ambiance */}
       <div className="absolute inset-0 bg-gray-900 overflow-hidden">
          <img 
            src={imageUrl} 
            className={`w-full h-full object-cover transition-all duration-500 opacity-30 blur-xl scale-110`} 
            alt="Background Ambiance" 
          />
          
          {/* Grid Overlay (Standard Mode Only) */}
          {!isCustomMode && (
            <div className="absolute inset-0 pointer-events-none">
              <img 
                src={imageUrl} 
                className="w-full h-full object-contain opacity-100 blur-0" 
                alt="Editing Target" 
              />
              <div className="absolute inset-0 w-full h-full border-[1px] border-white/30 grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border-[0.5px] border-white/10"></div>
                  ))}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-blue-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                    推荐区域
                  </span>
              </div>
            </div>
          )}
       </div>

       {/* Top Navigation */}
       <div className="flex items-center justify-between p-4 relative z-20">
        <button onClick={onBack} className="p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 transition-colors">
          <ChevronLeft size={24} />
        </button>
        {isCustomMode && (
          <div className={`px-3 py-1 backdrop-blur-md rounded-full text-xs font-medium border transition-colors ${
            hasRecordedAudio 
              ? 'bg-green-500/20 border-green-500 text-green-400' 
              : 'bg-black/20 border-white/10 text-gray-300'
          }`}>
            {hasRecordedAudio ? '录音完成' : '配音模式'}
          </div>
        )}
        <div className="w-10"></div>
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 relative z-10 flex flex-col justify-end pb-8">
         
         {/* Standard Tools (Hidden in Custom Mode) */}
         {!isCustomMode && (
           <div className="bg-black p-6 pb-8 space-y-4 rounded-t-3xl border-t border-gray-800">
               <div className="flex justify-center gap-12 mb-4">
                  <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors">
                     <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <RotateCw size={20} />
                     </div>
                     <span className="text-[10px]">旋转</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors">
                     <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <Scissors size={20} />
                     </div>
                     <span className="text-[10px]">裁剪</span>
                  </button>
               </div>
               <div className="flex justify-between items-center text-xs text-gray-500 px-1">
                  <span>{template.name}</span>
                  <span>今日剩余 9/10 次</span>
               </div>
               <div>
                 <Button fullWidth size="lg" className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700" onClick={() => onStartGeneration()}>
                   开始生成
                 </Button>
                 <LegalDisclaimer mode="dark" />
               </div>
           </div>
         )}
         
         {/* Custom Lip Sync Interaction UI */}
         {isCustomMode && (
            <div className="px-4 flex flex-col items-center justify-between h-full pt-4">
              
              {/* Top: Avatar Preview (Visual Context) */}
              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs space-y-6">
                 
                 {/* The Avatar Bubble */}
                 <div className="relative group">
                    <div className={`w-28 h-28 rounded-full border-4 overflow-hidden shadow-2xl transition-all duration-300 relative z-10 ${
                      isRecording 
                        ? 'border-purple-500 scale-110 shadow-purple-500/50' 
                        : 'border-white/20'
                    }`}>
                       <img src={imageUrl} className="w-full h-full object-cover" alt="Avatar" />
                    </div>
                    
                    {/* Recording Ripple Effect */}
                    {isRecording && (
                       <>
                         <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping"></div>
                         <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse delay-75"></div>
                       </>
                    )}
                    
                    {/* Context Label */}
                    {!isRecording && !hasRecordedAudio && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-800/90 text-[10px] px-2 py-0.5 rounded-full text-gray-300 whitespace-nowrap border border-gray-600 z-20">
                         当前角色
                      </div>
                    )}
                 </div>

                 {/* Teleprompter / Script Display */}
                 <div className={`transition-all duration-300 w-full ${isRecording ? 'scale-105' : ''}`}>
                    {!hasRecordedAudio && (
                      <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-5 border border-white/10 text-center shadow-xl">
                         <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                            请朗读
                            <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                         </p>
                         <p className="text-base font-medium leading-relaxed text-white drop-shadow-md line-clamp-4">
                           “{template.defaultScript || "（此模板暂无预设文案，请自由发挥）"}”
                         </p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Bottom: Recording Controls */}
              <div className="w-full flex flex-col items-center pb-8">
                 {!hasRecordedAudio ? (
                    /* RECORDING STATE */
                    <div className="relative">
                      {/* Progress Ring */}
                      {isRecording && (
                        <div className="absolute inset-[-8px] rounded-full border-4 border-purple-500/30 animate-pulse"></div>
                      )}
                      
                      {/* Main Mic Button */}
                      <button 
                        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl ${
                          isRecording 
                            ? 'bg-gradient-to-br from-red-500 to-pink-600 scale-110 ring-4 ring-white/20' 
                            : 'bg-white text-black hover:scale-105 active:scale-95'
                        }`}
                        onMouseDown={handleStartRecording}
                        onMouseUp={handleStopRecording}
                        onTouchStart={(e) => { e.preventDefault(); handleStartRecording(); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleStopRecording(); }}
                      >
                         <Mic size={32} className={`transition-transform ${isRecording ? 'scale-125 text-white' : 'text-purple-600'}`} />
                         
                         {/* Visual Waveform Effect inside button */}
                         {isRecording && (
                           <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-50 pointer-events-none">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-1 bg-white rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: `${i * 0.1}s`, height: '40%' }}></div>
                              ))}
                           </div>
                         )}
                      </button>
                      
                      {/* Hint Text */}
                      <div className="mt-4 text-center h-6">
                         <p className={`text-sm font-medium transition-colors ${isRecording ? 'text-red-400' : 'text-white/80'}`}>
                           {isRecording ? formatTime(recordingDuration) : '按住说话，松开结束'}
                         </p>
                      </div>
                    </div>
                 ) : (
                    /* REVIEW STATE */
                    <div className="w-full bg-black/60 backdrop-blur-xl rounded-2xl p-4 border border-white/10 animate-in slide-in-from-bottom-10">
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-gray-300">录音预览</h3>
                          <span className="text-xs text-gray-500">{formatTime(recordingDuration)}</span>
                       </div>

                       {/* Audio Waveform Visualization (Fake) */}
                       <div className="h-10 bg-gray-800/50 rounded-lg flex items-center justify-center gap-1 px-4 mb-4 overflow-hidden">
                          {Array.from({length: 40}).map((_, i) => (
                             <div 
                               key={i} 
                               className={`w-1 rounded-full transition-all duration-300 ${isPlaying ? 'bg-purple-500 animate-pulse' : 'bg-gray-600'}`} 
                               style={{ 
                                 height: `${Math.random() * 80 + 20}%`,
                                 opacity: isPlaying ? 1 : 0.5
                               }}
                             ></div>
                          ))}
                       </div>

                       {/* Action Controls */}
                       <div className="flex items-center justify-between gap-3">
                          <button 
                            onClick={handleDeleteAudio} 
                            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                          >
                             <Trash2 size={18} />
                          </button>

                          <button 
                            onClick={togglePlayback}
                            className="flex-1 h-10 rounded-full bg-white text-black text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                          >
                             {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" />}
                             {isPlaying ? '暂停' : '试听'}
                          </button>

                          <Button 
                             onClick={() => onStartGeneration(undefined)}
                             className="flex-1 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 border-none shadow-lg shadow-purple-900/30 text-sm font-bold"
                          >
                             生成视频
                          </Button>
                       </div>
                       
                       {/* Legal Disclaimer */}
                       <LegalDisclaimer mode="light" />
                    </div>
                 )}
              </div>
            </div>
         )}
      </div>
    </div>
  );
};

const formatTime = (ds: number) => {
  const seconds = Math.floor(ds / 10);
  const decimals = ds % 10;
  return `${seconds}.${decimals}s`;
};
