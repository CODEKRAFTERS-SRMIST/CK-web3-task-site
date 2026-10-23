import { GuildTask, TaskSubmission, ShowcaseProject } from '../types/task';

// ponytail: Single lightweight local storage manager. No Redux, no Zustand, no external db.
const STORAGE_KEYS = {
  TASKS: 'codekrafters_tasks',
  SUBMISSIONS: 'codekrafters_submissions',
  SHOWCASE: 'codekrafters_showcase',
};

const DEFAULT_TASKS: GuildTask[] = [
  {
    id: 'task-101',
    title: 'ERC-4337 Smart Account Session Key Module',
    description: 'Implement a modular session key validator contract in Solidity using ERC-4337 account abstraction standards to allow automated micro-transactions without master key exposure.',
    requirements: [
      'Write SessionValidationModule adhering to ERC-4337',
      'Include NatSpec and unit test suite with 100% coverage',
      'Deploy testnet verification script on Sepolia or Base',
    ],
    track: 'Solidity',
    difficulty: 'Advanced',
    xpReward: 500,
    tokenReward: '150 USDC',
    deadline: '2026-11-15',
    authorLead: 'alex.eth (Smart Contract Lead)',
    status: 'Open',
    submissionsCount: 2,
  },
  {
    id: 'task-102',
    title: 'Circom Groth16 Zero-Knowledge Membership Circuit',
    description: 'Construct a Circom circuit proving a user belongs to a Merkle tree of verified developers without revealing their public address or identity.',
    requirements: [
      'Poseidon hash tree with depth 16',
      'Generate zkey and export browser verifier wasm',
      'Write quick benchmark proving generation under 1.5s',
    ],
    track: 'ZK',
    difficulty: 'Advanced',
    xpReward: 650,
    tokenReward: '200 USDC',
    deadline: '2026-11-20',
    authorLead: 'elena.zk (ZK Research Lead)',
    status: 'In Progress',
    submissionsCount: 1,
  },
  {
    id: 'task-103',
    title: 'Lightweight EIP-6963 Multi-Injected Wallet Discovery',
    description: 'Create a clean React hook supporting the EIP-6963 provider announcement standard so users with multiple installed wallets (Rabby, MetaMask, Brave) can pick their favorite without clashes.',
    requirements: [
      'Listen to eip6963:announceProvider events',
      'Expose icon, provider name, and uuid',
      'No external Web3 libraries required',
    ],
    track: 'React',
    difficulty: 'Intermediate',
    xpReward: 350,
    tokenReward: '100 USDC',
    deadline: '2026-11-05',
    authorLead: 'devin.eth (Core Dev Lead)',
    status: 'Open',
    submissionsCount: 3,
  },
  {
    id: 'task-104',
    title: 'Cyberpunk Web3 Guild Terminal Theme & Shader',
    description: 'Design responsive dark-mode high contrast UI tokens with glassmorphic cards and subtle WebGL ambient background for member portals.',
    requirements: [
      'Tailwind CSS tokens + accessible contrast ratios',
      'Mobile-first responsive drawer',
      'Design specs exported in Figma or HTML prototype',
    ],
    track: 'UI/UX',
    difficulty: 'Beginner',
    xpReward: 200,
    deadline: '2026-11-01',
    authorLead: 'sarah.design (Design Lead)',
    status: 'Open',
    submissionsCount: 0,
  },
];

const DEFAULT_PROJECTS: ShowcaseProject[] = [
  {
    id: 'proj-1',
    title: 'Aegis ZK-Rollup Proof Verifier',
    description: 'Ultra-fast browser-side SNARK verifier enabling instant verification of optimistic batches with recursive proofs.',
    authorHandle: 'satoshi.eth',
    authorWallet: '0x38F2...9a12',
    techTags: ['ZK', 'Rust', 'Wasm', 'Solidity'],
    githubUrl: 'https://github.com/codekrafters/aegis-zk',
    liveDemoUrl: 'https://aegis-verifier.network',
    upvotes: 42,
    hasUpvoted: false,
    createdAt: '2026-10-18',
  },
  {
    id: 'proj-2',
    title: 'DeFi Autonomous Yield Optimizer on Base',
    description: 'Non-custodial smart contracts routing liquidity between Aerodrome and Compound pools based on volatility oracle feeds.',
    authorHandle: 'vitalik_fan',
    authorWallet: '0x7129...8B41',
    techTags: ['Solidity', 'Foundry', 'Chainlink', 'Base'],
    githubUrl: 'https://github.com/codekrafters/base-yield-bot',
    liveDemoUrl: 'https://base-yield-bot.app',
    upvotes: 28,
    hasUpvoted: false,
    createdAt: '2026-10-20',
  },
];

export function getGuildTasks(): GuildTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
      return DEFAULT_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveGuildTask(task: GuildTask): void {
  const tasks = getGuildTasks();
  const existingIdx = tasks.findIndex((t) => t.id === task.id);
  if (existingIdx >= 0) {
    tasks[existingIdx] = task;
  } else {
    tasks.unshift(task);
  }
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function getTaskSubmissions(): TaskSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTaskSubmission(submission: TaskSubmission): void {
  const subs = getTaskSubmissions();
  subs.unshift(submission);
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(subs));

  // Increment task submissions count
  const tasks = getGuildTasks();
  const task = tasks.find((t) => t.id === submission.taskId);
  if (task) {
    task.submissionsCount = (task.submissionsCount || 0) + 1;
    task.status = 'Under Review';
    saveGuildTask(task);
  }
}

export function updateSubmissionStatus(
  submissionId: string,
  status: TaskSubmission['status'],
  feedback?: string
): void {
  const subs = getTaskSubmissions();
  const sub = subs.find((s) => s.id === submissionId);
  if (sub) {
    sub.status = status;
    if (feedback) sub.feedback = feedback;
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(subs));
  }
}

export function getShowcaseProjects(): ShowcaseProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOWCASE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SHOWCASE, JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function toggleProjectUpvote(projectId: string): ShowcaseProject[] {
  const list = getShowcaseProjects();
  const updated = list.map((p) => {
    if (p.id === projectId) {
      const isUp = !p.hasUpvoted;
      return {
        ...p,
        hasUpvoted: isUp,
        upvotes: isUp ? p.upvotes + 1 : Math.max(0, p.upvotes - 1),
      };
    }
    return p;
  });
  localStorage.setItem(STORAGE_KEYS.SHOWCASE, JSON.stringify(updated));
  return updated;
}

export function saveShowcaseProject(project: ShowcaseProject): void {
  const list = getShowcaseProjects();
  list.unshift(project);
  localStorage.setItem(STORAGE_KEYS.SHOWCASE, JSON.stringify(list));
}
