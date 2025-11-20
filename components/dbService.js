// Simple persistence layer for sessions and traces.
// Implementation uses localStorage for a browser-hosted static app.
// Later you can swap this for a backend API (indexedDB, SQLite, or remote DB).

const SESSIONS_KEY = 'selfdraw_sessions_v1';

function readAll() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY) || '[]';
    return JSON.parse(raw);
  } catch (e) {
    console.warn('dbService: corrupted storage, resetting');
    localStorage.setItem(SESSIONS_KEY, '[]');
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
}

export async function saveSession(session) {
  const list = readAll();
  const idx = list.findIndex((s) => s.id === session.id);
  if (idx >= 0) list[idx] = session;
  else list.push(session);
  writeAll(list);
  return session;
}

export async function getSession(id) {
  const list = readAll();
  return list.find((s) => s.id === id) || null;
}

export async function listSessions() {
  return readAll();
}

export async function deleteSession(id) {
  const list = readAll().filter((s) => s.id !== id);
  writeAll(list);
}

export default { saveSession, getSession, listSessions, deleteSession };
