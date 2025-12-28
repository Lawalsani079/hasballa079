
import React, { useEffect, useState } from 'react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notification: AppNotification;
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExit(true);
      setTimeout(() => onClose(notification.id), 500);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const icons = {
    success: 'fa-check-circle text-emerald-500',
    error: 'fa-exclamation-circle text-red-500',
    info: 'fa-info-circle text-[#0047FF]',
    warning: 'fa-exclamation-triangle text-orange-500'
  };

  const borderColors = {
    success: 'border-emerald-500/20',
    error: 'border-red-500/20',
    info: 'border-blue-500/20',
    warning: 'border-orange-500/20'
  };

  return (
    <div className={`transition-all duration-500 ease-out transform ${exit ? '-translate-y-10 opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'}`}>
      <div className={`backdrop-blur-2xl bg-white/95 border ${borderColors[notification.type]} p-5 rounded-[2.2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center gap-4 border-2`}>
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
          <i className={`fas ${icons[notification.type]} text-xl`}></i>
        </div>
        <div className="flex-1 overflow-hidden">
          <h4 className="text-slate-900 font-black text-[11px] uppercase tracking-tighter leading-none">{notification.title}</h4>
          <p className="text-slate-500 text-[10px] font-bold leading-tight line-clamp-2 mt-1.5 uppercase tracking-widest">{notification.body}</p>
        </div>
        <button onClick={() => { setExit(true); setTimeout(() => onClose(notification.id), 500); }} className="w-8 h-8 flex items-center justify-center text-slate-300 active:scale-75">
          <i className="fas fa-times text-xs"></i>
        </button>
        {/* Animated Progress Shimmer */}
        <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-slate-100 overflow-hidden rounded-full">
          <div className="h-full bg-[#0047FF] animate-[progress_5s_linear_forwards] shadow-[0_0_8px_#0047FF]"></div>
        </div>
      </div>
      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
