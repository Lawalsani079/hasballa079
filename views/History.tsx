
import React from 'react';
import { User, TransactionRequest } from '../types';

interface HistoryProps {
  user: User;
  requests: TransactionRequest[];
}

const History: React.FC<HistoryProps> = ({ user, requests }) => {
  const userRequests = requests.filter(r => r.userId === user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-green-100 text-green-700';
      case 'Rejeté': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="flex-1 bg-blue-900 overflow-y-auto pb-24">
       <div className="p-6">
         <h2 className="text-2xl font-bold text-white mb-6">Historique</h2>
         
         {userRequests.length === 0 ? (
           <div className="bg-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-800/50 rounded-full flex items-center justify-center text-blue-300 text-3xl mb-4">
                <i className="fas fa-box-open"></i>
              </div>
              <h3 className="text-white font-bold text-lg">Aucune demande</h3>
              <p className="text-blue-300/70 text-sm mt-2">Vos transactions s'afficheront ici une fois envoyées.</p>
           </div>
         ) : (
           <div className="space-y-4">
             {userRequests.map((req) => (
               <div key={req.id} className="bg-white rounded-3xl p-5 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${req.type === 'Dépôt' ? 'bg-sky-100 text-sky-600' : 'bg-orange-100 text-orange-600'}`}>
                      <i className={`fas ${req.type === 'Dépôt' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900">{req.type} {req.bookmaker}</h4>
                      <p className="text-gray-400 text-xs">{new Date(req.createdAt).toLocaleDateString()} • {req.amount} FCFA</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getStatusColor(req.status)}`}>
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
