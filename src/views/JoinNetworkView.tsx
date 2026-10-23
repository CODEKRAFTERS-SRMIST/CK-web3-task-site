import React, { useState } from 'react';
import { ScreenType, BuilderProfile, GuildRole, GoogleUser, ROLE_LABELS, canDo } from '../types';
import { saveProfile } from '../utils/auth';

interface JoinNetworkViewProps {
  onNavigate: (screen: ScreenType) => void;
  profile: BuilderProfile;
  setProfile: React.Dispatch<React.SetStateAction<BuilderProfile>>;
  onOpenWallet: () => void;
  googleUser: GoogleUser | null;
}

export const JoinNetworkView: React.FC<JoinNetworkViewProps> = ({
  onNavigate,
  profile,
  setProfile,
  onOpenWallet,
  googleUser,
}) => {
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showMintModal, setShowMintModal] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);


  // Role is set by server — read-only on client
  const handleRoleSelect = (_role: GuildRole) => {};

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/^@/, '');
    setProfile((prev) => ({ ...prev, handle: val }));
  };

  const handleDiscordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({ ...prev, discordHandle: e.target.value }));
  };

  const toggleGithub = () => {
    setProfile((prev) => {
      const nextStatus = !prev.githubConnected;
      return {
        ...prev,
        githubConnected: nextStatus,
        githubUsername: nextStatus ? 'satoshi-builder' : '',
        xp: nextStatus ? prev.xp + 150 : prev.xp - 150,
      };
    });
    setSaveToast(
      profile.githubConnected
        ? 'GitHub account unlinked'
        : 'GitHub linked! +150 XP Developer Proof awarded'
    );
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    const ok = await saveProfile(profile);
    setSaveToast(ok ? 'Profile saved to network ✓' : 'Save failed — try again');
    setIsSaving(false);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleMintPassport = () => {
    setIsMinting(true);
    setShowMintModal(true);
    setTimeout(() => {
      setIsMinting(false);
      setProfile((prev) => ({
        ...prev,
        isMinted: true,
        badgesUnlocked: prev.badgesUnlocked + 1,
        xp: prev.xp + 300,
      }));
    }, 2200);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Navigation Step Bar matching Image 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#ff4799]/15">
        <button
          onClick={() => onNavigate('landing')}
          className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#e2bdc7] hover:text-white cursor-pointer w-fit"
        >
          <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          <span>BACK TO HOME</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-xs text-[#feb700] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#feb700] animate-pulse" />
            <span>STEP 01 / 03 • BUILDER IDENTITY</span>
          </div>
          {/* Progress bar */}
          <div className="w-28 sm:w-36 h-2 rounded-full bg-[#231c2f] overflow-hidden">
            <div className="w-1/3 h-full bg-[#feb700] rounded-full" />
          </div>
          <span className="font-mono text-xs text-[#e2bdc7]">33%</span>
        </div>
      </div>

      {/* Header Title Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 font-mono text-xs text-[#ffb0c9] tracking-widest uppercase mb-2">
          <span className="material-symbols-outlined text-sm text-[#ff4799]">verified_user</span>
          <span>VERIFIED DEVELOPER CREDENTIALS</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-[54px] text-white tracking-tight mb-4">
          Join the <span className="text-[#ff4799]">Builder</span>{' '}
          <span className="text-[#feb700]">Network</span>
        </h1>
        <p className="font-sans text-sm sm:text-base text-[#e2bdc7] max-w-3xl leading-relaxed">
          Mint your on-chain builder passport, link your university or club chapter, and unlock exclusive dev bounties across 14+ ecosystems.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left Column (8 cols): Main Form */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Builder Handle & Role */}
          <div className="rounded-2xl bg-[#1b122b]/80 border border-[#ff4799]/20 p-6 sm:p-7 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ff4799] text-xl">badge</span>
                <h2 className="font-display font-bold text-lg text-white">
                  Builder Handle &amp; Role
                </h2>
              </div>
              <span className="font-mono text-xs text-[#ffb0c9] uppercase tracking-wider">
                ID // 0xPROTO
              </span>
            </div>

            {/* Handle Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-xs text-[#e2bdc7] uppercase tracking-wider">
                  BUILDER DISPLAY NAME / ENS
                </label>
                <span className="font-mono text-xs text-emerald-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  <span>AVAILABLE ON-CHAIN</span>
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-mono text-sm text-[#feb700] font-semibold">
                  @
                </span>
                <input
                  type="text"
                  value={profile.handle}
                  onChange={handleHandleChange}
                  placeholder="satoshi.eth"
                  className="w-full pl-9 pr-24 py-3 rounded-xl bg-[#110b1c] border border-[#ff4799]/30 focus:border-[#ff4799] focus:outline-none focus:ring-1 focus:ring-[#ff4799] font-mono text-sm text-white transition-all"
                />
                <span className="absolute right-3 px-2 py-0.5 rounded-md bg-[#231c2f] border border-white/10 font-mono text-[10px] text-[#e2bdc7] tracking-wider uppercase">
                  ERC-3643
                </span>
              </div>
            </div>

            {/* Guild Tier Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block font-mono text-xs text-[#e2bdc7] uppercase tracking-wider">
                  GUILD TIER &amp; ROLE STATUS
                </label>
                <span className="font-mono text-[10px] text-[#feb700] uppercase tracking-wider">
                  Assigned by Governance
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(
                  [
                    {
                      role: 'member' as const,
                      label: 'Club Member',
                      subtitle: 'Active Builder',
                      icon: 'school',
                    },
                    {
                      role: 'lead' as const,
                      label: 'Campus Lead',
                      subtitle: 'Chapter Mentor',
                      icon: 'flag',
                    },
                    {
                      role: 'head' as const,
                      label: 'Core Dev Head',
                      subtitle: 'Track Reviewer',
                      icon: 'terminal',
                    },
                    {
                      role: 'president' as const,
                      label: 'President',
                      subtitle: 'Governance',
                      icon: 'shield_person',
                    },
                  ]
                ).map((tier) => {
                  const isCurrent = profile.role === tier.role;
                  return (
                    <div
                      key={tier.role}
                      className={`p-3.5 rounded-xl text-left border transition-all relative ${
                        isCurrent
                          ? 'bg-[#2a173d] border-[#feb700] shadow-[0_0_15px_rgba(254,183,0,0.25)]'
                          : 'bg-[#110b1c]/80 border-white/5 opacity-55'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`material-symbols-outlined text-lg ${
                            isCurrent ? 'text-[#feb700]' : 'text-[#a98891]'
                          }`}
                        >
                          {tier.icon}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#feb700] text-[#090414] uppercase">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="font-display font-bold text-xs text-white">
                        {tier.label}
                      </div>
                      <div className="font-mono text-[10px] text-[#e2bdc7]/70 mt-0.5">
                        {tier.subtitle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Step 02: Connect Builder Wallet */}
          <div className="rounded-2xl bg-[#1b122b]/80 border border-[#ff4799]/20 p-6 sm:p-7 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#feb700] text-xl">
                  account_balance_wallet
                </span>
                <h2 className="font-display font-bold text-lg text-white">
                  Step 02: Connect Builder Wallet
                </h2>
              </div>
              <span className="font-mono text-[10px] text-[#feb700] px-2 py-0.5 rounded-full bg-[#feb700]/15 tracking-wider uppercase font-semibold">
                • REQUIRED FOR PASSPORT MINT
              </span>
            </div>

            <p className="font-sans text-xs sm:text-sm text-[#e2bdc7] leading-relaxed mb-6">
              Connect your Web3 address to anchor developer reputation, soulbound badges, and automated quest bounty payouts. Authenticate via standard SIWE (Sign-In with Ethereum).
            </p>

            {/* 4 Wallet Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* MetaMask Card */}
              <div
                onClick={onOpenWallet}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  profile.connectedWallet.name === 'MetaMask' && profile.connectedWallet.address !== 'Not Connected'
                    ? 'bg-[#2a173d]/90 border-[#ff4799]/50 hover:border-[#feb700]'
                    : 'bg-[#110b1c]/80 border-white/10 hover:border-[#ff4799]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#393145] flex items-center justify-center text-[#feb700]">
                    <span className="material-symbols-outlined text-xl">electric_bolt</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-white">
                        MetaMask
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold tracking-wider bg-[#ff4799]/20 text-[#ffb0c9]">
                        {profile.connectedWallet.name === 'MetaMask' && profile.connectedWallet.address !== 'Not Connected'
                          ? 'ACTIVE'
                          : 'READY'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#e2bdc7]">EVM / Layer 2s</div>
                    <div className="text-[11px] font-mono text-[#feb700] flex items-center gap-1 mt-1">
                      {profile.connectedWallet.name === 'MetaMask' && profile.connectedWallet.address !== 'Not Connected' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{profile.connectedWallet.address}</span>
                          <span className="text-[#a98891]">• Connected</span>
                        </>
                      ) : (
                        <span className="text-[#a98891]">Click to connect</span>
                      )}
                    </div>
                  </div>
                </div>
                {!(profile.connectedWallet.name === 'MetaMask' && profile.connectedWallet.address !== 'Not Connected') && (
                  <span className="font-mono text-xs text-[#ffb0c9]">Connect →</span>
                )}
              </div>

              {/* Phantom Card */}
              <div
                onClick={onOpenWallet}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  profile.connectedWallet.name === 'Phantom' && profile.connectedWallet.address !== 'Not Connected'
                    ? 'bg-[#2a173d]/90 border-[#ff4799]/50 hover:border-[#feb700]'
                    : 'bg-[#110b1c]/80 border-white/10 hover:border-[#ff4799]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#393145] flex items-center justify-center text-[#fbabff]">
                    <span className="material-symbols-outlined text-xl">token</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-white">Phantom</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/10 text-[#e2bdc7]">
                        {profile.connectedWallet.name === 'Phantom' && profile.connectedWallet.address !== 'Not Connected'
                          ? 'ACTIVE'
                          : 'READY'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#e2bdc7]/75">
                      Solana / Multi-chain
                    </div>
                    <div className="text-[11px] font-mono text-[#a98891] mt-1">
                      {profile.connectedWallet.name === 'Phantom' && profile.connectedWallet.address !== 'Not Connected' ? (
                        <span className="text-[#feb700] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {profile.connectedWallet.address}
                        </span>
                      ) : (
                        'Multi-Protocol Vault'
                      )}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#ffb0c9]">
                  {profile.connectedWallet.name === 'Phantom' && profile.connectedWallet.address !== 'Not Connected'
                    ? '• Connected'
                    : 'Connect →'}
                </span>
              </div>

              {/* WalletConnect Card */}
              <div
                onClick={onOpenWallet}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  profile.connectedWallet.name === 'WalletConnect' && profile.connectedWallet.address !== 'Not Connected'
                    ? 'bg-[#2a173d]/90 border-[#ff4799]/50 hover:border-[#feb700]'
                    : 'bg-[#110b1c]/80 border-white/10 hover:border-[#ff4799]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#393145] flex items-center justify-center text-[#ff4799]">
                    <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-white">
                        WalletConnect
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/10 text-[#e2bdc7]">
                        {profile.connectedWallet.name === 'WalletConnect' && profile.connectedWallet.address !== 'Not Connected'
                          ? 'ACTIVE'
                          : 'V2 PROTOCOL'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#e2bdc7]/75">
                      Universal Mobile Bridge
                    </div>
                    <div className="text-[11px] font-mono text-[#a98891] mt-1">
                      {profile.connectedWallet.name === 'WalletConnect' && profile.connectedWallet.address !== 'Not Connected' ? (
                        <span className="text-[#feb700] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {profile.connectedWallet.address}
                        </span>
                      ) : (
                        'Mobile & Hardware'
                      )}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#ffb0c9]">
                  {profile.connectedWallet.name === 'WalletConnect' && profile.connectedWallet.address !== 'Not Connected'
                    ? '• Connected'
                    : 'Scan QR →'}
                </span>
              </div>

              {/* Coinbase Wallet Card */}
              <div
                onClick={onOpenWallet}
                className="p-4 rounded-xl bg-[#110b1c]/80 border border-white/10 hover:border-[#ff4799]/40 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#393145] flex items-center justify-center text-[#38bdf8]">
                    <span className="material-symbols-outlined text-xl">shield</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-white">
                        Coinbase Wallet
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/10 text-[#e2bdc7] uppercase">
                        ERC-4337
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#e2bdc7]/75">
                      Smart Wallet / Base L2
                    </div>
                    <div className="text-[11px] font-mono text-[#a98891] mt-1">Passkey Native</div>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#ffb0c9]">Connect →</span>
              </div>
            </div>

            {/* Bottom SIWE info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#110b1c] border border-white/5 font-mono text-xs text-[#e2bdc7]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#feb700]">key</span>
                <span>Ready for EIP-4361 SIWE signature</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-[#231c2f] text-[10px] text-[#e2bdc7]">
                  EVM
                </span>
                <span className="px-2 py-0.5 rounded bg-[#231c2f] text-[10px] text-[#e2bdc7]">
                  ZK L2s
                </span>
                <span className="px-2 py-0.5 rounded bg-[#231c2f] text-[10px] text-[#e2bdc7]">
                  Solana
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Developer Proof & Social Handshake */}
          <div className="rounded-2xl bg-[#1b122b]/80 border border-[#ff4799]/20 p-6 sm:p-7 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/5">
              <span className="material-symbols-outlined text-[#ff4799] text-xl">fingerprint</span>
              <h2 className="font-display font-bold text-lg text-white">
                Developer Proof &amp; Social Handshake
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GitHub Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#110b1c] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-white flex items-center gap-1.5 font-semibold">
                      <span className="material-symbols-outlined text-sm text-[#feb700]">code</span>
                      GitHub Commits
                    </span>
                    <span className="font-mono text-[10px] text-[#feb700] uppercase font-semibold">
                      Optional XP boost
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#e2bdc7]/80 leading-relaxed mb-4">
                    Verify on-chain dev history and PRs to claim Level 2 status automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleGithub}
                  className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    profile.githubConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                      : 'bg-[#231c2f] text-white hover:bg-[#2e273a] border border-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {profile.githubConnected ? 'check_circle' : 'link'}
                  </span>
                  <span>{profile.githubConnected ? 'GITHUB LINKED (+150 XP)' : 'CONNECT GITHUB'}</span>
                </button>
              </div>

              {/* Discord / Telegram Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#110b1c] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-white flex items-center gap-1.5 font-semibold">
                      <span className="material-symbols-outlined text-sm text-[#ff4799]">chat</span>
                      Discord / Telegram
                    </span>
                    <span className="font-mono text-[10px] text-[#fbabff] uppercase font-semibold">
                      Guild Sync
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#e2bdc7]/80 leading-relaxed mb-4">
                    Direct notifications for quest bounties and club governance calls.
                  </p>
                </div>
                <input
                  type="text"
                  value={profile.discordHandle}
                  onChange={handleDiscordChange}
                  placeholder="e.g. satoshi#0001 or @telegram"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f182b] border border-[#ff4799]/30 focus:border-[#ff4799] focus:outline-none font-mono text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Live On-Chain Card Preview & Status */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Card 1: • ON-CHAIN CARD PREVIEW (matching Image 5) */}
          <div className="rounded-2xl bg-[#110b1c] border border-[#feb700]/30 p-6 relative overflow-hidden shadow-2xl">
            {/* Watermark 01 */}
            <div className="absolute top-4 right-6 font-mono text-3xl font-bold text-white/10 select-none pointer-events-none">
              01
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#feb700] animate-pulse" />
              <span className="font-mono text-xs text-[#feb700] uppercase tracking-wider font-semibold">
                ON-CHAIN CARD PREVIEW
              </span>
            </div>

            {/* Real Soulbound Passport Preview Frame */}
            <div className="rounded-2xl bg-gradient-to-b from-[#1b122b] to-[#0d051a] border border-[#ff4799]/40 p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#feb700] text-black font-display font-extrabold flex items-center justify-center text-sm shadow-md">
                    CK
                  </div>
                  <div>
                    <div className="font-display font-bold text-base text-white">
                      @{profile.handle || 'builder.eth'}
                    </div>
                    <div className="font-mono text-xs text-[#ffb0c9]">{profile.role}</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#feb700] text-xl">
                  verified
                </span>
              </div>

              {/* Network XP Base */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#e2bdc7]">Network XP Base</span>
                  <span className="text-[#feb700] font-bold">{profile.xp} XP</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#231c2f] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#feb700] to-[#ff4799] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (profile.xp / 1000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Bento Details */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="p-2.5 rounded-lg bg-[#110b1c]/90 border border-white/5">
                  <div className="font-mono text-[9px] text-[#a98891] uppercase tracking-wider">
                    GAS RESERVE
                  </div>
                  <div className="font-display font-bold text-xs text-white mt-0.5">
                    Sponsored
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#110b1c]/90 border border-white/5">
                  <div className="font-mono text-[9px] text-[#a98891] uppercase tracking-wider">
                    SOULBOUND ID
                  </div>
                  <div className="font-mono font-bold text-xs text-[#fbabff] mt-0.5">
                    {profile.soulboundId}
                  </div>
                </div>
              </div>

              {/* Live Protocol Hash Wave ECG Animation */}
              <div>
                <div className="font-mono text-[9px] text-[#a98891] uppercase tracking-wider mb-1">
                  PROTOCOL HASH
                </div>
                <div className="w-full h-9 flex items-center justify-center">
                  <svg
                    className="w-full h-full text-[#ff4799]"
                    viewBox="0 0 200 30"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M0 15 L35 15 L45 5 L55 25 L65 10 L75 18 L85 15 L120 15 L130 2 L140 28 L150 12 L160 17 L200 15"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: SIGNATURE STATUS */}
          <div className="rounded-2xl bg-[#1b122b]/80 border border-white/10 p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-[#a98891] uppercase">SIGNATURE STATUS</span>
              {profile.connectedWallet.address !== 'Not Connected' ? (
                <span className="text-[#feb700] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#feb700]" />
                  VERIFIED (EIP-4361)
                </span>
              ) : (
                <span className="text-[#e2bdc7] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a98891]" />
                  OFFLINE (UNCONNECTED)
                </span>
              )}
            </div>

            <div className="flex justify-between">
              <span className="text-[#a98891]">Connected Provider:</span>
              <span className="text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#feb700]">
                  electric_bolt
                </span>
                {profile.connectedWallet.name || 'None'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#a98891]">Signer Address:</span>
              <span className="text-[#e2bdc7]">{profile.connectedWallet.address}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#a98891]">Payload Cipher:</span>
              <span className="text-white">ECDSA / secp256k1</span>
            </div>

            <div className="pt-2 border-t border-white/5 text-[11px] text-[#e2bdc7]/80 flex items-center justify-between">
              {profile.connectedWallet.address !== 'Not Connected' ? (
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Ready to sign cryptographic payload for passport mint</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenWallet}
                  className="text-[#feb700] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Connect Wallet to Sign</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar matching Image 5 */}
      <div className="w-full rounded-2xl bg-[#1b122b]/95 border border-[#ff4799]/25 p-5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2e273a] flex items-center justify-center text-[#feb700] flex-shrink-0">
            <span className="material-symbols-outlined text-lg">shield</span>
          </div>
          <div>
            <div className="font-mono text-xs text-white font-bold tracking-wider uppercase">
              EIP-4361 STANDARDIZED (SIWE)
            </div>
            <div className="font-sans text-xs text-[#e2bdc7]/80">
              Gas-free profile generation. Your cryptographic keys remain yours.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#2e273a] hover:bg-[#393145] text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            SAVE DRAFT
          </button>
          <button
            type="button"
            onClick={handleMintPassport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#feb700] hover:bg-[#ffc633] text-[#090414] font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#feb700]/30 transition-all cursor-pointer"
          >
            <span>{profile.isMinted ? 'VIEW ON-CHAIN PASSPORT' : 'CONTINUE TO PASSPORT'}</span>
            <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-24 right-8 z-50 px-5 py-3 rounded-xl bg-[#110b1c] border border-[#feb700] text-[#feb700] font-mono text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-sm">verified</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* On-Chain Passport Mint Modal */}
      {showMintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#110b1c] border border-[#ff4799]/40 p-8 text-center shadow-2xl">
            {isMinting ? (
              <div className="py-8 space-y-6">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-[#feb700] animate-ping opacity-40" />
                  <span className="material-symbols-outlined text-4xl text-[#feb700] animate-spin">
                    sync
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl text-white">
                  Minting Soulbound Passport...
                </h3>
                <p className="font-mono text-xs text-[#e2bdc7]">
                  Anchoring cryptographic identity to Sepolia testnet enclave (ERC-3643).
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#feb700] to-[#ff4799] p-0.5 mx-auto">
                  <div className="w-full h-full bg-[#110b1c] rounded-[14px] flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-[#feb700]">
                      military_tech
                    </span>
                  </div>
                </div>
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                    MINT SUCCESSFUL
                  </span>
                  <h3 className="font-display font-extrabold text-2xl text-white mt-2">
                    Builder Passport #48192-S1 Active!
                  </h3>
                  <p className="font-sans text-xs text-[#e2bdc7] mt-1">
                    Your on-chain developer reputation is anchored. +300 XP awarded to @{profile.handle}.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#1f182b] border border-white/5 font-mono text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#a98891]">Tx Hash:</span>
                    <span className="text-[#feb700]">0x93FA...4b82</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a98891]">Guild Role:</span>
                    <span className="text-white">{ROLE_LABELS[profile.role] || 'Web3 Builder'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a98891]">Total Guild XP:</span>
                    <span className="text-[#ff4799] font-bold">{profile.xp} XP</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMintModal(false)}
                    className="flex-1 py-3 rounded-xl bg-[#2e273a] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#393145] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowMintModal(false);
                      onNavigate('landing');
                    }}
                    className="flex-1 py-3 rounded-xl bg-[#feb700] text-[#090414] font-display font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#feb700]/25 transition-all cursor-pointer"
                  >
                    Return to Home →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
