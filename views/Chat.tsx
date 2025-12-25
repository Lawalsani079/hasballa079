
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from '../firebaseConfig';
import { User, ChatMessage } from '../types';

interface ChatProps {
  user: User;
  messages: ChatMessage[];
  onBack: () => void;
  targetUserId?: string; // Utilisé par l'admin pour répondre à un utilisateur spécifique
  targetUserName?: string;
}

const Chat: React.FC<ChatProps> = ({ user, messages, onBack, targetUserId, targetUserName }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = user.role === 'admin';
  const currentChatId = isAdmin ? targetUserId : user.id;

  const chatMessages = messages.filter(m => m.userId === currentChatId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        userId: currentChatId,
        userName: isAdmin ? "Support Recharge+" : user.name,
        text: text.trim(),
        isAdmin: isAdmin,
        createdAt: Date.now()
      });
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#081a2b] h-full overflow-hidden">
      {/* Header Sombre et Stylisé */}
      <div className="bg-[#081a2b] px-6 pt-12 pb-6 flex items-center justify-between border-b border-white/5 shadow-xl z-20">
        <button onClick={onBack} className="w-11 h-11 bg-white/5 rounded-[1rem] flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all shadow-lg">
          <i className="fas fa-chevron-left text-sm"></i>
        </button>
        
        <div className="flex flex-col items-center">
          <h2 className="text-white font-black text-xs uppercase tracking-[0.2em]">
            {isAdmin ? (targetUserName || "Chat Client") : "Assistance Directe"}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Support en ligne</p>
          </div>
        </div>

        <div className="w-11 h-11 bg-yellow-400 rounded-[1rem] flex items-center justify-center text-[#081a2b] text-lg shadow-lg shadow-yellow-400/20">
          <i className={isAdmin ? "fas fa-user-circle" : "fas fa-headset"}></i>
        </div>
      </div>

      {/* Messages Area - Dark Theme */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#081a2b] to-[#04111d]">
        {chatMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
               <i className="fas fa-comments text-3xl text-white"></i>
            </div>
            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
              {isAdmin ? "Aucun message avec ce client." : "Bonjour ! Posez votre question, notre équipe vous répondra ici même."}
            </p>
          </div>
        )}
        
        {chatMessages.map((msg) => {
          const isMe = isAdmin ? msg.isAdmin : !msg.isAdmin;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-4 rounded-[1.8rem] shadow-2xl relative ${
                isMe 
                ? 'bg-blue-600 text-white rounded-tr-none border border-blue-400/20' 
                : 'bg-white/10 text-white rounded-tl-none border border-white/10 backdrop-blur-md'
              }`}>
                <p className="text-xs font-bold leading-relaxed">{msg.text}</p>
                <div className={`text-[7px] mt-2 font-black uppercase tracking-widest flex items-center gap-1.5 ${isMe ? 'opacity-50 text-white justify-end' : 'text-white/30'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && <i className="fas fa-check-double text-[6px]"></i>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area - Redessinée */}
      <div className="p-4 bg-[#04111d] border-t border-white/5 pb-10">
        <form onSubmit={handleSend} className="flex gap-2 bg-white/5 p-2 rounded-[2.2rem] border border-white/10 backdrop-blur-xl group focus-within:border-yellow-400/30 transition-all">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrivez votre message..." 
            className="flex-1 bg-transparent px-5 py-3 outline-none text-white text-xs font-bold placeholder:text-white/10"
          />
          <button 
            type="submit" 
            disabled={!text.trim() || loading}
            className="w-12 h-12 bg-yellow-400 text-[#081a2b] rounded-full flex items-center justify-center shadow-xl shadow-yellow-400/10 active:scale-90 transition-all disabled:opacity-30 disabled:grayscale"
          >
            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-paper-plane text-xs"></i>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
