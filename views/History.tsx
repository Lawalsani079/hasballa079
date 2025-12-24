
import React, { useState, useMemo } from 'react';
import { doc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User, TransactionRequest, RequestStatus, RequestType } from '../types';

interface HistoryProps {
  user: User;
  requests: TransactionRequest[];
}

const History: React.FC<HistoryProps> = ({ user, requests }) => {
  const [filterType, setFilterType] = useState<RequestType | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests
      .filter(r => r.userId === user.id)
      .filter(r => filterType === 'All' || r.type === filterType)
      .filter(r => filterStatus === 'All' || r.status === filterStatus);
  }, [requests, user.id, filterType, filterStatus]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm("Voulez-vous supprimer cette opération de votre historique ?")) return;
    
    try {
      await deleteDoc(doc(db, "requests", id));
    } catch (err: any) {
      alert("Erreur lors de la suppression. Veuillez réessayer.");
    }
  };

  const handleClearAll = async () => {
    const userRequests = requests.filter(r => r.userId === user.id);
    if (userRequests.length === 0) {
      alert("Votre historique est déjà vide.");
      return;
    }
    if (!window.confirm(`Supprimer définitivement TOUTES vos ${userRequests.length} opérations pour libérer de l'espace ?`)) return;
    
    setDeleting(true);
    try {
      const batch = writeBatch(db);
      userRequests.forEach(req => {
        batch.delete(doc(db, "requests", req.id));
      });
      await batch.commit();
    } catch (err) {
      alert("Erreur lors de la suppression groupée.");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-green-500 text-white shadow-lg shadow-green-500/20';
      case 'Rejeté': return 'bg-red-500 text-white shadow-lg shadow-red-500/20';
      default: return 'bg-yellow-400 text-[#081a2b] shadow-lg shadow-yellow-500/20';
    }
  };

  const getTypeIcon = (type: RequestType) => {
    switch (type) {
      case 'Dépôt': return { icon: 'fa-arrow-down', color: 'bg-blue-500/20 text-blue-300' };
      case 'Retrait': return { icon: 'fa-arrow-up', color: 'bg-yellow-500/20 text-yellow-300' };
      case 'Crypto': return { icon: 'fa-coins', color: 'bg-emerald-500/20 text-emerald-300' };
      default: return { icon: 'fa-exchange-alt', color: 'bg-white/10 text-white/40' };
    }
  };

  return (
    <div className="flex-1 bg-[#081a2b] overflow-y-auto pb-32">
       <div className="p-6">
         <div className="flex justify-between items-center mb-6 px-1">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Historique</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{filteredRequests.length} opérations trouvées</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleClearAll}
                disabled={deleting}
                className="w-12 h-12 rounded-2xl bg-red-500 text-white shadow-xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
                title="Vider tout"
              >
                {deleting ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-trash-alt"></i>}
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`relative w-12 h-12 rounded-2xl transition-all shadow-xl flex items-center justify-center ${showFilters ? 'bg-yellow-400 text-[#081a2b]' : 'bg-white/10 text-white'}`}
              >
                <i className="fas fa-filter"></i>
              </button>
            </div>
         </div>

         {showFilters && (
           <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 mb-6 border border-white/10 animate-in slide-in-from-top-4 duration-300">
             <div className="space-y-6">
               <div>
                 <p className="text-[10px] font-black text-white/40 uppercase mb-3 tracking-widest px-2">Type d'opération</p>
                 <div className="grid grid-cols-2 gap-2">
                   {['All', 'Dépôt', 'Retrait', 'Crypto'].map((t) => (
                     <button key={t} onClick={() => setFilterType(t as any)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === t ? 'bg-white text-[#081a2b] shadow-lg' : 'bg-white/5 text-white/40'}`}>
                       {t === 'All' ? 'Tous' : t}
                     </button>
                   ))}
                 </div>
               </div>
               <div>
                 <p className="text-[10px] font-black text-white/40 uppercase mb-3 tracking-widest px-2">Statut</p>
                 <div className="grid grid-cols-2 gap-2">
                   {['All', 'En attente', 'Validé', 'Rejeté'].map((s) => (
                     <button key={s} onClick={() => setFilterStatus(s as any)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-white text-[#081a2b] shadow-lg' : 'bg-white/5 text-white/40'}`}>
                       {s === 'All' ? 'Tous' : s}
                     </button>
                   ))}
                 </div>
               </div>
             </div>
           </div>
         )}
         
         {filteredRequests.length === 0 ? (
           <div className="bg-white/5 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center border border-white/5 mt-4 opacity-50">
              <i className="fas fa-folder-open text-white/20 text-5xl mb-4"></i>
              <h3 className="text-white/40 font-black text-xs uppercase tracking-widest">Aucune donnée trouvée</h3>
           </div>
         ) : (
           <div className="space-y-4">
             {filteredRequests.map((req) => {
               const style = getTypeIcon(req.type);
               return (
                 <div key={req.id} className="bg-white/10 backdrop-blur-md rounded-[2.2rem] p-5 border border-white/10 flex flex-col gap-4 active:scale-[0.98] transition-all relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${style.color}`}>
                          <i className={`fas ${style.icon}`}></i>
                        </div>
                        <div>
                          <h4 className="font-black text-white text-sm uppercase tracking-tight">{req.type} {req.type === 'Crypto' ? req.cryptoType : req.bookmaker}</h4>
                          <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">
                            {new Date(req.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-white font-black text-sm">{req.amount} F</p>
                         <p className="text-[9px] font-bold text-white/20 uppercase">{req.method || 'NITA'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusStyle(req.status)}`}>
                        {req.status}
                      </div>
                      <div className="flex items-center gap-3">
                        {req.type === 'Retrait' && req.withdrawCode && (
                          <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-dashed border-white/10">
                             <span className="text-[9px] font-black text-yellow-400 font-mono tracking-widest">{req.withdrawCode}</span>
                          </div>
                        )}
                        <button 
                          onClick={(e) => handleDelete(e, req.id)}
                          className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all"
                        >
                          <i className="fas fa-trash-alt text-sm"></i>
                        </button>
                      </div>
                    </div>
                 </div>
               );
             })}
           </div>
         )}
       </div>
    </div>
  );
};

export default History;
