
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
import Chat from './views/Chat';
import { User, TransactionRequest, ChatMessage } from './types';

type View = 'splash' | 'login' | 'register' | 'home' | 'deposit' | 'withdraw' | 'history' | 'profile' | 'admin' | 'chat';

interface AppNotification {
  id: string;
  userName: string;
  type: string;
  text?: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);
  
  const isInitialSync = useRef(true);
  const currentUserRef = useRef<User | null>(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const triggerInAppNotification = (userName: string, type: string, text?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setActiveNotification({ id, userName, type, text });
    setTimeout(() => {
      setActiveNotification(prev => prev?.id === id ? null : prev);
    }, 5000);
  };

  useEffect(() => {
    // FIX: Le timer ne doit se lancer QUE si on est sur le splash screen au démarrage
    let splashTimer: number | undefined;
    if (currentView === 'splash') {
      splashTimer = window.setTimeout(() => {
        setCurrentView('login');
      }, 2500);
    }

    let unsubRequests = () => {};
    let unsubMessages = () => {};
    
    try {
      // Listener Requests
      const qReq = query(collection(db, "requests"), orderBy("createdAt", "desc"));
      unsubRequests = onSnapshot(qReq, (snap) => {
        const reqs: any[] = [];
        if (!isInitialSync.current && currentUserRef.current?.role === 'admin') {
          snap.docChanges().forEach(change => {
            if (change.type === 'added') triggerInAppNotification(change.doc.data().userName, change.doc.data().type);
          });
        }
        snap.forEach(doc => reqs.push({ id: doc.id, ...doc.data() }));
        setRequests(reqs);
      });

      // Listener Messages
      const qMsg = query(collection(db, "messages"), orderBy("createdAt", "asc"));
      unsubMessages = onSnapshot(qMsg, (snap) => {
        const msgs: any[] = [];
        if (!isInitialSync.current) {
          snap.docChanges().forEach(change => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const isForMe = currentUserRef.current?.role === 'admin' ? !data.isAdmin : (data.isAdmin && data.userId === currentUserRef.current?.id);
              if (isForMe && currentView !== 'chat') {
                triggerInAppNotification(data.userName, 'Message', data.text);
              }
            }
          });
        }
        snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
        isInitialSync.current = false;
      });
    } catch (err) {}

    return () => {
      if (splashTimer) clearTimeout(splashTimer);
      unsubRequests();
      unsubMessages();
    };
  }, [currentView]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    isInitialSync.current = true;
  };

  return (
    <div className="w-full h-full max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden flex flex-col font-['Poppins']">
      {currentView === 'splash' && <SplashScreen />}
      
      {activeNotification && (
        <div className="fixed top-4 left-4 right-4 z-[300] animate-[slideDown_0.4s_ease-out]">
          <div className="bg-blue-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeNotification.type === 'Message' ? 'bg-yellow-400' : 'bg-blue-500'}`}>
              <i className={`fas ${activeNotification.type === 'Message' ? 'fa-comment text-blue-900' : 'fa-bell text-white'} text-sm`}></i>
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-white font-black text-xs truncate">{activeNotification.userName}</h4>
              <p className="text-blue-100/60 text-[9px] font-bold uppercase truncate">
                {activeNotification.text || `Nouvelle demande: ${activeNotification.type}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'login' && <Login onLogin={(u) => { setCurrentUser(u); setCurrentView(u.role === 'admin' ? 'admin' : 'home'); }} onNavigateRegister={() => setCurrentView('register')} />}
        {currentView === 'register' && <Register onRegister={(u) => { setCurrentUser(u); setCurrentView('home'); }} onNavigateLogin={() => setCurrentView('login')} />}
        
        {currentUser?.role === 'user' && (
          <div className="flex-1 flex flex-col bg-[#F4F7FE] overflow-hidden">
            <div className="flex-1 overflow-hidden relative flex flex-col">
              {currentView === 'home' && <UserHome user={currentUser} onDeposit={() => setCurrentView('deposit')} onWithdraw={() => setCurrentView('withdraw')} onLogout={handleLogout} onChat={() => setCurrentView('chat')} />}
              {currentView === 'deposit' && <DepositForm user={currentUser} onBack={() => setCurrentView('home')} onComplete={() => setCurrentView('history')} />}
              {currentView === 'withdraw' && <WithdrawForm user={currentUser} onBack={() => setCurrentView('home')} onComplete={() => setCurrentView('history')} />}
              {currentView === 'history' && <History user={currentUser} requests={requests} />}
              {currentView === 'profile' && <Profile user={currentUser} onLogout={handleLogout} onChat={() => setCurrentView('chat')} />}
              {currentView === 'chat' && <Chat user={currentUser} messages={messages} onBack={() => setCurrentView('home')} />}
            </div>

            {['home', 'history', 'profile'].includes(currentView) && (
              <div className="shrink-0 bg-transparent px-4 pb-6 pt-2 z-50">
                <nav className="w-full bg-white/95 backdrop-blur-xl border border-white/20 flex justify-around py-2 px-2 rounded-[2rem] shadow-lg">
                  <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center flex-1 py-1 ${currentView === 'home' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <i className="fas fa-home text-lg mb-0.5"></i>
                    <span className="text-[9px] font-bold uppercase">Accueil</span>
                  </button>
                  <button onClick={() => setCurrentView('history')} className={`flex flex-col items-center flex-1 py-1 ${currentView === 'history' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <i className="fas fa-history text-lg mb-0.5"></i>
                    <span className="text-[9px] font-bold uppercase">Historique</span>
                  </button>
                  <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center flex-1 py-1 ${currentView === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <i className="fas fa-user-circle text-lg mb-0.5"></i>
                    <span className="text-[9px] font-bold uppercase">Profil</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}

        {currentUser?.role === 'admin' && (
          <AdminDashboard requests={requests} messages={messages} onLogout={handleLogout} />
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-120%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
