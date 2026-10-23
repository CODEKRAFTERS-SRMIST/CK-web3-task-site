import React, { useState } from 'react';
import { ScreenType, BuilderProfile } from '../types';
import {
  connectEVMWallet,
  connectSolanaWallet,
  signSIWEMessage,
  formatAddress,
  ConnectedWalletData,
} from '../utils/web3';

interface ConnectWalletModalProps {
  onClose: () => void;
  onNavigate: (screen: ScreenType) => void;
  profile: BuilderProfile;
  setProfile: React.Dispatch<React.SetStateAction<BuilderProfile>>;
  isWalletConnected: boolean;
  setIsWalletConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

type WalletModalState = 'disconnected' | 'connecting' | 'connected' | 'error';

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  onClose,
  onNavigate,
  profile,
  setProfile,
  isWalletConnected,
  setIsWalletConnected,
}) => {
  const [modalState, setModalState] = useState<WalletModalState>(
    isWalletConnected ? 'connected' : 'disconnected'
  );
  const [selectedProvider, setSelectedProvider] = useState<string>('MetaMask');
  const [connectionStage, setConnectionStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // ponytail: Real EIP-1193 / Solana wallet handler. Zero fake timers, zero mock addresses.
  const handleConnect = async (providerName: string) => {
    setSelectedProvider(providerName);
    setErrorMessage('');
    setModalState('connecting');

    try {
      setConnectionStage(`Requesting authorization from ${providerName}...`);

      let walletData: ConnectedWalletData;
      if (providerName === 'Phantom') {
        walletData = await connectSolanaWallet('Phantom');
      } else {
        walletData = await connectEVMWallet(providerName);
      }

      setConnectionStage('Requesting SIWE authentication signature...');
      let sig: string | undefined;
      try {
        sig = await signSIWEMessage(walletData.fullAddress, walletData.name);
      } catch (err: any) {
        console.warn('SIWE signature rejected or bypassed:', err?.message);
        // User may skip SIWE sign but wallet address remains authenticated
      }

      setProfile((prev) => ({
        ...prev,
        connectedWallet: {
          name: walletData.name,
          address: walletData.address,
          fullAddress: walletData.fullAddress,
          network: walletData.network,
          balance: walletData.balance,
          chainId: walletData.chainId,
          signature: sig,
        },
      }));

      setIsWalletConnected(true);
      setModalState('connected');
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setErrorMessage(err?.message || 'Failed to connect wallet.');
      setModalState('error');
    }
  };

  const handleDisconnect = () => {
    setIsWalletConnected(false);
    setModalState('disconnected');
    setErrorMessage('');
    setProfile((prev) => ({
      ...prev,
      connectedWallet: {
        name: 'None',
        address: 'Not Connected',
        fullAddress: undefined,
        network: 'Ethereum Mainnet (Chain ID: 1)',
        balance: '0.00 ETH',
        chainId: 1,
        signature: undefined,
      },
    }));
  };

  const handleCopy = () => {
    const addr = profile.connectedWallet.fullAddress || profile.connectedWallet.address;
    if (addr && addr !== 'Not Connected') {
      navigator.clipboard?.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="flex flex-col w-full max-w-4xl mx-auto text-[#eadef8]">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between w-full mb-8">
          <button
            onClick={onClose}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-[#1f182b]/80 hover:bg-[#2e273a] backdrop-blur-md shadow-sm transition-all border border-[#ff4799]/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#ffb0c9] text-sm transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span className="font-mono text-xs text-[#e2bdc7] uppercase tracking-wider group-hover:text-white">
              Return to Landing
            </span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#110b1c]/80 border border-[#ff4799]/15 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="font-mono text-[11px] text-emerald-400 tracking-widest uppercase">
              Live EIP-1193 Gateway
            </span>
          </div>
        </div>

        {/* Cyber Frame */}
        <div className="relative w-full rounded-3xl bg-[#110b1c]/90 border border-[#ff4799]/20 backdrop-blur-2xl shadow-2xl p-6 sm:p-10 md:p-12 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#ff4799]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#feb700]/15 blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-10">
            <div className="relative mb-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#ff4799] via-[#feb700] to-[#e14ef6] blur-md opacity-40 animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-[#393145] border border-[#ff4799]/30 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-[#feb700] text-3xl">account_balance_wallet</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 font-mono text-[11px] tracking-widest text-[#e2bdc7] uppercase">
              <span>Web3 Auth</span>
              <span className="text-[#ff4799]">•</span>
              <span>EIP-1193 Standard</span>
              <span className="text-[#ff4799]">•</span>
              <span>Zero Simulations</span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-2">
              Connect Web3 Wallet
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#e2bdc7] max-w-md">
              Connect your verified browser wallet (MetaMask, Coinbase, Phantom) to sign in, anchor developer credentials, and unlock builder bounties.
            </p>
          </div>

          {/* STATE 1: Disconnected / Wallet Selection */}
          {modalState === 'disconnected' && (
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              {/* MetaMask Card */}
              <div
                onClick={() => handleConnect('MetaMask')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect('MetaMask')}
                className="group relative rounded-2xl bg-[#1f182b]/70 hover:bg-[#2e273a] border border-[#ff4799]/15 hover:border-[#feb700]/50 p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-[#393145] flex-shrink-0 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform border border-white/5">
                      <span className="material-symbols-outlined text-[#feb700] text-2xl">electric_bolt</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-lg text-white">MetaMask</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#feb700]/15 text-[#feb700] font-mono text-[10px] tracking-widest uppercase font-semibold">
                          EVM / L2s
                        </span>
                      </div>
                      <span className="font-sans text-xs sm:text-sm text-[#e2bdc7]/80 truncate">
                        Ethereum Mainnet, Polygon, Arbitrum, Base, Optimism
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-mono text-xs text-[#ffb0c9] font-semibold group-hover:text-[#feb700] transition-colors">
                      Connect
                    </span>
                    <span className="material-symbols-outlined text-[#ffb0c9] text-base group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>

              {/* Coinbase / Browser EVM Card */}
              <div
                onClick={() => handleConnect('Coinbase / Browser EVM')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect('Coinbase / Browser EVM')}
                className="group relative rounded-2xl bg-[#1f182b]/70 hover:bg-[#2e273a] border border-[#ff4799]/15 hover:border-[#ff4799]/50 p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-[#393145] flex-shrink-0 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform border border-white/5">
                      <span className="material-symbols-outlined text-[#ff4799] text-2xl">account_balance</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-lg text-white">Coinbase / Injected EVM</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#ff4799]/20 text-[#ffb0c9] font-mono text-[10px] tracking-widest uppercase font-semibold">
                          SMART WALLET / BRAVE / RABBY
                        </span>
                      </div>
                      <span className="font-sans text-xs sm:text-sm text-[#e2bdc7]/80 truncate">
                        Direct connection via window.ethereum EIP-1193 standard
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-mono text-xs text-[#ffb0c9] font-semibold group-hover:text-white transition-colors">
                      Connect
                    </span>
                    <span className="material-symbols-outlined text-[#ffb0c9] text-base group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>

              {/* Phantom (Solana) Card */}
              <div
                onClick={() => handleConnect('Phantom')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect('Phantom')}
                className="group relative rounded-2xl bg-[#1f182b]/70 hover:bg-[#2e273a] border border-[#ff4799]/15 hover:border-[#fbabff]/50 p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-[#393145] flex-shrink-0 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform border border-white/5">
                      <span className="material-symbols-outlined text-[#fbabff] text-2xl">token</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-lg text-white">Phantom</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#e14ef6]/25 text-[#fbabff] font-mono text-[10px] tracking-widest uppercase font-semibold">
                          SOLANA
                        </span>
                      </div>
                      <span className="font-sans text-xs sm:text-sm text-[#e2bdc7]/80 truncate">
                        Solana cluster &amp; native program deployment signing
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-mono text-xs text-[#ffb0c9] font-semibold group-hover:text-[#fbabff] transition-colors">
                      Connect
                    </span>
                    <span className="material-symbols-outlined text-[#ffb0c9] text-base group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Connecting / Awaiting Signature */}
          {modalState === 'connecting' && (
            <div className="flex flex-col items-center justify-center max-w-lg mx-auto py-8 text-center">
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#ff4799] animate-ping opacity-30" />
                <div className="relative w-16 h-16 rounded-full bg-[#393145] border border-[#ff4799]/40 flex items-center justify-center shadow-xl">
                  <span className="material-symbols-outlined text-[#feb700] text-3xl animate-spin">
                    sync
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#feb700]/20 text-[#feb700] mb-3 font-mono text-xs uppercase tracking-wider font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#feb700] animate-pulse" />
                <span>Wallet Request Active</span>
              </div>

              <h2 className="font-display font-bold text-2xl text-white mb-2">
                Check {selectedProvider}
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#e2bdc7] mb-6 max-w-sm leading-relaxed">
                {connectionStage || 'Approve the connection request in your browser wallet extension.'}
              </p>

              <button
                onClick={() => setModalState('disconnected')}
                className="py-2 px-6 rounded-xl bg-[#2e273a] text-white font-mono text-xs tracking-wider uppercase hover:bg-[#393145] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* STATE: Error Screen */}
          {modalState === 'error' && (
            <div className="flex flex-col items-center justify-center max-w-md mx-auto py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mb-4 text-rose-400">
                <span className="material-symbols-outlined text-3xl">error_outline</span>
              </div>

              <h2 className="font-display font-bold text-xl text-white mb-2">Connection Failed</h2>
              <p className="font-sans text-xs text-[#e2bdc7] mb-6 leading-relaxed bg-[#1f182b] p-4 rounded-xl border border-white/5">
                {errorMessage}
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setModalState('disconnected')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#2e273a] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#393145] cursor-pointer"
                >
                  Choose Other Wallet
                </button>
                <button
                  onClick={() => handleConnect(selectedProvider)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#ff4799] text-white font-mono text-xs uppercase tracking-wider font-semibold hover:brightness-110 cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: Connected Screen */}
          {modalState === 'connected' && (
            <div className="flex flex-col max-w-2xl mx-auto">
              <div className="rounded-2xl bg-[#1f182b] border border-[#ff4799]/20 p-6 sm:p-7 mb-6 relative overflow-hidden shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff4799] to-[#feb700] p-0.5 flex items-center justify-center shadow-md">
                      <div className="w-full h-full bg-[#110b1c] rounded-[14px] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#feb700] text-2xl">verified</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-xl text-white">
                          {formatAddress(profile.connectedWallet.address)}
                        </span>
                        <button
                          onClick={handleCopy}
                          className="text-[#e2bdc7] hover:text-[#ffb0c9] transition-colors cursor-pointer"
                          title="Copy Full Address"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {copied ? 'check' : 'content_copy'}
                          </span>
                        </button>
                        {copied && (
                          <span className="text-[10px] font-mono text-emerald-400">Copied!</span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-[#e2bdc7] tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{profile.connectedWallet.network}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="self-start sm:self-auto px-4 py-1.5 rounded-lg bg-[#393145] text-[#ffb4ab] font-mono text-xs tracking-wider uppercase hover:bg-[#93000a] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">power_settings_new</span>
                    <span>Disconnect</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#110b1c]/80 border border-white/5">
                    <span className="font-mono text-[10px] text-[#a98891] uppercase tracking-wider">
                      Provider
                    </span>
                    <div className="font-display font-bold text-white text-sm mt-0.5">
                      {profile.connectedWallet.name}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#110b1c]/80 border border-white/5">
                    <span className="font-mono text-[10px] text-[#a98891] uppercase tracking-wider">
                      Balance
                    </span>
                    <div className="font-display font-bold text-[#feb700] text-sm mt-0.5">
                      {profile.connectedWallet.balance}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#110b1c]/80 border border-white/5">
                    <span className="font-mono text-[10px] text-[#a98891] uppercase tracking-wider">
                      SIWE Status
                    </span>
                    <div className="font-display font-bold text-emerald-400 text-sm mt-0.5">
                      {profile.connectedWallet.signature ? 'Verified Signature' : 'Connected'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between">
                <button
                  onClick={onClose}
                  className="py-3 px-6 rounded-xl bg-[#2e273a] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#393145] transition-colors cursor-pointer"
                >
                  Close Window
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('join');
                  }}
                  className="py-3 px-8 rounded-xl bg-gradient-to-r from-[#ff4799] to-[#feb700] text-[#090414] font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#ff4799]/25 hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Continue to Builder Identity</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
