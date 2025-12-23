
import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db, isPlaceholderConfig } from './firebaseConfig';
import SplashScreen from './views/SplashScreen';
import Login from './views/Login';
import Register from './views/Register';
import UserHome from './views/UserHome';
import DepositForm from './views/DepositForm';
import WithdrawForm from './views/WithdrawForm';
import History from './views/History';
import Profile from './views/Profile';
import AdminDashboard from './views/AdminDashboard';
import { User, TransactionRequest } from './types';

type View = 'splash' | 'login' | 'register' | 'home' | 'deposit' | 'withdraw' | 'history' | 'profile' | 'admin';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const isInitialSync = useRef(true);
  const currentUserRef = useRef<User | null>(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const triggerNotification = (userName: string, type: string, amount: string) => {
    if (typeof Notification !== 'undefined' && Notification.permission === "granted") {
      new Notification(`Nouvelle demande ${type}`, {
        body: `${userName} vient d'envoyer une demande de ${amount} FCFA.`,
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      });
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentView('login');
    }, 2500);

    let unsubscribe = () => {};
    
    try {
      const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const reqs: TransactionRequest[] = [];
        const changes = querySnapshot.docChanges();
        
        if (!isInitialSync.current && currentUserRef.current?.role === 'admin') {
          changes.forEach(change => {
            if (change.type === 'added') {
              const data = change.doc.data();
              // On s'assure de passer des chaînes de caractères uniquement
              triggerNotification(String(data.userName), String(data.type), String(data.amount));
            }
          });
        }

        querySnapshot.forEach((doc) => {
          const rawData = doc.data();
          // Nettoyage strict pour éviter les structures circulaires ou complexes de Firebase
          const cleanData: any = { id: doc.id };
          
          for (const key in rawData) {
            const value = rawData[key];
            if (value && typeof value === 'object') {
              if (typeof value.toMillis === 'function') {
                cleanData[key] = value.toMillis();
              } else {
                // Pour les autres objets (comme les refs), on stocke leur représentation textuelle ou on les ignore
                // Sauf si c'est spécifiquement géré (comme les images base64 qui sont des strings)
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                  cleanData[key] = value;
                }
              }
            } else {
              cleanData[key] = value;
            }
          }
          reqs.push(cleanData as TransactionRequest);
        });

        setRequests(reqs);
        setDbError(null);
        isInitialSync.current = false;
      }, (error) => {
        const msg = error.message || "Erreur Firestore";
        if (error.code === 'permission-denied') {
          setDbError("Accès refusé. Vérifiez vos règles Firestore.");
        } else {
          setDbError("Erreur : " + msg);
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
    // On crée une copie propre de l'objet utilisateur pour éviter les structures circulaires
    setCurrentUser({
      id: String(user.id),
      name: String(user.name),
      phone: String(user.phone),
      role: user.role
    });
    setCurrentView(user.role === 'admin' ? 'admin' : 'home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    isInitialSync.current = true;
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col">
      {currentView === 'splash' && <SplashScreen />}
      
      {isPlaceholderConfig && currentView !== 'splash' && (
        <div className="bg-red-600 text-white text-[10px] py-1 px-4 text-center font-bold z-50">
          PROJECT ID INCORRECT DANS LA CONFIG
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
            <UserHome 
              user={currentUser} 
              onDeposit={() => setCurrentView('deposit')} 
              onWithdraw={() => setCurrentView('withdraw')}
              onLogout={handleLogout} 
            />
          )}
          {currentView === 'deposit' && (
            <DepositForm user={currentUser} onBack={() => setCurrentView('home')} onComplete={() => setCurrentView('history')} />
          )}
          {currentView === 'withdraw' && (
            <WithdrawForm user={currentUser} onBack={() => setCurrentView('home')} onComplete={() => setCurrentView('history')} />
          )}
          {currentView === 'history' && (
            <History user={currentUser} requests={requests} />
          )}
          {currentView === 'profile' && (
            <Profile user={currentUser} onLogout={handleLogout} />
          )}

          {['home', 'history', 'profile', 'deposit', 'withdraw'].includes(currentView) && (
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
