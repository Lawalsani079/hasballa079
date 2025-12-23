
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
              triggerNotification(String(data.userName), String(data.type), String(data.amount));
            }
          });
        }

        querySnapshot.forEach((doc) => {
          const rawData = doc.data();
          const cleanData: any = { id: doc.id };
          
          // Sanitization logic to avoid circular structures and complex objects in state
          Object.keys(rawData).forEach(key => {
            const val = rawData[key];
            if (val && typeof val === 'object') {
              if (typeof val.toMillis === 'function') {
                cleanData[key] = val.toMillis();
              } else if (val.seconds !== undefined) { // Fallback for simple timestamp objects
                cleanData[key] = val.seconds * 1000;
              } else if (Array.isArray(val)) {
                cleanData[key] = [...val]; // Shallow copy array
              } else {
                // If it's a complex object we don't recognize, we stringify or skip to avoid circular issues
                // For TransactionRequest fields, we expect strings/numbers mostly
                if (['amount', 'bookmakerId', 'withdrawCode', 'userName', 'userPhone', 'method', 'bookmaker', 'status', 'type', 'proofImage'].includes(key)) {
                  cleanData[key] = String(val);
                }
              }
            } else {
              cleanData[key] = val;
            }
          });
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
    // Ensure the user object is a plain object without circular refs
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
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col font-['Poppins']">
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
        <div className="flex-1 flex flex-col bg-[#F4F7FE]">
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
            <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-6 px-6 pointer-events-none z-50">
              <nav className="w-full max-w-sm bg-white/80 backdrop-blur-xl border border-white/20 flex justify-around py-3 px-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] pointer-events-auto">
                <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center flex-1 transition-all duration-300 ${currentView === 'home' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`p-2 rounded-2xl transition-all ${currentView === 'home' ? 'bg-blue-50' : ''}`}>
                    <i className={`fas fa-home text-xl mb-1 ${currentView === 'home' ? 'scale-110' : ''}`}></i>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${currentView === 'home' ? 'opacity-100' : 'opacity-0 h-0'}`}>Accueil</span>
                </button>
                <button onClick={() => setCurrentView('history')} className={`flex flex-col items-center flex-1 transition-all duration-300 ${currentView === 'history' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`p-2 rounded-2xl transition-all ${currentView === 'history' ? 'bg-blue-50' : ''}`}>
                    <i className={`fas fa-history text-xl mb-1 ${currentView === 'history' ? 'scale-110' : ''}`}></i>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${currentView === 'history' ? 'opacity-100' : 'opacity-0 h-0'}`}>Historique</span>
                </button>
                <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center flex-1 transition-all duration-300 ${currentView === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`p-2 rounded-2xl transition-all ${currentView === 'profile' ? 'bg-blue-50' : ''}`}>
                    <i className={`fas fa-user-circle text-xl mb-1 ${currentView === 'profile' ? 'scale-110' : ''}`}></i>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${currentView === 'profile' ? 'opacity-100' : 'opacity-0 h-0'}`}>Profil</span>
                </button>
              </nav>
            </div>
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
