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
    <header className="sticky top-0 z-40 w-full border-b border-[#ff4799]/15 bg-[#090414]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 group text-left cursor-pointer select-none"
          >
            <div className="relative w-9 h-9 rounded-lg bg-[#231c2f] border border-[#ff4799]/40 flex items-center justify-center group-hover:border-[#feb700] transition-colors shadow-sm shrink-0 overflow-hidden p-1">
              <img src="/logo.png" alt="CodeKrafters" className="w-full h-full object-contain" />
              <div className="absolute -inset-0.5 rounded-lg bg-[#ff4799]/20 blur-xs -z-10 group-hover:bg-[#feb700]/30 transition-all" />
            </div>
            <span className="font-display font-extrabold text-base sm:text-lg tracking-wider text-white uppercase hidden sm:inline leading-none">
              CODEKRAFTERS
            </span>
          </button>
        </div>

        {/* Centered Pill Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#171022]/90 border border-white/10 shadow-inner backdrop-blur-md shrink-0">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`h-8 px-3 rounded-lg inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer select-none leading-none whitespace-nowrap ${currentScreen === tab.id
                  ? 'bg-[#ff4799]/20 text-[#feb700] font-bold border border-[#ff4799]/30 shadow-xs'
                  : tab.id === 'admin'
                    ? 'text-[#ff4799] hover:bg-[#ff4799]/10 border border-[#ff4799]/20'
                    : 'text-[#e2bdc7] hover:text-white hover:bg-white/5'
                }`}
            >
              <span className="material-symbols-outlined text-[15px] leading-none shrink-0">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Action Zone */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 justify-end">
          {/* Wallet Button */}
          {isWalletConnected ? (
            <button
              onClick={onOpenWallet}
              className="h-9 px-3 rounded-lg bg-[#1f182b]/90 border border-[#ff4799]/30 hover:border-[#ff4799] transition-all text-xs font-mono text-[#eadef8] inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-[130px] leading-none">{profile.connectedWallet.address}</span>
              <span className="text-[#feb700] font-semibold hidden md:inline leading-none">
                {profile.connectedWallet.balance}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenWallet}
              className="h-9 px-3 rounded-lg bg-[#1f182b]/90 border border-[#ff4799]/30 hover:border-[#feb700] transition-colors text-xs font-mono text-[#e2bdc7] hover:text-white inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px] text-[#feb700] leading-none shrink-0">account_balance_wallet</span>
              <span className="hidden sm:inline leading-none">CONNECT WALLET</span>
            </button>
          )}

          {/* Google User Info / Identity or Join */}
          {googleUser ? (
            <div className="flex items-center gap-2">
              {/* Role badge */}
              <span className="hidden lg:inline-flex items-center h-6 font-mono text-[10px] px-2 rounded-full bg-[#ff4799]/15 text-[#ffb0c9] border border-[#ff4799]/20 uppercase tracking-wider leading-none whitespace-nowrap">
                {ROLE_LABELS[googleUser.role]}
              </span>
              {/* Avatar + Identity Link */}
              <button
                onClick={() => onNavigate('join')}
                className={`h-9 px-3 sm:px-3.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer select-none leading-none whitespace-nowrap ${currentScreen === 'join'
                    ? 'bg-[#2e273a] text-white border border-[#ff4799]/40'
                    : 'bg-[#feb700] hover:bg-[#ffc633] text-[#090414] shadow-[#feb700]/25'
                  }`}
              >
                {googleUser.avatar_url ? (
                  <img src={googleUser.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                ) : (
                  <span className="material-symbols-outlined text-[15px] leading-none shrink-0">badge</span>
                )}
                <span>IDENTITY</span>
              </button>
              {/* Logout */}
              <button
                onClick={logout}
                title="Logout"
                className="h-9 w-9 rounded-lg bg-[#1f182b]/90 border border-white/10 hover:border-[#ff4799]/40 transition-colors inline-flex items-center justify-center cursor-pointer shrink-0 text-[#a98891] hover:text-[#e2bdc7]"
              >
                <span className="material-symbols-outlined text-sm leading-none">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleJoinClick}
              className="h-9 px-3.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider bg-[#feb700] hover:bg-[#ffc633] text-[#090414] shadow-md shadow-[#feb700]/25 transition-all inline-flex items-center gap-1.5 cursor-pointer select-none leading-none whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px] leading-none shrink-0">login</span>
              <span>JOIN NETWORK</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-white/5 py-2 px-2 bg-[#090414]/95 backdrop-blur-lg font-mono text-[11px] uppercase">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md transition-colors cursor-pointer select-none ${currentScreen === tab.id ? 'text-[#feb700] font-bold' : 'text-[#a98891] hover:text-[#e2bdc7]'
              }`}
          >
            <span className="material-symbols-outlined text-base leading-none">{tab.icon}</span>
            <span className="leading-none">{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};

