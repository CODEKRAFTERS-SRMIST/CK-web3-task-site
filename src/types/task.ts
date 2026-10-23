export type DomainTrack = 'Solidity' | 'Rust' | 'React' | 'UI/UX' | 'ZK' | 'DevOps' | 'Smart Contracts' | 'Frontend' | 'Design';

export type TaskDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type TaskStatus = 'Open' | 'In Progress' | 'Under Review' | 'Completed';

export interface TaskSubmission {
  id: string;
  taskId: string;
  builderHandle: string;
  builderWallet: string;
  githubPrUrl: string;
  demoUrl?: string;
  notes: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Revision Requested' | 'Rejected';
  feedback?: string;
}

export interface GuildTask {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  track: DomainTrack;
  difficulty: TaskDifficulty;
  xpReward: number;
  tokenReward?: string;
  deadline: string;
  authorLead: string;
  status: TaskStatus;
  submissionsCount: number;
}

export interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  authorHandle: string;
  authorWallet: string;
  techTags: string[];
  githubUrl: string;
  liveDemoUrl?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  createdAt: string;
}
