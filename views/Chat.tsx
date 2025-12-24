
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
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 flex items-center gap-4 shadow-sm z-10">
        <button onClick={onBack} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-blue-900 active:scale-90 transition-all">
          <i className="fas fa-chevron-left"></i>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg">
            <i className={isAdmin ? "fas fa-user" : "fas fa-headset"}></i>
          </div>
          <div>
            <h2 className="text-blue-900 font-black text-sm uppercase tracking-tight">
              {isAdmin ? (targetUserName || "Client") : "Support Recharge+"}
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">En ligne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-10">
            <i className="fas fa-comments text-5xl mb-4 text-blue-900"></i>
            <p className="text-xs font-bold text-blue-900 uppercase tracking-widest leading-relaxed">
              {isAdmin ? "Aucun message. Envoyez le premier message au client." : "Bonjour ! Posez votre question ici, notre support vous répondra instantanément."}
            </p>
          </div>
        )}
        
        {chatMessages.map((msg) => {
          const isMe = isAdmin ? msg.isAdmin : !msg.isAdmin;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] p-4 rounded-3xl shadow-sm text-sm font-medium ${
                isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-blue-900 rounded-tl-none border border-gray-100'
              }`}>
                {msg.text}
                <div className={`text-[8px] mt-1.5 opacity-50 font-black uppercase text-right`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-50 pb-8">
        <form onSubmit={handleSend} className="flex gap-2 bg-gray-50 p-2 rounded-[2rem] border border-gray-100">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrivez votre message..." 
            className="flex-1 bg-transparent px-4 py-2 outline-none text-blue-900 text-sm font-bold"
          />
          <button 
            type="submit" 
            disabled={!text.trim() || loading}
            className="w-12 h-12 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50"
          >
            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-paper-plane text-sm"></i>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;