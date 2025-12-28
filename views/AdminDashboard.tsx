
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { collection, doc, updateDoc, query, onSnapshot, limit, getDocs, where, writeBatch, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { TransactionRequest, RequestType, User, BannerItem } from '../types';
import Chat from './Chat';
import { LayoutDashboard, ReceiptText, MessageSquare, Power, RefreshCw, Trash2, CheckCircle2, XCircle, Users, ExternalLink, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminDashboardProps {
  banners: BannerItem[];
  onLogout: () => void;
  addToast: (title: string, body: string, type?: any) => void;
}

type AdminSubView = 'dashboard' | 'history' | 'support';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ banners, onLogout, addToast }) => {
  const [activeSubView, setActiveSubView] = useState<AdminSubView>('dashboard');
  const [requestFilter, setRequestFilter] = useState<RequestType>('Dépôt');
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [archiveRequests, setArchiveRequests] = useState<TransactionRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null);
  const [selectedUserChat, setSelectedUserChat] = useState<{id: string, name: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // REAL-TIME: Pending requests only. 
  // Simplified query (no orderBy) to avoid Firestore Index requirements.
  useEffect(() => {
    const q = query(
      collection(db, "requests"), 
      where("status", "==", "En attente"),
      limit(25)
    );
    
    const unsub = onSnapshot(q, (snap) => {
      const rList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionRequest));
      
      // Sort in memory to avoid index requirements
      const sorted = rList.sort((a, b) => b.createdAt - a.createdAt);
      
      snap.docChanges().forEach(change => {
        if (change.type === "added") {
          const data = change.doc.data() as TransactionRequest;
          if (Date.now() - data.createdAt < 15000) {
            addToast("Nouveau Dépôt", `${data.userName}: ${data.amount}F`, "info");
          }
        }
      });
      
      setRequests(sorted);
    }, (err) => {
      // Avoid circular structure error by logging only the message
      console.warn("Snapshot Niger Error:", err?.message || "Quota reached");
    });
    return () => unsub();
  }, [addToast]);

  // STATS & ARCHIVES: Fetch history and user list
  // Removed orderBy to ensure it works without composite indexes
  const loadStats = useCallback(async (force = false) => {
    if (!force && Date.now() - lastFetchTime < 120000) return; // Cache 2 min
    setLoading(true);
    try {
      // Query processed requests
      const qA = query(
        collection(db, "requests"), 
        where("status", "!=", "En attente"), 
        limit(100)
      );
      const snapA = await getDocs(qA);
      const fetchedArchives = snapA.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as TransactionRequest))
        .sort((a, b) => b.createdAt - a.createdAt);
      
      setArchiveRequests(fetchedArchives);

      // Query users
      const qU = query(collection(db, "users"), limit(50));
      const snapU = await getDocs(qU);
      setAllUsers(snapU.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
      
      setLastFetchTime(Date.now());
    } catch (e: any) { 
      console.error("Fetch Stats Error Admin:", e?.message);
    } 
    finally { setLoading(false); }
  }, [lastFetchTime]);

  useEffect(() => { 
    loadStats(); 
  }, [loadStats, activeSubView]);

  // Robust statistics calculation
  const stats = useMemo(() => {
    const depVal = archiveRequests.filter(r => r.type === 'Dépôt' && r.status === 'Validé');
    const depValSum = depVal.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    
    const depRej = archiveRequests.filter(r => r.type === 'Dépôt' && r.status === 'Rejeté');
    const depRejSum = depRej.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    const withVal = archiveRequests.filter(r => r.type === 'Retrait' && r.status === 'Validé');
    const withValSum = withVal.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    const online = allUsers.filter(u => Date.now() - (u.lastActive || 0) < 600000).length;
    
    return { 
      depValSum, depValCount: depVal.length, 
      depRejSum, depRejCount: depRej.length,
      withValSum, withValCount: withVal.length,
      totalUsers: allUsers.length, 
      online 
    };
  }, [archiveRequests, allUsers]);

  const handleUpdateRequest = async (id: string, status: 'Validé' | 'Rejeté') => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "requests", id), { status });
      setSelectedRequest(null);
      addToast(status === 'Validé' ? "Action: Validée" : "Action: Rejetée", `Mise à jour réussie`, status === 'Validé' ? "success" : "warning");
      // Give a small delay for Firestore to process before reloading stats
      setTimeout(() => loadStats(true), 800); 
    } catch (err: any) { 
      addToast("Erreur", "Action impossible (Quota?)", "error");
    } finally { setLoading(false); }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette demande ?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "requests", id));
      // Local update for instant feedback
      setRequests(prev => prev.filter(r => r.id !== id));
      addToast("Supprimé", "La demande a été retirée définitivement", "success");
    } catch (err: any) { 
      addToast("Erreur", "Suppression impossible", "error");
    } finally { setLoading(false); }
  };

  const handleDeleteAllHistory = async () => {
    if (archiveRequests.length === 0) return;
    if (!confirm(`⚠️ SUPPRESSION TOTALE\nVoulez-vous vider les ${archiveRequests.length} archives ?`)) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      archiveRequests.forEach(r => batch.delete(doc(db, "requests", r.id)));
      await batch.commit();
      setArchiveRequests([]);
      addToast("Purger", "Historique vidé avec succès", "success");
    } catch (e: any) { 
      addToast("Erreur", "Nettoyage impossible", "error"); 
    }
    finally { setLoading(false); }
  };

  if (selectedUserChat) {
    return <Chat user={{ id: 'admin-1', name: 'Support', role: 'admin' } as User} onBack={() => setSelectedUserChat(null)} targetUserId={selectedUserChat.id} targetUserName={selectedUserChat.name} />;
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FACC15] font-['Poppins']">
      <header className="px-6 pt-14 pb-6 bg-[#0f172a] flex justify-between items-center z-30 border-b-4 border-[#FACC15] shadow-2xl">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-[#0047FF] rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white/10"><CheckCircle2 size={24} /></div>
           <div>
             <h1 className="text-[11px] font-black uppercase text-white tracking-[0.2em] leading-none">Administration</h1>
             <p className="text-[#FACC15] text-[7px] font-black uppercase tracking-widest mt-1">Plateforme Niger Premium</p>
           </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => loadStats(true)} disabled={loading} className="w-10 h-10 flex items-center justify-center bg-white/5 text-white rounded-xl active:bg-white/10 transition-all border border-white/5">
             <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
           </button>
           <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center text-white bg-red-600 rounded-xl border border-red-500 shadow-lg"><Power size={16} /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-8 pb-32 no-scrollbar">
        {activeSubView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Summary Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f172a] p-5 rounded-[2.5rem] shadow-xl border border-slate-800">
                <p className="text-white/40 text-[8px] font-black uppercase mb-1 tracking-widest">En Ligne</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white leading-none">{stats.online}</h2>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-[2.5rem] shadow-xl">
                <p className="text-slate-400 text-[8px] font-black uppercase mb-1 tracking-widest">Inscrits</p>
                <h2 className="text-xl font-black text-slate-900 leading-none">{stats.totalUsers}</h2>
              </div>
            </div>

            {/* Principal Financial Box */}
            <div className="bg-[#0047FF] p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border-4 border-white/10">
              <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Dépôts Validés (Total)</p>
              <div className="flex justify-between items-end">
                <h2 className="text-3xl font-black text-white tracking-tighter leading-none">
                  {stats.depValSum.toLocaleString()} <span className="text-xs opacity-40">FCFA</span>
                </h2>
                <div className="bg-white/20 px-4 py-1.5 rounded-2xl text-white text-[10px] font-black border border-white/20">
                  {stats.depValCount} Op
                </div>
              </div>
            </div>

            {/* Detailed Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-white flex flex-col justify-between">
                <p className="text-slate-400 text-[8px] font-black uppercase mb-2">Retraits Validés</p>
                <h3 className="text-sm font-black text-emerald-600 leading-none">{stats.withValSum.toLocaleString()} F</h3>
                <p className="text-[7px] font-black text-slate-300 mt-2 uppercase">{stats.withValCount} Transactions</p>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-white flex flex-col justify-between">
                <p className="text-slate-400 text-[8px] font-black uppercase mb-2">Dépôts Rejetés</p>
                <h3 className="text-sm font-black text-red-500 leading-none">{stats.depRejSum.toLocaleString()} F</h3>
                <p className="text-[7px] font-black text-slate-300 mt-2 uppercase">{stats.depRejCount} Rejets</p>
              </div>
            </div>

            {/* Filtering & Pending List */}
            <div className="space-y-4">
              <div className="flex bg-[#0f172a]/10 backdrop-blur-md p-1.5 rounded-[2rem] border-2 border-white/50">
                {['Dépôt', 'Retrait', 'Crypto'].map((type) => (
                  <button key={type} onClick={() => setRequestFilter(type as RequestType)} className={`flex-1 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${requestFilter === type ? 'bg-[#0047FF] text-white shadow-xl scale-105' : 'text-slate-500'}`}>
                    {type}s
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between px-2">
                 <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-[0.2em]">En attente ({requestFilter})</h3>
                 <span className="w-8 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[9px] font-black">
                   {requests.filter(r => r.type === requestFilter).length}
                 </span>
              </div>
              
              {requests.filter(r => r.type === requestFilter).map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-[2.5rem] shadow-xl flex flex-col gap-4 border border-white/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4" onClick={() => setSelectedRequest(req)}>
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                        <ReceiptText size={20} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-slate-900 leading-none mb-1">{req.userName}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{req.amount}F • {req.method}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteRequest(req.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100 active:bg-red-500 active:text-white transition-all"><Trash2 size={14}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleUpdateRequest(req.id, 'Rejeté')} className="bg-slate-100 text-slate-400 py-3.5 rounded-2xl text-[9px] font-black uppercase">Rejeter</button>
                    <button onClick={() => handleUpdateRequest(req.id, 'Validé')} className="bg-[#0047FF] text-white py-3.5 rounded-2xl text-[9px] font-black uppercase shadow-lg">Valider</button>
                  </div>
                </div>
              ))}
              {requests.filter(r => r.type === requestFilter).length === 0 && (
                <div className="text-center py-16 opacity-30 text-[9px] font-black uppercase tracking-widest bg-white/30 rounded-[2.5rem] border-2 border-dashed border-white">Aucune demande en attente</div>
              )}
            </div>
          </div>
        )}

        {activeSubView === 'history' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
             <div className="flex justify-between items-center px-2">
                <div>
                   <h2 className="text-slate-900 font-black text-lg uppercase tracking-tight leading-none">Historique Global</h2>
                   <p className="text-blue-600 text-[8px] font-black uppercase tracking-[0.3em] mt-1">Actions Récentes</p>
                </div>
                <button onClick={handleDeleteAllHistory} disabled={archiveRequests.length === 0} className="h-10 px-4 bg-red-50 text-red-500 rounded-xl flex items-center gap-2 border border-red-100 text-[9px] font-black uppercase">
                   <Trash2 size={12}/> Purger
                </button>
             </div>

             <div className="space-y-3">
                {archiveRequests.map(req => (
                  <div key={req.id} className="bg-white/80 backdrop-blur-md p-5 rounded-[2.5rem] flex items-center justify-between border border-white shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${req.status === 'Validé' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-red-50 border-red-100 text-red-500'}`}>
                           {req.status === 'Validé' ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                        </div>
                        <div>
                           <h4 className="text-[10px] font-black uppercase text-slate-900 leading-none">{req.userName}</h4>
                           <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{req.type} • {req.amount} F</p>
                        </div>
                     </div>
                     <span className={`text-[7px] font-black px-3 py-1 rounded-full uppercase border ${req.status === 'Validé' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-100' : 'bg-red-500/10 text-red-600 border-red-100'}`}>{req.status}</span>
                  </div>
                ))}
                {archiveRequests.length === 0 && (
                  <div className="text-center py-20 opacity-20"><ReceiptText size={40} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">Aucune donnée archivée</p></div>
                )}
             </div>
          </div>
        )}

        {activeSubView === 'support' && (
          <div className="space-y-4 animate-in slide-in-from-right duration-500">
            <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-[0.2em] px-2 flex items-center gap-3">
               <MessageSquare size={14}/> Discussions Clients
            </h3>
            {allUsers.length === 0 ? (
              <div className="text-center py-20 opacity-20 text-[10px] font-black uppercase tracking-widest">Aucun client trouvé</div>
            ) : (
              allUsers.map(u => (
                <button key={u.id} onClick={() => setSelectedUserChat({id: u.id, name: u.name})} className="w-full bg-white p-5 rounded-[2.5rem] shadow-lg flex items-center justify-between active:scale-95 transition-all border border-white/50">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-slate-50 text-blue-600 rounded-2xl flex items-center justify-center border border-slate-100"><Users size={18}/></div>
                    <div className="text-left">
                      <h4 className="text-[11px] font-black uppercase text-slate-900 leading-none mb-1">{u.name}</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{u.phone}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-[#0047FF] text-white rounded-xl flex items-center justify-center"><ChevronRight size={16}/></div>
                </button>
              ))
            )}
          </div>
        )}
      </main>

      {/* Navigation Bar - Same style as user */}
      <nav className="shrink-0 px-8 pb-10 pt-2 bg-transparent fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/90 backdrop-blur-2xl border border-white/50 flex justify-around py-4 px-2 rounded-[2.5rem] shadow-2xl">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Accueil' },
            { id: 'history', icon: ReceiptText, label: 'Archives' },
            { id: 'support', icon: MessageSquare, label: 'Support' }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSubView === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => setActiveSubView(item.id as AdminSubView)} 
                className={`relative flex flex-col items-center flex-1 transition-all py-1 ${isActive ? 'text-[#0047FF] scale-110' : 'text-slate-400'}`}
              >
                <Icon size={20} className="mb-1.5" />
                <span className="text-[8px] font-black uppercase tracking-wider">{item.label}</span>
                {isActive && <motion.div layoutId="adminNav" className="absolute -bottom-1 w-1 h-1 bg-[#0047FF] rounded-full" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[1000] bg-[#0f172a]/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-8 shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden">
             <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-6">
                <div>
                   <h3 className="text-slate-900 font-black text-xl uppercase tracking-tighter leading-none">{selectedRequest.userName}</h3>
                   <p className="text-blue-600 text-[10px] font-black mt-2 uppercase tracking-widest">{selectedRequest.userPhone}</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><XCircle size={20}/></button>
             </div>
             <div className="space-y-6">
                <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 shadow-inner flex flex-col items-center">
                   <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">Montant</p>
                   <h4 className="text-slate-900 font-black text-3xl tracking-tighter">{selectedRequest.amount} <span className="text-sm opacity-30 uppercase font-black">FCFA</span></h4>
                </div>
                {selectedRequest.proofImage && (
                  <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-xl relative group">
                    <img src={selectedRequest.proofImage} className="w-full h-64 object-cover" alt="Preuve" />
                    <button onClick={() => window.open(selectedRequest.proofImage)} className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                       <ExternalLink size={30} />
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => handleUpdateRequest(selectedRequest.id, 'Rejeté')} className="bg-slate-100 text-slate-400 py-5 rounded-[2rem] font-black uppercase text-[10px] active:scale-95">Rejeter</button>
                   <button onClick={() => handleUpdateRequest(selectedRequest.id, 'Validé')} className="bg-[#0047FF] text-white py-5 rounded-[2rem] font-black uppercase text-[10px] shadow-xl active:scale-95">Valider</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
