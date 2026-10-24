import React, { useState, useEffect, useCallback } from 'react';
import { BuilderProfile, GoogleUser } from '../types';
import { ShowcaseProject } from '../types/task';
import {
  getShowcaseProjects,
  saveShowcaseProject,
  toggleProjectUpvote,
} from '../utils/storage';

interface ShowcaseViewProps {
  profile: BuilderProfile;
  onOpenWallet: () => void;
  googleUser?: GoogleUser | null;
}

export const ShowcaseView: React.FC<ShowcaseViewProps> = ({ profile, onOpenWallet, googleUser }) => {
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/showcase');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          const mapped: ShowcaseProject[] = data.projects.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            authorHandle: p.authorHandle,
            authorWallet: p.authorWallet || 'Not Connected',
            techTags: p.techTags || [],
            githubUrl: p.githubUrl,
            liveDemoUrl: p.liveDemoUrl,
            upvotes: Number(p.upvotes) || 0,
            hasUpvoted: Boolean(p.hasUpvoted),
            createdAt: (p.createdAt || '').split('T')[0],
          }));
          setProjects(mapped);
        }
      }
    } catch {
      // offline fallback
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleUpvote = async (id: string) => {
    // Optimistic local update
    const updated = toggleProjectUpvote(id);
    setProjects(updated);

    if (googleUser) {
      try {
        await fetch(`/api/showcase/${id}/upvote`, { method: 'POST' });
        loadProjects();
      } catch {
        // fallback
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !githubUrl.trim()) return;

    if (profile.connectedWallet.address === 'Not Connected') {
      onOpenWallet();
      return;
    }

    const techTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

    const newProj: ShowcaseProject = {
      id: `proj-${Date.now()}`,
      title,
      description,
      authorHandle: profile.handle,
      authorWallet: profile.connectedWallet.address,
      techTags,
      githubUrl,
      liveDemoUrl: liveUrl || undefined,
      upvotes: 1,
      hasUpvoted: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    saveShowcaseProject(newProj);
    setProjects(getShowcaseProjects());

    try {
      await fetch('/api/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          techTags,
          githubUrl,
          liveDemoUrl: liveUrl || null,
          authorWallet: profile.connectedWallet.address,
        }),
      });
      loadProjects();
    } catch {
      // offline fallback
    }

    setIsSubmitOpen(false);
    setTitle('');
    setDescription('');
    setTags('');
    setGithubUrl('');
    setLiveUrl('');
  };

  const filtered = projects.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.techTags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full min-h-[calc(100vh-140px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#ff4799]/15">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#feb700] uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-[#feb700] animate-pulse" />
            <span>COMMUNITY PROOF-OF-BUILD</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Builder Project Showcase
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#e2bdc7] mt-1 max-w-2xl">
            Highlight your open-source projects, hackathon prototypes, and smart contract architectures. Upvote peer work and spark collaborations.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff4799] to-[#feb700] text-[#090414] font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#ff4799]/20 hover:brightness-110 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">rocket_launch</span>
          <span>Submit Project</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-8 max-w-md">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#a98891] text-sm">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, tags (e.g. ZK, Foundry, Base)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1b122b]/80 border border-white/10 text-white font-mono text-xs placeholder:text-[#a98891] focus:outline-none focus:border-[#feb700]"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {filtered.map((proj) => (
          <div
            key={proj.id}
            className="rounded-2xl bg-[#1f182b]/80 border border-[#ff4799]/20 hover:border-[#feb700]/50 p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {proj.techTags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full bg-[#ff4799]/15 text-[#ffb0c9] font-mono text-[10px] uppercase font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* 1-Line Upvote Button */}
                <button
                  onClick={() => handleUpvote(proj.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs transition-colors cursor-pointer ${
                    proj.hasUpvoted
                      ? 'bg-[#feb700] text-[#090414] font-bold shadow-md shadow-[#feb700]/25'
                      : 'bg-[#2e273a] text-[#e2bdc7] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">thumb_up</span>
                  <span>{proj.upvotes}</span>
                </button>
              </div>

              <h3 className="font-display font-bold text-xl text-white group-hover:text-[#feb700] transition-colors mb-2">
                {proj.title}
              </h3>

              <p className="font-sans text-xs text-[#e2bdc7] leading-relaxed mb-4">
                {proj.description}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 font-mono text-xs">
                <span className="text-[#a98891]">Author: {proj.authorHandle}</span>
                <span className="text-[#a98891]">{proj.createdAt}</span>
              </div>

              <div className="flex items-center gap-4 font-mono text-xs">
                <a
                  href={proj.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ff4799] hover:underline flex items-center gap-1.5 font-semibold"
                >
                  <img src="/assets/icons/github.svg" alt="GitHub" className="w-3.5 h-3.5 object-contain text-white" />
                  <span>GitHub Repository</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>

                {proj.liveDemoUrl && (
                  <a
                    href={proj.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#feb700] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Live Demo</span>
                    <span className="material-symbols-outlined text-xs">launch</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Submit Project */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#1a1128] border border-[#ff4799]/30 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-white">Showcase Your Project</h3>
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="text-[#a98891] hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[#a98891] uppercase block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Aegis ZK Rollup Verifier"
                  className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#ff4799]"
                />
              </div>

              <div>
                <label className="text-[#a98891] uppercase block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does it do? Key tech stack and novelty..."
                  className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#ff4799]"
                />
              </div>

              <div>
                <label className="text-[#a98891] uppercase block mb-1">
                  Tech Stack Tags (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Solidity, Rust, React, ZK"
                  className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#ff4799]"
                />
              </div>

              <div>
                <label className="text-[#a98891] uppercase block mb-1">GitHub Repo URL *</label>
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username/repo"
                  className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#ff4799]"
                />
              </div>

              <div>
                <label className="text-[#a98891] uppercase block mb-1">Live Demo URL</label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://yourproject.network"
                  className="w-full px-3 py-2 rounded-xl bg-[#110b1c] border border-white/10 text-white focus:outline-none focus:border-[#ff4799]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2e273a] text-white uppercase hover:bg-[#393145] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ff4799] to-[#feb700] text-[#090414] font-bold uppercase hover:brightness-110 cursor-pointer shadow-lg shadow-[#ff4799]/20"
                >
                  Publish Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
