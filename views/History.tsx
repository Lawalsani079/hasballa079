
import React, { useState, useMemo } from 'react';
import { doc, deleteDoc, writeBatch, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User, TransactionRequest, RequestStatus, RequestType } from '../types';

interface HistoryProps {
  user: User;
  requests: TransactionRequest[];
}

const History: React.FC<HistoryProps> = ({ user, requests }) => {
  const [filterType, setFilterType] = useState<RequestType | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'All'>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    return requests
      .filter(r => r.userId === user.id)
      .filter(r => filterType === 'All' || r.type === filterType)
      .filter(r => filterStatus === 'All' || r.status === filterStatus)
      .filter(r => {
        if (!startDate) return true;
        const requestDate = new Date(r.createdAt).setHours(0, 0, 0, 0);
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        return requestDate >= start;
      })
      .filter(r => {
        if (!endDate) return true;
        const requestDate = new Date(r.createdAt).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(0, 0, 0, 0);
        return requestDate <= end;
      });
  }, [requests, user.id, filterType, filterStatus, startDate, endDate]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer cette transaction de votre historique ?")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "requests", id));
    } catch (err: any) {
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Voulez-vous supprimer TOUTES vos transactions archivées ? Cette action est irréversible.")) return;
    setDeleting(true);
    try {
      const q = query(collection(db, "requests"), where("userId", "==", user.id));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      let count = 0;
      snapshot.forEach(doc => {
        if (doc.data().status !== 'En attente') {
          batch.delete(doc.ref);
          count++;
        }
      });
      if (count > 0) {
        await batch.commit();
        alert(`${count} transactions supprimées de votre historique.`);
      } else {
        alert("Rien à supprimer.");
      }
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filterSummary = useMemo(() => {
    let summaryParts: string[] = [];
    if (filterType === 'All' && filterStatus === 'All') {
      summaryParts.push('Toutes les transactions');
    } else {
      const typeStr = filterType === 'All' ? 'Transactions' : filterType + 's';
      const statusStr = filterStatus === 'All' ? '' : filterStatus.toLowerCase() + 's';
      summaryParts.push(`${typeStr} ${statusStr}`.trim());
    }
    return summaryParts.join(' ');
  }, [filterType, filterStatus]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-green-500 text-white shadow-green-100';
      case 'Rejeté': return 'bg-red-500 text-white shadow-red-100';
      default: return 'bg-blue-600 text-white shadow-blue-100';
    }
  };

  return (
    <div className="flex-1 bg-[#F4F7FE] overflow-y-auto pb-32">
       <div className="p-6">
         <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-blue-900 tracking-tight">Historique</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{filteredRequests.length} opérations</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleClearAll}
                disabled={deleting}
                className="w-10 h-10 bg-white text-red-500 rounded-xl shadow-lg flex items-center justify-center active:scale-90 border border-red-50"
              >
                <i className={`fas ${deleting ? 'fa-circle-notch animate-spin' : 'fa-trash-alt'}`}></i>
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`relative w-10 h-10 rounded-xl transition-all shadow-lg flex items-center justify-center ${showFilters ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-blue-900'}`}
              >
                <i className="fas fa-sliders-h"></i>
              </button>
            </div>
         </div>

         {showFilters && (
           <div className="bg-white rounded-[2rem] p-6 mb-6 shadow-2xl shadow-blue-900/5 animate-in slide-in-from-top-4 duration-300">
             <div className="space-y-6">
               <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest px-2">Filtrer par Type</p>
                 <div className="flex gap-2">
                   {['All', 'Dépôt', 'Retrait'].map((t) => (
                     <button key={t} onClick={() => setFilterType(t as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                       {t === 'All' ? 'Tous' : t}
                     </button>
                   ))}
                 </div>
               </div>
               <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest px-2">Filtrer par Statut</p>
                 <div className="grid grid-cols-2 gap-2">
                   {['All', 'En attente', 'Validé', 'Rejeté'].map((s) => (
                     <button key={s} onClick={() => setFilterStatus(s as any)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                       {s === 'All' ? 'Tous' : s}
                     </button>
                   ))}
                 </div>
               </div>
             </div>
           </div>
         )}

         <div className="px-2 mb-4">
           <p className="text-blue-600/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
             {filterSummary}
           </p>
         </div>
         
         {filteredRequests.length === 0 ? (
           <div className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-sm mt-4">
              <i className="fas fa-folder-open text-blue-100 text-4xl mb-4"></i>
              <h3 className="text-blue-900 font-black text-sm uppercase tracking-widest">Historique vide</h3>
           </div>
         ) : (
           <div className="space-y-3">
             {filteredRequests.map((req) => (
               <div key={req.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 flex items-center justify-between active:scale-[0.98] transition-all group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${req.type === 'Dépôt' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-500'}`}>
                      <i className={`fas ${req.type === 'Dépôt' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                    </div>
                    <div>
                      <h4 className="font-black text-blue-900 text-sm uppercase tracking-tight">{req.type} {req.bookmaker}</h4>
                      <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-1">
                        {new Date(req.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • <span className="text-blue-600 font-black">{req.amount} F</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm ${getStatusStyle(req.status)}`}>
                      {req.status}
                    </div>
                    {req.status !== 'En attente' && (
                      <button 
                        onClick={(e) => handleDelete(e, req.id)}
                        disabled={deletingId === req.id}
                        className="text-gray-200 hover:text-red-500 transition-colors"
                      >
                        {deletingId === req.id ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-trash-alt text-[10px]"></i>}
                      </button>
                    )}
                  </div>
               </div>
             ))}
           </div>
         )}
       </div>
    </div>
  );
};

export default History;
