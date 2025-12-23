
import React, { useState } from 'react';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { TransactionRequest } from '../types';

interface AdminDashboardProps {
  requests: TransactionRequest[];
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, onLogout }) => {
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleUpdate = async (id: string, status: 'Validé' | 'Rejeté') => {
    setProcessing(true);
    try {
      const docRef = doc(db, "requests", id);
      await updateDoc(docRef, { status });
      setSelectedRequest(null);
    } catch (err: any) {
      console.error("Update error message:", err.message);
      alert('Erreur lors de la mise à jour : ' + (err.code === 'permission-denied' ? 'Permission refusée' : err.message));
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'En attente').length;

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-screen overflow-hidden">
      <div className="bg-blue-600 p-6 flex justify-between items-center text-white shadow-lg z-10">
        <div>
          <h2 className="text-xl font-black italic tracking-tight">ADMIN PANEL</h2>
          <p className="text-[10px] opacity-70 font-medium uppercase tracking-wider">Gestion des recharges en direct</p>
        </div>
        <button onClick={onLogout} className="bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-colors"><i className="fas fa-sign-out-alt"></i></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">En attente</p>
            <p className="text-2xl font-black text-blue-600">{pendingCount}</p>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Validés</p>
            <p className="text-2xl font-black text-green-500">{requests.filter(r => r.status === 'Validé').length}</p>
          </div>
        </div>

        <div className="px-2">
           <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
             <i className="fas fa-list-ul text-blue-600"></i>
             Demandes récentes
           </h3>
          
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="py-12 text-center text-gray-300">
                <i className="fas fa-inbox text-4xl mb-2"></i>
                <p className="text-sm font-medium">Aucune demande trouvée</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} onClick={() => setSelectedRequest(req)} className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-95 transition-all hover:border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${req.status === 'En attente' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-50 text-blue-400'}`}>
                      <i className={`fas ${req.type === 'Dépôt' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-gray-800 leading-tight">{req.userName}</h5>
                      <p className="text-[10px] text-gray-400 font-medium">{req.amount} FCFA • {req.bookmaker}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${req.status === 'Validé' ? 'bg-green-100 text-green-600' : req.status === 'Rejeté' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {req.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm p-6 flex items-center justify-center p-4">
          <div className="bg-white w-full rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
               <div>
                 <h4 className="font-black leading-tight">{selectedRequest.userName}</h4>
                 <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">{selectedRequest.type}</p>
               </div>
               <button onClick={() => setSelectedRequest(null)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
               <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100"><p className="text-gray-400 text-[9px] font-bold uppercase mb-1">ID Bookmaker</p><p className="font-black text-blue-900">{selectedRequest.bookmakerId}</p></div>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100"><p className="text-gray-400 text-[9px] font-bold uppercase mb-1">Montant</p><p className="font-black text-blue-900">{selectedRequest.amount} FCFA</p></div>
               </div>
               
               {selectedRequest.proofImage ? (
                 <div className="space-y-2">
                    <p className="text-gray-400 text-[9px] font-bold uppercase px-1">Preuve de paiement</p>
                    <img src={selectedRequest.proofImage} className="w-full rounded-2xl shadow-lg border border-gray-100 cursor-pointer" alt="Reçu" onClick={() => window.open(selectedRequest.proofImage)} />
                    <p className="text-[8px] text-center text-gray-400 italic">Cliquer sur l'image pour agrandir</p>
                 </div>
               ) : (
                 <div className="bg-gray-100 p-8 rounded-2xl text-center text-gray-400">
                   <i className="fas fa-image text-3xl mb-2"></i>
                   <p className="text-xs font-medium">Aucune image fournie</p>
                 </div>
               )}
            </div>
            
            {selectedRequest.status === 'En attente' && (
              <div className="p-6 pt-0 flex gap-4">
                <button disabled={processing} onClick={() => handleUpdate(selectedRequest.id, 'Rejeté')} className="flex-1 bg-red-100 text-red-600 font-black py-4 rounded-2xl active:scale-95 transition-transform">REJETER</button>
                <button disabled={processing} onClick={() => handleUpdate(selectedRequest.id, 'Validé')} className="flex-1 bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-100 active:scale-95 transition-transform">VALIDER</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
