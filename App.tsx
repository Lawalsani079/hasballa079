
import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from './firebaseConfig';
import SplashScreen from './views/SplashScreen';
import Login from './views/Login';
import Register from './views/Register';
import UserHome from './views/UserHome';
import DepositForm from './views/DepositForm';
import WithdrawForm from './views/WithdrawForm';
import CryptoForm from './views/CryptoForm';
import History from './views/History';
import Profile from './views/Profile';
import AdminDashboard from './views/AdminDashboard';
import Chat from './views/Chat';
import { User, TransactionRequest, ChatMessage } from './types';

type View = 'splash' | 'login' | 'register' | 'home' | 'deposit' | 'withdraw' | 'crypto' | 'history' | 'profile' | 'admin' | 'chat';

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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);
  
  const isInitialSync = useRef(true);
  const currentUserRef = useRef<User | null>(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
    
    if (currentUser && currentUser.role === 'user') {
      const updateActivity = async () => {
        try {
          await updateDoc(doc(db, "users", currentUser.id), {
            lastActive: Date.now()
          });
        } catch (e) { console.error("Heartbeat failed", e); }
      };
      
      updateActivity();
      const interval = setInterval(updateActivity, 120000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const triggerInAppNotification = (userName: any, type: any, text?: any) => {
    const safeUserName = String(userName || 'Client');
    const safeType = String(type || 'Action');
    const safeText = text ? String(text) : undefined;
    
    const id = Math.random().toString(36).substr(2, 9);
    setActiveNotification({ id, userName: safeUserName, type: safeType, text: safeText });
    
    if (currentUserRef.current?.role === 'admin') playNotificationSound();
    setTimeout(() => { setActiveNotification(prev => prev?.id === id ? null : prev); }, 5000);
  };

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (e) {}
  };

  useEffect(() => {
    let splashTimer: number | undefined;
    if (currentView === 'splash') {
      splashTimer = window.setTimeout(() => setCurrentView('login'), 2500);
    }

    // Unsubscribe references
    let unsubReq: (() => void) | undefined;
    let unsubMsg: (() => void) | undefined;
    let unsubUsr: (() => void) | undefined;

    const setupListeners = () => {
      unsubReq = onSnapshot(query(collection(db, "requests"), orderBy("createdAt", "desc")), (snap) => {
        const reqs: TransactionRequest[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          // Explicit mapping to ensure POJO (Plain Old JavaScript Objects) in state
          reqs.push({
            id: doc.id,
            userId: String(d.userId),
            userName: String(d.userName),
            userPhone: String(d.userPhone),
            type: d.type,
            amount: String(d.amount),
            method: String(d.method || ''),
            bookmaker: d.bookmaker ? String(d.bookmaker) : undefined,
            bookmakerId: d.bookmakerId ? String(d.bookmakerId) : undefined,
            withdrawCode: d.withdrawCode ? String(d.withdrawCode) : undefined,
            cryptoType: d.cryptoType ? String(d.cryptoType) : undefined,
            walletAddress: d.walletAddress ? String(d.walletAddress) : undefined,
            proofImage: d.proofImage ? String(d.proofImage) : undefined,
            status: d.status,
            createdAt: Number(d.createdAt)
          });
        });

        if (!isInitialSync.current && currentUserRef.current?.role === 'admin') {
          snap.docChanges().forEach(change => {
            if (change.type === 'added') {
              const d = change.doc.data();
              triggerInAppNotification(d.userName, d.type);
            }
          });
        }
        setRequests(reqs);
      }, (err) => console.error("Firestore Request Error:", err));

      unsubMsg = onSnapshot(query(collection(db, "messages"), orderBy("createdAt", "asc")), (snap) => {
        const msgs: ChatMessage[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          msgs.push({
            id: doc.id,
            userId: String(d.userId),
            userName: String(d.userName),
            text: String(d.text),
            isAdmin: Boolean(d.isAdmin),
            createdAt: Number(d.createdAt)
          });
        });
        setMessages(msgs);
      }, (err) => console.error("Firestore Message Error:", err));

      unsubUsr = onSnapshot(collection(db, "users"), (snap) => {
        const usersList: User[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          usersList.push({
            id: doc.id,
            name: String(d.name),
            phone: String(d.phone),
            role: d.role,
            referralCode: String(d.referralCode),
            referralBalance: Number(d.referralBalance || 0),
            lastActive: Number(d.lastActive || Date.now())
          });
        });
        setAllUsers(usersList);
        
        if (currentUserRef.current) {
          const updatedMe = usersList.find(u => u.id === currentUserRef.current?.id);
          if (updatedMe) setCurrentUser(updatedMe);
        }
      }, (err) => console.error("Firestore User Error:", err));

      isInitialSync.current = false;
    };

    setupListeners();

    return () => {
      if (splashTimer) clearTimeout(splashTimer);
      if (unsubReq) unsubReq();
      if (unsubMsg) unsubMsg();
      if (unsubUsr) unsubUsr();
    };
  }, [currentView]);

  return (
    <div className="w-full h-full max-w-md mx-auto bg-[#081a2b] shadow-2xl relative overflow-hidden flex flex-col font-['Poppins']">
      {currentView === 'splash' && <SplashScreen />}
      
      {activeNotification && (
        <div className="fixed top-4 left-4 right-4 z-[300] animate-[slideDown_0.4s_ease-out]">
          <div className="bg-[#04111d]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeNotification.type === 'Message' ? 'bg-yellow-400' : 'bg-blue-500'}`}>
              <i className={`fas ${activeNotification.type === 'Message' ? 'fa-comment text-[#081a2b]' : 'fa-bell text-white'} text-sm`}></i>
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-white font-black text-xs truncate">{activeNotification.userName}</h4>
              <p className="text-blue-100/60 text-[9px] font-bold uppercase truncate">{activeNotification.text || `Action: ${activeNotification.type}`}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'login' && <Login onLogin={(u) => { setCurrentUser(u); setCurrentView(u.role === 'admin' ? 'admin' : 'home'); }} onNavigateRegister={() => setCurrentView('register')} />}
        {currentView === 'register' && <Register onRegister={(u) => { setCurrentUser(u); setCurrentView('home'); }} onNavigateLogin={() => setCurrentView('login')} />}
        
        {currentUser?.role === 'user' && (
          <div className="flex-1 flex flex-col bg-[#081a2b] overflow-hidden">
            <div className="flex-1 overflow-hidden relative flex flex-col">
              {currentView === 'home' && <UserHome user={currentUser} onDeposit={() => setCurrentView('deposit')} onWithdraw={() => setCurrentView('withdraw')} onBuyCrypto={() => setCurrentView('crypto')} onLogout={() => { setCurrentUser(null); setCurrentView('login'); }} onChat={() => setCurrentView('chat')} />}
              {currentView === 'deposit' && <DepositForm user={currentUser} onBack={() => setCurrentView('home')} onComplete={() => setCurrentView('history')} />}
              {currentView === 'withdraw' && <WithdrawForm user={currentUser} onBack={() => setCurrentView('home')} onComplete={() => setCurrentView('history')} />}
              {currentView === 'crypto' && <CryptoForm user={currentUser} onBack={() => setCurrentView('home')} onComplete={() => setCurrentView('history')} />}
              {currentView === 'history' && <History user={currentUser} requests={requests} />}
              {currentView === 'profile' && <Profile user={currentUser} onLogout={() => { setCurrentUser(null); setCurrentView('login'); }} onChat={() => setCurrentView('chat')} />}
              {currentView === 'chat' && <Chat user={currentUser} messages={messages} onBack={() => setCurrentView('home')} />}
            </div>

            {['home', 'history', 'profile'].includes(currentView) && (
              <div className="shrink-0 bg-transparent px-4 pb-6 pt-2 z-50">
                <nav className="w-full bg-white/10 backdrop-blur-xl border border-white/10 flex justify-around py-2 px-2 rounded-[2rem] shadow-lg">
                  <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center flex-1 py-1 ${currentView === 'home' ? 'text-yellow-400' : 'text-white/40'}`}>
                    <i className="fas fa-home text-lg mb-0.5"></i>
                    <span className="text-[9px] font-bold uppercase">Accueil</span>
                  </button>
                  <button onClick={() => setCurrentView('history')} className={`flex flex-col items-center flex-1 py-1 ${currentView === 'history' ? 'text-yellow-400' : 'text-white/40'}`}>
                    <i className="fas fa-history text-lg mb-0.5"></i>
                    <span className="text-[9px] font-bold uppercase">Historique</span>
                  </button>
                  <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center flex-1 py-1 ${currentView === 'profile' ? 'text-yellow-400' : 'text-white/40'}`}>
                    <i className="fas fa-user-circle text-lg mb-0.5"></i>
                    <span className="text-[9px] font-bold uppercase">Profil</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}

        {currentUser?.role === 'admin' && (
          <AdminDashboard requests={requests} messages={messages} allUsers={allUsers} onLogout={() => { setCurrentUser(null); setCurrentView('login'); }} />
        )}
      </div>
      <style>{`@keyframes slideDown { from { transform: translateY(-120%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
};

export default App;
