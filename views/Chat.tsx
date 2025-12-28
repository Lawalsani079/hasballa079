
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, limit, onSnapshot, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User, ChatMessage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatProps {
  user: User;
  onBack: () => void;
  targetUserId?: string; 
  targetUserName?: string;
}

const Chat: React.FC<ChatProps> = ({ user, onBack, targetUserId, targetUserName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const isAdmin = user.role === 'admin';
  const currentChatId = isAdmin ? targetUserId : user.id;

  useEffect(() => {
    if (!currentChatId || isClearing) return;
    
    // Limitation stricte à 20 messages pour économiser le quota Niger
    const q = query(collection(db, "messages"), where("userId", "==", currentChatId), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      if (isClearing) return;
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs.sort((a, b) => a.createdAt - b.createdAt));
      
      setTimeout(() => { 
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; 
      }, 150);
    }, (err) => {
      console.warn("Chat Snapshot error (Quota?)");
    });
    
    return () => unsub();
  }, [currentChatId, isClearing]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSend = async (msgText: string, msgImage: string | null = null) => {
    if ((!msgText.trim() && !msgImage) || loading) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        userId: currentChatId,
        userName: isAdmin ? "Support Recharge+" : user.name,
        text: msgText.trim(),
        image: msgImage,
        isAdmin: isAdmin,
        createdAt: Date.now()
      });
      setText(''); setImage(null);
    } catch (err: any) { 
      console.error("Send Error Niger:", err.message); 
    } finally { setLoading(false); }
  };

  const handleClearChat = async () => {
    if (messages.length === 0) return;

    // Étape 1 : Demander confirmation visuelle (UI progressive)
    if (!confirmClear) {
      setConfirmClear(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setConfirmClear(false), 4000);
      return;
    }

    // Étape 2 : Suppression réelle
    setConfirmClear(false);
    setIsClearing(true);
    setLoading(true);

    try {
      const q = query(collection(db, "messages"), where("userId", "==", currentChatId));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        setMessages([]);
      }
    } catch (err: any) { 
      console.error("Clear Chat Error:", err.message);
      alert("Échec de la suppression Niger (Quota?)."); 
    } finally { 
      setLoading(false); 
      setIsClearing(false);
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert("Image trop lourde (max 2Mo)"); return; }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
      <div className="bg-white px-6 pt-12 pb-6 flex items-center justify-between border-b border-slate-50 shadow-sm relative z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 active:scale-90 transition-all border border-slate-100">
            <i className="fas fa-arrow-left text-sm"></i>
          </button>
          <div>
            <h2 className="text-slate-900 font-black text-xs uppercase tracking-tight">
              {isAdmin ? (targetUserName || "Client") : "Support Recharge+"}
            </h2>
            <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest mt-1">Chat Sécurisé Niger</p>
          </div>
        </div>
        
        {/* Bouton Corbeille Discussion avec Double Validation */}
        <button 
          onClick={handleClearChat} 
          disabled={loading || isClearing || messages.length === 0}
          className={`h-11 rounded-2xl flex items-center justify-center transition-all border shadow-sm px-3 gap-2 ${
            confirmClear 
              ? 'bg-red-600 text-white border-red-700 animate-pulse w-auto' 
              : 'bg-red-50 text-red-500 border-red-100 w-11'
          }`}
        >
           {isClearing ? (
             <i className="fas fa-spinner animate-spin text-xs"></i>
           ) : confirmClear ? (
             <>
               <i className="fas fa-exclamation-triangle text-xs"></i>
               <span className="text-[9px] font-black uppercase tracking-widest leading-none">Vider ?</span>
             </>
           ) : (
             <i className="fas fa-broom text-xs"></i>
           )}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar">
        <AnimatePresence>
          {messages.map((msg) => {
            const isMe = isAdmin ? msg.isAdmin : !msg.isAdmin;
            return (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-[1.8rem] shadow-sm relative ${isMe ? 'bg-[#0047FF] text-white rounded-tr-none shadow-blue-200' : 'bg-white text-slate-900 rounded-tl-none border border-slate-100 shadow-slate-200'}`}>
                    {msg.image && <img src={msg.image} className="max-h-64 w-full object-cover rounded-2xl mb-2 shadow-sm" alt="Chat" onClick={() => setPreviewImage(msg.image || null)} />}
                    {msg.text && <p className="text-[12px] font-medium leading-relaxed tracking-tight">{msg.text}</p>}
                    <p className={`text-[7px] font-black uppercase mt-2 ${isMe ? 'text-white/40' : 'text-slate-300'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {messages.length === 0 && !loading && !isClearing && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-center px-10">
             <div className="w-20 h-20 bg-slate-200 rounded-[2.5rem] flex items-center justify-center mb-6">
                <i className="fas fa-comments text-3xl"></i>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">Aucun message</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-50 pb-12 shrink-0">
        <div className="flex gap-4">
          <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 active:scale-90 transition-all shadow-sm">
            <i className="fas fa-image"></i>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImagePick} />
          <div className="flex-1 bg-slate-50 rounded-2xl flex items-center px-4 border border-slate-100 shadow-inner">
            <input 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSend(text, image)}
              placeholder="Écrivez au support..." 
              className="flex-1 bg-transparent py-3 text-slate-900 text-[11px] outline-none font-bold placeholder:text-slate-300" 
            />
            <button 
              onClick={() => handleSend(text, image)} 
              disabled={loading || (!text.trim() && !image)} 
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${text.trim() || image ? 'bg-[#0047FF] text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}
            >
              <i className={`fas ${loading ? 'fa-circle-notch animate-spin' : 'fa-paper-plane'} text-[10px]`}></i>
            </button>
          </div>
        </div>
      </div>
      
      {previewImage && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in" alt="Full" />
          <button className="absolute top-12 right-10 text-white w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md active:scale-90 border border-white/20"><i className="fas fa-times"></i></button>
        </div>
      )}
    </div>
  );
};

export default Chat;
