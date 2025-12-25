
import React, { useState, useMemo } from 'react';
import { doc, updateDoc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { TransactionRequest, ChatMessage, RequestType, User } from '../types';
import Chat from './Chat';
import { ASSETS } from '../constants';

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
  const [deleting, setDeleting] = useState(false);

  const stats = useMemo(() => {
    const now = Date.now();
    const onlineUsers = allUsers.filter(u => u.role === 'user' && u.lastActive > now - 300000).length;
    
    const validatedSum = requests
      .filter(r => r.status === 'Validé')
      .reduce((acc, r) => acc + (parseInt(r.amount) || 0), 0);

    const validatedDepositsSum = requests
      .filter(r => r.status === 'Validé' && r.type === 'Dépôt')
      .reduce((acc, r) => acc + (parseInt(r.amount) || 0), 0);
      
    const rejectedSum = requests
      .filter(r => r.status === 'Rejeté')
      .reduce((acc, r) => acc + (parseInt(r.amount) || 0), 0);

    const pendingCount = requests.filter(r => r.status === 'En attente').length;

    return {
      onlineUsers,
      totalUsers: allUsers.filter(u => u.role === 'user').length,
      enAttenteTotal: pendingCount,
      validatedSum,
      validatedDepositsSum,
      rejectedSum
    };
  }, [requests, allUsers]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => r.type === requestFilter && r.status === 'En attente');
  }, [requests, requestFilter]);

  const archiveRequests = useMemo(() => {
    return requests.filter(r => r.status !== 'En attente');
  }, [requests]);

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

  const handleClearArchives = async () => {
    if (archiveRequests.length === 0) return;
    if (!window.confirm(`Voulez-vous supprimer définitivement les ${archiveRequests.length} opérations archivées ? Cette action est irréversible.`)) return;

    setDeleting(true);
    try {
      const batch = writeBatch(db);
      archiveRequests.forEach(req => {
        batch.delete(doc(db, "requests", req.id));
      });
      await batch.commit();
    } catch (err) {
      alert("Erreur lors de la suppression des archives.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden text-white bg-[#081a2b]">
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-[#081a2b] shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
           <img src={ASSETS.logoAdmin} alt="Admin Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-blue-400/20" />
           <h1 className="text-[10px] font-black uppercase tracking-[0.2em]">Administration</h1>
        </div>
        <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 active:scale-90 transition-all">
          <i className="fas fa-power-off"></i>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        {activeSubView === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-blue-600/20 p-2.5 rounded-2xl border border-blue-500/20 h-20 flex flex-col justify-between">
                <p className="text-[6px] font-black text-blue-300 uppercase tracking-widest leading-none">En Ligne</p>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse self-end"></div>
                <h2 className="text-lg font-black">{stats.onlineUsers}</h2>
              </div>

              <div onClick={() => setActiveSubView('users')} className="bg-white/5 p-2.5 rounded-2xl border border-white/10 h-20 flex flex-col justify-between active:bg-white/10">
                <p className="text-[6px] font-black text-white/40 uppercase tracking-widest leading-none">Clients</p>
                <i className="fas fa-users text-[8px] opacity-20 self-end"></i>
                <h2 className="text-lg font-black">{stats.totalUsers}</h2>
              </div>

              <div className="bg-yellow-400/10 border border-yellow-400/30 p-2.5 rounded-2xl h-20 flex flex-col justify-between">
                <p className="text-[6px] font-black text-yellow-400 uppercase tracking-widest leading-none">Attente</p>
                <i className="fas fa-clock text-[8px] opacity-40 self-end text-yellow-400"></i>
                <h2 className="text-lg font-black text-yellow-400">{stats.enAttenteTotal}</h2>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 p-2.5 rounded-2xl h-20 flex flex-col justify-between">
                <p className="text-[6px] font-black text-blue-400 uppercase tracking-widest leading-none">Total Validé</p>
                <h2 className="text-[10px] font-black text-blue-400 truncate">{stats.validatedSum.toLocaleString()} F</h2>
              </div>

              <div className="bg-yellow-400/5 border border-yellow-400/20 p-2.5 rounded-2xl h-20 flex flex-col justify-between">
                <p className="text-[6px] font-black text-yellow-500 uppercase tracking-widest leading-none">Dépôts OK</p>
                <h2 className="text-[10px] font-black text-yellow-500 truncate">{stats.validatedDepositsSum.toLocaleString()} F</h2>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded-2xl h-20 flex flex-col justify-between">
                <p className="text-[6px] font-black text-red-400 uppercase tracking-widest leading-none">Total Rejeté</p>
                <h2 className="text-[10px] font-black text-red-400 truncate">{stats.rejectedSum.toLocaleString()} F</h2>
              </div>
            </div>

            <div className="flex gap-1.5 mb-6">
              {['Dépôt', 'Retrait', 'Crypto'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setRequestFilter(t as RequestType)} 
                  className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${requestFilter === t ? (t === 'Dépôt' ? 'bg-blue-600 text-white shadow-lg' : 'bg-yellow-400 text-[#081a2b] shadow-lg') : 'bg-white/5 text-white/30 border border-white/5'}`}
                >
                  {t}s
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 px-2 mb-2">Demandes {requestFilter}s</h3>
              {filteredRequests.map(req => (
                <div key={req.id} onClick={() => setSelectedRequest(req)} className="bg-white/5 p-3 rounded-2xl flex items-center justify-between border border-white/5 active:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-xs shadow-inner ${req.type === 'Dépôt' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                      <i className={`fas ${req.type === 'Dépôt' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-[11px] truncate">{req.userName}</p>
                      <p className="text-[8px] opacity-40 font-bold uppercase tracking-tight truncate">{req.amount} F • {req.bookmaker}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <i className="fas fa-chevron-right opacity-10 text-[8px]"></i>
                  </div>
                </div>
              ))}
              {filteredRequests.length === 0 && (
                <div className="text-center py-10 border border-dashed border-white/5 rounded-3xl opacity-20 text-[9px] font-black uppercase tracking-widest">
                  Aucun {requestFilter} en attente
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubView === 'users' && (
          <div className="animate-in slide-in-from-right-4 duration-300 pb-20">
             <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-lg font-black uppercase tracking-tight">Liste Clients</h2>
                <div className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black">{stats.totalUsers}</div>
             </div>
             
             <div className="relative mb-6">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/20"></i>
                <input 
                  type="text" 
                  placeholder="Rechercher nom ou téléphone..." 
                  className="w-full bg-white/5 border border-white/10 py-3 pl-12 pr-4 rounded-2xl outline-none focus:border-blue-400/50 text-xs font-bold"
                  value={searchUser}
                  onChange={e => setSearchUser(e.target.value)}
                />
             </div>

             <div className="space-y-2">
                {displayUsers.map(u => (
                  <div key={u.id} className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl overflow-hidden border border-white/10">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt="Avatar" className="w-full h-full" />
                        </div>
                        <div>
                           <p className="font-black text-xs">{u.name}</p>
                           <p className="text-[9px] text-white/40 font-bold">{u.phone}</p>
                        </div>
                     </div>
                     <div className={`w-1.5 h-1.5 rounded-full ${Date.now() - u.lastActive < 300000 ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-white/10'}`}></div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeSubView === 'support' && (
          <div className="animate-in slide-in-from-right-4 duration-300 pb-20">
             <h2 className="text-lg font-black mb-6 px-2 uppercase tracking-tight">Support Chat</h2>
             <div className="space-y-3">
                {uniqueConversations.map(([uid, info]) => (
                   <div key={uid} onClick={() => setSelectedUserChat({id: uid, name: info.name})} className="bg-white/5 p-4 rounded-3xl flex items-center justify-between border border-white/5 active:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-300"><i className="fas fa-comment-dots text-lg"></i></div>
                         <div className="max-w-[150px]">
                            <p className="font-black text-xs truncate">{info.name}</p>
                            <p className="text-[9px] opacity-40 truncate font-bold uppercase tracking-tight">{info.lastMsg}</p>
                         </div>
                      </div>
                      <i className="fas fa-chevron-right text-[10px] opacity-20"></i>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeSubView === 'archives' && (
          <div className="animate-in slide-in-from-right-4 duration-300 pb-20 px-2">
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">Archives</h2>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{archiveRequests.length} opérations traitées</p>
                </div>
                <button 
                  onClick={handleClearArchives}
                  disabled={deleting || archiveRequests.length === 0}
                  className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-90 disabled:opacity-20 flex items-center gap-2"
                >
                   {deleting ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-broom"></i>}
                   Vider
                </button>
             </div>

             <div className="space-y-2">
                {archiveRequests.slice(0, 50).map(req => (
                  <div key={req.id} className="bg-white/5 p-3 rounded-2xl flex items-center justify-between border border-white/5 opacity-80">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] ${req.status === 'Validé' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                           <i className={`fas ${req.status === 'Validé' ? 'fa-check' : 'fa-times'}`}></i>
                        </div>
                        <div>
                           <p className="font-black text-[10px]">{req.userName}</p>
                           <p className="text-[7px] uppercase font-bold text-white/30">{req.amount} F • {req.type} {req.bookmaker || ''}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${req.status === 'Validé' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                           {req.status}
                        </span>
                        <p className="text-[6px] font-bold text-white/10 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                     </div>
                  </div>
                ))}
                {archiveRequests.length === 0 && (
                  <div className="text-center py-20 border border-dashed border-white/5 rounded-[2.5rem] opacity-20">
                     <i className="fas fa-box-open text-4xl mb-4"></i>
                     <p className="text-[10px] font-black uppercase tracking-widest">Aucune archive</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </main>

      {selectedRequest && (
        <div className="fixed inset-0 z-[150] bg-black/90 flex items-end animate-in fade-in duration-300 p-4">
           <div className="bg-[#081a2b] w-full max-w-md mx-auto rounded-[2.5rem] p-6 border border-white/10 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">{selectedRequest.userName}</h3>
                    <p className="text-[9px] text-white/40 font-bold">{selectedRequest.userPhone}</p>
                 </div>
                 <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg active:scale-90 transition-all"><i className="fas fa-times"></i></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[8px] opacity-40 uppercase font-black mb-1">Montant</p>
                    <p className="text-base font-black text-yellow-400">{selectedRequest.amount} F</p>
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[8px] opacity-40 uppercase font-black mb-1">Type</p>
                    <p className="text-base font-black text-blue-400">{selectedRequest.type}</p>
                 </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl space-y-2">
                 <div className="flex justify-between text-[10px]"><span className="opacity-40 uppercase font-bold">Bookmaker</span><span className="font-black text-white">{selectedRequest.bookmaker || 'N/A'}</span></div>
                 <div className="flex justify-between text-[10px]"><span className="opacity-40 uppercase font-bold">ID Joueur</span><span className="font-black text-white tracking-widest">{selectedRequest.bookmakerId || 'N/A'}</span></div>
                 {selectedRequest.withdrawCode && <div className="flex justify-between text-[10px] bg-yellow-400/10 p-2 rounded-lg mt-2"><span className="font-black text-yellow-400 uppercase tracking-widest text-[8px]">Code Retrait</span><span className="font-black text-yellow-400 tracking-[0.2em]">{selectedRequest.withdrawCode}</span></div>}
              </div>
              {selectedRequest.proofImage && (
                <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                   <p className="absolute top-2 left-2 z-10 text-[7px] font-black bg-black/60 px-2 py-0.5 rounded uppercase tracking-widest text-white/60">Preuve de paiement</p>
                   <img src={selectedRequest.proofImage} className="w-full h-48 object-contain" alt="Proof" />
                   <a 
                     href={selectedRequest.proofImage} 
                     download={`preuve-${selectedRequest.userName}-${selectedRequest.type}.png`}
                     className="absolute bottom-3 right-3 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all z-20"
                     title="Télécharger la preuve"
                   >
                     <i className="fas fa-download"></i>
                   </a>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                 <button onClick={() => { updateDoc(doc(db, "requests", selectedRequest.id), {status: 'Rejeté'}); setSelectedRequest(null); }} className="flex-1 bg-red-500/10 text-red-500 py-4 rounded-2xl font-black uppercase text-[10px] border border-red-500/20 active:scale-95 transition-all">Rejeter</button>
                 <button onClick={() => { updateDoc(doc(db, "requests", selectedRequest.id), {status: 'Validé'}); setSelectedRequest(null); }} className="flex-1 bg-green-500 py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-green-500/20 active:scale-95 transition-all text-white">Valider</button>
              </div>
           </div>
        </div>
      )}

      {selectedUserChat && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
          <div className="w-full h-full max-w-md bg-[#081a2b] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
            <Chat user={{id: 'admin', name: 'Support', phone: '000', role: 'admin', referralCode: '', referralBalance: 0, lastActive: 0}} messages={messages} onBack={() => setSelectedUserChat(null)} targetUserId={selectedUserChat.id} targetUserName={selectedUserChat.name} />
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-4 z-[100] bg-[#04111d] border-t border-white/5 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveSubView('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'dashboard' ? 'text-blue-400 scale-105' : 'text-white/30'}`}>
          <i className="fas fa-chart-pie text-lg"></i>
          <span className="text-[7px] font-black uppercase tracking-tighter">Stats</span>
        </button>
        <button onClick={() => setActiveSubView('users')} className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'users' ? 'text-blue-400 scale-105' : 'text-white/30'}`}>
          <i className="fas fa-user-group text-lg"></i>
          <span className="text-[7px] font-black uppercase tracking-tighter">Clients</span>
        </button>
        <button onClick={() => setActiveSubView('support')} className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'support' ? 'text-blue-400 scale-105' : 'text-white/30'}`}>
          <i className="fas fa-message text-lg"></i>
          <span className="text-[7px] font-black uppercase tracking-tighter">Support</span>
        </button>
        <button onClick={() => setActiveSubView('archives')} className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'archives' ? 'text-blue-400 scale-105' : 'text-white/30'}`}>
          <i className="fas fa-clock-rotate-left text-lg"></i>
          <span className="text-[7px] font-black uppercase tracking-tighter">Archives</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminDashboard;
