
import React from 'react';
import { motion } from 'framer-motion';
import { User, BannerItem } from '../types';
import Banner from '../components/Banner';
import { Bell, Power, Bot, Plus, Send, Bitcoin, Gift, ArrowRight, Wallet, ArrowDownLeft, ArrowUpRight, Zap } from 'lucide-react';

interface UserHomeProps {
  user: User;
  banners: BannerItem[];
  unreadCount: number;
  onDeposit: () => void;
  onWithdraw: () => void;
  onBuyCrypto: () => void;
  onLogout: () => void;
  onChat: () => void;
  onNotify: () => void;
  onAIChat: () => void;
}

const UserHome: React.FC<UserHomeProps> = ({ user, banners, unreadCount, onDeposit, onWithdraw, onBuyCrypto, onLogout, onChat, onNotify, onAIChat }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex-1 bg-transparent flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="px-6 pt-14 pb-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-white bg-white shadow-xl p-1"
          >
            <i className="fas fa-user text-[#0047FF] text-xl"></i>
          </motion.div>
          <div className="flex flex-col">
            <h3 className="text-slate-900 font-black text-sm uppercase tracking-tight">{user.name}</h3>
            <p className="text-[#0047FF] font-black text-[8px] uppercase tracking-widest">Membre Premium Niger</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onNotify} 
            className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md text-slate-600 rounded-xl border border-white shadow-sm relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-[#0047FF] text-white text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onLogout} 
            className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-xl border border-red-500 shadow-lg"
          >
            <Power size={18} />
          </motion.button>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto flex flex-col px-6 pb-24 no-scrollbar"
      >
        {/* Banner Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
            <Banner banners={banners} />
          </div>
        </motion.div>

        {/* AI Assistant Promo */}
        <motion.button 
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
          onClick={onAIChat}
          className="w-full bg-slate-900 p-5 rounded-[2.2rem] flex items-center justify-between mb-8 shadow-2xl border border-slate-800"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0047FF] rounded-xl flex items-center justify-center text-white shadow-lg">
              <Bot size={20} />
            </div>
            <div className="text-left">
              <p className="text-white font-black text-[10px] uppercase tracking-wider">Assistant IA Niger</p>
              <p className="text-white/40 text-[8px] font-bold uppercase tracking-widest">Analyse de vos activités</p>
            </div>
          </div>
          <Zap size={16} className="text-[#FACC15] animate-pulse" />
        </motion.button>

        {/* Main Actions */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <motion.button
            variants={itemVariants}
            whileTap={{ scale: 0.95 }}
            onClick={onDeposit}
            className="bg-white p-6 rounded-[2.5rem] flex flex-col items-center gap-4 shadow-xl border border-white group"
          >
            <div className="w-14 h-14 bg-blue-50 text-[#0047FF] rounded-2xl flex items-center justify-center group-active:scale-90 transition-transform">
              <ArrowDownLeft size={28} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Déposer</span>
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileTap={{ scale: 0.95 }}
            onClick={onWithdraw}
            className="bg-white p-6 rounded-[2.5rem] flex flex-col items-center gap-4 shadow-xl border border-white group"
          >
            <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center group-active:scale-90 transition-transform">
              <ArrowUpRight size={28} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Retirer</span>
          </motion.button>
        </div>

        {/* Crypto Shortcut */}
        <motion.button
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
          onClick={onBuyCrypto}
          className="w-full bg-[#0047FF] p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl group border-4 border-white/20"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
              <Bitcoin size={24} />
            </div>
            <div className="text-left">
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Achat Crypto</h4>
              <p className="text-white/50 text-[8px] font-bold uppercase tracking-widest mt-0.5">USDT • BTC • ETH</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white">
            <ArrowRight size={16} />
          </div>
        </motion.button>

        {/* Referral Card */}
        <motion.div
          variants={itemVariants}
          className="mt-8 bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 border-2 border-white/50 flex flex-col gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-slate-900 shadow-sm">
              <Gift size={20} />
            </div>
            <div>
              <p className="text-slate-900 font-black text-[9px] uppercase tracking-widest">Parrainage</p>
              <p className="text-slate-900/40 text-[8px] font-bold uppercase tracking-widest">Gagnez 500F par ami</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-white rounded-xl py-3 px-4 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-400 text-[8px] font-black uppercase">Code:</span>
              <span className="text-slate-900 font-black text-xs tracking-widest">{user.referralCode}</span>
            </div>
            <button className="bg-slate-900 text-white px-6 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg">Partager</button>
          </div>
        </motion.div>

        <div className="mt-10 py-6 text-center opacity-20">
          <p className="text-slate-900 font-black text-[8px] uppercase tracking-[0.5em]">Secured by Recharge+ Niger</p>
        </div>
      </motion.div>
    </div>
  );
};

export default UserHome;
