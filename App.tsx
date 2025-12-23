
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db, isPlaceholderConfig } from './firebaseConfig';
import SplashScreen from './views/SplashScreen';
import Login from './views/Login';
import Register from './views/Register';
import UserHome from './views/UserHome';
import DepositForm from './views/DepositForm';
import History from './views/History';
import Profile from './views/Profile';
import AdminDashboard from './views/AdminDashboard';
import { User, TransactionRequest } from './types';

type View = 'splash' | 'login' | 'register' | 'home' | 'deposit' | 'history' | 'profile' | 'admin';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentView('login');
    }, 2500);

    let unsubscribe = () => {};
    
    try {
      const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const reqs: TransactionRequest[] = [];
        querySnapshot.forEach((doc) => {
          const rawData = doc.data();
          
          // Fix: Ensure we only keep serializable data to avoid circular structure errors
          // Firebase Timestamps have internal methods that can cause issues if stringified
          const cleanData = { ...rawData };
          if (cleanData.createdAt && typeof cleanData.createdAt.toMillis === 'function') {
            cleanData.createdAt = cleanData.createdAt.toMillis();
          }

          reqs.push({ 
            id: doc.id, 
            ...cleanData 
          } as TransactionRequest);
        });
        setRequests(reqs);
        setDbError(null);
      }, (error) => {
        // Fix: Avoid logging the full error object directly
        const errorMessage = error.message || "Unknown Firestore error";
        console.error("Firestore error:", errorMessage);
        
        if (error.code === 'permission-denied') {
          setDbError("Erreur : Permission refusée. Vérifiez vos règles Firestore (doivent être en mode lecture/écriture publique pour ce test).");
        } else {
          setDbError("Erreur de connexion : " + errorMessage);
        }
      });
    } catch (err: any) {
      console.error("Setup error:", err.message);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView(user.role === 'admin' ? 'admin' : 'home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col">
      {currentView === 'splash' && <SplashScreen />}
      
      {isPlaceholderConfig && currentView !== 'splash' && (
        <div className="bg-red-600 text-white text-[10px] py-1 px-4 text-center font-bold z-50">
          ATTENTION : ID PROJET INCORRECT DANS LA CONFIG
        </div>
      )}

      {dbError && (
        <div className="bg-orange-500 text-white text-[10px] py-2 px-4 text-center z-50 shadow-md">
          {dbError}
        </div>
      )}
      
      {currentView === 'login' && (
        <Login onLogin={handleLogin} onNavigateRegister={() => setCurrentView('register')} />
      )}
      
      {currentView === 'register' && (
        <Register onRegister={handleLogin} onNavigateLogin={() => setCurrentView('login')} />
      )}
      
      {currentUser?.role === 'user' && (
        <div className="flex-1 flex flex-col">
          {currentView === 'home' && (
            <UserHome user={currentUser} onDeposit={() => setCurrentView('deposit')} onLogout={handleLogout} />
          )}
          {currentView === 'deposit' && (
            <DepositForm user={currentUser} onBack={() => setCurrentView('home')} onComplete={() => setCurrentView('history')} />
          )}
          {currentView === 'history' && (
            <History user={currentUser} requests={requests} />
          )}
          {currentView === 'profile' && (
            <Profile user={currentUser} onLogout={handleLogout} />
          )}

          {['home', 'history', 'profile', 'deposit'].includes(currentView) && (
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around py-3 pb-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center transition-colors ${currentView === 'home' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                <i className="fas fa-home text-xl mb-1"></i>
                <span className="text-[10px]">Accueil</span>
              </button>
              <button onClick={() => setCurrentView('history')} className={`flex flex-col items-center transition-colors ${currentView === 'history' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                <i className="fas fa-history text-xl mb-1"></i>
                <span className="text-[10px]">Historique</span>
              </button>
              <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center transition-colors ${currentView === 'profile' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                <i className="fas fa-user text-xl mb-1"></i>
                <span className="text-[10px]">Profil</span>
              </button>
            </nav>
          )}
        </div>
      )}

      {currentUser?.role === 'admin' && currentView === 'admin' && (
        <AdminDashboard requests={requests} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
