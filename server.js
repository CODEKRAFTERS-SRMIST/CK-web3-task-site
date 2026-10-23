/**
 * CodeKrafters API Server
 * Google OAuth2 + NeonDB profiles + RBAC admin endpoints
 */
import express from 'express';
import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const sql = neon(process.env.NEON_DATABASE_URL);
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-prod';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const getCallbackUrl = (req) => {
  const host = req ? (req.headers['x-forwarded-host'] || req.headers.host) : null;
  const proto = req ? (req.headers['x-forwarded-proto'] || 'https') : 'https';
  const base = process.env.APP_URL || (host ? `${proto}://${host}` : 'http://localhost:3000');
  return `${base}/api/auth/callback`;
};

// ─── Cookie helpers ───────────────────────────────────────────────────────────
function signCookie(userId) {
  const ts = Date.now();
  const payload = `${userId}:${ts}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

function verifyCookie(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [userId, ts, sig] = decoded.split(':');
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(`${userId}:${ts}`).digest('hex');
    if (sig !== expected) return null;
    if (Date.now() - Number(ts) > 7 * 24 * 3600 * 1000) return null; // 7-day expiry
    return userId;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(raw.split(';').map(c => c.trim().split('=').map(decodeURIComponent)));
}

// ─── Auth middleware ──────────────────────────────────────────────────────────
async function requireAuth(req, res, next) {
  const cookies = parseCookies(req);
  const userId = cookies.ck_session ? verifyCookie(cookies.ck_session) : null;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const [user] = await sql`SELECT * FROM users WHERE id = ${userId}`;
  if (!user) return res.status(401).json({ error: 'User not found' });
  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────
app.get('/api/auth/google', (req, res) => {
  const redirectUri = getCallbackUrl(req);
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'No code' });
  const redirectUri = getCallbackUrl(req);

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const tokens = await tokenRes.json();
  if (!tokens.access_token) {
    console.error('Google OAuth token error:', tokens);
    return res.status(400).json({ error: 'Token exchange failed', details: tokens });
  }

  // Fetch Google userinfo
  const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const info = await infoRes.json();

  // Upsert user in NeonDB
  await sql`
    INSERT INTO users (id, email, full_name, avatar_url)
    VALUES (${info.sub}, ${info.email}, ${info.name}, ${info.picture})
    ON CONFLICT (id) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          avatar_url = EXCLUDED.avatar_url
  `;

  // Ensure profile row exists
  await sql`
    INSERT INTO profiles (user_id, soulbound_id)
    VALUES (${info.sub}, ${`#${Math.floor(10000 + Math.random() * 89999)}-S1`})
    ON CONFLICT (user_id) DO NOTHING
  `;

  const cookie = signCookie(info.sub);
  const isSecure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  res.setHeader('Set-Cookie', `ck_session=${cookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${isSecure ? '; Secure' : ''}`);
  res.redirect('/?loggedIn=1');
});

app.get('/api/auth/me', async (req, res) => {
  const cookies = parseCookies(req);
  const userId = cookies.ck_session ? verifyCookie(cookies.ck_session) : null;
  if (!userId) return res.status(401).json({ error: 'Not logged in' });
  const [user] = await sql`SELECT id, email, full_name, avatar_url, role FROM users WHERE id = ${userId}`;
  if (!user) return res.status(401).json({ error: 'User not found' });
  res.json(user);
});

app.get('/api/auth/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'ck_session=; Path=/; HttpOnly; Max-Age=0');
  res.redirect('/');
});

// ─── Profile endpoints ────────────────────────────────────────────────────────
app.get('/api/profile', requireAuth, async (req, res) => {
  const [profile] = await sql`SELECT * FROM profiles WHERE user_id = ${req.user.id}`;
  res.json({ user: req.user, profile: profile || null });
});

app.post('/api/profile', requireAuth, async (req, res) => {
  const {
    handle, bio, domainInterest, discordHandle, twitterHandle,
    githubUsername, githubConnected, walletAddress, walletName,
  } = req.body;

  await sql`
    INSERT INTO profiles (user_id, handle, bio, domain_interest, discord_handle, twitter_handle,
      github_username, github_connected, wallet_address, wallet_name, updated_at)
    VALUES (
      ${req.user.id}, ${handle}, ${bio}, ${domainInterest || null},
      ${discordHandle}, ${twitterHandle}, ${githubUsername},
      ${githubConnected || false}, ${walletAddress}, ${walletName}, now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      handle = EXCLUDED.handle,
      bio = EXCLUDED.bio,
      domain_interest = EXCLUDED.domain_interest,
      discord_handle = EXCLUDED.discord_handle,
      twitter_handle = EXCLUDED.twitter_handle,
      github_username = EXCLUDED.github_username,
      github_connected = EXCLUDED.github_connected,
      wallet_address = EXCLUDED.wallet_address,
      wallet_name = EXCLUDED.wallet_name,
      updated_at = now()
  `;
  res.json({ ok: true });
});

// ─── Admin endpoints ──────────────────────────────────────────────────────────
app.get('/api/admin/members', requireAuth, requireRole('head', 'president'), async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const members = await sql`
    SELECT u.id, u.email, u.full_name, u.avatar_url, u.role, u.created_at,
           p.handle, p.xp, p.badges_unlocked, p.is_minted, p.wallet_address
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    ORDER BY u.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [{ count }] = await sql`SELECT COUNT(*) as count FROM users`;
  res.json({ members, total: Number(count), page, limit });
});

app.get('/api/admin/stats', requireAuth, requireRole('head', 'president'), async (req, res) => {
  const [stats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE role = 'member') AS total_members,
      COUNT(*) FILTER (WHERE role = 'lead') AS total_leads,
      COUNT(*) FILTER (WHERE role = 'head') AS total_heads,
      COUNT(*) FILTER (WHERE role = 'president') AS total_presidents,
      COUNT(*) AS total_users
    FROM users
  `;
  const [xpStats] = await sql`
    SELECT COALESCE(SUM(xp), 0) AS total_xp, COUNT(*) FILTER (WHERE is_minted = true) AS minted_count
    FROM profiles
  `;
  res.json({ ...stats, ...xpStats });
});

app.post('/api/admin/assign-role', requireAuth, requireRole('president'), async (req, res) => {
  const { targetUserId, newRole } = req.body;
  if (!['lead', 'head'].includes(newRole)) {
    return res.status(400).json({ error: 'Presidents can only assign lead or head roles' });
  }
  const [target] = await sql`SELECT id, role FROM users WHERE id = ${targetUserId}`;
  if (!target) return res.status(404).json({ error: 'User not found' });

  await sql`UPDATE users SET role = ${newRole} WHERE id = ${targetUserId}`;
  await sql`
    INSERT INTO role_assignments (assigned_by, assigned_to, old_role, new_role)
    VALUES (${req.user.id}, ${targetUserId}, ${target.role}, ${newRole})
  `;
  res.json({ ok: true, targetUserId, newRole });
});

// ─── Leaderboard ─────────────────────────────────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
  try {
    const domain = req.query.domain;
    const builders = await sql`
      SELECT u.id, u.role, u.full_name,
             p.handle, p.domain_interest AS domain, p.wallet_address AS wallet,
             p.xp, p.badges_unlocked AS badges
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      WHERE (${domain || null}::text IS NULL OR p.domain_interest::text = ${domain || null})
      ORDER BY p.xp DESC
      LIMIT 100
    `;
    res.json({ builders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Task Management & Submissions ────────────────────────────────────────────
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await sql`
      SELECT t.id, t.title, t.description, t.requirements, t.track, t.difficulty,
             t.xp_reward AS "xpReward", t.token_reward AS "tokenReward",
             t.deadline::text, t.author_handle AS "authorLead", t.status,
             (SELECT COUNT(*)::int FROM task_submissions s WHERE s.task_id = t.id) AS "submissionsCount"
      FROM guild_tasks t
      ORDER BY t.created_at DESC
    `;
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', requireAuth, requireRole('lead', 'head', 'president'), async (req, res) => {
  try {
    const { title, description, requirements, track, difficulty, xpReward, tokenReward, deadline } = req.body;
    if (!title || !description || !track || !difficulty) {
      return res.status(400).json({ error: 'Missing required task fields' });
    }
    const taskId = `task-${Date.now()}`;
    const [profile] = await sql`SELECT handle FROM profiles WHERE user_id = ${req.user.id}`;
    const authorHandle = profile?.handle || req.user.full_name || req.user.email.split('@')[0];

    await sql`
      INSERT INTO guild_tasks (id, title, description, requirements, track, difficulty, xp_reward, token_reward, deadline, author_id, author_handle, status)
      VALUES (${taskId}, ${title}, ${description}, ${requirements || []}, ${track}, ${difficulty}, ${Number(xpReward) || 250}, ${tokenReward || null}, ${deadline || null}, ${req.user.id}, ${authorHandle}, 'Open')
    `;
    res.json({ ok: true, taskId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks/submissions', requireAuth, async (req, res) => {
  try {
    const isReviewer = ['lead', 'head', 'president'].includes(req.user.role);
    const submissions = isReviewer
      ? await sql`
          SELECT s.id, s.task_id AS "taskId", s.user_id AS "userId", s.handle,
                 s.wallet_address AS "walletAddress", s.pr_url AS "prUrl",
                 s.demo_url AS "demoUrl", s.notes, s.status, s.feedback,
                 s.submitted_at AS "submittedAt"
          FROM task_submissions s
          ORDER BY s.submitted_at DESC
        `
      : await sql`
          SELECT s.id, s.task_id AS "taskId", s.user_id AS "userId", s.handle,
                 s.wallet_address AS "walletAddress", s.pr_url AS "prUrl",
                 s.demo_url AS "demoUrl", s.notes, s.status, s.feedback,
                 s.submitted_at AS "submittedAt"
          FROM task_submissions s
          WHERE s.user_id = ${req.user.id}
          ORDER BY s.submitted_at DESC
        `;
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/:id/submit', requireAuth, async (req, res) => {
  try {
    const { prUrl, demoUrl, notes, walletAddress } = req.body;
    if (!prUrl) return res.status(400).json({ error: 'Pull request URL required' });
    const submissionId = `sub-${Date.now()}`;
    const [profile] = await sql`SELECT handle FROM profiles WHERE user_id = ${req.user.id}`;
    const handle = profile?.handle || req.user.full_name || req.user.email.split('@')[0];

    await sql`
      INSERT INTO task_submissions (id, task_id, user_id, handle, wallet_address, pr_url, demo_url, notes, status)
      VALUES (${submissionId}, ${req.params.id}, ${req.user.id}, ${handle}, ${walletAddress || null}, ${prUrl}, ${demoUrl || null}, ${notes || null}, 'Pending')
    `;
    await sql`UPDATE guild_tasks SET status = 'Under Review' WHERE id = ${req.params.id} AND status = 'Open'`;
    res.json({ ok: true, submissionId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks/submissions/:id/review', requireAuth, requireRole('lead', 'head', 'president'), async (req, res) => {
  try {
    const { status, feedback } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid review status' });
    }
    const [sub] = await sql`SELECT * FROM task_submissions WHERE id = ${req.params.id}`;
    if (!sub) return res.status(404).json({ error: 'Submission not found' });

    await sql`
      UPDATE task_submissions
      SET status = ${status}, feedback = ${feedback || null}, reviewed_by = ${req.user.id}, reviewed_at = now()
      WHERE id = ${req.params.id}
    `;

    if (status === 'Approved') {
      const [task] = await sql`SELECT xp_reward FROM guild_tasks WHERE id = ${sub.task_id}`;
      const xpBonus = task?.xp_reward || 250;
      await sql`
        UPDATE profiles
        SET xp = xp + ${xpBonus}, badges_unlocked = badges_unlocked + 1
        WHERE user_id = ${sub.user_id}
      `;
    }
    res.json({ ok: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Showcase Projects & Upvoting ─────────────────────────────────────────────
app.get('/api/showcase', async (req, res) => {
  try {
    const cookies = parseCookies(req);
    const userId = cookies.ck_session ? verifyCookie(cookies.ck_session) : null;

    const projects = await sql`
      SELECT p.id, p.title, p.description, p.author_handle AS "authorHandle",
             p.author_wallet AS "authorWallet", p.tech_tags AS "techTags",
             p.github_url AS "githubUrl", p.live_demo_url AS "liveDemoUrl",
             p.upvotes, p.created_at::text AS "createdAt",
             EXISTS(
               SELECT 1 FROM project_upvotes u
               WHERE u.project_id = p.id AND u.user_id = ${userId || ''}
             ) AS "hasUpvoted"
      FROM showcase_projects p
      ORDER BY p.upvotes DESC, p.created_at DESC
    `;
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/showcase', requireAuth, async (req, res) => {
  try {
    const { title, description, techTags, githubUrl, liveDemoUrl, authorWallet } = req.body;
    if (!title || !githubUrl) {
      return res.status(400).json({ error: 'Title and GitHub URL required' });
    }

    const [profile] = await sql`SELECT handle FROM profiles WHERE user_id = ${req.user.id}`;
    const handle = profile?.handle || req.user.full_name || req.user.email.split('@')[0];
    const projId = `proj-${Date.now()}`;

    await sql`
      INSERT INTO showcase_projects (id, title, description, author_id, author_handle, author_wallet, tech_tags, github_url, live_demo_url, upvotes)
      VALUES (${projId}, ${title}, ${description || ''}, ${req.user.id}, ${handle}, ${authorWallet || null}, ${techTags || []}, ${githubUrl}, ${liveDemoUrl || null}, 1)
    `;

    // Initial author upvote
    await sql`
      INSERT INTO project_upvotes (project_id, user_id)
      VALUES (${projId}, ${req.user.id})
      ON CONFLICT DO NOTHING
    `;

    res.json({ ok: true, projId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/showcase/:id/upvote', requireAuth, async (req, res) => {
  try {
    const projId = req.params.id;
    const [existing] = await sql`
      SELECT 1 FROM project_upvotes
      WHERE project_id = ${projId} AND user_id = ${req.user.id}
    `;

    if (existing) {
      await sql`DELETE FROM project_upvotes WHERE project_id = ${projId} AND user_id = ${req.user.id}`;
      await sql`UPDATE showcase_projects SET upvotes = GREATEST(0, upvotes - 1) WHERE id = ${projId}`;
      res.json({ ok: true, hasUpvoted: false });
    } else {
      await sql`INSERT INTO project_upvotes (project_id, user_id) VALUES (${projId}, ${req.user.id})`;
      await sql`UPDATE showcase_projects SET upvotes = upvotes + 1 WHERE id = ${projId}`;
      res.json({ ok: true, hasUpvoted: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Serve Vite build in prod ─────────────────────────────────────────────────
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
if (!process.env.VERCEL) {
  createServer(app).listen(PORT, () => {
    console.log(`CodeKrafters API running on :${PORT}`);
  });
}

export default app;
