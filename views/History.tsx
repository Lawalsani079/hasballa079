
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, limit, getDocs, deleteDoc, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User, TransactionRequest } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryProps {
  user: User;
  onBack: () => void;
}

const History: React.FC<HistoryProps> = ({ user, onBack }) => {
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // États pour la double confirmation
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "requests"), where("userId", "==", user.id), limit(30));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as TransactionRequest));
      setRequests(data.sort((a, b) => b.createdAt - a.createdAt));
    } catch (e: any) { 
      console.error("Fetch History Error:", e.message);
    } finally { 
      setLoading(false); 
    }
  }, [user.id]);

  useEffect(() => { 
    fetchHistory(); 
  }, [fetchHistory]);

  // Nettoyage des timers à la destruction du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDelete = async (id: string) => {
    // Étape 1 : Demander confirmation
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }

    // Étape 2 : Suppression effective
    setConfirmDeleteId(null);
    const previousRequests = [...requests];
    setRequests(prev => prev.filter(r => r.id !== id));
    
    try {
      await deleteDoc(doc(db, "requests", id));
    } catch (e: any) { 
      setRequests(previousRequests);
      alert("Erreur lors de la suppression serveur."); 
    }
  };

  const handleClearAll = async () => {
    if (requests.length === 0) return;

    // Étape 1 : Demander confirmation globale
    if (!confirmClearAll) {
      setConfirmClearAll(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setConfirmClearAll(null), 4000);
      return;
    }

    // Étape 2 : Nettoyage global
    setConfirmClearAll(false);
    setIsDeleting(true);
    const previousRequests = [...requests];
    setRequests([]); 

    try {
      const q = query(collection(db, "requests"), where("userId", "==", user.id));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (e: any) { 
      setRequests(previousRequests);
      alert("Erreur lors du nettoyage global."); 
    } finally { 
      setIsDeleting(false); 
    }
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto pb-32 no-scrollbar flex flex-col h-full animate-in fade-in">
       <div className="p-6 flex-1 flex flex-col">
         <div className="flex justify-between items-center mb-8 shrink-0">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Activité</h2>
              <p className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Recharge+ Niger</p>
            </div>
            <div className="flex gap-2">
              {/* Bouton Vider Tout avec confirmation visuelle */}
              <button 
                onClick={handleClearAll} 
                disabled={loading || isDeleting || requests.length === 0} 
                className={`h-11 rounded-2xl flex items-center justify-center border transition-all disabled:opacity-20 shadow-sm px-4 gap-2 ${
                  confirmClearAll 
                    ? 'bg-red-600 text-white border-red-700 w-auto animate-pulse' 
                    : 'bg-red-50 text-red-500 border-red-100 w-11'
                }`}
              >
                {confirmClearAll ? (
                  <>
                    <i className="fas fa-exclamation-triangle text-xs"></i>
                    <span className="text-[9px] font-black uppercase tracking-widest">Confirmer ?</span>
                  </>
                ) : (
                  <i className={`fas ${isDeleting ? 'fa-spinner animate-spin' : 'fa-broom'} text-sm`}></i>
                )}
              </button>

              <button 
                onClick={fetchHistory} 
                className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 active:scale-90 shadow-sm"
              >
                <i className={`fas fa-sync-alt text-sm ${loading ? 'animate-spin' : ''}`}></i>
              </button>
            </div>
         </div>

         <div className="flex-1">
           {loading && requests.length === 0 ? (
            <div className="h-full flex items-center justify-center py-20 opacity-20"><i className="fas fa-circle-notch animate-spin text-3xl text-blue-600"></i></div>
           ) : requests.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-30">
                <i className="fas fa-folder-open text-5xl mb-6"></i>
                <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest">Historique Vide</h3>
              </div>
            ) : (
             <div className="space-y-4">
               <AnimatePresence mode="popLayout">
                 {requests.map((req) => (
                   <motion.div 
                     key={req.id} 
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, x: -50 }}
                     className="bg-slate-50 p-5 rounded-[2.5rem] border border-slate-100 flex flex-col gap-3 shadow-sm"
                   >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                             <i className={`fas ${req.type === 'Dépôt' ? 'fa-arrow-down text-blue-600' : 'fa-arrow-up text-yellow-600'}`}></i>
                           </div>
                           <div>
                             <h4 className="font-black text-slate-900 text-[11px] uppercase">{req.type}</h4>
                             <p className="text-slate-400 text-[7px] font-black uppercase mt-0.5">
                               {new Date(req.createdAt).toLocaleDateString()}
                             </p>
                           </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-900 font-black text-xs tracking-tight">{req.amount} F</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200/40">
                        <span className={`px-3 py-1 rounded-lg text-[7px] font-black uppercase border ${
                          req.status === 'Validé' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          req.status === 'Rejeté' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                        }`}>
                          {req.status}
                        </span>
                        
                        {/* Bouton de suppression individuelle avec double confirmation */}
                        <button 
                          onClick={() => handleDelete(req.id)} 
                          className={`h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border px-3 gap-2 ${
                            confirmDeleteId === req.id 
                              ? 'bg-red-600 text-white border-red-700' 
                              : 'bg-white text-slate-300 border-slate-100'
                          }`}
                        >
                          {confirmDeleteId === req.id ? (
                            <span className="text-[8px] font-black uppercase tracking-tighter">Confirmer ?</span>
                          ) : (
                            <i className="fas fa-trash-alt text-[10px]"></i>
                          )}
                        </button>
                      </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
           )}
         </div>
       </div>
    </div>
  );
};

export default History;
