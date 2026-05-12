const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const CONTENT_PATH = path.join(ROOT, 'data', 'site-content.json');

function json(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(body));
}

function text(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.end(body);
}

function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return raw.split(';').reduce((acc, pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return acc;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const parts = [];
    req.on('data', chunk => parts.push(chunk));
    req.on('end', () => {
      if (!parts.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(parts).toString('utf8')));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function hmac(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function signToken(payload, secret) {
  const body = base64url(JSON.stringify(payload));
  const sig = hmac(body, secret);
  return `${body}.${sig}`;
}

function verifyToken(token, secret) {
  if (!token || !secret) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = hmac(body, secret);
  if (expected.length !== sig.length) return null;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch (err) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

function cookieHeader(name, value, maxAge, httpOnly = true) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'SameSite=Lax',
  ];
  if (httpOnly) parts.push('HttpOnly');
  if (maxAge != null) parts.push(`Max-Age=${maxAge}`);
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

async function readContentFile() {
  const raw = await fs.readFile(CONTENT_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeContentFile(bundle) {
  const clean = JSON.stringify(bundle, null, 2) + '\n';
  await fs.mkdir(path.dirname(CONTENT_PATH), { recursive: true });
  await fs.writeFile(CONTENT_PATH, clean, 'utf8');
  return clean;
}

function getGitHubConfig() {
  const owner = process.env.GITHUB_OWNER || 'moyukh229197';
  const repo = process.env.GITHUB_REPO || 'BJP_Sankalpa';
  const branch = process.env.GITHUB_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN || '';
  return { owner, repo, branch, token };
}

async function writeContentToGitHub(bundle, message) {
  const { owner, repo, branch, token } = getGitHubConfig();
  if (!token) {
    return { mode: 'local', content: await writeContentFile(bundle) };
  }
  const filePath = 'data/site-content.json';
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const current = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  let sha;
  if (current.ok) {
    const currentJson = await current.json();
    sha = currentJson.sha;
  }
  const content = Buffer.from(JSON.stringify(bundle, null, 2) + '\n', 'utf8').toString('base64');
  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!putRes.ok) {
    const errorText = await putRes.text();
    throw new Error(`GitHub update failed: ${putRes.status} ${errorText}`);
  }
  return { mode: 'github', result: await putRes.json() };
}

function requireAdmin(req) {
  const secret = process.env.ADMIN_SECRET || 'sankalp-admin-secret';
  const cookies = parseCookies(req);
  return verifyToken(cookies.sb_admin, secret);
}

module.exports = {
  CONTENT_PATH,
  cookieHeader,
  getGitHubConfig,
  json,
  parseCookies,
  readBody,
  readContentFile,
  requireAdmin,
  signToken,
  text,
  verifyToken,
  writeContentFile,
  writeContentToGitHub,
};
