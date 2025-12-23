
import React, { useState, useMemo } from 'react';
import { doc, updateDoc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { TransactionRequest } from '../types';
import { COLORS } from '../constants';

interface AdminDashboardProps {
  requests: TransactionRequest[];
  onLogout: () => void;
}

type AdminSubView = 'dashboard' | 'archives' | 'admin';
type RequestFilter = 'Dépôt' | 'Retrait';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, onLogout }) => {
  const [activeSubView, setActiveSubView] = useState<AdminSubView>('dashboard');
  const [activeFilter, setActiveFilter] = useState<RequestFilter>('Dépôt');
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayReqs = requests.filter(r => new Date(r.createdAt).setHours(0, 0, 0, 0) === today);

    return {
      totalDepotsToday: todayReqs.filter(r => r.type === 'Dépôt' && r.status === 'Validé').reduce((acc, curr) => acc + Number(curr.amount || 0), 0),
      enAttenteTotal: requests.filter(r => r.status === 'En attente').length,
      depotsEnCours: requests.filter(r => r.type === 'Dépôt' && r.status === 'En attente').length,
      retraitsEnCours: requests.filter(r => r.type === 'Retrait' && r.status === 'En attente').length,
      rejetesToday: todayReqs.filter(r => r.status === 'Rejeté').length,
      traitesToday: todayReqs.filter(r => r.status !== 'En attente').length
    };
  }, [requests]);

  const filteredList = useMemo(() => {
    if (activeSubView === 'dashboard') {
      return requests.filter(r => r.type === activeFilter && r.status === 'En attente');
    }
    return requests.filter(r => r.status !== 'En attente' && r.type === activeFilter).slice(0, 100);
  }, [requests, activeFilter, activeSubView]);

  const handleUpdate = async (id: string, status: 'Validé' | 'Rejeté') => {
    setProcessing(true);
    try {
      await updateDoc(doc(db, "requests", id), { status });
      setSelectedRequest(null);
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer définitivement cette transaction ?")) return;
    setProcessing(true);
    try {
      await deleteDoc(doc(db, "requests", id));
      if (selectedRequest?.id === id) setSelectedRequest(null);
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleClearFilteredHistory = async () => {
    if (filteredList.length === 0) return;
    if (!window.confirm(`Voulez-vous supprimer TOUTES les archives de type "${activeFilter}" ?`)) return;
    setProcessing(true);
    try {
      const batch = writeBatch(db);
      filteredList.forEach(req => batch.delete(doc(db, "requests", req.id)));
      await batch.commit();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden text-white font-['Poppins']" style={{ backgroundColor: COLORS.backgroundAdmin }}>
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex justify-between items-center z-10">
        <button className="w-10 h-10 flex items-center justify-center">
          <i className="fas fa-bars text-xl"></i>
        </button>
        <h1 className="text-xl font-bold tracking-tight uppercase">
          {activeSubView === 'dashboard' ? 'Tableau de Bord' : 'Archives'}
        </h1>
        <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center text-orange-400">
          <i className="fas fa-sign-out-alt text-xl"></i>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-32">
        {activeSubView === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#2ecc71] p-4 rounded-3xl shadow-lg animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-2">
                  <div><p className="text-xs font-semibold opacity-90">Total Depots</p><p className="text-[10px] opacity-75">Valides aujourd'hui</p></div>
                  <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-chart-line text-xs"></i></div>
                </div>
                <h2 className="text-lg font-black">{stats.totalDepotsToday.toLocaleString()} F</h2>
              </div>
              <div className="bg-[#3498db] p-4 rounded-3xl shadow-lg animate-in zoom-in-95 duration-300 delay-75">
                <div className="flex justify-between items-start mb-2">
                  <div><p className="text-xs font-semibold opacity-90">En Attente</p><p className="text-[10px] opacity-75">Global</p></div>
                  <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-clock text-xs"></i></div>
                </div>
                <h2 className="text-3xl font-black">{stats.enAttenteTotal}</h2>
              </div>
              <div className="bg-[#9b59b6] p-4 rounded-3xl shadow-lg animate-in zoom-in-95 duration-300 delay-100">
                <div className="flex justify-between items-start mb-2">
                  <div><p className="text-xs font-semibold opacity-90">Depots en cours</p><p className="text-[10px] opacity-75">A valider</p></div>
                  <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-arrow-down text-xs"></i></div>
                </div>
                <h2 className="text-3xl font-black">{stats.depotsEnCours}</h2>
              </div>
              <div className="bg-[#e67e22] p-4 rounded-3xl shadow-lg animate-in zoom-in-95 duration-300 delay-150">
                <div className="flex justify-between items-start mb-2">
                  <div><p className="text-xs font-semibold opacity-90">Retraits en cours</p><p className="text-[10px] opacity-75">A traiter</p></div>
                  <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-arrow-up text-xs"></i></div>
                </div>
                <h2 className="text-3xl font-black">{stats.retraitsEnCours}</h2>
              </div>
              <div className="bg-[#e74c3c] p-4 rounded-3xl shadow-lg animate-in zoom-in-95 duration-300 delay-200">
                <div className="flex justify-between items-start mb-2">
                  <div><p className="text-xs font-semibold opacity-90">Rejetes</p><p className="text-[10px] opacity-75">Aujourd'hui</p></div>
                  <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-times-circle text-xs"></i></div>
                </div>
                <h2 className="text-3xl font-black">{stats.rejetesToday}</h2>
              </div>
              <div className="bg-[#1abc9c] p-4 rounded-3xl shadow-lg animate-in zoom-in-95 duration-300 delay-300">
                <div className="flex justify-between items-start mb-2">
                  <div><p className="text-xs font-semibold opacity-90">Total Traites</p><p className="text-[10px] opacity-75">Aujourd'hui</p></div>
                  <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-check-double text-xs"></i></div>
                </div>
                <h2 className="text-3xl font-black">{stats.traitesToday}</h2>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setActiveFilter('Dépôt')} className={`flex-1 py-4 rounded-3xl text-xs font-bold transition-all ${activeFilter === 'Dépôt' ? 'bg-[#9b59b6] shadow-lg scale-105' : 'bg-white/10 opacity-60'}`}>Requetes Depots</button>
              <button onClick={() => setActiveFilter('Retrait')} className={`flex-1 py-4 rounded-3xl text-xs font-bold transition-all ${activeFilter === 'Retrait' ? 'bg-[#e67e22] shadow-lg scale-105' : 'bg-white/10 opacity-60'}`}>Requetes Retraits</button>
            </div>

            <div className="mt-8 space-y-3 pb-10">
              {filteredList.map(req => (
                <div key={req.id} onClick={() => setSelectedRequest(req)} className="bg-white/10 p-4 rounded-2xl flex items-center justify-between border border-white/5 active:scale-95 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><i className={`fas ${req.type === 'Dépôt' ? 'fa-arrow-down text-blue-400' : 'fa-arrow-up text-orange-400'}`}></i></div>
                    <div><p className="font-bold text-sm">{req.userName}</p><p className="text-[10px] opacity-50 uppercase">{req.amount} F • {req.bookmaker}</p></div>
                  </div>
                  <i className="fas fa-chevron-right text-white/20"></i>
                </div>
              ))}
              {filteredList.length === 0 && <p className="text-center py-10 opacity-30 text-sm">Aucune demande en attente</p>}
            </div>
          </div>
        )}

        {activeSubView === 'archives' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Historique {activeFilter}s</h2>
              <button onClick={handleClearFilteredHistory} disabled={processing} className="text-red-400 text-[9px] font-bold uppercase bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20">Vider</button>
            </div>
            <div className="flex gap-2 mb-6">
              <button onClick={() => setActiveFilter('Dépôt')} className={`flex-1 py-3 rounded-2xl text-[10px] font-bold transition-all ${activeFilter === 'Dépôt' ? 'bg-white/20' : 'opacity-40'}`}>Dépôts</button>
              <button onClick={() => setActiveFilter('Retrait')} className={`flex-1 py-3 rounded-2xl text-[10px] font-bold transition-all ${activeFilter === 'Retrait' ? 'bg-white/20' : 'opacity-40'}`}>Retraits</button>
            </div>
            <div className="space-y-3">
              {filteredList.map(req => (
                <div key={req.id} onClick={() => setSelectedRequest(req)} className="bg-white/10 p-4 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${req.status === 'Validé' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}><i className={`fas ${req.status === 'Validé' ? 'fa-check' : 'fa-times'}`}></i></div>
                    <div><p className="text-sm font-bold">{req.userName}</p><p className="text-[10px] opacity-50">{req.amount} F</p></div>
                  </div>
                  <button onClick={(e) => handleDelete(e, req.id)} className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-red-400"><i className="fas fa-trash-alt text-xs"></i></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in">
           <div className="bg-[#0a4d8c] w-full max-w-md rounded-t-[3rem] shadow-2xl border-t border-white/10 animate-in slide-in-from-bottom-12 flex flex-col max-h-[90vh]">
              <div className="p-8 flex justify-between items-center border-b border-white/5">
                 <h3 className="text-xl font-bold uppercase">{selectedRequest.userName}</h3>
                 <div className="flex gap-2">
                    <button onClick={(e) => handleDelete(e, selectedRequest.id)} className="w-10 h-10 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center"><i className="fas fa-trash-alt"></i></button>
                    <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><i className="fas fa-times"></i></button>
                 </div>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[10px] font-bold opacity-50 mb-1 uppercase">Montant</p><p className="text-lg font-black">{selectedRequest.amount} F</p></div>
                    <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[10px] font-bold opacity-50 mb-1 uppercase">ID Joueur</p>
                       <div className="flex items-center justify-between"><p className="text-sm font-bold text-blue-300">{selectedRequest.bookmakerId}</p><button onClick={() => copyToClipboard(selectedRequest.bookmakerId)}><i className={`fas ${copied ? 'fa-check text-green-400' : 'fa-copy'} text-xs`}></i></button></div>
                    </div>
                 </div>
                 {selectedRequest.withdrawCode && <div className="bg-white/5 p-6 rounded-2xl text-center border border-orange-500/20"><p className="text-orange-400 text-[10px] font-bold uppercase mb-2">Code de Retrait</p><p className="text-3xl font-black tracking-widest">{selectedRequest.withdrawCode}</p></div>}
                 {selectedRequest.proofImage && <div className="space-y-2"><p className="text-[10px] font-bold opacity-50 uppercase px-2">Preuve</p><div className="rounded-2xl overflow-hidden border border-white/10"><img src={selectedRequest.proofImage} className="w-full object-contain max-h-[300px]" alt="Proof" /></div></div>}
              </div>
              {selectedRequest.status === 'En attente' && (
                 <div className="p-8 pt-0 flex gap-4">
                    <button disabled={processing} onClick={() => handleUpdate(selectedRequest.id, 'Rejeté')} className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl uppercase text-[10px]">Rejeter</button>
                    <button disabled={processing} onClick={() => handleUpdate(selectedRequest.id, 'Validé')} className="flex-1 bg-green-500 text-white font-black py-4 rounded-2xl uppercase text-[10px] shadow-lg">Valider</button>
                 </div>
              )}
           </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around py-4 border-t border-white/5 shadow-2xl" style={{ backgroundColor: COLORS.darkNav }}>
        <button onClick={() => setActiveSubView('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'dashboard' ? 'text-white' : 'text-white/40'}`}>
          <i className="fas fa-th-large text-xl"></i>
          <span className="text-[9px] font-medium">Dashboard</span>
        </button>
        <button onClick={() => setActiveSubView('archives')} className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'archives' ? 'text-white' : 'text-white/40'}`}>
          <i className="fas fa-archive text-xl"></i>
          <span className="text-[9px] font-medium">Archives</span>
        </button>
        <button onClick={() => setActiveSubView('admin')} className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'admin' ? 'text-white' : 'text-white/40'}`}>
          <i className="fas fa-cog text-xl"></i>
          <span className="text-[9px] font-medium">Réglages</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminDashboard;
