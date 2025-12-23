
import React, { useState, useMemo } from 'react';
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

  const filterSummary = useMemo(() => {
    let summaryParts: string[] = [];

    // Type and Status
    if (filterType === 'All' && filterStatus === 'All') {
      summaryParts.push('Toutes les transactions');
    } else {
      const typeStr = filterType === 'All' ? 'Transactions' : filterType + 's';
      const statusStr = filterStatus === 'All' ? '' : filterStatus.toLowerCase() + 's';
      summaryParts.push(`${typeStr} ${statusStr}`.trim());
    }

    // Dates
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const end = new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      summaryParts.push(`du ${start} au ${end}`);
    } else if (startDate) {
      const start = new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      summaryParts.push(`depuis le ${start}`);
    } else if (endDate) {
      const end = new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      summaryParts.push(`jusqu'au ${end}`);
    }

    return summaryParts.join(' ');
  }, [filterType, filterStatus, startDate, endDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-green-100 text-green-700';
      case 'Rejeté': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const clearFilters = () => {
    setFilterType('All');
    setFilterStatus('All');
    setStartDate('');
    setEndDate('');
  };

  const activeFiltersCount = [
    filterType !== 'All',
    filterStatus !== 'All',
    startDate !== '',
    endDate !== ''
  ].filter(Boolean).length;

  return (
    <div className="flex-1 bg-blue-900 overflow-y-auto pb-24">
       <div className="p-6">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Historique</h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-3 rounded-2xl transition-all ${showFilters ? 'bg-yellow-400 text-blue-900' : 'bg-white/10 text-white'}`}
            >
              <i className="fas fa-filter"></i>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-blue-900">
                  {activeFiltersCount}
                </span>
              )}
            </button>
         </div>

         {/* Filter Panel */}
         {showFilters && (
           <div className="bg-white rounded-[2rem] p-6 mb-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-blue-900 text-sm">Filtres</h3>
               <button onClick={clearFilters} className="text-blue-600 text-xs font-bold underline">Réinitialiser</button>
             </div>

             <div className="space-y-4">
               {/* Type Filter */}
               <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Type de transaction</p>
                 <div className="flex gap-2">
                   {['All', 'Dépôt', 'Retrait'].map((t) => (
                     <button
                       key={t}
                       onClick={() => setFilterType(t as any)}
                       className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${filterType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                     >
                       {t === 'All' ? 'Tous' : t}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Status Filter */}
               <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Statut</p>
                 <div className="flex flex-wrap gap-2">
                   {['All', 'En attente', 'Validé', 'Rejeté'].map((s) => (
                     <button
                       key={s}
                       onClick={() => setFilterStatus(s as any)}
                       className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                     >
                       {s === 'All' ? 'Tous' : s}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Date Range */}
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Du</p>
                   <input 
                     type="date" 
                     className="w-full bg-gray-50 p-3 rounded-xl text-xs border-none outline-none focus:ring-2 focus:ring-blue-500" 
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
                   />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Au</p>
                   <input 
                     type="date" 
                     className="w-full bg-gray-50 p-3 rounded-xl text-xs border-none outline-none focus:ring-2 focus:ring-blue-500" 
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
                   />
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Filter Summary Text */}
         <div className="px-1 mb-4">
           <p className="text-blue-300/80 text-[11px] font-medium flex items-center gap-2">
             <i className="fas fa-info-circle opacity-50"></i>
             <span className="first-letter:uppercase">{filterSummary}</span>
           </p>
         </div>
         
         {filteredRequests.length === 0 ? (
           <div className="bg-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-800/50 rounded-full flex items-center justify-center text-blue-300 text-3xl mb-4">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="text-white font-bold text-lg">Aucun résultat</h3>
              <p className="text-blue-300/70 text-sm mt-2">Essayez de modifier vos filtres pour voir plus de transactions.</p>
           </div>
         ) : (
           <div className="space-y-4">
             {filteredRequests.map((req) => (
               <div key={req.id} className="bg-white rounded-3xl p-5 shadow-xl flex items-center justify-between border-l-4 border-transparent hover:border-blue-400 transition-all active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${req.type === 'Dépôt' ? 'bg-sky-100 text-sky-600' : 'bg-orange-100 text-orange-600'}`}>
                      <i className={`fas ${req.type === 'Dépôt' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 text-sm">{req.type} {req.bookmaker}</h4>
                      <p className="text-gray-400 text-[10px] font-medium">
                        {new Date(req.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} • {req.amount} FCFA
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${getStatusColor(req.status)}`}>
                    {req.status}
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
