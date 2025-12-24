
import React, { useState, useMemo } from 'react';
import { doc, updateDoc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { TransactionRequest, ChatMessage } from '../types';
import { COLORS } from '../constants';
import Chat from './Chat';

interface AdminDashboardProps {
  requests: TransactionRequest[];
  messages: ChatMessage[];
  onLogout: () => void;
}

type AdminSubView = 'dashboard' | 'archives' | 'support' | 'admin';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, messages, onLogout }) => {
  const [activeSubView, setActiveSubView] = useState<AdminSubView>('dashboard');
  const [activeFilter, setActiveFilter] = useState<'Dépôt' | 'Retrait'>('Dépôt');
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null);
  const [selectedUserChat, setSelectedUserChat] = useState<{id: string, name: string} | null>(null);
  const [processing, setProcessing] = useState(false);

  const stats = useMemo(() => ({
    totalDepotsToday: requests.filter(r => r.type === 'Dépôt' && r.status === 'Validé').length,
    enAttenteTotal: requests.filter(r => r.status === 'En attente').length,
    unreadSupport: Array.from(new Set(messages.filter(m => !m.isAdmin).map(m => m.userId))).length
  }), [requests, messages]);

  const uniqueConversations = useMemo(() => {
    const users: Record<string, {name: string, lastMsg: string, time: number}> = {};
    messages.forEach(m => {
      users[m.userId] = { 
        name: m.isAdmin ? users[m.userId]?.name || "Client" : m.userName, 
        lastMsg: m.text, 
        time: m.createdAt 
      };
    });
    return Object.entries(users).sort((a, b) => b[1].time - a[1].time);
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden text-white font-['Poppins']" style={{ backgroundColor: COLORS.backgroundAdmin }}>
      <header className="px-6 pt-12 pb-4 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-300">
             <i className="fas fa-crown"></i>
           </div>
           <div>
             <h1 className="text-lg font-black tracking-tight uppercase leading-tight">Admin</h1>
             <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest">Recharge+ Control</p>
           </div>
        </div>
        <button onClick={onLogout} className="w-10 h-10 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center border border-red-500/20"><i className="fas fa-power-off text-sm"></i></button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-32">
        {activeSubView === 'dashboard' && (
          <div className="space-y-4 pt-4">
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#3498db] p-4 rounded-3xl shadow-lg">
                   <p className="text-xs font-semibold opacity-90">En Attente</p>
                   <h2 className="text-3xl font-black mt-2">{stats.enAttenteTotal}</h2>
                </div>
                <div className="bg-[#f1c40f] p-4 rounded-3xl shadow-lg text-blue-900">
                   <p className="text-xs font-semibold opacity-90">Conversations</p>
                   <h2 className="text-3xl font-black mt-2">{stats.unreadSupport}</h2>
                </div>
             </div>
             
             <div className="flex gap-2 mt-6">
                <button onClick={() => setActiveFilter('Dépôt')} className={`flex-1 py-4 rounded-3xl text-xs font-bold transition-all ${activeFilter === 'Dépôt' ? 'bg-yellow-400 text-blue-900' : 'bg-white/10'}`}>Dépôts</button>
                <button onClick={() => setActiveFilter('Retrait')} className={`flex-1 py-4 rounded-3xl text-xs font-bold transition-all ${activeFilter === 'Retrait' ? 'bg-yellow-400 text-blue-900' : 'bg-white/10'}`}>Retraits</button>
             </div>

             <div className="mt-6 space-y-3">
                {requests.filter(r => r.type === activeFilter && r.status === 'En attente').map(req => (
                   <div key={req.id} onClick={() => setSelectedRequest(req)} className="bg-white/10 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><i className={`fas ${req.type === 'Dépôt' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i></div>
                        <div><p className="font-bold text-sm">{req.userName}</p><p className="text-[10px] opacity-50">{req.amount} F • {req.bookmaker}</p></div>
                      </div>
                      <i className="fas fa-chevron-right text-white/20"></i>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeSubView === 'support' && (
          <div className="space-y-4 pt-4">
             <h2 className="text-lg font-bold mb-4 px-2 uppercase tracking-widest">Support Clients</h2>
             <div className="space-y-3">
                {uniqueConversations.map(([uid, info]) => (
                   <div key={uid} onClick={() => setSelectedUserChat({id: uid, name: info.name})} className="bg-white/10 p-5 rounded-3xl flex items-center justify-between border border-white/5 active:bg-white/20 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-lg"><i className="fas fa-user"></i></div>
                         <div className="max-w-[150px]">
                            <p className="font-black text-sm truncate">{info.name}</p>
                            <p className="text-[10px] opacity-50 truncate">{info.lastMsg}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] font-bold opacity-30">{new Date(info.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                         <div className="w-2 h-2 bg-yellow-400 rounded-full ml-auto mt-2"></div>
                      </div>
                   </div>
                ))}
                {uniqueConversations.length === 0 && <p className="text-center opacity-30 py-20 uppercase tracking-widest text-xs font-black">Aucune discussion</p>}
             </div>
          </div>
        )}

        {activeSubView === 'archives' && <div className="p-4 text-center opacity-30 uppercase tracking-widest text-xs font-black py-20">Historique des transactions validées</div>}
        {activeSubView === 'admin' && <div className="p-4 text-center opacity-30 uppercase tracking-widest text-xs font-black py-20">Paramètres de l'application</div>}
      </main>

      {/* Chat Modal for Admin */}
      {selectedUserChat && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center">
          <div className="w-full h-full max-w-md bg-white">
            <Chat 
              user={{id: 'admin', name: 'Support', phone: '000', role: 'admin'}} 
              messages={messages} 
              onBack={() => setSelectedUserChat(null)} 
              targetUserId={selectedUserChat.id} 
              targetUserName={selectedUserChat.name}
            />
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[150] bg-black/80 flex items-end animate-in fade-in duration-300">
           <div className="bg-[#0a4d8c] w-full rounded-t-[3rem] p-8 space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase tracking-tight">{selectedRequest.userName}</h3>
                 <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 bg-white/10 rounded-xl"><i className="fas fa-times"></i></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[9px] opacity-50 font-black uppercase">Montant</p><p className="text-lg font-black">{selectedRequest.amount} F</p></div>
                 <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[9px] opacity-50 font-black uppercase">ID Joueur</p><p className="text-lg font-black">{selectedRequest.bookmakerId}</p></div>
              </div>
              {selectedRequest.proofImage && <img src={selectedRequest.proofImage} className="w-full h-48 object-contain bg-black rounded-2xl" alt="Proof" />}
              <div className="flex gap-3">
                 <button onClick={() => { updateDoc(doc(db, "requests", selectedRequest.id), {status: 'Rejeté'}); setSelectedRequest(null); }} className="flex-1 bg-red-500 py-4 rounded-2xl font-black uppercase text-xs">Rejeter</button>
                 <button onClick={() => { updateDoc(doc(db, "requests", selectedRequest.id), {status: 'Validé'}); setSelectedRequest(null); }} className="flex-1 bg-green-500 py-4 rounded-2xl font-black uppercase text-xs">Valider</button>
              </div>
           </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 flex justify-around py-4 z-50 shadow-2xl" style={{ backgroundColor: COLORS.darkNav }}>
        <button onClick={() => setActiveSubView('dashboard')} className={`flex flex-col items-center gap-1 ${activeSubView === 'dashboard' ? 'text-yellow-400' : 'text-white/40'}`}>
          <i className="fas fa-th-large text-xl"></i>
          <span className="text-[9px] font-bold uppercase">Gestion</span>
        </button>
        <button onClick={() => setActiveSubView('support')} className={`flex flex-col items-center gap-1 ${activeSubView === 'support' ? 'text-yellow-400' : 'text-white/40'}`}>
          <i className="fas fa-comments text-xl"></i>
          <span className="text-[9px] font-bold uppercase">Support</span>
        </button>
        <button onClick={() => setActiveSubView('archives')} className={`flex flex-col items-center gap-1 ${activeSubView === 'archives' ? 'text-yellow-400' : 'text-white/40'}`}>
          <i className="fas fa-archive text-xl"></i>
          <span className="text-[9px] font-bold uppercase">Archives</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminDashboard;
