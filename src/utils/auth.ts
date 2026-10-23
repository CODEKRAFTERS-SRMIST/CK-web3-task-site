/** Client-side auth helpers — thin wrappers over /api/auth/* */

import type { GoogleUser, BuilderProfile } from '../types';

export async function getGoogleUser(): Promise<GoogleUser | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getProfile(): Promise<BuilderProfile | null> {
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) return null;
    const data = await res.json();
    const { user, profile } = data;
    if (!profile) return null;
    return {
      handle:          profile.handle || user.email?.split('@')[0] || '',
      fullName:        user.full_name,
      bio:             profile.bio,
      domainInterest:  profile.domain_interest,
      role:            user.role,
      googleId:        user.id,
      email:           user.email,
      avatarUrl:       user.avatar_url,
      connectedWallet: {
        name:    profile.wallet_name || 'None',
        address: profile.wallet_address || 'Not Connected',
        network: 'Ethereum Mainnet (Chain ID: 1)',
        balance: '0.00 ETH',
        chainId: 1,
      },
      githubConnected: profile.github_connected || false,
      githubUsername:  profile.github_username || '',
      discordHandle:   profile.discord_handle || '',
      twitterHandle:   profile.twitter_handle || '',
      xp:              profile.xp || 0,
      soulboundId:     profile.soulbound_id || '#00000-S1',
      badgesUnlocked:  profile.badges_unlocked || 0,
      isMinted:        profile.is_minted || false,
    };
  } catch {
    return null;
  }
}

export async function saveProfile(profile: BuilderProfile): Promise<boolean> {
  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle:          profile.handle,
        bio:             profile.bio,
        domainInterest:  profile.domainInterest,
        discordHandle:   profile.discordHandle,
        twitterHandle:   profile.twitterHandle,
        githubUsername:  profile.githubUsername,
        githubConnected: profile.githubConnected,
        walletAddress:   profile.connectedWallet.address,
        walletName:      profile.connectedWallet.name,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function initiateGoogleLogin() {
  window.location.href = '/api/auth/google';
}

export function logout() {
  window.location.href = '/api/auth/logout';
}
