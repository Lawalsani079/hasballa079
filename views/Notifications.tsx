
import React, { useState, useMemo } from 'react';
import { AppNotification } from '../types';

interface NotificationsProps {
  notifications: AppNotification[];
  onBack: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

type FilterType = 'all' | AppNotification['type'];

const NotificationsView: React.FC<NotificationsProps> = ({ notifications, onBack, onMarkAsRead, onMarkAllAsRead, onDelete }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredNotifications = useMemo(() => {
    return filter === 'all' 
      ? notifications 
      : notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const icons = {
    success: 'fa-check-circle text-emerald-500',
    error: 'fa-exclamation-circle text-red-500',
    info: 'fa-info-circle text-blue-500',
    warning: 'fa-exclamation-triangle text-amber-500'
  };

  const labels = {
    all: 'Tous',
    success: 'Succès',
    error: 'Erreurs',
    info: 'Infos',
    warning: 'Alertes'
  };

  return (
    <div className="flex-1 bg-white h-full flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="px-6 pt-14 pb-6 flex items-center justify-between z-10 border-b border-slate-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-900 rounded-xl border border-slate-100 shadow-sm active:scale-90 transition-all">
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Notifications</h2>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={onMarkAllAsRead} 
            className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 active:scale-95"
          >
            Tout lire
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        {(['all', 'success', 'error', 'info', 'warning'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shrink-0 border ${
              filter === f 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}
          >
            {labels[f]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-6 opacity-30 text-center px-10">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
               <i className="fas fa-bell-slash text-3xl"></i>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Boîte de réception vide</p>
              <p className="text-[8px] font-bold uppercase tracking-widest mt-2">Vous n'avez pas encore de notifications dans cette catégorie.</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => !n.read && onMarkAsRead(n.id)}
              className={`p-5 rounded-[2rem] border transition-all flex gap-4 items-start active:scale-[0.98] ${
                n.read 
                  ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                n.read ? 'bg-slate-100 border-slate-200 opacity-50' : 'bg-slate-50 border-slate-100'
              }`}>
                <i className={`fas ${icons[n.type]} text-sm`}></i>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-start gap-2">
                  <h4 className={`text-[11px] font-black uppercase tracking-tight ${n.read ? 'text-slate-400' : 'text-slate-900'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[7px] font-black text-slate-300 uppercase shrink-0">
                    {new Date(n.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-[10px] leading-relaxed mt-1 line-clamp-2 ${n.read ? 'text-slate-400' : 'text-slate-600'}`}>
                  {n.body}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {!n.read && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse self-end shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>}
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                  className="p-2 text-slate-300 hover:text-red-500 active:scale-90"
                >
                  <i className="fas fa-trash-alt text-[10px]"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default NotificationsView;
