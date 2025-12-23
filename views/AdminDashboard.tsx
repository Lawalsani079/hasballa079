
import React, { useState, useMemo } from 'react';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { TransactionRequest } from '../types';

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
  const [searchQuery, setSearchQuery] = useState('');

  // Statistiques calculées
  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaysRequests = requests.filter(r => new Date(r.createdAt).setHours(0, 0, 0, 0) === today);

    const totalDepotsValidesToday = todaysRequests
      .filter(r => r.type === 'Dépôt' && r.status === 'Validé')
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const enAttenteTotal = requests.filter(r => r.status === 'En attente').length;
    const depotsEnCours = requests.filter(r => r.type === 'Dépôt' && r.status === 'En attente').length;
    const retraitsEnCours = requests.filter(r => r.type === 'Retrait' && r.status === 'En attente').length;
    const rejetesToday = todaysRequests.filter(r => r.status === 'Rejeté').length;
    const traitesToday = todaysRequests.filter(r => r.status !== 'En attente').length;

    // Global stats for Admin tab
    const totalVolume = requests
      .filter(r => r.status === 'Validé')
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    return {
      totalDepotsValidesToday,
      enAttenteTotal,
      depotsEnCours,
      retraitsEnCours,
      rejetesToday,
      traitesToday,
      totalVolume,
      totalRequests: requests.length
    };
  }, [requests]);

  const filteredPending = useMemo(() => {
    return requests.filter(r => r.type === activeFilter && r.status === 'En attente');
  }, [requests, activeFilter]);

  const archivesList = useMemo(() => {
    return requests
      .filter(r => r.status !== 'En attente')
      .filter(r => 
        r.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.bookmakerId.includes(searchQuery)
      )
      .slice(0, 50); // Limit to latest 50 for performance
  }, [requests, searchQuery]);

  const handleUpdate = async (id: string, status: 'Validé' | 'Rejeté') => {
    setProcessing(true);
    try {
      const docRef = doc(db, "requests", id);
      await updateDoc(docRef, { status });
      setSelectedRequest(null);
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'text-green-400';
      case 'Rejeté': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const renderDashboard = () => (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#2ecc71] p-4 rounded-3xl relative h-36 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start">
            <div className="text-[10px] leading-tight font-bold opacity-90 uppercase">Total Depots<br/>Valides<br/>aujourd'hui</div>
            <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-chart-line text-xs"></i></div>
          </div>
          <div className="text-xl font-black">{stats.totalDepotsValidesToday.toLocaleString()} FCFA</div>
        </div>

        <div className="bg-[#3498db] p-4 rounded-3xl relative h-36 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start">
            <div className="text-[10px] leading-tight font-bold opacity-90 uppercase">En Attente<br/>Depots + Retraits</div>
            <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-clock text-xs"></i></div>
          </div>
          <div className="text-4xl font-black">{stats.enAttenteTotal}</div>
        </div>

        <div className="bg-[#9b59b6] p-4 rounded-3xl relative h-36 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start">
            <div className="text-[10px] leading-tight font-bold opacity-90 uppercase">Depots en cours<br/>A valider</div>
            <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-download text-xs"></i></div>
          </div>
          <div className="text-4xl font-black">{stats.depotsEnCours}</div>
        </div>

        <div className="bg-[#e67e22] p-4 rounded-3xl relative h-36 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start">
            <div className="text-[10px] leading-tight font-bold opacity-90 uppercase">Retraits en cours<br/>A traiter</div>
            <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-upload text-xs"></i></div>
          </div>
          <div className="text-4xl font-black">{stats.retraitsEnCours}</div>
        </div>

        <div className="bg-[#e74c3c] p-4 rounded-3xl relative h-36 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start">
            <div className="text-[10px] leading-tight font-bold opacity-90 uppercase">Rejetes<br/>Aujourd'hui</div>
            <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-times-circle text-xs"></i></div>
          </div>
          <div className="text-4xl font-black">{stats.rejetesToday}</div>
        </div>

        <div className="bg-[#1abc9c] p-4 rounded-3xl relative h-36 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start">
            <div className="text-[10px] leading-tight font-bold opacity-90 uppercase">Total Traites<br/>Aujourd'hui</div>
            <div className="bg-white/20 p-1.5 rounded-lg"><i className="fas fa-check-circle text-xs"></i></div>
          </div>
          <div className="text-4xl font-black">{stats.traitesToday}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveFilter('Dépôt')}
          className={`flex-1 py-4 rounded-full font-bold transition-all text-center ${activeFilter === 'Dépôt' ? 'bg-[#9b59b6] text-white shadow-lg shadow-purple-900/40' : 'bg-transparent border border-white/20 text-white'}`}
        >
          Requetes Depots
        </button>
        <button 
          onClick={() => setActiveFilter('Retrait')}
          className={`flex-1 py-4 rounded-full font-bold transition-all text-center ${activeFilter === 'Retrait' ? 'bg-white text-[#0a4d8c] shadow-lg shadow-black/20' : 'bg-transparent border border-white/20 text-white'}`}
        >
          Requetes Retraits
        </button>
      </div>

      {/* List */}
      <div className="min-h-[200px]">
        {filteredPending.length === 0 ? (
          <div className="text-center opacity-40 py-10">
            <div className="text-6xl mb-4"><i className="fas fa-inbox"></i></div>
            <p className="text-sm">Aucune requete en attente</p>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {filteredPending.map((req) => (
              <div 
                key={req.id} 
                onClick={() => setSelectedRequest(req)} 
                className="bg-white/10 p-4 rounded-3xl flex items-center justify-between cursor-pointer border border-white/5 active:scale-95 transition-all animate-in slide-in-from-bottom-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${req.type === 'Dépôt' ? 'bg-sky-400/20 text-sky-400' : 'bg-orange-400/20 text-orange-400'}`}>
                    <i className={`fas ${req.type === 'Dépôt' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">{req.userName}</h5>
                    <p className="text-[10px] opacity-60 uppercase">{req.amount} FCFA • {req.bookmaker}</p>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-white/40"></i>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderArchives = () => (
    <div className="animate-in fade-in duration-300">
      <h3 className="text-lg font-bold mb-4 px-2">Historique complet</h3>
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"><i className="fas fa-search"></i></span>
        <input 
          type="text" 
          placeholder="Rechercher un client ou un ID..." 
          className="w-full bg-white/10 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {archivesList.length === 0 ? (
          <div className="text-center opacity-40 py-10">Aucune archive trouvée</div>
        ) : (
          archivesList.map((req) => (
            <div 
              key={req.id} 
              onClick={() => setSelectedRequest(req)}
              className="bg-white/5 p-4 rounded-3xl flex items-center justify-between border border-white/5"
            >
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${req.status === 'Validé' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                    <i className={`fas ${req.status === 'Validé' ? 'fa-check' : 'fa-times'}`}></i>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">{req.userName}</h5>
                    <p className="text-[9px] opacity-60 uppercase">{req.type} • {req.amount} FCFA</p>
                  </div>
               </div>
               <div className={`text-[9px] font-bold uppercase ${getStatusColor(req.status)}`}>{req.status}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="animate-in fade-in duration-300 px-2">
      <h3 className="text-lg font-bold mb-6">Gestion Système</h3>
      
      <div className="bg-white/10 rounded-3xl p-6 border border-white/10 mb-6 shadow-xl">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-6">Performances Globales</h4>
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white"><i className="fas fa-coins"></i></div>
               <span className="text-sm font-bold">Volume Total Validé</span>
             </div>
             <span className="text-lg font-black">{stats.totalVolume.toLocaleString()} FCFA</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white"><i className="fas fa-file-invoice"></i></div>
               <span className="text-sm font-bold">Total Transactions</span>
             </div>
             <span className="text-lg font-black">{stats.totalRequests}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white/10 p-6 rounded-3xl flex flex-col items-center gap-3 border border-white/10 active:scale-95 transition-all">
          <i className="fas fa-users text-2xl text-blue-300"></i>
          <span className="text-[10px] font-bold uppercase">Utilisateurs</span>
        </button>
        <button className="bg-white/10 p-6 rounded-3xl flex flex-col items-center gap-3 border border-white/10 active:scale-95 transition-all">
          <i className="fas fa-cog text-2xl text-gray-300"></i>
          <span className="text-[10px] font-bold uppercase">Réglages</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0a4d8c] flex flex-col h-screen overflow-hidden text-white">
      {/* Header */}
      <div className="p-5 flex justify-between items-center bg-[#0a4d8c] z-20">
        <button className="text-2xl"><i className="fas fa-bars"></i></button>
        <h2 className="text-xl font-bold tracking-tight uppercase">
          {activeSubView === 'dashboard' ? 'Tableau de Bord' : activeSubView === 'archives' ? 'Archives' : 'Administration'}
        </h2>
        <button onClick={onLogout} className="text-2xl text-red-400">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-2">
        {activeSubView === 'dashboard' && renderDashboard()}
        {activeSubView === 'archives' && renderArchives()}
        {activeSubView === 'admin' && renderAdmin()}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white text-gray-900 w-full max-w-sm rounded-[3rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className={`p-6 flex justify-between items-center text-white ${selectedRequest.type === 'Dépôt' ? 'bg-blue-600' : 'bg-orange-600'}`}>
               <div>
                 <h4 className="font-black text-lg">{selectedRequest.userName}</h4>
                 <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{selectedRequest.type} • {selectedRequest.method}</p>
               </div>
               <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center active:scale-75 transition-transform"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-gray-400 text-[9px] font-black uppercase mb-1 tracking-tighter">ID Bookmaker</p>
                    <p className="font-black text-blue-900 text-sm">{selectedRequest.bookmakerId}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-gray-400 text-[9px] font-black uppercase mb-1 tracking-tighter">Montant</p>
                    <p className="font-black text-blue-900 text-sm">{selectedRequest.amount} FCFA</p>
                  </div>
               </div>

               <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex justify-between items-center">
                  <span className="text-gray-400 text-[9px] font-black uppercase tracking-tighter">Téléphone</span>
                  <span className="font-bold text-blue-900 text-xs">{selectedRequest.userPhone}</span>
               </div>

               {selectedRequest.type === 'Retrait' && selectedRequest.withdrawCode && (
                 <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <p className="text-orange-400 text-[9px] font-black uppercase mb-1 tracking-widest">Code de Retrait</p>
                    <p className="font-black text-orange-600 text-2xl text-center tracking-[0.2em]">{selectedRequest.withdrawCode}</p>
                 </div>
               )}
               
               {selectedRequest.proofImage && (
                 <div>
                    <p className="text-gray-400 text-[9px] font-black uppercase mb-2 px-1 tracking-widest">Preuve de transaction</p>
                    <div className="relative group">
                      <img src={selectedRequest.proofImage} className="w-full rounded-2xl shadow-inner border border-gray-100" alt="Preuve" />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                    </div>
                 </div>
               )}

               {selectedRequest.status !== 'En attente' && (
                 <div className={`p-4 rounded-2xl text-center font-black uppercase text-xs tracking-widest border ${selectedRequest.status === 'Validé' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    Demande {selectedRequest.status}
                 </div>
               )}
            </div>
            
            {selectedRequest.status === 'En attente' && (
              <div className="p-6 pt-0 flex gap-4">
                <button disabled={processing} onClick={() => handleUpdate(selectedRequest.id, 'Rejeté')} className="flex-1 bg-red-100 text-red-600 font-black py-4 rounded-2xl active:scale-95 transition-all">REJETER</button>
                <button disabled={processing} onClick={() => handleUpdate(selectedRequest.id, 'Validé')} className="flex-1 bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-100 active:scale-95 transition-all">VALIDER</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="bg-[#083d71] border-t border-white/5 flex justify-around py-4 pb-8 fixed bottom-0 left-0 right-0 z-[50]">
        <button 
          onClick={() => setActiveSubView('dashboard')} 
          className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'dashboard' ? 'text-white scale-110' : 'text-white/40'}`}
        >
          <div className={`p-2 rounded-xl ${activeSubView === 'dashboard' ? 'bg-white/10' : ''}`}><i className="fas fa-th-large text-xl"></i></div>
          <span className="text-[10px] font-bold">Tableau de Bord</span>
        </button>
        <button 
          onClick={() => setActiveSubView('archives')} 
          className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'archives' ? 'text-white scale-110' : 'text-white/40'}`}
        >
          <div className={`p-2 rounded-xl ${activeSubView === 'archives' ? 'bg-white/10' : ''}`}><i className="fas fa-archive text-xl"></i></div>
          <span className="text-[10px] font-bold">Archives</span>
        </button>
        <button 
          onClick={() => setActiveSubView('admin')} 
          className={`flex flex-col items-center gap-1 transition-all ${activeSubView === 'admin' ? 'text-white scale-110' : 'text-white/40'}`}
        >
          <div className={`p-2 rounded-xl ${activeSubView === 'admin' ? 'bg-white/10' : ''}`}><i className="fas fa-shield-alt text-xl"></i></div>
          <span className="text-[10px] font-bold">Admin</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminDashboard;
