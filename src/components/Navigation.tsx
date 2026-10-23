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
    <header className="sticky top-0 z-40 w-full border-b border-[#ff4799]/15 bg-[#090414]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3.5 group text-left cursor-pointer flex-shrink-0"
          >
            <div className="relative w-10 h-10 rounded-xl bg-[#1b122b] border border-[#ff4799]/30 flex items-center justify-center group-hover:border-[#feb700] transition-colors shadow-sm">
              <span className="font-mono text-xs font-black text-[#feb700] tracking-tight">CK</span>
              <div className="absolute -inset-0.5 rounded-xl bg-[#ff4799]/20 blur-xs -z-10 group-hover:bg-[#feb700]/30 transition-all" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-wider text-white uppercase hidden sm:inline">
              CODEKRAFTERS
            </span>
          </button>

          {/* Navigation Links with generous breathing room */}
          <nav className="hidden lg:flex items-center gap-2 font-mono text-xs uppercase tracking-wider pl-4 border-l border-white/10">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  currentScreen === tab.id
                    ? 'bg-[#ff4799]/20 text-[#feb700] font-bold border border-[#ff4799]/40 shadow-sm'
                    : tab.id === 'admin'
                    ? 'text-[#ff4799] hover:bg-[#ff4799]/10 border border-[#ff4799]/20 ml-2'
                    : 'text-[#e2bdc7] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Action Zone with clean grouping & distinct dividers */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Wallet */}
          {isWalletConnected ? (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#1b122b] border border-[#ff4799]/25 hover:border-[#ff4799] transition-all text-xs font-mono text-[#eadef8] cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{profile.connectedWallet.address}</span>
              <span className="text-[#feb700] font-semibold hidden md:inline ml-1 pl-2 border-l border-white/10">
                {profile.connectedWallet.balance}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1b122b] border border-[#ff4799]/25 hover:border-[#feb700] transition-colors text-xs font-mono text-[#e2bdc7] hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#feb700]">account_balance_wallet</span>
              <span className="hidden sm:inline">CONNECT WALLET</span>
            </button>
          )}

          {/* Vertical Separator */}
          <div className="hidden sm:block h-6 w-[1px] bg-white/10" />

          {/* Google User info or JOIN button */}
          {googleUser ? (
            <div className="flex items-center gap-3">
              {/* Role badge */}
              <span className="hidden xl:inline font-mono text-[10px] px-2.5 py-1 rounded-full bg-[#ff4799]/15 text-[#ffb0c9] border border-[#ff4799]/25 uppercase font-bold tracking-wider">
                {ROLE_LABELS[googleUser.role]}
              </span>
              {/* Avatar + profile link */}
              <button
                onClick={() => onNavigate('join')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  currentScreen === 'join'
                    ? 'bg-[#2e273a] text-white border border-[#ff4799]/40'
                    : 'bg-[#feb700] hover:bg-[#ffc633] text-[#090414] shadow-md shadow-[#feb700]/25'
                }`}
              >
                {googleUser.avatar_url ? (
                  <img src={googleUser.avatar_url} alt="" className="w-4 h-4 rounded-full ring-1 ring-black/40" />
                ) : (
                  <span className="material-symbols-outlined text-base">badge</span>
                )}
                <span>IDENTITY</span>
              </button>
              {/* Logout */}
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl bg-[#1b122b] border border-white/10 hover:border-[#ff4799]/40 text-[#a98891] hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleJoinClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-[#feb700] hover:bg-[#ffc633] text-[#090414] shadow-md shadow-[#feb700]/25 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>JOIN NETWORK</span>
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
