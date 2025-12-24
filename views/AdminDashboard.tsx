
import React, { useState, useMemo } from 'react';
import { doc, updateDoc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { TransactionRequest, ChatMessage, RequestType, User } from '../types';
import Chat from './Chat';

interface AdminDashboardProps {
  requests: TransactionRequest[];
  messages: ChatMessage[];
  allUsers: User[];
  onLogout: () => void;
}

type AdminSubView = 'dashboard' | 'archives' | 'support' | 'users';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, messages, allUsers, onLogout }) => {
  const [activeSubView, setActiveSubView] = useState<AdminSubView>('dashboard');
  const [requestFilter, setRequestFilter] = useState<RequestType>('Dépôt');
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null);
  const [selectedUserChat, setSelectedUserChat] = useState<{id: string, name: string} | null>(null);
  const [searchUser, setSearchUser] = useState('');

  const stats = useMemo(() => {
    const now = Date.now();
    const onlineUsers = allUsers.filter(u => u.role === 'user' && u.lastActive > now - 300000).length;
    const totalReferralBonus = allUsers.reduce((acc, u) => acc + (u.referralBalance || 0), 0);

    return {
      onlineUsers,
      totalUsers: allUsers.filter(u => u.role === 'user').length,
      enAttenteTotal: requests.filter(r => r.status === 'En attente').length,
      totalReferralBonus,
    };
  }, [requests, allUsers]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => r.type === requestFilter && r.status === 'En attente');
  }, [requests, requestFilter]);

  const displayUsers = useMemo(() => {
    return allUsers
      .filter(u => u.role === 'user')
      .filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.phone.includes(searchUser))
      .sort((a, b) => b.lastActive - a.lastActive);
  }, [allUsers, searchUser]);

  const uniqueConversations = useMemo(() => {
    const userMap: Record<string, {name: string, lastMsg: string, time: number}> = {};
    messages.forEach(m => {
      userMap[m.userId] = { name: m.userName, lastMsg: m.text, time: m.createdAt };
    });
    return Object.entries(userMap).sort((a, b) => b[1].time - a[1].time);
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden text-white bg-[#081a2b]">
      <header className="px-6 pt-10 pb-6 flex justify-between items-center bg-[#081a2b] shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-[#081a2b] font-black">A</div>
           <h1 className="text-sm font-black uppercase tracking-widest">Administration</h1>
        </div>
        <button onClick={onLogout} className="text-red-400 text-xl"><i className="fas fa-power-off"></i></button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        {activeSubView === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-600 p-5 rounded-[1.8rem] shadow-lg relative overflow-hidden h-36 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] font-black opacity-90 uppercase tracking-widest">En Ligne</p>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h2 className="text-4xl font-black">{stats.onlineUsers}</h2>
              </div>

              <div className="bg-white/10 p-5 rounded-[1.8rem] border border-white/10 h-36 flex flex-col justify-between" onClick={() => setActiveSubView('users')}>
                <div>
                  <p className="text-[11px] font-black opacity-50 uppercase tracking-widest">Clients</p>
                </div>
                <h2 className="text-3xl font-black">{stats.totalUsers}</h2>
              </div>

              <div className="bg-yellow-400 text-[#081a2b] p-5 rounded-[1.8rem] h-36 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-black opacity-70 uppercase tracking-widest">En Attente</p>
                </div>
                <h2 className="text-4xl font-black">{stats.enAttenteTotal}</h2>
              </div>

              <div className="bg-emerald-500 p-5 rounded-[1.8rem] h-36 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-black opacity-90 uppercase tracking-widest">Bonus Payés</p>
                </div>
                <h2 className="text-xl font-black">{stats.totalReferralBonus} F</h2>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              {['Dépôt', 'Retrait', 'Crypto'].map(t => (
                <button key={t} onClick={() => setRequestFilter(t as RequestType)} className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${requestFilter === t ? 'bg-blue-500 text-white shadow-xl' : 'bg-white/5 text-white/40'}`}>
                  {t}s
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredRequests.map(req => (
                <div key={req.id} onClick={() => setSelectedRequest(req)} className="bg-white/10 p-5 rounded-[2rem] flex items-center justify-between border border-white/5 active:bg-white/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                      <i className={`fas ${req.type === 'Dépôt' ? 'fa-arrow-down text-blue-300' : 'fa-arrow-up text-orange-300'}`}></i>
                    </div>
                    <div>
                      <p className="font-black text-sm">{req.userName}</p>
                      <p className="text-[10px] opacity-50 font-bold uppercase tracking-tight">{req.amount} F • {req.bookmaker || 'NITA'}</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right opacity-20 text-xs"></i>
                </div>
              ))}
              {filteredRequests.length === 0 && <p className="text-center py-10 opacity-20 text-xs font-black uppercase tracking-widest">Aucune demande</p>}
            </div>
          </div>
        )}

        {activeSubView === 'users' && (
          <div className="animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-black uppercase tracking-tight">Liste Clients</h2>
                <div className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black">{stats.totalUsers}</div>
             </div>
             
             <div className="relative mb-6">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/20"></i>
                <input 
                  type="text" 
                  placeholder="Rechercher nom ou téléphone..." 
                  className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-yellow-400/50 text-sm font-bold"
                  value={searchUser}
                  onChange={e => setSearchUser(e.target.value)}
                />
             </div>

             <div className="space-y-3">
                {displayUsers.map(u => (
                  <div key={u.id} className="bg-white/5 p-5 rounded-[2.2rem] border border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt="Avatar" className="w-full h-full" />
                        </div>
                        <div>
                           <p className="font-black text-sm">{u.name}</p>
                           <p className="text-[10px] text-white/40 font-bold">{u.phone}</p>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="text-[8px] font-black text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md">CODE: {u.referralCode}</span>
                              <span className="text-[8px] font-black text-emerald-400">Bal: {u.referralBalance} F</span>
                           </div>
                        </div>
                     </div>
                     <div className={`w-2 h-2 rounded-full ${Date.now() - u.lastActive < 300000 ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-white/10'}`}></div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeSubView === 'support' && (
          <div className="animate-in slide-in-from-right-4 duration-300">
             <h2 className="text-xl font-black mb-8 px-2 uppercase tracking-tight">Messages Clients</h2>
             <div className="space-y-4">
                {uniqueConversations.map(([uid, info]) => (
                   <div key={uid} onClick={() => setSelectedUserChat({id: uid, name: info.name})} className="bg-white/10 p-5 rounded-[2.2rem] flex items-center justify-between border border-white/5 active:bg-white/20 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-300"><i className="fas fa-comment-dots text-xl"></i></div>
                         <div className="max-w-[150px]">
                            <p className="font-black text-sm truncate">{info.name}</p>
                            <p className="text-[10px] opacity-40 truncate font-bold uppercase tracking-tight">{info.lastMsg}</p>
                         </div>
                      </div>
                      <i className="fas fa-chevron-right text-xs opacity-20"></i>
                   </div>
                ))}
                {uniqueConversations.length === 0 && <p className="text-center py-20 text-white/20 text-xs font-black uppercase tracking-widest">Aucun message reçu</p>}
             </div>
          </div>
        )}
      </main>

      {/* Details Request Popup */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[150] bg-black/90 flex items-end animate-in fade-in duration-300 p-4">
           <div className="bg-[#081a2b] w-full max-w-md mx-auto rounded-[3rem] p-8 border border-white/10 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">{selectedRequest.userName}</h3>
                    <p className="text-[10px] text-white/40 font-bold">{selectedRequest.userPhone}</p>
                 </div>
                 <button onClick={() => setSelectedRequest(null)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl"><i className="fas fa-times"></i></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-center">
                    <p className="text-[9px] opacity-40 uppercase font-black mb-1">Montant</p>
                    <p className="text-lg font-black text-yellow-400">{selectedRequest.amount} F</p>
                 </div>
                 <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-center">
                    <p className="text-[9px] opacity-40 uppercase font-black mb-1">Type</p>
                    <p className="text-lg font-black text-blue-400">{selectedRequest.type}</p>
                 </div>
              </div>
              
              <div className="bg-white/5 p-4 rounded-3xl space-y-2">
                 <div className="flex justify-between text-[11px]"><span className="opacity-40">Bookmaker</span><span className="font-bold">{selectedRequest.bookmaker}</span></div>
                 <div className="flex justify-between text-[11px]"><span className="opacity-40">ID Joueur</span><span className="font-bold">{selectedRequest.bookmakerId}</span></div>
                 {selectedRequest.withdrawCode && <div className="flex justify-between text-[11px]"><span className="opacity-40">Code Retrait</span><span className="font-bold text-yellow-400 uppercase tracking-widest">{selectedRequest.withdrawCode}</span></div>}
              </div>

              {selectedRequest.proofImage && (
                <div className="relative group">
                   <img src={selectedRequest.proofImage} className="w-full h-48 object-contain rounded-3xl bg-black/40 border border-white/10 shadow-inner" alt="Proof" />
                   <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-md text-[8px] font-black uppercase">Preuve fournie</div>
                </div>
              )}
              <div className="flex gap-4">
                 <button onClick={() => { updateDoc(doc(db, "requests", selectedRequest.id), {status: 'Rejeté'}); setSelectedRequest(null); }} className="flex-1 bg-red-500/10 text-red-500 py-5 rounded-3xl font-black uppercase text-xs border border-red-500/20 active:scale-95 transition-all">Rejeter</button>
                 <button onClick={() => { updateDoc(doc(db, "requests", selectedRequest.id), {status: 'Validé'}); setSelectedRequest(null); }} className="flex-1 bg-green-500 py-5 rounded-3xl font-black uppercase text-xs shadow-lg shadow-green-500/20 active:scale-95 transition-all text-white">Valider</button>
              </div>
           </div>
        </div>
      )}

      {selectedUserChat && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
          <div className="w-full h-full max-w-md bg-white rounded-[3rem] overflow-hidden shadow-2xl">
            <Chat user={{id: 'admin', name: 'Support', phone: '000', role: 'admin', referralCode: '', referralBalance: 0, lastActive: 0}} messages={messages} onBack={() => setSelectedUserChat(null)} targetUserId={selectedUserChat.id} targetUserName={selectedUserChat.name} />
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-6 z-[100] bg-[#04111d] border-t border-white/5 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveSubView('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'dashboard' ? 'text-yellow-400 scale-110' : 'text-white/30'}`}>
          <i className="fas fa-th-large text-xl"></i>
          <span className="text-[8px] font-black uppercase tracking-tighter">Stats</span>
        </button>
        <button onClick={() => setActiveSubView('users')} className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'users' ? 'text-yellow-400 scale-110' : 'text-white/30'}`}>
          <i className="fas fa-users text-xl"></i>
          <span className="text-[8px] font-black uppercase tracking-tighter">Clients</span>
        </button>
        <button onClick={() => setActiveSubView('support')} className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'support' ? 'text-yellow-400 scale-110' : 'text-white/30'}`}>
          <i className="fas fa-comment-dots text-xl"></i>
          <span className="text-[8px] font-black uppercase tracking-tighter">Support</span>
        </button>
        <button onClick={() => setActiveSubView('archives')} className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'archives' ? 'text-yellow-400 scale-110' : 'text-white/30'}`}>
          <i className="fas fa-box-archive text-xl"></i>
          <span className="text-[8px] font-black uppercase tracking-tighter">Logs</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminDashboard;
