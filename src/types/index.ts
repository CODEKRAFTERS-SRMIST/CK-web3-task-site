export type ScreenType = 'landing' | 'join' | 'wallet' | 'tasks' | 'leaderboard' | 'showcase' | 'admin';

/** 4-tier RBAC: president assigns leads/heads; members are default */
export type GuildRole = 'member' | 'lead' | 'head' | 'president';

export type DomainInterest = 'Smart Contracts' | 'Frontend' | 'ZK' | 'Design' | 'DevOps';

export interface GoogleUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: GuildRole;
}

export interface BuilderProfile {
  handle: string;
  fullName?: string;
  bio?: string;
  domainInterest?: DomainInterest;
  role: GuildRole;
  googleId?: string;
  email?: string;
  avatarUrl?: string;
  connectedWallet: {
    name: string;
    address: string;
    fullAddress?: string;
    network: string;
    balance: string;
    chainId: number;
    signature?: string;
  };
  githubConnected: boolean;
  githubUsername: string;
  discordHandle: string;
  twitterHandle?: string;
  xp: number;
  soulboundId: string;
  badgesUnlocked: number;
  isMinted: boolean;
}

/** Role capability guard — use on client to show/hide UI elements */
export function canDo(role: GuildRole, action: 'create_task' | 'review' | 'admin' | 'assign_role'): boolean {
  const matrix: Record<typeof action, GuildRole[]> = {
    create_task: ['lead', 'head', 'president'],
    review:      ['lead', 'head', 'president'],
    admin:       ['head', 'president'],
    assign_role: ['president'],
  };
  return matrix[action].includes(role);
}

export const ROLE_LABELS: Record<GuildRole, string> = {
  member:    'Club Member',
  lead:      'Campus Lead',
  head:      'Core Dev Head',
  president: 'President',
};

