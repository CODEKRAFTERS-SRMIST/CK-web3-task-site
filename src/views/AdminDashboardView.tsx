import React, { useState, useEffect, useCallback } from 'react';
import { GoogleUser, GuildRole, ROLE_LABELS, canDo } from '../types';

interface AdminDashboardViewProps {
  googleUser: GoogleUser | null;
}

interface Member {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: GuildRole;
  created_at: string;
  handle: string;
  xp: number;
  badges_unlocked: number;
  is_minted: boolean;
  wallet_address: string;
}

interface Stats {
  total_members: number;
  total_leads: number;
  total_heads: number;
  total_presidents: number;
  total_users: number;
  total_xp: number;
  minted_count: number;
}

const ROLE_COLORS: Record<GuildRole, string> = {
  member:    'bg-[#2e273a] text-[#e2bdc7] border-white/10',
  lead:      'bg-[#feb700]/15 text-[#feb700] border-[#feb700]/30',
  head:      'bg-[#ff4799]/15 text-[#ff4799] border-[#ff4799]/30',
  president: 'bg-gradient-to-r from-[#feb700]/20 to-[#ff4799]/20 text-white border-[#feb700]/40',
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ googleUser }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, GuildRole>>({});
  const [toast, setToast] = useState<string | null>(null);

  const isPresident = googleUser?.role === 'president';
  const canViewAdmin = googleUser && canDo(googleUser.role, 'admin');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [membersRes, statsRes] = await Promise.all([
      fetch(`/api/admin/members?page=${page}`),
      fetch('/api/admin/stats'),
    ]);
    if (membersRes.ok) {
      const data = await membersRes.json();
      setMembers(data.members);
      setTotal(data.total);
    }
    if (statsRes.ok) setStats(await statsRes.json());
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAssignRole = async (targetUserId: string) => {
    const newRole = selectedRoles[targetUserId];
    if (!newRole || !['lead', 'head'].includes(newRole)) return;
    setAssigning(targetUserId);
    const res = await fetch('/api/admin/assign-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, newRole }),
    });
    if (res.ok) {
      setMembers(prev => prev.map(m => m.id === targetUserId ? { ...m, role: newRole } : m));
      showToast(`Role updated → ${ROLE_LABELS[newRole]}`);
    } else {
      showToast('Failed to assign role');
    }
    setAssigning(null);
  };

  if (!canViewAdmin) {
    return (
      <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <span className="material-symbols-outlined text-5xl text-[#ff4799]">lock</span>
          <p className="font-mono text-xs text-[#e2bdc7] uppercase tracking-widest">Access Restricted</p>
          <p className="font-sans text-sm text-[#a98891]">Head or President role required.</p>
        </div>
      </div>
    );
  }

  const LIMIT = 20;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="w-full min-h-[calc(100vh-140px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 font-mono text-xs text-[#ffb0c9] tracking-widest uppercase mb-2">
          <span className="material-symbols-outlined text-sm text-[#ff4799]">admin_panel_settings</span>
          <span>ADMIN DASHBOARD</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
          Guild <span className="text-[#ff4799]">Control</span>{' '}
          <span className="text-[#feb700]">Center</span>
        </h1>
        <p className="font-sans text-sm text-[#e2bdc7] mt-2">
          Monitor members · Assign roles · Track guild XP
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Members Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl bg-[#1b122b]/80 border border-[#ff4799]/20 p-5 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff4799]">group</span>
                <h2 className="font-display font-bold text-lg text-white">All Members</h2>
                <span className="font-mono text-xs text-[#ffb0c9] px-2 py-0.5 rounded-full bg-[#ff4799]/10">
                  {total} total
                </span>
              </div>
              <button
                onClick={fetchData}
                className="p-2 rounded-lg bg-[#2e273a] hover:bg-[#393145] transition-colors cursor-pointer"
                title="Refresh"
              >
                <span className="material-symbols-outlined text-sm text-[#e2bdc7]">refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined text-3xl text-[#feb700] animate-spin">sync</span>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="rounded-xl bg-[#110b1c]/80 border border-white/5 p-4 hover:border-[#ff4799]/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[#2e273a] flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-lg text-[#e2bdc7]">person</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-sm text-white truncate">
                            {member.full_name || 'Anonymous'}
                          </span>
                          {member.handle && (
                            <span className="font-mono text-xs text-[#feb700]">@{member.handle}</span>
                          )}
                          {/* Role badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${ROLE_COLORS[member.role]}`}>
                            {member.role === 'president' && (
                              <span className="material-symbols-outlined text-[10px] mr-0.5">workspace_premium</span>
                            )}
                            {ROLE_LABELS[member.role]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-[#a98891]">
                          <span>{member.email}</span>
                          <span>·</span>
                          <span className="text-[#feb700]">{member.xp ?? 0} XP</span>
                          {member.is_minted && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-400 flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[10px]">verified</span>
                                Minted
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Role assignment (president only) */}
                      {isPresident && member.role !== 'president' && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <select
                            value={selectedRoles[member.id] || member.role}
                            onChange={e => setSelectedRoles(prev => ({ ...prev, [member.id]: e.target.value as GuildRole }))}
                            className="px-2 py-1.5 rounded-lg bg-[#1b122b] border border-[#ff4799]/30 text-xs font-mono text-white focus:outline-none cursor-pointer"
                          >
                            <option value="member">Member</option>
                            <option value="lead">Lead</option>
                            <option value="head">Head</option>
                          </select>
                          <button
                            onClick={() => handleAssignRole(member.id)}
                            disabled={assigning === member.id || selectedRoles[member.id] === member.role || !selectedRoles[member.id]}
                            className="px-3 py-1.5 rounded-lg bg-[#ff4799]/20 hover:bg-[#ff4799]/30 border border-[#ff4799]/30 text-[#ffb0c9] text-xs font-mono uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            {assigning === member.id ? (
                              <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                            ) : 'Assign'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-[#2e273a] text-xs font-mono text-white disabled:opacity-40 cursor-pointer hover:bg-[#393145] transition-colors"
                >
                  ← Prev
                </button>
                <span className="font-mono text-xs text-[#e2bdc7]">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-[#2e273a] text-xs font-mono text-white disabled:opacity-40 cursor-pointer hover:bg-[#393145] transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Stats Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Stats */}
          <div className="rounded-2xl bg-[#1b122b]/80 border border-[#ff4799]/20 p-5 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <span className="material-symbols-outlined text-[#feb700]">bar_chart</span>
              <h3 className="font-display font-bold text-sm text-white">Guild Stats</h3>
            </div>

            {stats ? (
              <div className="space-y-3">
                {[
                  { label: 'Total Members', value: stats.total_members, icon: 'person', color: 'text-[#e2bdc7]' },
                  { label: 'Active Leads', value: stats.total_leads, icon: 'flag', color: 'text-[#feb700]' },
                  { label: 'Active Heads', value: stats.total_heads, icon: 'admin_panel_settings', color: 'text-[#ff4799]' },
                  { label: 'Total Guild XP', value: Number(stats.total_xp).toLocaleString(), icon: 'bolt', color: 'text-[#fbabff]' },
                  { label: 'Minted Passports', value: stats.minted_count, icon: 'verified', color: 'text-emerald-400' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-[#110b1c]/80 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${s.color}`}>{s.icon}</span>
                      <span className="font-mono text-xs text-[#a98891] uppercase tracking-wider">{s.label}</span>
                    </div>
                    <span className={`font-display font-bold text-sm ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <span className="material-symbols-outlined text-2xl text-[#feb700] animate-spin">sync</span>
              </div>
            )}
          </div>

          {/* Role Legend */}
          <div className="rounded-2xl bg-[#1b122b]/80 border border-white/10 p-5">
            <h3 className="font-display font-bold text-sm text-white mb-3">Role Hierarchy</h3>
            <div className="space-y-2 text-xs font-mono">
              {(['president', 'head', 'lead', 'member'] as GuildRole[]).map(r => (
                <div key={r} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${ROLE_COLORS[r]}`}>
                  <div className="flex items-center gap-1.5">
                    {r === 'president' && <span className="material-symbols-outlined text-xs">workspace_premium</span>}
                    <span className="uppercase tracking-wider">{ROLE_LABELS[r]}</span>
                  </div>
                  <span className="opacity-60 text-[10px]">
                    {r === 'president' ? 'Assigns leads/heads' :
                     r === 'head' ? 'Reviews + Admin' :
                     r === 'lead' ? 'Creates tasks' : 'Completes tasks'}
                  </span>
                </div>
              ))}
            </div>
            {isPresident && (
              <p className="mt-3 font-mono text-[10px] text-[#a98891] leading-relaxed">
                As President, use inline dropdowns to assign Lead or Head roles. President role is bootstrapped via database.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 right-8 z-50 px-5 py-3 rounded-xl bg-[#110b1c] border border-[#feb700] text-[#feb700] font-mono text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-sm">verified</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};
