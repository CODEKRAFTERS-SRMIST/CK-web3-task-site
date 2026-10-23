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
    <header className="sticky top-0 z-30 w-full border-b border-[#ff4799]/15 bg-[#090414]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="relative w-9 h-9 rounded-lg bg-[#231c2f] border border-[#ff4799]/40 flex items-center justify-center group-hover:border-[#feb700] transition-colors shadow-sm">
              <span className="font-mono text-xs font-bold text-[#feb700] tracking-tighter">CK</span>
              <div className="absolute -inset-0.5 rounded-lg bg-[#ff4799]/20 blur-xs -z-10 group-hover:bg-[#feb700]/30 transition-all" />
            </div>
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-white uppercase hidden sm:inline">
              CODEKRAFTERS
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentScreen === tab.id
                    ? 'bg-[#ff4799]/20 text-[#feb700] font-bold border border-[#ff4799]/30'
                    : tab.id === 'admin'
                    ? 'text-[#ff4799] hover:bg-[#ff4799]/10 border border-[#ff4799]/20'
                    : 'text-[#e2bdc7] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Action Zone */}
        <div className="flex items-center gap-3">
          {/* Wallet */}
          {isWalletConnected ? (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1f182b]/80 border border-[#ff4799]/30 hover:border-[#ff4799] transition-all text-xs font-mono text-[#eadef8] cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{profile.connectedWallet.address}</span>
              <span className="text-[#feb700] font-semibold hidden sm:inline">
                {profile.connectedWallet.balance}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f182b]/80 border border-[#ff4799]/30 hover:border-[#feb700] transition-colors text-xs font-mono text-[#e2bdc7] hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-[#feb700]">account_balance_wallet</span>
              <span className="hidden sm:inline">CONNECT WALLET</span>
            </button>
          )}

          {/* Google User info or JOIN button */}
          {googleUser ? (
            <div className="flex items-center gap-2">
              {/* Role badge */}
              <span className="hidden sm:inline font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#ff4799]/15 text-[#ffb0c9] border border-[#ff4799]/20 uppercase tracking-wider">
                {ROLE_LABELS[googleUser.role]}
              </span>
              {/* Avatar + profile link */}
              <button
                onClick={() => onNavigate('join')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer ${
                  currentScreen === 'join'
                    ? 'bg-[#2e273a] text-white border border-[#ff4799]/40'
                    : 'bg-[#feb700] hover:bg-[#ffc633] text-[#090414] shadow-[#feb700]/25'
                }`}
              >
                {googleUser.avatar_url ? (
                  <img src={googleUser.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                ) : (
                  <span className="material-symbols-outlined text-[15px]">badge</span>
                )}
                <span>IDENTITY</span>
              </button>
              {/* Logout */}
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg bg-[#1f182b]/80 border border-white/10 hover:border-[#ff4799]/40 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-[#a98891] hover:text-[#e2bdc7]">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleJoinClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider bg-[#feb700] hover:bg-[#ffc633] text-[#090414] shadow-md shadow-[#feb700]/25 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">login</span>
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
