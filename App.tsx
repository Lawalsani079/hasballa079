
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
import AIChat from './views/AIChat';
import NotificationsView from './views/Notifications';
import NotificationToast from './components/NotificationToast';
import { User, BannerItem, AppNotification, TransactionRequest } from './types';
import { MOCK_BANNERS } from './constants';
import { Home, ReceiptText, Fingerprint, MessageSquare } from 'lucide-react';

type View = 'splash' | 'login' | 'register' | 'home' | 'deposit' | 'withdraw' | 'crypto' | 'history' | 'profile' | 'admin' | 'chat' | 'notifications' | 'ai-chat';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [banners, setBanners] = useState<BannerItem[]>(MOCK_BANNERS);
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [quotaError, setQuotaError] = useState(false);
  
  const lastRequestStates = useRef<Record<string, string>>({});

  const addToast = useCallback((title: string, body: string, type: AppNotification['type'] = 'info') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(7),
      userId: currentUser?.id || 'system',
      title,
      body,
      type,
      timestamp: Date.now(),
      read: false
    };
    setToasts(prev => [...prev, newNotif]);
  }, [currentUser]);

  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const handleFirestoreError = useCallback((err: any) => {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('quota')) {
      console.error("🔥 Firestore Quota Exceeded");
      setQuotaError(true);
    }
  }, []);

  useEffect(() => {
    if (!currentUser || quotaError) return;
    
    // Limitation drastique des notifications lues pour économiser le quota Niger
    const qNotifs = query(
      collection(db, "notifications"), 
      where("userId", "==", currentUser.id), 
      limit(3) 
    );
    
    const unsub = onSnapshot(qNotifs, (snap) => {
      const fetchedNotifs = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as AppNotification));
      setNotifications(fetchedNotifs.sort((a, b) => b.timestamp - a.timestamp));
    }, handleFirestoreError);
    
    return () => unsub();
  }, [currentUser?.id, quotaError, handleFirestoreError]);

  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin' || quotaError) return;

    // Limitation stricte du suivi des requêtes pour préserver les lectures
    const q = query(
      collection(db, "requests"), 
      where("userId", "==", currentUser.id), 
      limit(2)
    );
    
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach(change => {
        const data = change.doc.data() as TransactionRequest;
        const reqId = change.doc.id;
        if (change.type === 'modified') {
          const oldStatus = lastRequestStates.current[reqId];
          if (oldStatus && oldStatus !== data.status) {
            addToast(`Statut ${data.type}`, `Votre demande est passée à: ${data.status}`, data.status === 'Validé' ? 'success' : 'error');
          }
        }
        lastRequestStates.current[reqId] = data.status;
      });
    }, handleFirestoreError);

    return () => unsub();
  }, [currentUser?.id, quotaError, addToast, handleFirestoreError]);

  useEffect(() => {
    if (currentView === 'splash') {
      const timer = setTimeout(() => setCurrentView('login'), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  return (
    <div className="w-full h-full max-w-md mx-auto bg-[#FACC15] shadow-2xl relative overflow-hidden flex flex-col font-['Poppins']">
      <div className="fixed top-0 left-0 right-0 z-[1000] pointer-events-none p-4 space-y-3">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <NotificationToast notification={toast} onClose={removeToast} />
          </div>
        ))}
      </div>

      <AnimatePresence>{currentView === 'splash' && <SplashScreen />}</AnimatePresence>
      
      {quotaError && (
        <div className="fixed inset-0 z-[2000] bg-[#0f172a] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-red-600 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl animate-pulse">
            <i className="fas fa-server text-white text-3xl"></i>
          </div>
          <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tighter leading-none">Service Saturé</h2>
          <p className="text-white/40 text-[10px] mb-12 uppercase font-black tracking-widest leading-relaxed">
            Le quota Niger a été atteint pour aujourd'hui. <br/>
            Veuillez réessayer demain matin à 09:00.
          </p>
          <button onClick={() => window.location.reload()} className="w-full bg-[#FACC15] text-slate-900 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-b-4 border-yellow-600">ACTUALISER</button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'login' && <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col"><Login onLogin={(u) => { setCurrentUser(u); setCurrentView(u.role === 'admin' ? 'admin' : 'home'); }} onNavigateRegister={() => setCurrentView('register')} /></motion.div>}
          {currentView === 'register' && <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col"><Register onRegister={(u) => { setCurrentUser(u); setCurrentView('home'); }} onNavigateLogin={() => setCurrentView('login')} /></motion.div>}
          
          {currentUser && (
            <div key="app-view" className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                  {currentView === 'home' && <UserHome user={currentUser} banners={banners} unreadCount={notifications.filter(n => !n.read).length} onDeposit={() => setCurrentView('deposit')} onWithdraw={() => setCurrentView('withdraw')} onBuyCrypto={() => setCurrentView('crypto')} onLogout={() => { setCurrentUser(null); setCurrentView('login'); }} onChat={() => setCurrentView('chat')} onNotify={() => setCurrentView('notifications')} onAIChat={() => setCurrentView('ai-chat')} />}
                  {currentView === 'deposit' && <DepositForm user={currentUser} onBack={() => setCurrentView('home')} onComplete={() => setCurrentView('history')} onQuotaError={() => setQuotaError(true)} />}
                  {currentView === 'withdraw' && <WithdrawForm user={currentUser} onBack={() => setCurrentView('home')} onComplete={() => setCurrentView('history')} onQuotaError={() => setQuotaError(true)} />}
                  {currentView === 'crypto' && <CryptoForm user={currentUser} onBack={() => setCurrentView('home')} onComplete={() => setCurrentView('history')} onQuotaError={() => setQuotaError(true)} />}
                  {currentView === 'history' && <History user={currentUser} onBack={() => setCurrentView('home')} />}
                  {currentView === 'profile' && <Profile user={currentUser} onLogout={() => { setCurrentUser(null); setCurrentView('login'); }} onChat={() => setCurrentView('chat')} onNotify={() => setCurrentView('notifications')} />}
                  {currentView === 'chat' && <Chat user={currentUser} onBack={() => setCurrentView('home')} />}
                  {currentView === 'ai-chat' && <AIChat user={currentUser} onBack={() => setCurrentView('home')} />}
                  {currentView === 'notifications' && <NotificationsView notifications={notifications} onBack={() => setCurrentView('home')} onMarkAsRead={() => {}} onMarkAllAsRead={() => {}} onDelete={() => {}} />}
                  {currentView === 'admin' && <AdminDashboard banners={banners} onLogout={() => { setCurrentUser(null); setCurrentView('login'); }} addToast={addToast} />}
                </AnimatePresence>
              
              {currentUser.role === 'user' && ['home', 'history', 'profile', 'chat'].includes(currentView) && (
                <nav className="shrink-0 px-8 pb-10 pt-2 bg-transparent">
                  <div className="bg-white/90 backdrop-blur-2xl border border-white/50 flex justify-around py-4 px-2 rounded-[2.5rem] shadow-2xl">
                    {[
                      { id: 'home', icon: Home, label: 'Accueil' },
                      { id: 'history', icon: ReceiptText, label: 'Activité' },
                      { id: 'chat', icon: MessageSquare, label: 'Chat' },
                      { id: 'profile', icon: Fingerprint, label: 'Compte' }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      return (
                        <button key={item.id} onClick={() => setCurrentView(item.id as any)} className={`relative flex flex-col items-center flex-1 transition-all py-1 ${isActive ? 'text-[#0047FF] scale-110' : 'text-slate-400'}`}>
                          <Icon size={20} className="mb-1.5" />
                          <span className="text-[7px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </nav>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
