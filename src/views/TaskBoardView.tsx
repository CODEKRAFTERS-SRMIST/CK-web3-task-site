import React, { useState, useEffect, useCallback } from 'react';
import { BuilderProfile, GoogleUser, canDo, ROLE_LABELS } from '../types';
import {
  GuildTask,
  DomainTrack,
  TaskDifficulty,
  TaskStatus,
  TaskSubmission,
} from '../types/task';
import {
  getGuildTasks,
  saveGuildTask,
  getTaskSubmissions,
  saveTaskSubmission,
  updateSubmissionStatus,
} from '../utils/storage';

interface TaskBoardViewProps {
  profile: BuilderProfile;
  setProfile: React.Dispatch<React.SetStateAction<BuilderProfile>>;
  onOpenWallet: () => void;
  googleUser?: GoogleUser | null;
}

const TRACKS: (DomainTrack | 'All')[] = [
  'All',
  'Solidity',
  'Rust',
  'React',
  'UI/UX',
  'ZK',
  'DevOps',
];
const DIFFICULTIES: (TaskDifficulty | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const STATUSES: (TaskStatus | 'All')[] = ['All', 'Open', 'In Progress', 'Under Review', 'Completed'];

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({
  profile,
  setProfile,
  onOpenWallet,
  googleUser,
}) => {
  const userRole = googleUser?.role || profile.role || 'member';
  const canCreate = canDo(userRole, 'create_task');
  const canReview = canDo(userRole, 'review');

  const [tasks, setTasks] = useState<GuildTask[]>(getGuildTasks());
  const [submissions, setSubmissions] = useState<TaskSubmission[]>(getTaskSubmissions());
  const [selectedTrack, setSelectedTrack] = useState<DomainTrack | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<TaskDifficulty | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      const taskRes = await fetch('/api/tasks');
      if (taskRes.ok) {
        const data = await taskRes.json();
        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          setTasks(data.tasks);
        }
      }
    } catch {
      // fallback to local tasks
    }

    if (googleUser) {
      try {
        const subRes = await fetch('/api/tasks/submissions');
        if (subRes.ok) {
          const data = await subRes.json();
          if (Array.isArray(data.submissions)) {
            const mapped: TaskSubmission[] = data.submissions.map((s: any) => ({
              id: s.id,
              taskId: s.taskId,
              builderHandle: s.handle,
              builderWallet: s.walletAddress || '',
              githubPrUrl: s.prUrl,
              demoUrl: s.demoUrl,
              notes: s.notes || '',
              submittedAt: (s.submittedAt || '').split('T')[0],
              status: s.status,
              feedback: s.feedback,
            }));
            setSubmissions(mapped);
          }
        }
      } catch {
        // fallback
      }
    }
  }, [googleUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Modals state
  const [submittingTask, setSubmittingTask] = useState<GuildTask | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [reviewingTask, setReviewingTask] = useState<GuildTask | null>(null);

  // Form states
  const [prUrl, setPrUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskTrack, setNewTaskTrack] = useState<DomainTrack>('Solidity');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<TaskDifficulty>('Intermediate');
  const [newTaskXp, setNewTaskXp] = useState<number>(300);
  const [newTaskToken, setNewTaskToken] = useState<string>('100 USDC');
  const [newTaskDeadline, setNewTaskDeadline] = useState<string>('2026-11-30');
  const [newTaskReqs, setNewTaskReqs] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedTrack !== 'All' && t.track !== selectedTrack) return false;
    if (selectedDifficulty !== 'All' && t.difficulty !== selectedDifficulty) return false;
    if (selectedStatus !== 'All' && t.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.track.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingTask) return;

    if (profile.connectedWallet.address === 'Not Connected') {
      onOpenWallet();
      return;
    }

    try {
      new URL(prUrl);
    } catch {
      showToast('Error: Please enter a valid GitHub PR URL.');
      return;
    }

    const sub: TaskSubmission = {
      id: `sub-${Date.now()}`,
      taskId: submittingTask.id,
      builderHandle: profile.handle,
      builderWallet: profile.connectedWallet.address,
      githubPrUrl: prUrl,
      demoUrl: demoUrl || undefined,
      notes: submissionNotes,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };

    saveTaskSubmission(sub);
    setSubmissions(getTaskSubmissions());

    try {
      await fetch(`/api/tasks/${submittingTask.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prUrl,
          demoUrl: demoUrl || null,
          notes: submissionNotes || null,
          walletAddress: profile.connectedWallet.address,
        }),
      });
      loadData();
    } catch {
      // offline fallback applied
    }

    setTasks(getGuildTasks());
    setSubmittingTask(null);
    setPrUrl('');
    setDemoUrl('');
    setSubmissionNotes('');
    showToast('Proof-of-work submitted! Domain Lead will review.');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) {
      showToast('Unauthorized: Only Leads, Heads, or President can post tasks');
      return;
    }
    if (!newTaskTitle.trim()) return;

    const task: GuildTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDesc,
      requirements: newTaskReqs
        ? newTaskReqs.split('\n').filter((r) => r.trim().length > 0)
        : ['Deliver working implementation and test suite.'],
      track: newTaskTrack,
      difficulty: newTaskDifficulty,
      xpReward: Number(newTaskXp) || 250,
      tokenReward: newTaskToken || undefined,
      deadline: newTaskDeadline,
      authorLead: `${profile.handle} (${profile.role})`,
      status: 'Open',
      submissionsCount: 0,
    };

    saveGuildTask(task);
    setTasks(getGuildTasks());

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          requirements: task.requirements,
          track: newTaskTrack,
          difficulty: newTaskDifficulty,
          xpReward: task.xpReward,
          tokenReward: newTaskToken,
          deadline: newTaskDeadline,
        }),
      });
      loadData();
    } catch {
      // offline fallback applied
    }

    setIsCreatingTask(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskReqs('');
    showToast('New guild task published to task board!');
  };

  const handleApproveSubmission = async (sub: TaskSubmission, task: GuildTask) => {
    updateSubmissionStatus(sub.id, 'Approved', 'Approved! XP awarded to builder.');
    setSubmissions(getTaskSubmissions());

    try {
      await fetch(`/api/tasks/submissions/${sub.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved', feedback: 'Approved by Domain Lead' }),
      });
      loadData();
    } catch {
      // offline fallback applied
    }

    // Award XP to builder
    setProfile((prev) => ({
      ...prev,
      xp: prev.xp + task.xpReward,
      badgesUnlocked: prev.badgesUnlocked + 1,
    }));

    showToast(`Submission approved! +${task.xpReward} XP awarded.`);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2e183b] border border-[#feb700] text-[#feb700] font-mono text-xs shadow-2xl animate-bounce">
          <span className="material-symbols-outlined text-sm">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Lead Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#ff4799]/15">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#feb700] tracking-widest uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-[#feb700] animate-pulse" />
            <span>DOMAIN WORK ENGINE</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Guild Task Board &amp; Bounties
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#e2bdc7] mt-1 max-w-2xl">
            Pick up live tasks across Solidity, ZK, Rust, and Frontend. Submit cryptographic proof of work, earn verifiable XP, and claim token bounties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canCreate ? (
            <button
              onClick={() => setIsCreatingTask(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff4799] to-[#feb700] text-[#090414] font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#ff4799]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Post New Task</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#231c2f]/80 border border-white/5 font-mono text-[11px] text-[#a98891]">
              <span className="material-symbols-outlined text-sm text-[#feb700]">lock</span>
              <span>Posting requires Lead or Head role</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Domain Track Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {TRACKS.map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedTrack === track
                    ? 'bg-[#ff4799] text-white font-bold shadow-md shadow-[#ff4799]/30'
                    : 'bg-[#1b122b]/80 text-[#e2bdc7] hover:text-white border border-white/5'
                }`}
              >
                {track}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#a98891] text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, keywords..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1b122b]/80 border border-white/10 text-white font-mono text-xs placeholder:text-[#a98891] focus:outline-none focus:border-[#feb700]"
            />
          </div>
        </div>

        {/* Secondary Filter: Difficulty & Status */}
        <div className="flex items-center gap-4 text-xs font-mono text-[#e2bdc7] flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[#a98891]">Difficulty:</span>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`px-2.5 py-1 rounded-md text-[11px] ${
                  selectedDifficulty === d
                    ? 'bg-[#feb700] text-[#090414] font-bold'
                    : 'bg-[#231c2f] text-[#e2bdc7] hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#a98891]">Status:</span>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] ${
                  selectedStatus === s
                    ? 'bg-[#e14ef6] text-white font-bold'
                    : 'bg-[#231c2f] text-[#e2bdc7] hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#a98891] font-mono text-xs bg-[#1b122b]/50 rounded-2xl border border-white/5">
            No guild tasks match your filter criteria.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl bg-[#1f182b]/80 border border-[#ff4799]/20 hover:border-[#feb700]/50 p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4799]/5 rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ff4799]/15 text-[#ffb0c9] font-mono text-[10px] tracking-wider uppercase font-bold">
                      {task.track}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] tracking-wider uppercase font-semibold ${
                        task.difficulty === 'Beginner'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : task.difficulty === 'Intermediate'
                          ? 'bg-[#feb700]/15 text-[#feb700]'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {task.difficulty}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
                      task.status === 'Open'
                        ? 'text-emerald-400'
                        : task.status === 'In Progress'
                        ? 'text-[#feb700]'
                        : 'text-[#e14ef6]'
                    }`}
                  >
                    • {task.status}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-white group-hover:text-[#feb700] transition-colors mb-2">
                  {task.title}
                </h3>

                <p className="font-sans text-xs text-[#e2bdc7] leading-relaxed mb-4 line-clamp-3">
                  {task.description}
                </p>

                {/* Requirements list */}
                <div className="mb-4 space-y-1 bg-[#110b1c]/60 p-3 rounded-xl border border-white/5">
                  <span className="font-mono text-[10px] text-[#a98891] uppercase tracking-wider block mb-1">
                    Requirements
                  </span>
                  {task.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] font-sans text-[#e2bdc7]">
                      <span className="text-[#feb700]">•</span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 font-mono text-xs">
                  <div>
                    <span className="text-[#a98891] text-[10px] uppercase block">REWARDS</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[#feb700] font-bold">+{task.xpReward} XP</span>
                      {task.tokenReward && (
                        <span className="text-white font-semibold">• {task.tokenReward}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[#a98891] text-[10px] uppercase block">DEADLINE</span>
                    <span className="text-[#e2bdc7] font-semibold mt-0.5 block">
                      {task.deadline}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-mono text-[#a98891] truncate">
                    Lead: {task.authorLead}
                  </span>

                  <div className="flex items-center gap-2">
                    {canReview && submissions.some((s) => s.taskId === task.id) && (
                      <button
                        onClick={() => setReviewingTask(task)}
                        className="px-3 py-1.5 rounded-lg bg-[#2e273a] hover:bg-[#393145] text-[#feb700] font-mono text-xs uppercase cursor-pointer"
                      >
                        Review ({submissions.filter((s) => s.taskId === task.id).length})
                      </button>
                    )}

                    <button
                      onClick={() => setSubmittingTask(task)}
                      className="px-4 py-1.5 rounded-lg bg-[#ff4799] hover:brightness-110 text-white font-mono text-xs uppercase font-bold cursor-pointer"
                    >
                      Submit PoW
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Submit Proof-of-Work */}
      {submittingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#1a1128] border border-[#ff4799]/30 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-[10px] text-[#feb700] uppercase tracking-widest">
                  PROOF-OF-WORK SUBMISSION
                </span>
                <h3 className="font-display font-bold text-lg text-white">
                  {submittingTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSubmittingTask(null)}
                className="text-[#a98891] hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[#a98891] uppercase tracking-wider block mb-1">
                  GitHub Pull Request URL *
                </label>
                <input
                  type="url"
                  required
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  placeholder="https://github.com/codekrafters/repo/pull/1"
                  className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#ff4799]"
                />
              </div>

              <div>
                <label className="text-[#a98891] uppercase tracking-wider block mb-1">
                  Live Demo / Testnet Deployment URL (Optional)
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://demo.app or contract explorer link"
                  className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#ff4799]"
                />
              </div>

              <div>
                <label className="text-[#a98891] uppercase tracking-wider block mb-1">
                  Implementation Notes &amp; Cryptographic Proof
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Detail contract deployment addresses, test output summary, or key architectural decisions..."
                  className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#ff4799]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#110b1c]/60 border border-white/5 text-[11px] text-[#e2bdc7]">
                <div className="flex justify-between">
                  <span className="text-[#a98891]">Submitting Builder:</span>
                  <span className="text-white font-bold">{profile.handle}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[#a98891]">Payout Wallet:</span>
                  <span className="text-[#feb700]">{profile.connectedWallet.address}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingTask(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2e273a] text-white uppercase hover:bg-[#393145] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ff4799] to-[#feb700] text-[#090414] font-bold uppercase hover:brightness-110 cursor-pointer shadow-lg shadow-[#ff4799]/20"
                >
                  Submit Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Post New Task (Leads / Heads) */}
      {isCreatingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#1a1128] border border-[#feb700]/30 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-white">Create Domain Task</h3>
              <button
                onClick={() => setIsCreatingTask(false)}
                className="text-[#a98891] hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[#a98891] uppercase block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement ZK Snark Verifier contract"
                  className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#feb700]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#a98891] uppercase block mb-1">Track</label>
                  <select
                    value={newTaskTrack}
                    onChange={(e) => setNewTaskTrack(e.target.value as DomainTrack)}
                    className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#feb700]"
                  >
                    {TRACKS.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#a98891] uppercase block mb-1">Difficulty</label>
                  <select
                    value={newTaskDifficulty}
                    onChange={(e) => setNewTaskDifficulty(e.target.value as TaskDifficulty)}
                    className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#feb700]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#a98891] uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Detailed context and deliverables..."
                  className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#feb700]"
                />
              </div>

              <div>
                <label className="text-[#a98891] uppercase block mb-1">
                  Requirements (1 per line)
                </label>
                <textarea
                  rows={2}
                  value={newTaskReqs}
                  onChange={(e) => setNewTaskReqs(e.target.value)}
                  placeholder="Smart contract deployed to Sepolia&#10;Unit tests passing&#10;Verified source code"
                  className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#feb700]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#a98891] uppercase block mb-1">XP Reward</label>
                  <input
                    type="number"
                    value={newTaskXp}
                    onChange={(e) => setNewTaskXp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#feb700]"
                  >
                  </input>
                </div>
                <div>
                  <label className="text-[#a98891] uppercase block mb-1">Token Bounty</label>
                  <input
                    type="text"
                    value={newTaskToken}
                    onChange={(e) => setNewTaskToken(e.target.value)}
                    placeholder="e.g. 150 USDC"
                    className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#feb700]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTask(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2e273a] text-white uppercase hover:bg-[#393145] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#feb700] text-[#090414] font-bold uppercase hover:brightness-110 cursor-pointer shadow-lg shadow-[#feb700]/20"
                >
                  Publish Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Review Submissions for a Task */}
      {reviewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#1a1128] border border-white/15 p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-[10px] text-[#feb700] uppercase tracking-widest">
                  LEAD REVIEW PORTAL
                </span>
                <h3 className="font-display font-bold text-lg text-white">
                  Submissions: {reviewingTask.title}
                </h3>
              </div>
              <button
                onClick={() => setReviewingTask(null)}
                className="text-[#a98891] hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {submissions.filter((s) => s.taskId === reviewingTask.id).length === 0 ? (
                <div className="py-8 text-center text-[#a98891] font-mono text-xs">
                  No submissions yet for this task.
                </div>
              ) : (
                submissions
                  .filter((s) => s.taskId === reviewingTask.id)
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl bg-[#110b1c] border border-white/10 space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#feb700] font-bold">{sub.builderHandle}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sub.status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-[#feb700]/20 text-[#feb700]'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#e2bdc7]">
                        <span className="text-[#a98891]">PR: </span>
                        <a
                          href={sub.githubPrUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#ff4799] underline"
                        >
                          {sub.githubPrUrl}
                        </a>
                      </div>

                      {sub.demoUrl && (
                        <div className="text-[11px] text-[#e2bdc7]">
                          <span className="text-[#a98891]">Demo: </span>
                          <a
                            href={sub.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#feb700] underline"
                          >
                            {sub.demoUrl}
                          </a>
                        </div>
                      )}

                      {sub.notes && (
                        <p className="text-[11px] font-sans text-[#e2bdc7]/80 bg-[#1b122b] p-2.5 rounded-lg">
                          {sub.notes}
                        </p>
                      )}

                      {sub.status === 'Pending' && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleApproveSubmission(sub, reviewingTask)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold uppercase cursor-pointer hover:bg-emerald-600"
                          >
                            Approve &amp; Award XP
                          </button>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
