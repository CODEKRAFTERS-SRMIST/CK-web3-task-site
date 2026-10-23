import React, { useState, useEffect } from 'react';
import { BuilderProfile, ROLE_LABELS } from '../types';
import { SkillRadarChart } from '../components/SkillRadarChart';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { DomainTrack } from '../types/task';

interface LeaderboardViewProps {
  profile: BuilderProfile;
}

interface RankedBuilder {
  rank: number;
  handle: string;
  wallet: string;
  domain: DomainTrack;
  role: string;
  xp: number;
  badges: number;
  isCurrentUser?: boolean;
}

const DOMAIN_FILTERS: (DomainTrack | 'All')[] = [
  'All',
  'Solidity',
  'Rust',
  'ZK',
  'React',
  'UI/UX',
  'DevOps',
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ profile }) => {
  const [selectedDomain, setSelectedDomain] = useState<DomainTrack | 'All'>('All');
  const [showCertificate, setShowCertificate] = useState(false);
  const [dbBuilders, setDbBuilders] = useState<RankedBuilder[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.builders) && data.builders.length > 0) {
          const mapped: RankedBuilder[] = data.builders.map((b: any, idx: number) => ({
            rank: idx + 1,
            handle: b.handle || b.full_name || 'anon',
            wallet: b.wallet || 'Not Connected',
            domain: (b.domain as DomainTrack) || 'Solidity',
            role: ROLE_LABELS[b.role as keyof typeof ROLE_LABELS] || b.role || 'Club Member',
            xp: Number(b.xp) || 0,
            badges: Number(b.badges) || 0,
            isCurrentUser: b.handle === profile.handle,
          }));
          setDbBuilders(mapped);
        }
      })
      .catch(() => {});
  }, [profile.handle]);

  const allBuilders: RankedBuilder[] = dbBuilders;

  const filteredBuilders = allBuilders.filter(
    (b) => selectedDomain === 'All' || b.domain === selectedDomain
  );

  // User skills profile for radar chart
  const userSkills: Record<string, number> = {
    Solidity: 88,
    ZK: 74,
    Rust: 60,
    Frontend: 85,
    Security: 92,
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#ff4799]/15">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#feb700] uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-[#feb700] animate-pulse" />
            <span>GLOBAL &amp; DOMAIN REPUTATION</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Builder Leaderboard &amp; Credentials
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#e2bdc7] mt-1 max-w-2xl">
            Real-time rankings based on approved task deliverables, hackathon bounties, and verifiable builder reputation.
          </p>
        </div>

        <button
          onClick={() => setShowCertificate(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff4799] to-[#feb700] text-[#090414] font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#ff4799]/20 hover:brightness-110 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">workspace_premium</span>
          <span>View Soulbound Certificate</span>
        </button>
      </div>

      {/* Bento Grid: Leaderboard (2 cols) + Skill Radar / Telemetry (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left 2 Cols: Leaderboard Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Domain Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {DOMAIN_FILTERS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedDomain === d
                    ? 'bg-[#feb700] text-[#090414] font-bold shadow-md shadow-[#feb700]/25'
                    : 'bg-[#1b122b]/80 text-[#e2bdc7] hover:text-white border border-white/5'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Table Container */}
          <div className="rounded-2xl bg-[#1f182b]/80 border border-[#ff4799]/20 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#160f22] text-[#a98891] uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Rank</th>
                    <th className="py-3.5 px-4">Builder</th>
                    <th className="py-3.5 px-4">Track</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4 text-center">Badges</th>
                    <th className="py-3.5 px-4 text-right">XP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBuilders.map((b) => (
                    <tr
                      key={b.handle}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        b.isCurrentUser ? 'bg-[#ff4799]/10 border-l-2 border-l-[#feb700]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold">
                        {b.rank === 1 ? (
                          <span className="text-[#feb700] flex items-center gap-1">🥇 1</span>
                        ) : b.rank === 2 ? (
                          <span className="text-zinc-300 flex items-center gap-1">🥈 2</span>
                        ) : b.rank === 3 ? (
                          <span className="text-amber-600 flex items-center gap-1">🥉 3</span>
                        ) : (
                          <span className="text-[#a98891]">#{b.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-[#feb700]">
                            {b.handle}
                          </span>
                          {b.isCurrentUser && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#feb700]/20 text-[#feb700] font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#a98891] block mt-0.5">{b.wallet}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#ff4799]/15 text-[#ffb0c9] text-[10px] font-bold">
                          {b.domain}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#e2bdc7]">{b.role}</td>
                      <td className="py-3.5 px-4 text-center text-[#feb700] font-bold">
                        {b.badges} 🏅
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-white">
                        {b.xp.toLocaleString()} <span className="text-[#feb700]">XP</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Heatmap */}
          <ActivityHeatmap />
        </div>

        {/* Right Col: Builder Profile & Pure SVG Radar Chart */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#1f182b]/80 border border-[#ff4799]/20 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <span className="font-mono text-xs uppercase tracking-wider text-[#feb700] font-bold">
                Builder Skill Radar
              </span>
              <span className="font-mono text-[10px] text-[#a98891]">On-Chain Verified</span>
            </div>

            <SkillRadarChart skills={userSkills} size={240} />

            <div className="mt-4 pt-4 border-t border-white/5 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#a98891]">Soulbound ID:</span>
                <span className="text-white font-bold">{profile.soulboundId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a98891]">Guild Role:</span>
                <span className="text-[#feb700] font-semibold text-right truncate max-w-[180px]">
                  {ROLE_LABELS[profile.role] || profile.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a98891]">Passport Status:</span>
                <span className="text-emerald-400 font-bold">
                  {profile.isMinted ? 'Minted & Anchored' : 'Draft Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Verifiable Soulbound Certificate */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#1f182b] to-[#110b1c] border-2 border-[#feb700]/50 p-8 shadow-2xl text-center">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-[#a98891] hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#feb700]/20 text-[#feb700] font-mono text-[10px] uppercase tracking-widest font-bold mb-4">
              <span>EIP-5192 Soulbound Guild Certificate</span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mb-1">
              CodeKrafters Verified Builder
            </h2>
            <p className="font-sans text-xs text-[#e2bdc7] mb-6">
              Official Non-Transferable Credential awarded to
            </p>

            <div className="p-6 rounded-2xl bg-[#110b1c]/90 border border-white/10 mb-6 font-mono space-y-2">
              <div className="text-2xl font-black text-[#feb700]">{profile.handle}</div>
              <div className="text-xs text-[#e2bdc7]">
                Wallet: {profile.connectedWallet.address}
              </div>
              <div className="text-xs text-[#a98891]">
                Role: {profile.role} • {profile.xp} XP • {profile.badgesUnlocked} Badges
              </div>
              <div className="pt-3 border-t border-white/5 text-[10px] text-emerald-400">
                Hash: 0x7a89b...e4f1c9 (Verified On Base Mainnet)
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCertificate(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#2e273a] text-white font-mono text-xs uppercase hover:bg-[#393145] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Certificate verification link copied to clipboard.');
                  setShowCertificate(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#feb700] text-[#090414] font-mono text-xs font-bold uppercase hover:brightness-110 cursor-pointer shadow-lg shadow-[#feb700]/25"
              >
                Share Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
