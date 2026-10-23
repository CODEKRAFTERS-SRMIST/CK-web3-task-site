/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ScreenType, BuilderProfile, GoogleUser } from './types';
import { ShaderBackground } from './components/ShaderBackground';
import { Navigation } from './components/Navigation';
import { FooterTelemetry } from './components/FooterTelemetry';
import { LandingView } from './views/LandingView';
import { ConnectWalletModal } from './views/ConnectWalletModal';
import { JoinNetworkView } from './views/JoinNetworkView';
import { TaskBoardView } from './views/TaskBoardView';
import { LeaderboardView } from './views/LeaderboardView';
import { ShowcaseView } from './views/ShowcaseView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { getGoogleUser, getProfile } from './utils/auth';

const DEFAULT_PROFILE: BuilderProfile = {
  handle: '',
  fullName: '',
  bio: '',
  domainInterest: undefined,
  role: 'member',
  connectedWallet: {
    name: 'None',
    address: 'Not Connected',
    network: 'Ethereum Mainnet (Chain ID: 1)',
    balance: '0.00 ETH',
    chainId: 1,
  },
  githubConnected: false,
  githubUsername: '',
  discordHandle: '',
  twitterHandle: '',
  xp: 0,
  soulboundId: '#00000-S1',
  badgesUnlocked: 0,
  isMinted: false,
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<BuilderProfile>(DEFAULT_PROFILE);

  // Mount: check session + hydrate profile from DB
  useEffect(() => {
    (async () => {
      const user = await getGoogleUser();
      if (user) {
        setGoogleUser(user);
        const dbProfile = await getProfile();
        if (dbProfile) {
          setProfile(dbProfile);
        } else {
          setProfile(prev => ({
            ...prev,
            handle: user.email.split('@')[0],
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            googleId: user.id,
            email: user.email,
            role: user.role,
          }));
        }
        if (window.location.search.includes('loggedIn=1')) {
          window.history.replaceState({}, '', '/');
          setCurrentScreen('join');
        }
      }
      setAuthLoading(false);
    })();
  }, []);

  const handleOpenWalletModal = () => setIsWalletModalOpen(true);
  const handleCloseWalletModal = () => setIsWalletModalOpen(false);

  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
    setIsWalletModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#090414] text-[#eadef8]">
        <ShaderBackground opacity={0.85} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-[#feb700] animate-spin">sync</span>
          <span className="font-mono text-xs text-[#e2bdc7] uppercase tracking-widest">Authenticating...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent text-[#eadef8] font-sans selection:bg-[#ff4799] selection:text-white">
      {/* Background WebGL Micro-Slats Wave Simulation at z-0 */}
      <ShaderBackground opacity={0.85} />

      {/* Main Content Area */}
      {isWalletModalOpen || currentScreen === 'wallet' ? (
        <main className="flex-1 w-full flex flex-col justify-center relative z-10">
          <ConnectWalletModal
            onClose={handleCloseWalletModal}
            onNavigate={navigateTo}
            profile={profile}
            setProfile={setProfile}
            isWalletConnected={isWalletConnected}
            setIsWalletConnected={setIsWalletConnected}
          />
        </main>
      ) : (
        <>
          {/* Primary Header Navigation */}
          <Navigation
            currentScreen={currentScreen}
            onNavigate={navigateTo}
            profile={profile}
            isWalletConnected={isWalletConnected}
            onOpenWallet={handleOpenWalletModal}
            googleUser={googleUser}
          />

          <main className="flex-1 w-full flex flex-col justify-center relative z-10">
            {currentScreen === 'landing' && (
              <LandingView
                onNavigate={navigateTo}
                onOpenWallet={handleOpenWalletModal}
                isWalletConnected={isWalletConnected}
                googleUser={googleUser}
              />
            )}

            {currentScreen === 'join' && (
              <JoinNetworkView
                onNavigate={navigateTo}
                profile={profile}
                setProfile={setProfile}
                onOpenWallet={handleOpenWalletModal}
                googleUser={googleUser}
              />
            )}

            {currentScreen === 'tasks' && (
              <TaskBoardView
                profile={profile}
                setProfile={setProfile}
                onOpenWallet={handleOpenWalletModal}
                googleUser={googleUser}
              />
            )}

            {currentScreen === 'leaderboard' && (
              <LeaderboardView profile={profile} />
            )}

            {currentScreen === 'showcase' && (
              <ShowcaseView
                profile={profile}
                onOpenWallet={handleOpenWalletModal}
                googleUser={googleUser}
              />
            )}

            {currentScreen === 'admin' && (
              <AdminDashboardView googleUser={googleUser} />
            )}
          </main>

          {/* Signature bottom telemetry ribbon */}
          <FooterTelemetry />
        </>
      )}
    </div>
  );
}
