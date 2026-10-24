import React from 'react';
import { ScreenType, GoogleUser } from '../types';
import { initiateGoogleLogin } from '../utils/auth';

interface LandingViewProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenWallet: () => void;
  isWalletConnected: boolean;
  googleUser: GoogleUser | null;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  onOpenWallet,
  isWalletConnected,
  googleUser,
}) => {
  const handleJoin = () => {
    if (!googleUser) { initiateGoogleLogin(); } else { onNavigate('join'); }
  };
  const cards = [
    {
      num: '01',
      title: 'On-Chain Quests',
      desc: 'Complete real Web3 tasks like deploying contracts, minting NFTs, and more.',
      icon: 'check_box',
      iconColor: 'text-[#ffb0c9]',
      glowColor: 'rgba(255, 71, 153, 0.25)',
      action: handleJoin,
    },
    {
      num: '02',
      title: 'Earn & Level Up',
      desc: 'Gain XP, unlock badges (SBTs), and climb the on-chain leaderboard.',
      icon: 'emoji_events',
      iconColor: 'text-[#feb700]',
      glowColor: 'rgba(254, 183, 0, 0.25)',
      action: handleJoin,
    },
    {
      num: '03',
      title: 'Showcase Your Work',
      desc: 'Get your projects featured and build a verifiable on-chain portfolio.',
      icon: 'terminal',
      iconColor: 'text-[#fbabff]',
      glowColor: 'rgba(251, 171, 255, 0.25)',
      action: handleJoin,
    },
    {
      num: '04',
      title: 'Join the Community',
      desc: 'Collaborate, compete and grow with a network of Web3 builders.',
      icon: 'groups',
      iconColor: 'text-[#ffdb9d]',
      glowColor: 'rgba(255, 219, 157, 0.25)',
      action: handleJoin,
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 relative z-10">
      {/* Hero Section */}
      <div className="max-w-4xl pt-4 sm:pt-8 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1f182b]/80 border border-[#ff4799]/30 mb-6 backdrop-blur-md shadow-sm">
          <img src="/logo.png" alt="CodeKrafters" className="w-5 h-5 object-contain" />
          <span className="font-mono text-xs font-semibold text-[#feb700] uppercase tracking-wider">CODEKRAFTERS GUILD PROTOCOL</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-[76px] leading-[1.08] tracking-tight text-white mb-6">
          Build, Learn and
          <br />
          Lead
          <br />
          in the <span className="text-[#feb700] drop-shadow-[0_0_20px_rgba(254,183,0,0.4)]">Web3</span>
          <br />
          <span className="text-[#ffb0c9]">World.</span>
        </h1>

        <p className="font-sans text-base sm:text-lg lg:text-xl text-[#e2bdc7] max-w-2xl font-normal leading-relaxed mb-8">
          A quest-driven platform for Web3 club members, leads and heads to build
          real projects, earn verifiable credentials, and grow a stronger Web3
          community together.
        </p>

        {/* Feature Pills */}
        <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-widest text-[#ffdb9d] uppercase">
          <span>QUESTS</span>
          <span className="text-[#ff4799]">•</span>
          <span>XP</span>
          <span className="text-[#ff4799]">•</span>
          <span>BADGES</span>
          <span className="text-[#ff4799]">•</span>
          <span>COMMUNITY</span>
        </div>
      </div>

      {/* 4 Feature HUD Cards Grid matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
        {cards.map((card) => (
          <div
            key={card.num}
            onClick={card.action}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && card.action()}
            className="group relative rounded-2xl bg-[#1b122b]/70 hover:bg-[#25173e]/85 border border-[#ff4799]/15 hover:border-[#ff4799]/40 p-6 flex flex-col justify-between transition-all duration-300 backdrop-blur-md cursor-pointer hover:-translate-y-1 shadow-lg hover:shadow-2xl"
          >
            {/* Watermark Number */}
            <div className="absolute top-5 right-6 font-mono font-bold text-3xl sm:text-4xl text-[#393145]/40 group-hover:text-[#ff4799]/30 transition-colors pointer-events-none select-none">
              {card.num}
            </div>

            {/* Recessed Icon Frame */}
            <div className="relative mb-8">
              <div
                className="w-13 h-13 rounded-xl bg-[#2e273a] flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-105 transition-transform"
                style={{
                  boxShadow: `0 0 20px ${card.glowColor}`,
                }}
              >
                <span className={`material-symbols-outlined text-2xl ${card.iconColor}`}>
                  {card.icon}
                </span>
              </div>
            </div>

            {/* Content & Arrow */}
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white mb-2 group-hover:text-[#ffb0c9] transition-colors">
                {card.title}
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#e2bdc7]/80 leading-relaxed mb-6">
                {card.desc}
              </p>

              <div className="flex justify-end items-center">
                <span className="material-symbols-outlined text-sm sm:text-base text-[#e2bdc7] group-hover:text-[#feb700] group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Prompt Bar matching Image 1 */}
      <div className="w-full rounded-2xl bg-[#1f182b]/80 border border-[#ff4799]/20 backdrop-blur-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-[#feb700] shadow-[0_0_10px_#feb700]" />
          <span className="font-sans font-medium text-sm sm:text-base text-white">
            Your next Web3 build starts here.
          </span>
        </div>

        <button
          onClick={handleJoin}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-[#feb700] hover:bg-[#ffc633] active:scale-[0.98] text-[#090414] font-display font-bold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(254,183,0,0.35)] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg font-bold">{googleUser ? 'badge' : 'login'}</span>
          <span>{googleUser ? 'VIEW PROFILE' : 'JOIN NETWORK'}</span>
        </button>
      </div>
    </div>
  );
};
