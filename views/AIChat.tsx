
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { GoogleGenAI } from "@google/genai";
import { db } from '../firebaseConfig';
import { User, ChatMessage, TransactionRequest } from '../types';

interface AIChatProps {
  user: User;
  onBack: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ user, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      userId: 'ai',
      userName: 'Recharge+ Bot',
      text: "Bonjour ! Je suis l'assistant intelligent Recharge+. Je peux analyser vos dépôts et retraits. Que souhaitez-vous savoir ?",
      isAdmin: false,
      isAI: true,
      createdAt: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userHistoryRef = useRef<string>('');

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Pré-charge l'historique une seule fois pour économiser le quota
  useEffect(() => {
    const fetchHistoryOnlyOnce = async () => {
      try {
        const q = query(collection(db, "requests"), where("userId", "==", user.id), limit(10));
        const snap = await getDocs(q);
        userHistoryRef.current = snap.docs.map(doc => {
          const d = doc.data() as TransactionRequest;
          return `- Le ${new Date(d.createdAt).toLocaleDateString()}: ${d.type} de ${d.amount}F (${d.status})`;
        }).join('\n');
      } catch (e) { console.warn("AI Pre-fetch failed"); }
    };
    fetchHistoryOnlyOnce();
  }, [user.id]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      userId: user.id,
      userName: user.name,
      text: inputText,
      isAdmin: false,
      createdAt: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    const prompt = inputText;
    setInputText('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [{ text: `
            Contexte: Assistant Recharge+ Niger.
            Utilisateur: ${user.name}
            Historique (extraits):
            ${userHistoryRef.current || "Aucune transaction récente."}
            
            Question: ${prompt}
            
            Instructions: Réponds de manière concise en français. Base-toi sur l'historique fourni.
          `}]
        }]
      });

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        userId: 'ai',
        userName: 'Recharge+ Bot',
        text: response.text || "Désolé, je ne parviens pas à répondre actuellement.",
        isAdmin: false,
        isAI: true,
        createdAt: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("AI Assistant Error:", err?.message || "Internal failure");
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        userId: 'ai',
        userName: 'Recharge+ Bot',
        text: "Désolé, le service d'IA est momentanément indisponible.",
        isAdmin: false,
        isAI: true,
        createdAt: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden animate-in fade-in duration-300">
      <div className="bg-white px-6 pt-12 pb-6 flex items-center gap-4 border-b border-slate-50 relative z-30 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 border border-slate-200 active:scale-90 transition-all">
          <i className="fas fa-chevron-left"></i>
        </button>
        <div>
          <h2 className="text-slate-900 font-black text-sm uppercase tracking-tight">Assistant Recharge+</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IA Niger</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${msg.isAI ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-none' : 'bg-[#0047FF] text-white rounded-tr-none'}`}>
              <p className="text-[12px] font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <div className="flex items-center justify-between mt-2 opacity-30">
                <span className="text-[7px] font-black uppercase tracking-widest">{msg.userName}</span>
                <span className="text-[7px] font-black uppercase">{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 flex gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span></div></div>}
      </div>

      <div className="p-6 bg-white border-t border-slate-100 pb-10">
        <div className="flex gap-3 bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
          <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Message..." className="flex-1 bg-transparent px-5 py-3 text-slate-900 text-[11px] outline-none font-bold" />
          <button onClick={handleSend} disabled={loading || !inputText.trim()} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-20 shadow-xl"><i className="fas fa-paper-plane text-xs"></i></button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
