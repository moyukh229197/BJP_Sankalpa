const { json, readBody, readContentFile, requireAdmin, text, writeContentFile, writeContentToGitHub } = require('./_lib');

function normalizeBundle(raw) {
  const base = { manifesto: [], dailyLog: [], moments: [], backlog: [] };
  if (!raw || typeof raw !== 'object') return base;
  for (const key of Object.keys(base)) {
    if (Array.isArray(raw[key])) base[key] = raw[key];
  }
  return base;
}

module.exports = async (req, res) => {
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'GET') {
    try {
      const content = normalizeBundle(await readContentFile());
      return json(res, 200, content);
    } catch (err) {
      return json(res, 200, { manifesto: [], dailyLog: [], moments: [], backlog: [] });
    }
  }

  if (method === 'PUT') {
    const auth = requireAdmin(req);
    if (!auth) {
      return json(res, 401, { ok: false, error: 'Unauthorized' });
    }
    const body = await readBody(req).catch(() => ({}));
    const content = normalizeBundle(body.content || body);
    try {
      const saved = await writeContentToGitHub(content, 'Update site content bundle from admin panel');
      if (saved.mode === 'local') {
        return json(res, 200, { ok: true, mode: saved.mode, content });
      }
      return json(res, 200, { ok: true, mode: saved.mode, content });
    } catch (err) {
      try {
        await writeContentFile(content);
        return json(res, 200, { ok: true, mode: 'local', content });
      } catch (fallbackErr) {
        return json(res, 500, { ok: false, error: fallbackErr.message || 'Unable to save content' });
      }
    }
  }

  return text(res, 405, 'Method Not Allowed');
};
