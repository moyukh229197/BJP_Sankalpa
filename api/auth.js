const { cookieHeader, json, readBody, signToken, text, verifyToken } = require('./_lib');

module.exports = async (req, res) => {
  const method = (req.method || 'GET').toUpperCase();
  const password = process.env.ADMIN_PASSWORD || 'BJP365';
  const secret = process.env.ADMIN_SECRET || 'sankalp-admin-secret';

  if (method === 'GET') {
    const token = (req.headers.cookie || '').match(/sb_admin=([^;]+)/)?.[1];
    const auth = verifyToken(token ? decodeURIComponent(token) : '', secret);
    return json(res, 200, { authenticated: !!auth, user: auth ? 'admin' : null });
  }

  if (method === 'POST') {
    const body = await readBody(req).catch(() => ({}));
    const action = String(body.action || 'login').toLowerCase();
    if (action === 'logout') {
      res.setHeader('Set-Cookie', cookieHeader('sb_admin', '', 0));
      return json(res, 200, { ok: true, authenticated: false });
    }
    if (String(body.password || '') !== password) {
      return json(res, 401, { ok: false, error: 'Invalid password' });
    }
    const token = signToken({ role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 24 * 7 }, secret);
    res.setHeader('Set-Cookie', cookieHeader('sb_admin', token, 60 * 60 * 24 * 7));
    return json(res, 200, { ok: true, authenticated: true });
  }

  return text(res, 405, 'Method Not Allowed');
};
