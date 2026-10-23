import React from 'react';
import { ScreenType, BuilderProfile, GoogleUser, canDo, ROLE_LABELS } from '../types';
import { initiateGoogleLogin, logout } from '../utils/auth';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  profile: BuilderProfile;
  isWalletConnected: boolean;
  onOpenWallet: () => void;
  googleUser: GoogleUser | null;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  profile,
  isWalletConnected,
  onOpenWallet,
  googleUser,
}) => {
  const navTabs: { id: ScreenType; label: string; icon: string }[] = [
    { id: 'landing', label: 'Home', icon: 'home' },
    { id: 'tasks', label: 'Task Board', icon: 'task' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
    { id: 'showcase', label: 'Showcase', icon: 'rocket_launch' },
    // Admin tab: only visible to head/president
    ...(googleUser && canDo(googleUser.role, 'admin')
      ? [{ id: 'admin' as ScreenType, label: 'Admin', icon: 'admin_panel_settings' }]
      : []),
  ];

  const handleJoinClick = () => {
    if (!googleUser) {
      initiateGoogleLogin();
    } else {
      onNavigate('join');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090414]/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Brand */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 group text-left cursor-pointer flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff4799]/20 to-[#feb700]/20 border border-[#ff4799]/30 flex items-center justify-center group-hover:border-[#feb700] transition-colors shadow-sm">
            <span className="font-mono text-xs font-black text-[#feb700] tracking-tight">CK</span>
          </div>
          <span className="font-display font-black text-lg tracking-wider text-white uppercase hidden sm:inline">
            CODEKRAFTERS
          </span>
        </button>

        {/* Center Nav Pills with Lucide Icons */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
          {navTabs.map((tab) => {
            const isActive = currentScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#feb700] text-[#090414] font-bold shadow-md shadow-[#feb700]/20'
                    : tab.id === 'admin'
                    ? 'text-[#ff4799] hover:bg-[#ff4799]/10'
                    : 'text-[#e2bdc7]/80 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Cluster */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Wallet Button */}
          {isWalletConnected ? (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#ff4799]/40 transition-all text-xs font-mono text-[#eadef8] cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{profile.connectedWallet.address}</span>
            </button>
          ) : (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#feb700] transition-colors text-xs font-mono text-[#e2bdc7] hover:text-white cursor-pointer"
            >
              <span>CONNECT WALLET</span>
            </button>
          )}

          {/* User Status / Identity */}
          {googleUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
              <span className="hidden xl:inline font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#ff4799]/15 text-[#ffb0c9] border border-[#ff4799]/20 uppercase font-semibold">
                {ROLE_LABELS[googleUser.role]}
              </span>

              <button
                onClick={() => onNavigate('join')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  currentScreen === 'join'
                    ? 'bg-[#2e273a] text-white border border-[#ff4799]/40'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]'
                }`}
              >
                {googleUser.avatar_url ? (
                  <img src={googleUser.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                ) : null}
                <span>IDENTITY</span>
              </button>

              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#ff4799]/40 text-[#a98891] hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleJoinClick}
              className="px-4 py-1.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-[#feb700] hover:bg-[#ffc633] text-[#090414] shadow-md shadow-[#feb700]/25 transition-all cursor-pointer"
            >
              JOIN NETWORK
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-white/5 py-2 px-2 font-mono text-[11px] uppercase">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center gap-0.5 ${
              currentScreen === tab.id ? 'text-[#feb700] font-bold' : 'text-[#a98891]'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
