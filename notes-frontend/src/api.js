const BASE_URL = 'http://localhost:8000/api/notes/';

function getCSRFToken() {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value);
  }
  return '';
}

function makeOptions(method, data = null) {
  const opts = {
    method,
    headers: {
      'X-CSRFToken': getCSRFToken(),
    },
    credentials: 'include',
  };

  if (data) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(data);
  }

  return opts;
}

async function handleResponse(res, action = 'Request') {
  if (!res.ok) {
    const errText = await res.text();
    console.error(`❌ ${action} failed (${res.status}):`, errText);
    throw new Error(`${action} failed`);
  }
  return res.status !== 204 ? res.json() : null;
}

export async function fetchNotes() {
  const res = await fetch(BASE_URL, { credentials: 'include' });
  return handleResponse(res, 'Fetch notes');
}

export async function createNote(note = {}) {
  const res = await fetch(BASE_URL, makeOptions('POST', note));
  return handleResponse(res, 'Create note');
}

export async function updateNote(id, note = {}) {
  const res = await fetch(`${BASE_URL}${id}/`, makeOptions('PUT', note));
  return handleResponse(res, `Update note (ID: ${id})`);
}

export async function deleteNote(id) {
  const res = await fetch(`${BASE_URL}${id}/`, makeOptions('DELETE'));
  return handleResponse(res, `Delete note (ID: ${id})`);
}
